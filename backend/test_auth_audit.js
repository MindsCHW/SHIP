require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const userService = require('./src/modules/users/user.service');
const bcrypt = require('bcryptjs');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Cleanup test user
  await User.deleteOne({ email: 'test_user_audit@example.com' });

  console.log('Creating user...');
  const user = await userService.createUser({
    name: 'Test Audit User',
    email: 'test_user_audit@example.com',
    username: 'testaudit',
    password: 'password123',
    role: 'User'
  });
  
  console.log('User created:', user._id);
  
  // Fetch user directly from DB to see the hash
  const rawUser = await User.findById(user._id).select('+passwordHash');
  console.log('Raw hash from DB:', rawUser.passwordHash);
  
  // Verify it
  const isMatch = await bcrypt.compare('password123', rawUser.passwordHash);
  console.log('Does password match "password123"?', isMatch);
  
  // Test via auth service login
  const authService = require('./src/modules/auth/auth.service');
  try {
    const loginResult = await authService.login('test_user_audit@example.com', 'password123');
    console.log('Login successful!', !!loginResult.token);
  } catch (err) {
    console.log('Login failed:', err.message);
  }

  mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
