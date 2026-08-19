'use strict';

const express = require('express');
const router = express.Router();

const { importSurveyPoint, importBatch, getSurveyImports } = require('./survey.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { uploadSurveyImage } = require('../../middleware/upload.middleware');

router.use(authenticate);

router.post('/import', uploadSurveyImage.single('image'), importSurveyPoint);
router.post('/import/batch', importBatch);
router.get('/imports', getSurveyImports);

module.exports = router;
