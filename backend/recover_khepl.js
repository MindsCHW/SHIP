const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const InspectionTask = require('./src/models/InspectionTask.model');

async function recoverKheplRatings() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // Find all tasks for KHEPL that have ratings but are not in COMPLETED status
    const filter = {
      project: /KHEPL/i,
      $expr: { $gt: [{ $size: { $ifNull: ['$ratings', []] } }, 0] },
      status: { $ne: 'COMPLETED' }
    };

    const count = await InspectionTask.countDocuments(filter);
    console.log(`Found ${count} tasks with existing ratings that are not COMPLETED.`);

    if (count > 0) {
      const result = await InspectionTask.updateMany(filter, { $set: { status: 'COMPLETED' } });
      console.log(`Successfully recovered and set ${result.modifiedCount} tasks back to COMPLETED status.`);
    }

    // Also let's check if the batch was messed up.
    // We should make sure the tasks are in a COMPLETED or IN_PROGRESS batch.
    // This is optional since tasks handle their own state.

    console.log('Recovery finished.');
  } catch (error) {
    console.error('Error recovering ratings:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

recoverKheplRatings();
