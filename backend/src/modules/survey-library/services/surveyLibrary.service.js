'use strict';

const fs = require('fs');
const SurveyAsset = require('../../../models/SurveyAsset.model');
const logger = require('../../../config/logger');

class SurveyLibraryService {
  async getProjectAssets(project) {
    return await SurveyAsset.find({ project }).sort({ assetName: 1 });
  }

  parseVttCoverage(vttPath) {
    try {
      const content = fs.readFileSync(vttPath, 'utf8');
      const blocks = content.trim().split(/\n\s*\n/);
      const metadataPattern = /Lat:\s*([0-9.-]+),\s*Lon:\s*([0-9.-]+),\s*Speed:\s*([0-9.-]+)[kK]m\/hr\s*chainage:\s*([0-9.-]+)/i;
      const timestampPattern = /(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/;

      let minChainage = Infinity;
      let maxChainage = -Infinity;
      let startTime = null;
      let endTime = null;
      let count = 0;

      for (const block of blocks) {
        const tsMatch = block.match(timestampPattern);
        const mdMatch = block.match(metadataPattern);
        if (tsMatch && mdMatch) {
          if (!startTime) startTime = tsMatch[1];
          endTime = tsMatch[2];

          const chainage = parseFloat(mdMatch[4]);
          if (chainage < minChainage) minChainage = chainage;
          if (chainage > maxChainage) maxChainage = chainage;
          count++;
        }
      }

      if (count === 0) throw new Error('No GPS metadata found in VTT');

      return {
        startChainage: minChainage,
        endChainage: maxChainage,
        startTime,
        endTime,
        chainageCount: count
      };
    } catch (e) {
      logger.error('Failed to parse VTT', e);
      throw new Error('Metadata parsing failed. Please verify the uploaded VTT.');
    }
  }

  mapFileData(file) {
    return {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype
    };
  }

  async createAsset(project, assetName, roadDirection, roadType, surveyType, videoFile, vttFile, user) {
    const existingAsset = await SurveyAsset.findOne({ project, assetName });
    if (existingAsset) {
      throw new Error(`Asset with name ${assetName} already exists in this project.`);
    }

    const asset = new SurveyAsset({
      project,
      assetName,
      roadDirection,
      roadType: roadType || 'All Types',
      surveyType: surveyType || 'DAY',
      status: 'PARSING_METADATA',
      createdBy: user._id,
      updatedBy: user._id,
      video: this.mapFileData(videoFile),
      vtt: this.mapFileData(vttFile)
    });

    await asset.save(); // Save initial state

    try {
      const coverage = this.parseVttCoverage(vttFile.path);
      asset.coverage = coverage;
      asset.status = 'READY';
    } catch (err) {
      // If parsing fails, asset stays in PARSING_METADATA or maybe a failed state
      // We'll throw the error and not set to READY.
      // Wait, the prompt says "If parsing fails: Display Metadata parsing failed... Do not allow extraction"
      asset.status = 'DRAFT'; // revert status
      await asset.save();
      throw err;
    }

    await asset.save();
    return await this.getProjectAssets(project);
  }

  async updateAsset(project, assetId, assetName, roadDirection, roadType, surveyType, videoFile, vttFile, user) {
    const asset = await SurveyAsset.findOne({ _id: assetId, project });
    if (!asset) throw new Error('Asset not found');

    if (assetName && assetName !== asset.assetName) {
      const existing = await SurveyAsset.findOne({ project, assetName });
      if (existing) throw new Error('Asset name already in use');
      asset.assetName = assetName;
    }

    if (roadDirection) {
      asset.roadDirection = roadDirection;
    }

    if (roadType) {
      asset.roadType = roadType;
    }

    if (surveyType) {
      asset.surveyType = surveyType;
    }

    let reparseRequired = false;

    if (videoFile) {
      if (fs.existsSync(asset.video.path)) fs.unlinkSync(asset.video.path);
      asset.video = this.mapFileData(videoFile);
    }

    if (vttFile) {
      if (fs.existsSync(asset.vtt.path)) fs.unlinkSync(asset.vtt.path);
      asset.vtt = this.mapFileData(vttFile);
      reparseRequired = true;
    }

    asset.updatedBy = user._id;

    if (reparseRequired) {
      asset.status = 'PARSING_METADATA';
      await asset.save();

      try {
        const coverage = this.parseVttCoverage(asset.vtt.path);
        asset.coverage = coverage;
        asset.status = 'READY';
      } catch (err) {
        asset.status = 'DRAFT';
        await asset.save();
        throw err;
      }
    }

    await asset.save();
    return await this.getProjectAssets(project);
  }

  async deleteAsset(project, assetId, user) {
    const asset = await SurveyAsset.findOne({ _id: assetId, project });
    if (!asset) throw new Error('Asset not found');

    if (asset.video && fs.existsSync(asset.video.path)) fs.unlinkSync(asset.video.path);
    if (asset.vtt && fs.existsSync(asset.vtt.path)) fs.unlinkSync(asset.vtt.path);

    await asset.deleteOne();

    return await this.getProjectAssets(project);
  }
}

module.exports = new SurveyLibraryService();
