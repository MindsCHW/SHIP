const mongoose = require('mongoose');
const InspectionBatch = require('./src/models/InspectionBatch.model');
const InspectionTask = require('./src/models/InspectionTask.model');
require('dotenv').config();

async function testDelete() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const batch = await InspectionBatch.findOne().sort({ createdAt: -1 });
    if (!batch) {
      console.log('No batch found');
      process.exit(0);
    }
    
    console.log(`Attempting to delete batch ${batch._id}`);
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await InspectionTask.deleteMany({ batchId: batch._id }, { session });
      await InspectionBatch.findByIdAndDelete(batch._id, { session });

      await session.commitTransaction();
      session.endSession();
      console.log('Successfully deleted with transaction');
    } catch (err) {
      console.error('Transaction Failed:', err.message, err.stack);
      await session.abortTransaction();
      session.endSession();
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Connection Failed:', err);
    process.exit(1);
  }
}

testDelete();
