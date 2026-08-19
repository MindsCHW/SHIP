const mongoose = require('mongoose');
const InspectionTask = require('../src/models/InspectionTask.model');
const { ROADWAY_PARAMETER_CONFIG } = require('../src/constants/roadwayConfig');
require('dotenv').config();

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hirate');
  console.log('Connected to DB');

  const tasks = await InspectionTask.find({ assetType: 'Roadway', $or: [{ category: { $in: [null, '-', ''] } }, { category: { $exists: false } }] });
  console.log(`Found ${tasks.length} tasks to migrate`);

  for (const task of tasks) {
    task.category = 'Roadway';
    if (!task.ratings || task.ratings.length === 0) {
      task.ratings = ROADWAY_PARAMETER_CONFIG;
    }
    await task.save();
  }

  console.log('Migration complete');
  process.exit(0);
}

migrate().catch(console.error);
