'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User.model');
const Project = require('../models/Project.model');

const PROJECTS = [
  { code: 'APEL', fullName: 'Andhra Pradesh Expressway Limited (APEL)', status: 'ON-GOING', coordinates: { lat: 15.9129, lng: 79.7400 } },
  { code: 'DATL', fullName: 'Delhi Agra Tollway Limited (DATL)', status: 'HO-RATED', coordinates: { lat: 27.4924, lng: 77.9739 } },
  { code: 'FRHL', fullName: 'Farakka-Raiganj Highways Ltd (FRHL)', status: 'HO-PROCESS', coordinates: { lat: 24.8072, lng: 87.9164 } },
  { code: 'JMTPL', fullName: 'Jaipur-Mahua Tollway Private Limited (JMTPL)', status: 'SPV-RATED', coordinates: { lat: 26.9124, lng: 75.7873 } },
  { code: 'KETPL', fullName: 'Kanyakumari-Etturavattam Tollway Private Limited (KETPL)', status: 'ON-GOING', coordinates: { lat: 8.0883, lng: 77.5385 } },
  { code: 'KMTPL', fullName: 'Kotwa-Muzaffarpur Tollway Private Limited (KMTPL)', status: 'HO-RATED', coordinates: { lat: 26.1197, lng: 85.3910 } },
  { code: 'MBEL', fullName: 'Mahua Bharatpur Expressway Limited (MBEL)', status: 'HO-PROCESS', coordinates: { lat: 27.4924, lng: 77.5139 } },
  { code: 'MKTPL', fullName: 'Madurai-Kanyakumari Tollway Private Limited (MKTPL)', status: 'SPV-RATED', coordinates: { lat: 9.9252, lng: 78.1198 } },
  { code: 'NAM', fullName: 'N A M Expressway Limited (NAMEL)', status: 'ON-GOING', coordinates: { lat: 17.3850, lng: 78.4867 } },
  { code: 'NDEPL', fullName: 'Nelamangla Devihalli Expressway Private Limited (NDEPL)', status: 'HO-RATED', coordinates: { lat: 13.0989, lng: 77.3983 } },
  { code: 'NKTPL', fullName: 'Nanguneri-Kanyakumari Tollway Private Limited (NKTPL)', status: 'HO-PROCESS', coordinates: { lat: 8.3183, lng: 77.4119 } },
  { code: 'SMTPL', fullName: 'Salaipudhur-Madurai Tollway Private Limited (SMTPL)', status: 'SPV-RATED', coordinates: { lat: 10.5049, lng: 78.1276 } },
  { code: 'WUPTL', fullName: 'Western UP Tollway Limited (WUPTL)', status: 'HO-RATED', coordinates: { lat: 28.7041, lng: 77.1025 } },
  { code: 'WVEL', fullName: 'KNR Walayar Tollways Pvt Ltd (WVEL)', status: 'ON-GOING', coordinates: { lat: 10.8505, lng: 76.2711 } },
  { code: 'KTIPL', fullName: 'KNR Tirumala Infra Private Limited (KTIPL)', status: 'HO-RATED', coordinates: { lat: 13.6288, lng: 79.4192 } },
  { code: 'SPPL', fullName: 'KNR Shankarampet Projects Private Limited (SPPL)', status: 'HO-PROCESS', coordinates: { lat: 17.5385, lng: 78.5726 } },
  { code: 'MSHP', fullName: 'DBL Mangalwedha Solapur Highways Private Limited (MSHP)', status: 'SPV-RATED', coordinates: { lat: 17.5144, lng: 75.4638 } },
  { code: 'MHPL', fullName: 'DBL Mangloor Highways Private Limited (MHPL)', status: 'ON-GOING', coordinates: { lat: 12.9141, lng: 74.8560 } },
  { code: 'BWHPL', fullName: 'DBL Borgaon Watambare Highways Private Limited (BWHPL)', status: 'HO-PROCESS', coordinates: { lat: 21.7645, lng: 78.5700 } },
  { code: 'GAEPL', fullName: 'Ghaziabad Aligarh Expressway Private Limited (GAEPL)', status: 'SPV-RATED', coordinates: { lat: 28.6692, lng: 77.4538 } },
  { code: 'SIPL', fullName: 'KNR Srirangam Infra Private Limited (SIPL)', status: 'HO-RATED', coordinates: { lat: 10.8603, lng: 78.6887 } },
  { code: 'BFHL', fullName: 'Baharampore Farakka Highways Limited (BFHL)', status: 'HO-PROCESS', coordinates: { lat: 24.1040, lng: 88.2509 } },
  { code: 'KHEPL', fullName: 'Kokhraj Handia Expressway Pvt Ltd (KHEPL)', status: 'ON-GOING', coordinates: { lat: 25.4358, lng: 81.8463 } },
  { code: 'WMPTL', fullName: 'Western MP Infrastructure & Toll Roads Pvt Ltd (WMPTL)', status: 'HO-RATED', coordinates: { lat: 22.9734, lng: 78.6569 } },
  { code: 'DHMEPL', fullName: 'Delhi Hapur Meerut Expressway Private Limited (DHMEPL)', status: 'SPV-RATED', coordinates: { lat: 28.9845, lng: 77.7064 } },
  { code: 'ADTPL', fullName: 'Devanahalli Tollway Private Limited (DTPL)', status: 'HO-PROCESS', coordinates: { lat: 13.2479, lng: 77.7173 } },
  { code: 'JUHPL', fullName: 'Jammu Udhampur Highway Private limited (JUHPL)', status: 'HO-RATED', coordinates: { lat: 32.7266, lng: 74.8570 } }
];

