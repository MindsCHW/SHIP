const mongoose = require('mongoose');
const InspectionBatch = require('./src/models/InspectionBatch.model');
const InspectionTask = require('./src/models/InspectionTask.model');
require('dotenv').config();

async function deepDebug() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const batches = await InspectionBatch.find({}).sort({ createdAt: -1 }).limit(3);
  for(const batch of batches) {
    console.log(`\n=== Batch ${batch._id} ===`);
    console.log(`Status: ${batch.status}`);
    console.log(`Created: ${batch.createdAt}`);
    console.log(`Updated: ${batch.updatedAt}`);
    
    const tasks = await InspectionTask.find({ batchId: batch._id });
    
    const statuses = {};
    for (const t of tasks) {
      statuses[t.status] = (statuses[t.status] || 0) + 1;
    }
    
    console.log(`Total Tasks: ${tasks.length}`);
    console.log(`Task Statuses:`, statuses);
  }
  
  process.exit(0);
}

deepDebug().catch(console.error);
