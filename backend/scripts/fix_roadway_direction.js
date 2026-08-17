const mongoose = require('mongoose');
require('dotenv').config();

const InspectionTask = require('../src/models/InspectionTask.model');
const SurveyAsset = require('../src/models/SurveyAsset.model');

async function fixDirection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hirate');
    console.log('Connected to DB');

    const tasks = await InspectionTask.find({ category: 'Roadway', direction: { $exists: false } }).populate('extractionDiagnostics.surveyAssetId');
    console.log(`Found ${tasks.length} Roadway tasks without direction.`);

    let updatedCount = 0;
    for (const task of tasks) {
      if (task.extractionDiagnostics && task.extractionDiagnostics.surveyAssetId) {
        const asset = task.extractionDiagnostics.surveyAssetId; // Because populated
        task.direction = asset.roadDirection || '-';
        await task.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated direction for ${updatedCount} Roadway tasks.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

fixDirection();
