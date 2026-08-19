const express = require('express');
const router = express.Router();
const masterListController = require('./masterList.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const { uploadExcel } = require('../../middleware/upload.middleware');

router.use(authenticate);
router.use(requireRole('Admin', 'Administrator'));

// Flat APIs for Question Bank
router.get('/', masterListController.getMasterList);
router.post('/import', uploadExcel.single('file'), masterListController.importMasterList);
router.get('/projects', masterListController.getProjects);
router.get('/categories', masterListController.getCategories);
router.get('/assets', masterListController.getAssetTypes);
router.get('/road-types', masterListController.getRoadTypes);
router.get('/parameters', masterListController.getParameters);
router.get('/chainages', masterListController.getChainages);
router.get('/stats', masterListController.getStats);
router.post('/fix-image-requirements', masterListController.fixImageRequirements);

router.put('/:id', masterListController.updateMasterListItem);
router.delete('/project/:projectName', masterListController.deleteProjectMasterList);
router.delete('/:id', masterListController.deleteMasterListItem);

module.exports = router;
