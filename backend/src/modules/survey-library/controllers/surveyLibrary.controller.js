'use strict';

const surveyLibraryService = require('../services/surveyLibrary.service');

exports.getAssets = async (req, res, next) => {
  try {
    const { project } = req.params;
    const assets = await surveyLibraryService.getProjectAssets(project);
    res.json({ success: true, data: assets });
  } catch (error) {
    next(error);
  }
};

exports.createAsset = async (req, res, next) => {
  try {
    const { project } = req.params;
    const { assetName, roadDirection, roadType, surveyType } = req.body;

    if (!assetName) {
      return res.status(400).json({ success: false, message: 'Asset Name is required' });
    }

    if (!req.files || !req.files.video || !req.files.vtt) {
      return res.status(400).json({ success: false, message: 'Both video and vtt files are required' });
    }

    const videoFile = req.files.video[0];
    const vttFile = req.files.vtt[0];

    const assets = await surveyLibraryService.createAsset(project, assetName, roadDirection, roadType, surveyType, videoFile, vttFile, req.user);
    res.json({ success: true, message: 'Survey Asset created successfully', data: assets });
  } catch (error) {
    next(error);
  }
};

exports.updateAsset = async (req, res, next) => {
  try {
    const { project, assetId } = req.params;
    const { assetName, roadDirection, roadType, surveyType } = req.body;
    
    const videoFile = req.files && req.files.video ? req.files.video[0] : null;
    const vttFile = req.files && req.files.vtt ? req.files.vtt[0] : null;

    const assets = await surveyLibraryService.updateAsset(project, assetId, assetName, roadDirection, roadType, surveyType, videoFile, vttFile, req.user);
    res.json({ success: true, message: 'Survey Asset updated successfully', data: assets });
  } catch (error) {
    next(error);
  }
};

exports.deleteAsset = async (req, res, next) => {
  try {
    const { project, assetId } = req.params;
    const assets = await surveyLibraryService.deleteAsset(project, assetId, req.user);
    res.json({ success: true, message: 'Asset deleted successfully', data: assets });
  } catch (error) {
    next(error);
  }
};
