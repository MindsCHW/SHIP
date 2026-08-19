const mongoose = require('mongoose');
require('dotenv').config();

const InspectionTask = require('./src/models/InspectionTask.model');
const InspectionBatch = require('./src/models/InspectionBatch.model');
const WorkAssignment = require('./src/models/WorkAssignment.model');

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const projectName = 'NAM';

    const tasks = await InspectionTask.deleteMany({ project: projectName });
    console.log(`Deleted ${tasks.deletedCount} tasks for ${projectName}`);

    const batches = await InspectionBatch.deleteMany({ project: projectName });
    console.log(`Deleted ${batches.deletedCount} batches for ${projectName}`);

    const assignments = await WorkAssignment.deleteMany({ project: projectName });
    console.log(`Deleted ${assignments.deletedCount} assignments for ${projectName}`);

    console.log('Cleanup complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanup();
