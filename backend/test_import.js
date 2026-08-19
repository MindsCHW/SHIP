const XLSX = require('xlsx');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testImport() {
  console.log('Generating dummy Excel file...');
  // 1. Create a dummy Excel file matching the expected columns
  const data = [
    {
      Category: 'Roadway',
      AssetType: 'Pavement',
      Parameter: 'Potholes',
      Question: 'Rate the severity of potholes',
      RoadType: 'Main Carriageway',
      Placement: 'LHS',
      TypeOfWork: 'Maintenance',
      RatingScale: '0, 1, 5, 10',
      SortOrder: 1
    },
    {
      Category: 'Structures',
      AssetType: 'Bridge',
      Parameter: 'Cracks',
      Question: 'Rate the cracks on bridge',
      RoadType: 'Both',
      Placement: 'Both',
      TypeOfWork: 'Maintenance',
      RatingScale: '0, 10',
      SortOrder: 2
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "MasterData");
  
  const excelFilePath = path.join(__dirname, 'dummy_master_data.xlsx');
  XLSX.writeFile(wb, excelFilePath);

  try {
    console.log('Authenticating to get JWT token...');
    // 2. Login to get JWT
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin@hirate.in',
      password: 'Admin@123456'
    });
    const token = loginRes.data.data.token;

    console.log('Uploading Excel file...');
    // 3. Upload Excel file
    const formData = new FormData();
    formData.append('file', fs.createReadStream(excelFilePath));

    const uploadRes = await axios.post('http://localhost:5000/api/v1/master/import', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('--- SUCCESS ---');
    console.log(uploadRes.data);
  } catch (err) {
    console.error('--- ERROR ---');
    console.error(err.response ? err.response.data : err.message);
  } finally {
    // Cleanup
    if (fs.existsSync(excelFilePath)) {
      fs.unlinkSync(excelFilePath);
    }
  }
}

testImport();
