'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const SurveyAsset = require('../../../models/SurveyAsset.model');
const InspectionBatch = require('../../../models/InspectionBatch.model');
const InspectionTask = require('../../../models/InspectionTask.model');
const { cloudinary } = require('../../../config/cloudinary');
const logger = require('../../../config/logger');
const Notification = require('../../../models/Notification.model');

class SurveyProcessingService {
  async getPendingBatches() {
    const pendingTaskBatchIds = await InspectionTask.distinct('batchId', {
      status: { $in: ['PENDING_IMAGE', 'EXTRACTION_FAILED'] }
    });

    return InspectionBatch.find({
      $or: [
        { status: { $in: ['WAITING_FOR_IMAGES', 'FAILED'] } },
        { _id: { $in: pendingTaskBatchIds }, status: 'READY_FOR_REVIEW' }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName email');
  }

  async validateExtraction(project) {
    const assets = await SurveyAsset.find({ project, status: 'READY' }).sort({ createdAt: -1 });
    if (!assets.length) {
      throw new Error('No ready assets found for this project.');
    }

    const pendingBatches = await InspectionBatch.find({
      project,
      status: { $in: ['WAITING_FOR_IMAGES', 'FAILED', 'PROCESSING', 'READY_FOR_REVIEW', 'READY_FOR_RATING', 'IN_PROGRESS'] }
    });

    if (!pendingBatches.length) {
      throw new Error('No pending batches found for this project');
    }

    const batchIds = pendingBatches.map(b => b._id);
    const tasks = await InspectionTask.find({ 
      batchId: { $in: batchIds }, 
      status: { $in: ['PENDING_IMAGE', 'EXTRACTION_FAILED'] } 
    }).populate('parameters');

    if (!tasks.length) {
      for (const b of pendingBatches) {
        if (b.status === 'WAITING_FOR_IMAGES') {
          b.status = 'READY_FOR_REVIEW';
          await b.save();
        }
      }
      throw new Error('All tasks already have images extracted');
    }

    return { assets, tasks, batchIds };
  }

  async processImagesInBackground(project, user, { assets, tasks, batchIds }) {
    // Map tasks to their covering asset
    const taskGroups = new Map();
    let unmappedTasks = [];

    for (const task of tasks) {
      const c = parseFloat(task.chainage);
      const taskDirection = task.parameters && task.parameters.length > 0 ? task.parameters[0].direction : 'N/A';
      const taskReq = task.imageRequirement || 'DAY';
      
      let bestAsset = null;
      let highestScore = -1;

      for (const a of assets) {
        if (!a.coverage) continue;
        
        // Basic eligibility: Chainage must be covered
        const matchesChainage = c >= Math.min(a.coverage.startChainage, a.coverage.endChainage) && 
                               c <= Math.max(a.coverage.startChainage, a.coverage.endChainage);
        
        if (!matchesChainage) continue;

        let score = 10; // Chainage matches
        
        // Priority: Video and VTT paths exist
        if (a.video && a.video.path) score += 20;
        if (a.vtt && a.vtt.path) score += 20;
        
        // Priority: Road Type Match
        if (a.roadType === task.roadType) {
          score += 10;
        } else if (a.roadType === 'All Types') {
          score += 5;
        }

        // Priority: Direction Match
        if (taskDirection === 'LHS' || taskDirection === 'RHS') {
          if (a.roadDirection === taskDirection) score += 10;
        } else {
          score += 5; 
        }

        // Priority: Survey Type Match
        const assetReq = a.surveyType || 'DAY';
        if (taskReq === assetReq) score += 10;
        
        if (score > highestScore) {
          highestScore = score;
          bestAsset = a;
        }
      }

      if (!bestAsset) {
        task.extractionDiagnostics = { failureReason: 'No Survey Asset covers this chainage' };
        task.status = 'EXTRACTION_FAILED';
        unmappedTasks.push(task);
      } else {
        if (!taskGroups.has(bestAsset._id.toString())) {
          taskGroups.set(bestAsset._id.toString(), { asset: bestAsset, tasks: [] });
        }
        taskGroups.get(bestAsset._id.toString()).tasks.push(task);
      }
    }

    const cliPath = path.join(__dirname, '../../../../survey_video_processor/survey_video_processor/cli.py');
    const outputDir = path.join(require('os').tmpdir(), `hirate-library-${project}-${Date.now()}`);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await InspectionBatch.updateMany(
      { _id: { $in: batchIds }, status: { $in: ['WAITING_FOR_IMAGES', 'FAILED', 'READY_FOR_REVIEW'] } },
      { $set: { status: 'PROCESSING' } }
    );

    let successCount = 0;
    let failCount = 0;

    try {
      // 1. Process mapped tasks
      for (const [assetId, group] of taskGroups.entries()) {
        const { asset, tasks: groupTasks } = group;
        const chainageSet = new Set();
        groupTasks.forEach(t => {
          const c = parseFloat(t.chainage);
          chainageSet.add(c.toFixed(3));
          chainageSet.add((c - 0.010).toFixed(3));
          chainageSet.add((c + 0.010).toFixed(3));
        });
        const chainagesStr = Array.from(chainageSet).join(',');
        
        try {
          asset.status = 'PROCESSING';
          await asset.save();
          
          if (!fs.existsSync(asset.video.path)) {
            throw new Error('VIDEO_NOT_FOUND');
          }
          if (!fs.existsSync(asset.vtt.path)) {
            throw new Error('VTT_NOT_FOUND');
          }

          const resultsJsonPath = await this.runPythonExtractor(cliPath, asset.video.path, asset.vtt.path, outputDir, chainagesStr);
          const results = JSON.parse(fs.readFileSync(resultsJsonPath, 'utf8'));
          
          if (results.success) {
            for (const task of groupTasks) {
              const centerC = parseFloat(task.chainage).toFixed(3);
              const prevC = (parseFloat(task.chainage) - 0.010).toFixed(3);
              const nextC = (parseFloat(task.chainage) + 0.010).toFixed(3);

              const centerRecord = results.records.find(r => parseFloat(r.target_chainage || r.chainage).toFixed(3) === centerC);
              const prevRecord = results.records.find(r => parseFloat(r.target_chainage || r.chainage).toFixed(3) === prevC);
              const nextRecord = results.records.find(r => parseFloat(r.target_chainage || r.chainage).toFixed(3) === nextC);
              
              task.extractionDiagnostics = {
                surveyAssetId: asset._id,
                videoFilename: asset.video.originalName,
                coverageStart: asset.coverage.startChainage,
                coverageEnd: asset.coverage.endChainage,
              };

              if (centerRecord) {
                task.extractionDiagnostics.calculatedTimestamp = centerRecord.start_time;
                task.extractionDiagnostics.videoDuration = centerRecord.video_duration;
                
                if (centerRecord.error) {
                  task.extractionDiagnostics.failureReason = centerRecord.error;
                  task.status = 'EXTRACTION_FAILED';
                  failCount++;
                } else if (centerRecord.frame_name) {
                  
                  const uploadFrame = async (record, suffix) => {
                    if (!record || record.error || !record.frame_name) return null;
                    const framePath = path.join(outputDir, record.frame_name);
                    if (!fs.existsSync(framePath)) return null;
                    const cloudRes = await cloudinary.uploader.upload(framePath, {
                      folder: `hirate/survey-images/${project}/${task.batchId}`,
                      public_id: `chainage_${task.chainage.replace(/\./g, '_')}_${task.imageRequirement}_${suffix}`,
                      overwrite: true,
                      invalidate: true,
                      transformation: [{ quality: 'auto', fetch_format: 'auto' }]
                    });
                    return cloudRes.secure_url;
                  };

                  try {
                    const centerUrl = await uploadFrame(centerRecord, 'center');
                    
                    if (centerUrl) {
                      const prevUrl = await uploadFrame(prevRecord, 'prev');
                      const nextUrl = await uploadFrame(nextRecord, 'next');

                      const imgObj = { cloudinaryUrl: centerUrl };
                      if (prevUrl) imgObj.previousUrl = prevUrl;
                      if (nextUrl) imgObj.nextUrl = nextUrl;
                      
                      task.image = imgObj;

                      task.metadata = {
                        latitude: centerRecord.latitude,
                        longitude: centerRecord.longitude,
                        speed: centerRecord.speed,
                        extractedAt: centerRecord.start_time
                      };
                      task.status = 'READY_FOR_REVIEW';
                      successCount++;
                    } else {
                      task.extractionDiagnostics.failureReason = 'Frame extracted but file not found on disk';
                      task.status = 'EXTRACTION_FAILED';
                      failCount++; 
                    }
                  } catch (err) {
                    logger.error(`Failed cloud upload for chainage ${task.chainage}`, err);
                    task.extractionDiagnostics.failureReason = `Cloudinary upload failed: ${err.message}`;
                    task.status = 'EXTRACTION_FAILED';
                    failCount++;
                  }
                } else { 
                  task.extractionDiagnostics.failureReason = 'No frame_name returned from python script';
                  task.status = 'EXTRACTION_FAILED';
                  failCount++; 
                }
              } else { 
                task.extractionDiagnostics.failureReason = 'No matching center record returned from python script';
                task.status = 'EXTRACTION_FAILED';
                failCount++; 
              }
              await task.save();
            }
          }
          
          asset.status = 'COMPLETED'; // As per prompt, will revert to READY below if we want to reuse
          asset.lastExtractedAt = new Date();
          await asset.save();
        } catch (innerErr) {
          logger.error(`Python extraction failed for asset ${asset.assetName}:`, innerErr);
          asset.status = 'READY'; // revert
          await asset.save();
          
          // Update all tasks mapped to this asset with the actual error
          for (const task of groupTasks) {
            task.extractionDiagnostics = { failureReason: innerErr.message || 'Python processing failed' };
            task.status = 'EXTRACTION_FAILED';
            await task.save();
            failCount++;
          }
        }
      }

      // Mark unmapped tasks
      for (const task of unmappedTasks) {
        if (!task.extractionDiagnostics || !task.extractionDiagnostics.failureReason) {
          task.extractionDiagnostics = { failureReason: 'No survey asset covers this chainage for the specified road type' };
          task.status = 'EXTRACTION_FAILED';
        }
        await task.save();
        failCount++;
      }

      // Any remaining tasks that somehow didn't get updated (catch-all)
      await InspectionTask.updateMany(
        { batchId: { $in: batchIds }, status: 'PENDING_IMAGE' },
        { $set: { status: 'EXTRACTION_FAILED', 'extractionDiagnostics.failureReason': 'Unknown failure during processing' } }
      );

      // Batches update
      for (const batchId of batchIds) {
        const batch = await InspectionBatch.findById(batchId);
        if (!batch) continue;
        
        // If the batch is already past the review stage, keep it there so ratings aren't lost
        if (['READY_FOR_RATING', 'IN_PROGRESS', 'COMPLETED'].includes(batch.status)) {
           continue;
        }

        const extractedCount = await InspectionTask.countDocuments({
          batchId,
          status: 'READY_FOR_REVIEW'
        });
        
        if (extractedCount > 0) {
          // If at least one image was successfully extracted, make it available in Image Review
          batch.status = 'READY_FOR_REVIEW';
        } else {
          // No images extracted at all, stay waiting
          batch.status = 'WAITING_FOR_IMAGES';
        }
        await batch.save();
      }

      if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });

      const totalPendingAfter = await InspectionTask.countDocuments({ batchId: { $in: batchIds }, status: { $in: ['PENDING_IMAGE', 'EXTRACTION_FAILED'] } });

      // Change any 'COMPLETED' assets back to 'READY' so they can be reused for future batches
      await SurveyAsset.updateMany({ project, status: 'COMPLETED' }, { $set: { status: 'READY' } });

      const failTotal = failCount + totalPendingAfter;
      
      if (user && user._id) {
        await Notification.create({
          userId: user._id,
          title: 'Image Extraction Complete',
          body: `Extraction for project ${project} is finished. Successfully extracted: ${successCount}. Failed: ${failTotal}. Remaining: ${totalPendingAfter}.`,
          type: 'SUCCESS',
          link: '/image-review'
        });
      }

      return {
        message: 'Extraction completed',
        successCount,
        failCount: failTotal,
        remainingTasks: totalPendingAfter
      };

    } catch (err) {
      // Revert batches if there was an overall failure
      for (const batchId of batchIds) {
        const batch = await InspectionBatch.findById(batchId);
        if (!batch) continue;
        
        if (['READY_FOR_RATING', 'IN_PROGRESS', 'COMPLETED'].includes(batch.status)) {
           continue;
        }

        const extractedCount = await InspectionTask.countDocuments({
          batchId,
          status: 'READY_FOR_REVIEW'
        });
        
        if (extractedCount > 0) {
          batch.status = 'READY_FOR_REVIEW';
        } else {
          batch.status = 'WAITING_FOR_IMAGES';
        }
        await batch.save();
      }
      
      if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
      
      if (user && user._id) {
        await Notification.create({
          userId: user._id,
          title: 'Image Extraction Failed',
          body: `The background extraction process for project ${project} failed. Error: ${err.message}`,
          type: 'ERROR'
        });
      }
      
      throw err;
    }
  }

  runPythonExtractor(cliPath, videoPath, vttPath, outputDir, chainagesStr) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        cliPath,
        '--video', videoPath,
        '--vtt', vttPath,
        '--outdir', outputDir,
        '--chainages', chainagesStr
      ]);

      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        logger.info(`Python stderr: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          const errorMsg = stderrData.trim() ? stderrData : stdoutData.trim();
          return reject(new Error(`Python script exited with code ${code}. Output: ${errorMsg}`));
        }
        try {
          const lines = stdoutData.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const result = JSON.parse(lastLine);
          
          if (result.success === true || result.status === 'success') {
            resolve(result.results_path);
          } else {
            reject(new Error(result.error || result.message || 'Unknown python error'));
          }
        } catch (e) {
          reject(new Error(`Failed to parse python output: ${e.message}\nRaw Output: ${stdoutData}`));
        }
      });
    });
  }
}

module.exports = new SurveyProcessingService();
