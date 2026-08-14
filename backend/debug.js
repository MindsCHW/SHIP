require('dotenv').config();
const mongoose = require('mongoose');
const InspectionTask = require('./src/models/InspectionTask.model');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const c = 195.2;
  const t1 = await InspectionTask.find({'chainage': '195.200', 'image.cloudinaryUrl': {$exists: true}}).countDocuments();
  const t2 = await InspectionTask.find({'chainage': '195.2', 'image.cloudinaryUrl': {$exists: true}}).countDocuments();
  console.log('Count for 195.200:', t1);
  console.log('Count for 195.2:', t2);
  process.exit();
}).catch(console.error);
