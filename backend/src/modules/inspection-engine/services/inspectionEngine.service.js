'use strict';

const inspectionEngineRepository = require('../repositories/inspectionEngine.repository');
const masterListRepository = require('../../master-list/masterList.repository');
const SamplingStrategyFactory = require('./strategies/samplingStrategyFactory');

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

    // 7. Prepare Task Data
    const tasksData = [];
    sampledAssets.forEach(asset => {
      // Split the asset's parameters by image requirement
      const dayParams = asset.parameters.filter(p => (p.imageRequirement || 'DAY') === 'DAY');
      const nightParams = asset.parameters.filter(p => p.imageRequirement === 'NIGHT');

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
