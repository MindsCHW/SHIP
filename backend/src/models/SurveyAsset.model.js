const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
  mimeType: { type: String }
}, { _id: false });

const SurveyAssetSchema = new mongoose.Schema({
  project: { type: String, required: true, index: true },
  assetName: { type: String, required: true, index: true }, // e.g., 'SIPL_001'
  roadDirection: { type: String, enum: ['LHS', 'RHS'] },
  roadType: { type: String, default: 'All Types', index: true },
  status: { 
    type: String, 
    enum: ['DRAFT', 'UPLOADING', 'PARSING_METADATA', 'READY', 'PROCESSING', 'COMPLETED'], 
    default: 'DRAFT' 
  },
  surveyType: {
    type: String,
    enum: ['DAY', 'NIGHT'],
    default: 'DAY',
    index: true
  },
  
  video: fileSchema,
  vtt: fileSchema,
  
  // Parsed from VTT on upload
  coverage: {
    startChainage: { type: Number },
    endChainage: { type: Number },
    startTime: { type: String },
    endTime: { type: String },
    chainageCount: { type: Number }
  },

  lastExtractedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// A given project should only have one asset with a specific assetName
SurveyAssetSchema.index({ project: 1, assetName: 1 }, { unique: true });

module.exports = mongoose.model('SurveyAsset', SurveyAssetSchema);
