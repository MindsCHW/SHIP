require('dotenv').config();
const mongoose = require('mongoose');
const MasterList = require('./src/models/MasterList.model');
const connectDB = require('./src/config/db');

async function check() {
  try {
    await connectDB();
    const count = await MasterList.countDocuments({ project: 'APEL', imageRequirement: 'NIGHT' });
    const all = await MasterList.countDocuments({ project: 'APEL' });
    console.log(`APEL has ${count} NIGHT parameters out of ${all} total parameters.`);
    
    // specifically pavement markings
    const pmNight = await MasterList.find({ project: 'APEL', assetType: 'Pavement Markings', imageRequirement: 'NIGHT' });
    console.log('NIGHT PM Params:', pmNight.map(p => p.parameter));

    const pmDay = await MasterList.find({ project: 'APEL', assetType: 'Pavement Markings', imageRequirement: 'DAY' });
    console.log('DAY PM Params:', pmDay.map(p => p.parameter));

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
}
check();
