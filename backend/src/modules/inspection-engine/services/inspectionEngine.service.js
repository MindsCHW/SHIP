'use strict';

const inspectionEngineRepository = require('../repositories/inspectionEngine.repository');
const masterListRepository = require('../../master-list/masterList.repository');
const SamplingStrategyFactory = require('./strategies/samplingStrategyFactory');
const SurveyAsset = require('../../../models/SurveyAsset.model');
const InspectionTask = require('../../../models/InspectionTask.model');
const fs = require('fs');

class InspectionEngineService {
  async createBatch(userId, batchData) {
    const { 
      project, 
      samplingPercentage, 
      samplingStrategy = 'RANDOM', 
      categories,
      assetTypes,
      excludePreviouslyInspected = true, 
      resetHistory = false 
    } = batchData;

    if (!project) throw new Error('Project is required to create a batch');
    if (!samplingPercentage || samplingPercentage <= 0 || samplingPercentage > 100) {
      throw new Error('Sampling percentage must be between 1 and 100');
    }

    // 1. Fetch Master List for this project (Active questions only)
    const filter = { project, status: 'Active' };
    if (categories && categories.length > 0) filter.category = categories;
    if (assetTypes && assetTypes.length > 0) filter.assetType = assetTypes;

    let masterListPopulation = await masterListRepository.getMasterList(filter);

    if (!masterListPopulation || masterListPopulation.length === 0) {
      throw new Error(`No active master list questions found for project: ${project}${categories ? ` and selected categories/assets` : ''}`);
    }

    // 1.5 Exclude previously inspected questions if requested
    if (excludePreviouslyInspected) {
      const previouslyInspectedIds = await inspectionEngineRepository.getPreviouslyInspectedMasterListIds(project);
      
      if (previouslyInspectedIds.length > 0) {
        masterListPopulation = masterListPopulation.filter(q => !previouslyInspectedIds.includes(q._id.toString()));
      }

      if (masterListPopulation.length === 0) {
        const err = new Error('All Master List questions for this project have already been inspected.');
        err.code = 'ALL_INSPECTED';
        throw err;
      }
    }

    // 2. Select Sampling Strategy
    // (Moved to step 4)

    // 3. Group Master List into Physical Assets
    const assetsMap = new Map();
    masterListPopulation.forEach(q => {
      const key = `${q.project}_${q.chainage}_${q.assetType}_${q.assetSubType || ''}_${q.roadType || ''}`;
      if (!assetsMap.has(key)) {
        assetsMap.set(key, {
          project: q.project,
          chainage: q.chainage,
          assetType: q.assetType,
          assetSubType: q.assetSubType,
          roadType: q.roadType,
          parameters: []
        });
      }
      assetsMap.get(key).parameters.push(q);
    });

    const physicalAssets = Array.from(assetsMap.values());

    // 4. Select Sampling Strategy and Generate Sample (Sampling ASSETS, not individual parameters)
    const strategy = SamplingStrategyFactory.getStrategy(samplingStrategy);
    const sampledAssets = strategy.sample(physicalAssets, samplingPercentage);

    if (sampledAssets.length === 0) {
      throw new Error('Sampling resulted in 0 tasks. Please adjust your percentage.');
    }

    // 5. Calculate Unique Chainages
    const uniqueChainages = new Set(sampledAssets.map(a => a.chainage));

    // Calculate total questions in the sample
    let selectedQuestionsCount = 0;
    sampledAssets.forEach(a => {
      selectedQuestionsCount += a.parameters.length;
    });

    // 6. Prepare Batch Data
    const name = `Batch-${project}-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000)}`;
    
    const newBatchData = {
      name,
      project,
      categories: categories || [],
      assetTypes: assetTypes || [],
      samplingPercentage,
      samplingStrategy,
      totalMasterQuestions: masterListPopulation.length,
      selectedQuestionsCount,
      uniqueChainagesCount: uniqueChainages.size,
      status: 'WAITING_FOR_IMAGES',
      createdBy: userId,
      isSamplingHistoryReset: resetHistory
    };

    // 7. Prepare Task Data - Split by imageRequirement so survey processing can match surveyType
    const tasksData = [];
    sampledAssets.forEach(asset => {
      // Split the asset's parameters by image requirement (from Master List)
      const dayParams = asset.parameters.filter(p => (p.imageRequirement || 'DAY') !== 'NIGHT');
      const nightParams = asset.parameters.filter(p => p.imageRequirement === 'NIGHT');

      // Create a DAY task if there are any DAY parameters
      if (dayParams.length > 0) {
        tasksData.push({
          project: asset.project,
          chainage: asset.chainage,
          assetType: asset.assetType,
          assetSubType: asset.assetSubType,
          roadType: asset.roadType,
          imageRequirement: 'DAY',
          parameters: dayParams.map(p => p._id),
          status: 'PENDING_IMAGE'
        });
      }

      // Create a NIGHT task if there are any NIGHT parameters
      if (nightParams.length > 0) {
        tasksData.push({
          project: asset.project,
          chainage: asset.chainage,
          assetType: asset.assetType,
          assetSubType: asset.assetSubType,
          roadType: asset.roadType,
          imageRequirement: 'NIGHT',
          parameters: nightParams.map(p => p._id),
          status: 'PENDING_IMAGE'
        });
      }
    });

    // 7. Save to DB transactionally
    const batch = await inspectionEngineRepository.createBatch(newBatchData, tasksData);
    
    return batch;
  }

