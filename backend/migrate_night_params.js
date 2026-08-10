require('dotenv').config();
const mongoose = require('mongoose');
const MasterList = require('./src/models/MasterList.model');
const connectDB = require('./src/config/db');

async function migrate() {
  try {
    await connectDB();
    console.log('Connected to DB');

    const nightParamsConditions = [
      {
        assetType: 'Pavement Markings',
        parameter: { $regex: /night visibility/i }
      },
      {
        assetType: { $regex: /signages/i },
        parameter: { $regex: /retro reflectivity/i }
      },
      {
        assetType: 'Traffic Blinkers and Signals',
        parameter: { $regex: /functional condition/i }
      },
      {
        assetType: 'Lightings',
        parameter: { $regex: /functional condition/i }
      },
      {
        assetType: 'Delineators',
        parameter: { $regex: /functional condition/i }
      }
    ];

    const result = await MasterList.updateMany(
      { $or: nightParamsConditions },
      { $set: { imageRequirement: 'NIGHT' } }
    );

    console.log(`Matched ${result.matchedCount} parameters. Modified ${result.modifiedCount} parameters to NIGHT.`);

    // Set remaining to DAY explicitly 
    const dayResult = await MasterList.updateMany(
      { 
        $nor: nightParamsConditions 
      },
      { $set: { imageRequirement: 'DAY' } }
    );

    console.log(`Set ${dayResult.modifiedCount} remaining parameters to DAY.`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrate();
