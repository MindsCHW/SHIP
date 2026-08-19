'use strict';

const multer = require('multer');
const streamifier = require('streamifier');
const { cloudinary } = require('../config/cloudinary');

/**
 * Multer — memory storage for all uploads.
 * We handle the actual cloud upload in a helper function below.
 */
const memoryStorage = multer.memoryStorage();

/**
 * Multer upload instance for survey images (memory storage).
 * Field name: 'image'. Max size: 10MB.
 */
const uploadSurveyImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'), false);
    }
  }
});

/**
 * Multer upload for Excel files (memory storage).
 */
const uploadExcel = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
      'text/plain',
      'application/octet-stream' // Some OS send xlsx/csv as this
    ];
    const allowedExts = ['.xlsx', '.xls', '.csv'];
    const ext = require('path').extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .xlsx, .xls, and .csv files are allowed.'), false);
    }
  }
});

/**
 * Uploads a buffer to Cloudinary using stream API (compatible with cloudinary v2).
 * Returns a promise that resolves to the Cloudinary upload result.
 *
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {object} options - Cloudinary upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'hirate/survey-images',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      ...options
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const os = require('os');
    const path = require('path');
    const tmpDir = path.join(os.tmpdir(), 'hirate-processing');
    const fs = require('fs');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + require('path').extname(file.originalname));
  }
});

const uploadVideo = multer({
  storage: diskStorage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.mp4', '.vtt'];
    const ext = require('path').extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .mp4 and .vtt files are allowed.'), false);
    }
  }
});

const libraryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = require('path');
    const fs = require('fs');
    // Store in backend/uploads/survey-library persistently
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'survey-library');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + require('path').extname(file.originalname));
  }
});

const uploadSurveyLibrary = multer({
  storage: libraryStorage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB limit per file
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.mp4', '.vtt'];
    const ext = require('path').extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .mp4 and .vtt files are allowed.'), false);
    }
  }
});

module.exports = { uploadSurveyImage, uploadExcel, uploadVideo, uploadToCloudinary, uploadSurveyLibrary };
