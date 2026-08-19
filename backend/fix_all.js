const mongoose = require('mongoose');
const InspectionTask = require('./src/models/InspectionTask.model');
const { ROADWAY_PARAMETER_CONFIG } = require('./src/constants/roadwayConfig');
require('dotenv').config();

async function fixAll() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hirate');
  console.log('Connected to DB');

  const tasks = await InspectionTask.find({ category: 'Roadway' });
  console.log(`Found ${tasks.length} tasks to fix`);

  let count = 0;
  for (const task of tasks) {
    let hasGroup = false;
    if (task.ratings && task.ratings.length > 0 && task.ratings[0].group) {
      hasGroup = true;
    }
    
    if (!hasGroup) {
      // Overwrite with the proper config so 'group' gets saved
      // But preserve scores/remarks if they were already rated
      const currentRatings = task.ratings || [];
      const newRatings = ROADWAY_PARAMETER_CONFIG.map(config => {
        const existing = currentRatings.find(r => r.parameterKey === config.parameterKey);
        return {
          ...config,
          score: existing ? existing.score : 10,
          remark: existing ? existing.remark : ''
        };
      });
      
      task.ratings = newRatings;
      await task.save();
      count++;
    }
  }

  console.log(`Fixed ${count} tasks!`);
  process.exit(0);
}

fixAll().catch(console.error);
