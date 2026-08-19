require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./src/models/User.model');

async function testE2E() {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteOne({ email: 'e2e_test@example.com' });
  
  // 1. Get an admin token (using the seed admin)
  let adminToken;
  try {
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin@hirate.in',
      password: 'Admin@123456'
    });
    adminToken = loginRes.data.data.token;
    console.log('Admin login successful');
  } catch (err) {
    console.log('Admin login failed:', err.response?.data || err.message);
    return;
  }

  // 2. Create user via User Management endpoint
  try {
    const createRes = await axios.post('http://localhost:5000/api/v1/users', {
      name: 'E2E Test',
      username: 'e2e_test',
      email: 'e2e_test@example.com',
      password: 'password123',
      role: 'User',
      manager: 'Manager',
      mobile: '1234567890',
      roadAssignment: 'Road 1',
      designation: 'Tester',
      jobDescription: 'Testing'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('User created:', createRes.data.data._id);
  } catch (err) {
    console.log('User creation failed:', err.response?.data || err.message);
    return;
  }

  // 3. Try to login with the new user
  try {
    const userLoginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'e2e_test@example.com',
      password: 'password123'
    });
    console.log('User login 1 successful! Token:', !!userLoginRes.data.data.token);
  } catch (err) {
    console.log('User login 1 failed:', err.response?.data || err.message);
  }

  // 4. Try to login a second time
  try {
    const userLoginRes2 = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'e2e_test@example.com',
      password: 'password123'
    });
    console.log('User login 2 successful! Token:', !!userLoginRes2.data.data.token);
  } catch (err) {
    console.log('User login 2 failed:', err.response?.data || err.message);
  }

  // 5. Update the user's password
  const userId = createRes.data.data._id;
  try {
    const updateRes = await axios.put(`http://localhost:5000/api/v1/users/${userId}`, {
      password: 'newpassword123'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('User update successful!');
  } catch (err) {
    console.log('User update failed:', err.response?.data || err.message);
  }

  // 6. Try to login with new password
  try {
    const userLoginRes3 = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'e2e_test@example.com',
      password: 'newpassword123'
    });
    console.log('User login 3 successful! Token:', !!userLoginRes3.data.data.token);
  } catch (err) {
    console.log('User login 3 failed:', err.response?.data || err.message);
  }

  mongoose.disconnect();
}

testE2E();
