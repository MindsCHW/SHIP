const mongoose = require('mongoose');
const InspectionBatch = require('./src/models/InspectionBatch.model');
const InspectionTask = require('./src/models/InspectionTask.model');
require('dotenv').config();

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log('--- InspectionBatch ---');
  const batches = await InspectionBatch.find({}).sort({ createdAt: -1 });
  console.log(`Found: ${batches.length}\n`);

  for (const batch of batches) {
    console.log(`Batch ID: ${batch._id}`);
    console.log(`Project: ${batch.project}`);
    console.log(`Status: ${batch.status}`);
    console.log('------------------------');

    const tasks = await InspectionTask.find({ batchId: batch._id });
    const mappedImages = tasks.filter(t => t.image?.cloudinaryUrl || t.imageUrl).length;

    console.log('--- InspectionTasks ---');
    console.log(`Found: ${tasks.length}`);
    console.log(`Mapped Images: ${mappedImages}`);
    
    // Log the first task as a sample for this batch
    if (tasks.length > 0) {
      const sample = tasks[0];
      console.log(`\nSample Task:`);
      console.log(`  Chainage: ${sample.chainage}`);
      console.log(`  Status: ${sample.status}`);
      console.log(`  Image URL: ${sample.image?.cloudinaryUrl || sample.imageUrl || 'None'}`);
    }
    console.log('========================\n');
  }

  console.log('--- Image Review Query ---');
  console.log('Searching:');
  console.log('status = READY_FOR_REVIEW\n');

  const reviewBatches = await InspectionBatch.find({ status: 'READY_FOR_REVIEW' });
  console.log(`Returned: ${reviewBatches.length}`);

  process.exit(0);
}

debug().catch(console.error);
