require('dotenv').config();
const mongoose = require('mongoose');
const MasterList = require('./src/models/MasterList.model');
const connectDB = require('./src/config/db');

async function check() {
  try {
    await connectDB();
    const signages = await MasterList.distinct('assetType', { project: 'APEL', assetType: { $regex: /Signages/i } });
    console.log(`\n--- Signages Asset Types ---`);
    console.log(signages);
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
}
check();