  _parseAllVttChainages(vttPath) {
    try {
      const content = fs.readFileSync(vttPath, 'utf8');
      const blocks = content.trim().split(/\n\s*\n/);
      const metadataPattern = /Lat:\s*([0-9.-]+),\s*Lon:\s*([0-9.-]+),\s*Speed:\s*([0-9.-]+)[kK]m\/hr\s*chainage:\s*([0-9.-]+)/i;
      
      const chainages = [];
      for (const block of blocks) {
        const mdMatch = block.match(metadataPattern);
        if (mdMatch) {
          chainages.push(parseFloat(mdMatch[4]));
        }
      }
      return chainages.sort((a, b) => a - b);
    } catch (e) {
      throw new Error('Failed to parse VTT chainages');
    }
  }

  _getClosestChainage(target, chainages) {
    if (!chainages || chainages.length === 0) return null;
    let closest = chainages[0];
    let minDiff = Math.abs(target - closest);
    for (let i = 1; i < chainages.length; i++) {
      const diff = Math.abs(target - chainages[i]);
      if (diff < minDiff) {
        closest = chainages[i];
        minDiff = diff;
      }
    }
    return closest;
  }

  async _calculateRoadwaySampling(project, surveyAssetId, startChainage, endChainage, intervalMetres) {
    let assets = [];
    if (surveyAssetId === 'all') {
      assets = await SurveyAsset.find({ project, 'vtt.path': { $exists: true, $ne: null } });
    } else {
      const asset = await SurveyAsset.findOne({ _id: surveyAssetId, project });
      if (asset) assets.push(asset);
    }
    
    if (assets.length === 0) throw new Error('No valid survey assets found');

    const availableChainages = [];
    const chainageSourceMap = new Map();

    for (const asset of assets) {
      try {
        const assetChainages = this._parseAllVttChainages(asset.vtt.path);
        for (const c of assetChainages) {
          availableChainages.push(c);
          if (!chainageSourceMap.has(c)) {
            chainageSourceMap.set(c, asset);
          }
        }
      } catch (err) {
        console.warn(`Failed to parse VTT for asset ${asset._id}: ${err.message}`);
      }
    }
    
    if (availableChainages.length === 0) throw new Error('No chainages found in VTT(s)');

    availableChainages.sort((a, b) => a - b);

    // Interval is in metres (e.g., 10). Chainage is usually in km (e.g., 180.00).
    const interval = intervalMetres / 1000;
    const minC = Math.min(startChainage, endChainage);
    const maxC = Math.max(startChainage, endChainage);

    const targetChainages = [];
    for (let c = minC; c <= maxC; c += interval) {
      targetChainages.push(parseFloat(c.toFixed(3)));
    }

    const matchedChainages = new Set();
    const sourceSurveyIds = new Map(); // matched chainage (number) -> surveyAssetId

    for (const target of targetChainages) {
      const closest = this._getClosestChainage(target, availableChainages);
      if (closest !== null) {
        matchedChainages.add(closest);
        const sourceAsset = chainageSourceMap.get(closest);
        if (sourceAsset) {
          sourceSurveyIds.set(closest, sourceAsset._id.toString());
        }
      }
    }

    const uniqueMatched = Array.from(matchedChainages);

    // Check which ones already have images extracted in previous InspectionTasks
    const existingTasks = await InspectionTask.find({
      project,
      chainage: { $in: uniqueMatched.map(c => c.toFixed(3)) },
      'image.cloudinaryUrl': { $exists: true, $ne: null }
    }).select('chainage image.cloudinaryUrl extractionDiagnostics');

    const existingImageMap = {};
    for (const task of existingTasks) {
      if (surveyAssetId === 'all') {
        if (!existingImageMap[task.chainage]) {
          existingImageMap[task.chainage] = task.image.cloudinaryUrl;
        }
      } else {
        if (!existingImageMap[task.chainage] || (task.extractionDiagnostics && task.extractionDiagnostics.surveyAssetId?.toString() === surveyAssetId)) {
          existingImageMap[task.chainage] = task.image.cloudinaryUrl;
        }
      }
    }

    const matchedCount = uniqueMatched.length;
    const existingCount = Object.keys(existingImageMap).length;
    const missingCount = matchedCount - existingCount;

    return {
      surveyAssetId,
      surveyName: surveyAssetId === 'all' ? 'All Videos' : assets[0].assetName,
      surveyType: surveyAssetId === 'all' ? 'MIXED' : assets[0].surveyType,
      startChainage: minC,
      endChainage: maxC,
      intervalMetres,
      totalAvailableImages: availableChainages.length,
      matchedImages: matchedCount,
      existingImages: existingCount,
      missingExtractionImages: missingCount,
      uniqueMatchedChainages: uniqueMatched,
      existingImageMap,
      sourceSurveyIds
    };
  }

