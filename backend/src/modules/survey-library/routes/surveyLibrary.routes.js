'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth.middleware');
const { requireRole } = require('../../../middleware/role.middleware');
const { uploadSurveyLibrary } = require('../../../middleware/upload.middleware');
const surveyLibraryController = require('../controllers/surveyLibrary.controller');

router.use(authenticate);
router.use(requireRole('Admin', 'Manager'));

// Get project library assets
router.get('/:project', surveyLibraryController.getAssets);

// Create new asset (must contain both video and vtt)
router.post(
  '/:project/asset',
  uploadSurveyLibrary.fields([
    { name: 'video', maxCount: 1 },
    { name: 'vtt', maxCount: 1 }
  ]),
  surveyLibraryController.createAsset
);

// Update existing asset (replace video and/or vtt)
router.put(
  '/:project/asset/:assetId',
  uploadSurveyLibrary.fields([
    { name: 'video', maxCount: 1 },
    { name: 'vtt', maxCount: 1 }
  ]),
  surveyLibraryController.updateAsset
);

// Delete entire asset
router.delete('/:project/asset/:assetId', surveyLibraryController.deleteAsset);

module.exports = router;
