'use strict';

const surveyProcessingService = require('../services/surveyProcessing.service');

class SurveyProcessingController {
  async getPendingBatches(req, res, next) {
    try {
      const batches = await surveyProcessingService.getPendingBatches();
      res.status(200).json({ success: true, data: batches });
    } catch (error) {
      next(error);
    }
  }

  async extractImages(req, res, next) {
    try {
      const { project } = req.params;
      
      // We run validation synchronously so we can return a 400 error immediately if it fails
      const extractionData = await surveyProcessingService.validateExtraction(project);
      
      // We run extraction asynchronously and do not await it
      surveyProcessingService.processImagesInBackground(project, req.user, extractionData).catch(err => {
        console.error('Background extraction failed:', err);
      });
      
      res.status(202).json({ 
        success: true, 
        message: 'Image extraction started in the background. You will receive a notification when it is complete.' 
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SurveyProcessingController();
