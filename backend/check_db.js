const mongoose = require('mongoose');
const InspectionTask = require('./src/models/InspectionTask.model');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hirate');
  
  const task = await InspectionTask.findOne({ project: 'GMC-BS', chainage: '295.960' }).lean();
  console.log(JSON.stringify(task, null, 2));
  
  process.exit(0);
}

check().catch(console.error);