  async previewRoadwayBatch(userId, data) {
    const { project, surveyAssetId, startChainage, endChainage, intervalMetres } = data;
    if (!project || !surveyAssetId || startChainage == null || endChainage == null || !intervalMetres) {
      throw new Error('Missing required fields for Roadway preview');
    }
    
    const samplingData = await this._calculateRoadwaySampling(project, surveyAssetId, startChainage, endChainage, intervalMetres);
    
    // Fixed Roadway Question Configuration: 12 Parameters
    const ROADWAY_PARAMETERS_COUNT = 12;

    return {
      ...samplingData,
      questionsPerImage: ROADWAY_PARAMETERS_COUNT,
      totalQuestionInstances: samplingData.matchedImages * ROADWAY_PARAMETERS_COUNT
    };
  }

  async createRoadwayBatch(userId, data) {
    const { project, surveyAssetId, startChainage, endChainage, intervalMetres } = data;
    
    const samplingData = await this._calculateRoadwaySampling(project, surveyAssetId, startChainage, endChainage, intervalMetres);
    
    // Fixed Roadway Question Configuration: 12 Parameters
    const ROADWAY_PARAMETERS_COUNT = 12;

    const name = `Roadway-${project}-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000)}`;
    
    // In continuous sampling, we don't randomly sample. We inspect ALL matched chainages.
    const selectedQuestionsCount = samplingData.matchedImages * ROADWAY_PARAMETERS_COUNT;

    const newBatchData = {
      name,
      project,
      categories: [],
      assetTypes: ['Roadway', 'Kerb', 'Shoulder', 'Pavement'],
      samplingPercentage: 100, // It's 100% of the selected interval
      samplingStrategy: 'CONTINUOUS',
      totalMasterQuestions: ROADWAY_PARAMETERS_COUNT,
      selectedQuestionsCount,
      uniqueChainagesCount: samplingData.matchedImages,
      status: 'WAITING_FOR_IMAGES',
      createdBy: userId,
      isSamplingHistoryReset: false
    };

    const tasksData = [];
    
    for (const chainage of samplingData.uniqueMatchedChainages) {
      const chainageStr = chainage.toFixed(3);
      const existingImageUrl = samplingData.existingImageMap[chainageStr];
      
      const taskStatus = existingImageUrl ? 'READY_FOR_RATING' : 'PENDING_IMAGE';
      
      const task = {
        project,
        chainage: chainageStr,
        assetType: 'Roadway',
        assetSubType: '',
        roadType: 'Main Carriageway', // Usually continuous is MCW, but we leave it as default or fetch from survey
        imageRequirement: samplingData.surveyType || 'DAY',
        parameters: [], // Empty as we don't use MasterList for Roadway
        status: taskStatus,
        extractionDiagnostics: {
          surveyAssetId: samplingData.surveyAssetId === 'all' ? samplingData.sourceSurveyIds.get(chainage) : surveyAssetId
        }
      };

      if (existingImageUrl) {
        task.image = { cloudinaryUrl: existingImageUrl };
        task.imageApproved = true;
        task.approvedAt = new Date();
      }

      tasksData.push(task);
    }

    const batch = await inspectionEngineRepository.createBatch(newBatchData, tasksData);
    
    // Update batch status if all tasks already have images
    if (samplingData.missingExtractionImages === 0) {
      batch.status = 'READY_FOR_RATING';
      await batch.save();
    }
    
    return batch;
  }

  async listBatches(filters) {
    return inspectionEngineRepository.listBatches(filters);
  }

  async getBatchDetails(batchId) {
    const batchDetails = await inspectionEngineRepository.getBatchDetails(batchId);
    if (!batchDetails) throw new Error('Batch not found');
    return batchDetails;
  }

  async deleteBatch(batchId) {
    return inspectionEngineRepository.deleteBatch(batchId);
  }

  async getExtractionReport(batchId) {
    return inspectionEngineRepository.getExtractionReport(batchId);
  }
}

module.exports = new InspectionEngineService();
