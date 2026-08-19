const mongoose = require('mongoose');
const InspectionTask = require('./src/models/InspectionTask.model');
require('dotenv').config();

async function testSave() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hirate');
  
  // get one roadway task
  const task = await InspectionTask.findOne({ category: 'Roadway' });
  console.log('Original ratings:', task.ratings.map(r => ({ key: r.parameterKey, group: r.group, score: r.score, remark: r.remark })));
  
  // Simulate what frontend sends
  const payload = task.ratings.map(r => ({
    parameterKey: r.parameterKey,
    parameterName: r.parameterName,
    group: r.group,
    score: 5,
    remark: 'Testing remark'
  }));

  task.ratings = payload;
  task.status = 'COMPLETED';
  await task.save();

  // Read it back
  const saved = await InspectionTask.findById(task._id).lean();
  console.log('Saved ratings:', saved.ratings.map(r => ({ key: r.parameterKey, group: r.group, score: r.score, remark: r.remark })));
  
  process.exit(0);
}

testSave().catch(console.error);
