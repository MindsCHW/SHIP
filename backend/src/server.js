'use strict';

require('dotenv').config();

const http = require('http');
const createApp = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Start listening
    server.listen(PORT, () => {
      logger.info(`========================================`);
      logger.info(`  HiRATE 3.0 Backend`);
      logger.info(`  Running on: http://localhost:${PORT}`);
      logger.info(`  API Docs:   http://localhost:${PORT}/api/docs`);
      logger.info(`  Health:     http://localhost:${PORT}/api/health`);
      logger.info(`  Env:        ${process.env.NODE_ENV || 'development'}`);
      logger.info(`========================================`);
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────────
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Closing server gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
