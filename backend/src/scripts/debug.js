const mongoose = require('mongoose');
const InspectionTask = require('../models/InspectionTask.model');

mongoose.connect('mongodb://127.0.0.1:27017/hi-rate2').then(async () => {
  const tasks = await InspectionTask.find({'image.cloudinaryUrl': {$exists: true, $ne: null}}).limit(5);
  console.log('Tasks with images:', tasks.map(t => ({
    chainage: t.chainage,
    project: t.project,
    img: t.image.cloudinaryUrl,
    diag: t.extractionDiagnostics
  })));
  process.exit();
}).catch(console.error);
