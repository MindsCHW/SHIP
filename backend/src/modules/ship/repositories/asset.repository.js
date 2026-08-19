'use strict';

const SurveyAsset = require('../../../models/SurveyAsset.model');
const MasterList = require('../../../models/MasterList.model');

class AssetRepository {
  async aggregateSurveyAssets(pipeline) {
    return await SurveyAsset.aggregate(pipeline);
  }

  async findSurveyAssets(filter = {}) {
    return await SurveyAsset.find(filter).lean();
  }

  async aggregateMasterList(pipeline) {
    return await MasterList.aggregate(pipeline);
  }

  async findMasterList(filter = {}) {
    return await MasterList.find(filter).lean();
  }
}

module.exports = new AssetRepository();