const seedDB = async () => {
  console.log("Mongo URI:", process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding...');

  // ── Seed Admin User ────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hirate.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      username: 'admin',
      passwordHash: adminPassword,
      role: 'Admin',
      designation: 'System Administrator',
      isActive: true
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`⏭️  Admin user already exists: ${adminEmail}`);
  }

  // Seed demo HO user
  const hoEmail = 'ho@hirate.in';
  if (!(await User.findOne({ email: hoEmail }))) {
    await User.create({
      name: 'HO Inspector',
      email: hoEmail,
      username: 'ho_inspector',
      passwordHash: 'HO@123456',
      role: 'HO',
      designation: 'Head Office Inspector',
      isActive: true
    });
    console.log(`✅ HO user created: ${hoEmail}`);
  }

  // Seed demo SPV user
  const spvEmail = 'spv@hirate.in';
  if (!(await User.findOne({ email: spvEmail }))) {
    await User.create({
      name: 'SPV Inspector',
      email: spvEmail,
      username: 'spv_inspector',
      passwordHash: 'SPV@123456',
      role: 'SPV',
      designation: 'SPV Inspector',
      isActive: true
    });
    console.log(`✅ SPV user created: ${spvEmail}`);
  }

  // ── Seed Projects ─────────────────────────────────────────────────────────
  let inserted = 0;
  let skipped = 0;
  for (const project of PROJECTS) {
    const exists = await Project.findOne({ code: project.code });
    if (!exists) {
      await Project.create({
        ...project,
        reportedBy: 'Swaraj',
        dateCreated: '23-Aug-23, 2:08:02 PM',
        isActive: true
      });
      inserted++;
    } else {
      skipped++;
    }
  }
  console.log(`✅ Projects: ${inserted} inserted, ${skipped} skipped`);

  console.log('\n🎉 Seeding complete!');
  console.log('──────────────────────────────────');
  console.log(`Admin Login:  ${adminEmail} / ${adminPassword}`);
  console.log(`HO Login:     ho@hirate.in / HO@123456`);
  console.log(`SPV Login:    spv@hirate.in / SPV@123456`);
  console.log('──────────────────────────────────');

  await mongoose.connection.close();
  process.exit(0);
};

seedDB().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
