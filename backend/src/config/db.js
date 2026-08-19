'use strict';

const mongoose = require('mongoose');
const logger = require('./logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let retryCount = 0;

const connectDB = async () => {
  try {
    console.log("Mongo URI:", process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database: ${conn.connection.name}`);
    retryCount = 0;
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      logger.warn(`Retrying connection (${retryCount}/${MAX_RETRIES}) in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(connectDB, RETRY_DELAY_MS);
    } else {
      logger.error('Max retries reached. Exiting process.');
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected.');
});

module.exports = connectDB;
