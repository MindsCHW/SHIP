'use strict';

const express = require('express');
const router = express.Router();

const {
  getInspections, exportCSV, getInspectionById,
  submitHORating, submitSPVRating, getInspectionHistory
} = require('./inspection.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

router.use(authenticate);

router.get('/', getInspections);
router.get('/export', exportCSV);
router.get('/:id', getInspectionById);
router.get('/:id/history', getInspectionHistory);
router.put('/:id/ho-rating', requireRole('Admin', 'HO'), submitHORating);
router.put('/:id/spv-rating', requireRole('Admin', 'SPV'), submitSPVRating);

module.exports = router;
