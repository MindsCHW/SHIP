const mongoose = require('mongoose');
const InspectionTask = require('./src/models/InspectionTask.model');
require('dotenv').config();

async function checkTasks() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const tasks = await InspectionTask.find({}).sort({ createdAt: -1 }).limit(1);
  console.log(JSON.stringify(tasks[0], null, 2));
  
  process.exit(0);
}

checkTasks().catch(console.error);
