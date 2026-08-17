const mongoose = require('mongoose');
const InspectionTask = require('./src/models/InspectionTask.model');
const { ROADWAY_PARAMETER_CONFIG } = require('./src/constants/roadwayConfig');
require('dotenv').config();

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hirate');
  
  const task = await InspectionTask.findOne({ project: 'GMC-BS', chainage: '295.960' });
  console.log('Before update:', task.ratings.map(r => r.group));
  
  task.ratings = ROADWAY_PARAMETER_CONFIG;
  await task.save();
  
  const updatedTask = await InspectionTask.findOne({ project: 'GMC-BS', chainage: '295.960' }).lean();
  console.log('After update:', updatedTask.ratings.map(r => r.group));
  
  process.exit(0);
}

fix().catch(console.error);
