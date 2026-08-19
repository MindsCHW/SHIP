require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./src/models/Project.model');
const MasterCategory = require('./src/models/MasterCategory.model');
const MasterAsset = require('./src/models/MasterAsset.model');
const MasterQuestion = require('./src/models/MasterQuestion.model');
const MasterImage = require('./src/models/MasterImage.model');
const User = require('./src/models/User.model');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hirate';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clean previous seed data to avoid unique index conflicts
    await Project.deleteMany({ code: { $in: ['NH16', 'NH44'] } });
    await MasterCategory.deleteMany({});
    await MasterAsset.deleteMany({});
    await MasterQuestion.deleteMany({});
    await MasterImage.deleteMany({});

    // Find an admin user for uploadedBy
    const adminUser = await User.findOne({ role: 'Admin' });
    const uploadedById = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

    // 1. Create 2 Projects
    const projectsData = [
      { code: 'NH16', fullName: 'National Highway 16', client: 'NHAI', state: 'Odisha', highway: 'NH16', status: 'ON-GOING' },
      { code: 'NH44', fullName: 'National Highway 44', client: 'NHAI', state: 'Telangana', highway: 'NH44', status: 'ON-GOING' }
    ];
    
    const createdProjects = await Project.insertMany(projectsData);
    console.log(`Created ${createdProjects.length} Projects`);

    // 2. Create 4 Categories per Project (8 Total)
    const categoryNames = ['Drainage', 'Structures', 'Road Furniture', 'Pavement'];
    const categoriesData = [];
    for (const project of createdProjects) {
      for (const catName of categoryNames) {
        categoriesData.push({ name: catName, projectId: project._id });
      }
    }
    const createdCategories = await MasterCategory.insertMany(categoriesData);
    console.log(`Created ${createdCategories.length} Categories`);

    // 3. Create 5 Assets per Category (40 Total)
    const assetsData = [];
    for (const category of createdCategories) {
      for (let i = 1; i <= 5; i++) {
        assetsData.push({ name: `${category.name} Asset ${i}`, categoryId: category._id });
      }
    }
    const createdAssets = await MasterAsset.insertMany(assetsData);
    console.log(`Created ${createdAssets.length} Assets`);

    // 4. Create 8 Questions per Asset (320 Total)
    const questionsData = [];
    for (const asset of createdAssets) {
      for (let i = 1; i <= 8; i++) {
        questionsData.push({ questionText: `Is ${asset.name} functioning properly in condition ${i}?`, assetId: asset._id });
      }
    }
    const createdQuestions = await MasterQuestion.insertMany(questionsData);
    console.log(`Created ${createdQuestions.length} Questions`);

    // 5. Create 3 Images per Question (960 Total)
    const imagesData = [];
    for (const question of createdQuestions) {
      for (let i = 1; i <= 3; i++) {
        imagesData.push({
          imageUrl: `https://res.cloudinary.com/demo/image/upload/sample.jpg?q=${question._id}&i=${i}`,
          questionId: question._id,
          chainage: `${100 + i}+${i * 10}`,
          latitude: 17.3850 + (i * 0.001),
          longitude: 78.4867 + (i * 0.001),
          roadDirection: i % 2 === 0 ? 'LHS' : 'RHS',
          capturedTime: new Date(),
          uploadedBy: uploadedById,
          status: 'PENDING'
        });
      }
    }
    
    // Insert images in chunks to avoid memory issues
    const chunkSize = 100;
    for (let i = 0; i < imagesData.length; i += chunkSize) {
      await MasterImage.insertMany(imagesData.slice(i, i + chunkSize));
    }
    console.log(`Created ${imagesData.length} Images`);

    console.log('Massive Seeding Complete!');
  } catch (error) {
    console.error('Seeding Error:', error);
  } finally {
    process.exit(0);
  }
}

seed();
