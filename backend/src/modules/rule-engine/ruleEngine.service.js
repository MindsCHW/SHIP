'use strict';

const MasterList = require('../../models/MasterList.model');
const logger = require('../../config/logger');

/**
 * HiRATE Rule Engine — Core Logic
 *
 * Given an inspection context (category, assetType, roadType, placement, direction),
 * resolves the applicable parameters and their questions from the imported Master List.
 */
const resolveParameters = async ({
  category,
  assetType,
  roadType,
  placement,
  direction
}) => {
  if (!category) {
    throw Object.assign(new Error('Category is required for parameter resolution'), { statusCode: 400 });
  }

  // Map direction to placement for query (LHS/RHS → actual placement)
  const effectivePlacement = placement || direction || 'Both';

  // Build priority-ordered query
  const filter = {
    status: 'Active',
    category
  };

  if (assetType) filter.assetType = assetType;

  // Allow 'Both' to be inclusive in all queries
  const roadTypeFilter = roadType
    ? { $in: [roadType, 'Both', 'N/A'] }
    : undefined;

  const placementFilter = effectivePlacement
    ? { $in: [effectivePlacement, 'Both', 'N/A'] }
    : undefined;

  if (roadTypeFilter) filter.roadType = roadTypeFilter;
  if (placementFilter) filter.placement = placementFilter;

  let records = await MasterList.find(filter)
    .sort({ parameter: 1 })
    .lean();

  // Fallback: if no records found with assetType, try category-only
  if (!records.length && assetType) {
    logger.warn(`Rule Engine: No parameters found for ${category}/${assetType}/${roadType}. Falling back to category match.`);
    delete filter.assetType;
    records = await MasterList.find(filter)
      .sort({ parameter: 1 })
      .lean();
  }

  if (!records.length) {
    logger.warn(`Rule Engine: No master data found for category: ${category}`);
  }

  // Build parameter list for inspection
  const parameters = records.map((record) => ({
    parameter: record.parameter,
    questionId: record.questionId,
    ratingScale: [0, 1, 5, 10], // Default scale for now
    hoRating: { value: null, remark: '', ratedBy: null, ratedAt: null },
    spvRating: { value: null, remark: '', ratedBy: null, ratedAt: null }
  }));

  logger.debug(`Rule Engine resolved ${parameters.length} parameters for [${category}/${assetType}/${roadType}/${effectivePlacement}]`);

  return {
    parameters,
    context: { category, assetType, roadType, placement: effectivePlacement },
    count: parameters.length
  };
};

/**
 * Gets the full list of unique category+assetType combinations from master data.
 * Used for building dropdowns in survey import forms.
 */
const getAvailableCombinations = async () => {
  return MasterList.aggregate([
    { $match: { status: 'Active' } },
    {
      $group: {
        _id: { category: '$category', assetType: '$assetType' },
        parameterCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.category': 1, '_id.assetType': 1 } }
  ]);
};

module.exports = { resolveParameters, getAvailableCombinations };
