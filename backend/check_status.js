const mongoose = require('mongoose');
const InspectionTask = require('./src/models/InspectionTask.model');
require('dotenv').config();

async function checkTasks() {
  await mongoose.connect(process.env.MONGODB_URI);
  const tasks = await InspectionTask.find({ batchId: '6a643868f266d8f32dfa554e' });
  
  const statusCounts = {};
  for (const t of tasks) {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  }
  
  console.log('Status counts for this batch:', statusCounts);
  process.exit(0);
}
checkTasks();
