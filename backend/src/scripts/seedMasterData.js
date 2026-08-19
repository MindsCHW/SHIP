'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const MasterData = require('../models/MasterData.model');

/**
 * Sample Master Data seed — representative parameters for each category.
 * This mirrors what would be imported from the Master Excel.
 * Replace/extend via POST /api/v1/master/import with the real Excel.
 */
const MASTER_DATA = [
  // ── ROADWAY ──────────────────────────────────────────────────────────────────
  { category: 'Roadway', assetType: 'Pavement', roadType: 'MCW', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Cracks', question: 'Rate the severity and extent of pavement cracking', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Roadway', assetType: 'Pavement', roadType: 'MCW', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Rutting', question: 'Rate the rutting depth and extent on pavement surface', ratingScale: [0, 1, 5, 10], sortOrder: 2 },
  { category: 'Roadway', assetType: 'Pavement', roadType: 'MCW', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Pothole', question: 'Rate the occurrence and severity of potholes', ratingScale: [0, 1, 5, 10], sortOrder: 3 },
  { category: 'Roadway', assetType: 'Pavement', roadType: 'SR', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Cracks', question: 'Rate the severity and extent of pavement cracking (Service Road)', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Roadway', assetType: 'Pavement', roadType: 'SR', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Rutting', question: 'Rate the rutting depth and extent on service road pavement', ratingScale: [0, 1, 5, 10], sortOrder: 2 },
  { category: 'Roadway', assetType: 'Embankment', roadType: 'Both', placement: 'LHS', typeOfWork: 'Maintenance', parameter: 'Erosion', question: 'Rate the erosion and slope failure on the LHS embankment', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Roadway', assetType: 'Embankment', roadType: 'Both', placement: 'RHS', typeOfWork: 'Maintenance', parameter: 'Erosion', question: 'Rate the erosion and slope failure on the RHS embankment', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Roadway', assetType: 'Embankment', roadType: 'Both', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Settlement', question: 'Rate the differential settlement observed on the embankment', ratingScale: [0, 1, 5, 10], sortOrder: 2 },
  { category: 'Roadway', assetType: 'Embankment', roadType: 'Both', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Vegetation', question: 'Rate the condition of vegetation on embankment slopes', ratingScale: [0, 1, 5, 10], sortOrder: 3 },
  { category: 'Roadway', assetType: 'Drainage', roadType: 'Both', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Blockage', question: 'Rate the level of blockage in the drainage channel', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Roadway', assetType: 'Drainage', roadType: 'Both', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Structural Damage', question: 'Rate the structural damage to drainage components', ratingScale: [0, 1, 5, 10], sortOrder: 2 },
  { category: 'Roadway', assetType: 'Drainage', roadType: 'Both', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Vegetation Overgrowth', question: 'Rate vegetation overgrowth obstructing drainage flow', ratingScale: [0, 1, 5, 10], sortOrder: 3 },
  { category: 'Roadway', assetType: 'Shoulder', roadType: 'Both', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Condition', question: 'Rate the overall condition of the shoulder', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Roadway', assetType: 'Kerb', roadType: 'Both', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Damage', question: 'Rate the damage to kerb and edge elements', ratingScale: [0, 1, 5, 10], sortOrder: 1 },

  // ── ROAD SIGNAGE AND FURNITURE ────────────────────────────────────────────────
  { category: 'Road Signage and Furniture', assetType: 'Signages', roadType: 'Both', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Retro Reflectivity', question: 'Rate the retro-reflectivity of signage', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Road Signage and Furniture', assetType: 'Signages', roadType: 'Both', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Damage', question: 'Rate the physical damage to signage panels and posts', ratingScale: [0, 1, 5, 10], sortOrder: 2 },
  { category: 'Road Signage and Furniture', assetType: 'Signages', roadType: 'Both', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Visibility', question: 'Rate the overall visibility and legibility of signage', ratingScale: [0, 1, 5, 10], sortOrder: 3 },
  { category: 'Road Signage and Furniture', assetType: 'Pavement Markings', roadType: 'Both', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Visibility', question: 'Rate the visibility and condition of pavement markings', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Road Signage and Furniture', assetType: 'Pavement Markings', roadType: 'Both', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Retro Reflectivity', question: 'Rate the retro-reflectivity of pavement markings', ratingScale: [0, 1, 5, 10], sortOrder: 2 },
  { category: 'Road Signage and Furniture', assetType: 'Traffic Blinkers and Signals', roadType: 'Both', placement: 'Both', typeOfWork: 'Operations', parameter: 'Functionality', question: 'Rate the functionality of traffic blinkers and signals', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Road Signage and Furniture', assetType: 'Lightings', roadType: 'Both', placement: 'Both', typeOfWork: 'Operations', parameter: 'Functionality', question: 'Rate the functionality of road lighting', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Road Signage and Furniture', assetType: 'Lightings', roadType: 'Both', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Physical Condition', question: 'Rate the physical condition of lighting poles and fixtures', ratingScale: [0, 1, 5, 10], sortOrder: 2 },

  // ── PROJECT FACILITIES ────────────────────────────────────────────────────────
  { category: 'Project Facilities', assetType: 'Bus Bay', roadType: 'MCW', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Cleanliness', question: 'Rate the cleanliness of the bus bay', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Project Facilities', assetType: 'Bus Bay', roadType: 'MCW', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Structural Condition', question: 'Rate the structural condition of the bus bay shelter', ratingScale: [0, 1, 5, 10], sortOrder: 2 },
  { category: 'Project Facilities', assetType: 'Toilet Block', roadType: 'MCW', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Cleanliness', question: 'Rate the cleanliness of the toilet block', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Project Facilities', assetType: 'Toilet Block', roadType: 'MCW', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Functionality', question: 'Rate the functionality of toilet block facilities', ratingScale: [0, 1, 5, 10], sortOrder: 2 },

  // ── STRUCTURES ─────────────────────────────────────────────────────────────────
  { category: 'Structures', assetType: 'Major Bridge', roadType: 'N/A', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Stagnation of Rain Water', question: 'Rate the stagnation of rainwater on the bridge deck', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Structures', assetType: 'Major Bridge', roadType: 'N/A', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Structural Damage', question: 'Rate the structural damage to bridge components', ratingScale: [0, 1, 5, 10], sortOrder: 2 },
  { category: 'Structures', assetType: 'Major Bridge', roadType: 'N/A', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Railing Condition', question: 'Rate the condition of bridge railings and barriers', ratingScale: [0, 1, 5, 10], sortOrder: 3 },
  { category: 'Structures', assetType: 'Minor Bridge', roadType: 'N/A', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Structural Damage', question: 'Rate the structural damage to minor bridge components', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Structures', assetType: 'Minor Bridge', roadType: 'N/A', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Drainage', question: 'Rate the drainage condition under the minor bridge', ratingScale: [0, 1, 5, 10], sortOrder: 2 },
  { category: 'Structures', assetType: 'Culvert', roadType: 'N/A', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Blockage', question: 'Rate the blockage condition of the culvert', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Structures', assetType: 'Culvert', roadType: 'N/A', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Structural Damage', question: 'Rate the structural damage to the culvert', ratingScale: [0, 1, 5, 10], sortOrder: 2 },

  // ── ATMS ─────────────────────────────────────────────────────────────────────
  { category: 'ATMS', assetType: 'MET', roadType: 'MCW', placement: 'Both', typeOfWork: 'Operations', parameter: 'Functionality', question: 'Rate the functionality of MET (Meteorological Equipment)', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'ATMS', assetType: 'VMS Full', roadType: 'MCW', placement: 'Both', typeOfWork: 'Operations', parameter: 'Display Functionality', question: 'Rate the display functionality of the VMS (Variable Message Sign)', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'ATMS', assetType: 'VMS Full', roadType: 'MCW', placement: 'Both', typeOfWork: 'Maintenance', parameter: 'Physical Condition', question: 'Rate the physical condition of the VMS structure and casing', ratingScale: [0, 1, 5, 10], sortOrder: 2 },

  // ── TMS ─────────────────────────────────────────────────────────────────────
  { category: 'TMS', assetType: 'Toll Plaza', roadType: 'MCW', placement: 'Both', typeOfWork: 'Operations', parameter: 'Static Weigh Bridge (SWB)', question: 'Rate the functionality of the static weigh bridge', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'TMS', assetType: 'Toll Plaza', roadType: 'MCW', placement: 'Both', typeOfWork: 'Operations', parameter: 'Weigh in Motion (WIM)', question: 'Rate the functionality of the weigh-in-motion system', ratingScale: [0, 1, 5, 10], sortOrder: 2 },
  { category: 'TMS', assetType: 'Toll Plaza', roadType: 'MCW', placement: 'Both', typeOfWork: 'Operations', parameter: 'AVCC System', question: 'Rate the functionality of the Automatic Vehicle Classification and Counting system', ratingScale: [0, 1, 5, 10], sortOrder: 3 },
  { category: 'TMS', assetType: 'Toll Plaza', roadType: 'MCW', placement: 'Both', typeOfWork: 'Operations', parameter: 'Automatic Boom Barrier', question: 'Rate the functionality of the automatic boom barrier', ratingScale: [0, 1, 5, 10], sortOrder: 4 },

  // ── LANDSCAPING ─────────────────────────────────────────────────────────────
  { category: 'Landscaping', assetType: 'Plants', roadType: 'MCW', placement: 'LHS', subCategory: 'Row', typeOfWork: 'Maintenance', parameter: 'Health', question: 'Rate the health and condition of row plants on LHS', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Landscaping', assetType: 'Plants', roadType: 'MCW', placement: 'RHS', subCategory: 'Row', typeOfWork: 'Maintenance', parameter: 'Health', question: 'Rate the health and condition of row plants on RHS', ratingScale: [0, 1, 5, 10], sortOrder: 1 },
  { category: 'Landscaping', assetType: 'Plants', roadType: 'MCW', placement: 'Both', subCategory: 'Median', typeOfWork: 'Maintenance', parameter: 'Health', question: 'Rate the health and condition of median plants', ratingScale: [0, 1, 5, 10], sortOrder: 2 },
  { category: 'Landscaping', assetType: 'Plants', roadType: 'MCW', placement: 'Both', subCategory: 'Median', typeOfWork: 'Maintenance', parameter: 'Irrigation', question: 'Rate the adequacy of irrigation for median plants', ratingScale: [0, 1, 5, 10], sortOrder: 3 }
];

const seedMasterData = async () => {
  console.log("Mongo URI:", process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for Master Data seeding...');

  let inserted = 0;
  let skipped = 0;

  for (const record of MASTER_DATA) {
    const filter = {
      category: record.category,
      assetType: record.assetType,
      parameter: record.parameter,
      roadType: record.roadType,
      placement: record.placement
    };

    const existing = await MasterData.findOne(filter);
    if (!existing) {
      await MasterData.create(record);
      inserted++;
    } else {
      skipped++;
    }
  }

  console.log(`✅ Master Data: ${inserted} inserted, ${skipped} skipped`);
  console.log(`📦 Total records: ${inserted + skipped}`);
  console.log('\n🎉 Master Data seeding complete!');
  console.log('Use POST /api/v1/master/import with your Excel to extend/replace this data.');

  await mongoose.connection.close();
  process.exit(0);
};

seedMasterData().catch((err) => {
  console.error('Master data seed error:', err);
  process.exit(1);
});
