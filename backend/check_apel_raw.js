require('dotenv').config();
const mongoose = require('mongoose');
const MasterList = require('./src/models/MasterList.model');
const connectDB = require('./src/config/db');

async function check() {
  try {
    await connectDB();
    const pm = await MasterList.find({ project: 'APEL', assetType: 'Pavement Markings' }).limit(5);
    console.log(JSON.stringify(pm, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
}
check();
