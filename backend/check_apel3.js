require('dotenv').config();
const mongoose = require('mongoose');
const MasterList = require('./src/models/MasterList.model');
const connectDB = require('./src/config/db');

async function check() {
  try {
    await connectDB();
    const assetTypesRegex = [/Signages/i, /Traffic Blinkers and Signals/i, /Lightings/i, /Delineators/i];
    
    for (const type of assetTypesRegex) {
      const nightParams = await MasterList.find({ project: 'APEL', assetType: type, imageRequirement: 'NIGHT' }).distinct('parameter');
      console.log(`\n--- NIGHT Params for ${type} ---`);
      console.log(nightParams);
    }

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
}
check();
