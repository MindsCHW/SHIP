require('dotenv').config();
const mongoose = require('mongoose');
const MasterList = require('./src/models/MasterList.model');
const connectDB = require('./src/config/db');

async function check() {
  try {
    await connectDB();
    
    // Find unique parameters in APEL that are related to Signages, Pavement Markings, Blinkers, Lightings, Delineators
    const assetTypes = ['Signages', 'Pavement Markings', 'Traffic Blinkers and Signals', 'Lightings', 'Delineators'];
    
    for (const type of assetTypes) {
      const params = await MasterList.distinct('parameter', { project: 'APEL', assetType: type });
      console.log(`\n--- ${type} ---`);
      console.log(params);
    }
    
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
}
check();
