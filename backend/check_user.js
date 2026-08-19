const mongoose = require('mongoose');
const User = require('./src/models/User.model');
require('dotenv').config();

async function checkUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({}).lean();
  console.log(users.map(u => ({ email: u.email, role: u.role })));
  process.exit(0);
}

checkUser();
