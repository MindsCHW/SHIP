'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const logger = require('./config/logger');
const swaggerSpec = require('./config/swagger');
const { initCloudinary } = require('./config/cloudinary');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Route modules
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const projectRoutes = require('./modules/projects/project.routes');
const masterListRoutes = require('./modules/master-list/masterList.routes');
const surveyRoutes = require('./modules/survey/survey.routes');
const inspectionRoutes = require('./modules/inspection/inspection.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const ratingsRoutes = require('./modules/ratings/rating.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const inspectionEngineRoutes = require('./modules/inspection-engine/routes/inspectionEngine.routes');
const surveyProcessingRoutes = require('./modules/survey-processing/routes/surveyProcessing.routes');
const surveyLibraryRoutes = require('./modules/survey-library/routes/surveyLibrary.routes');
const imageReviewRoutes = require('./modules/image-review/routes/imageReview.routes');
const workAssignmentRoutes = require('./modules/work-assignment/workAssignment.routes');
const shipRoutes = require('./modules/ship/ship.routes');
const reportRoutes = require('./modules/reports/report.routes');

// ─── Due-date reminder cron (runs every hour) ─────────────────────────────────
const { sendDueDateReminders, markOverdueAssignments } = require('./modules/work-assignment/workAssignment.service');
setInterval(async () => {
  try {
    await sendDueDateReminders();
    await markOverdueAssignments();
  } catch (e) {
    // Non-fatal — log only
    console.error('[Cron] Work assignment reminder error:', e.message);
  }
}, 60 * 60 * 1000); // every 1 hour

const createApp = () => {
  const app = express();

  // ─── Initialize Cloudinary ───────────────────────────────────────────────────
  initCloudinary();

  // ─── Security Middleware ──────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  // ─── CORS ─────────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: true, // Allow all origins for dev
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  // ─── Rate Limiting ────────────────────────────────────────────────────────────
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.', errors: [] }
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.', errors: [] }
  });

  // ─── Request Logging ──────────────────────────────────────────────────────────
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    })
  );

  // ─── Body Parsing ─────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ─── API Docs (Swagger UI) ────────────────────────────────────────────────────
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'HiRATE 3.0 API Docs',
    customCss: '.swagger-ui .topbar { display: none; }',
    swaggerOptions: { persistAuthorization: true }
  }));

  // ─── Health Check ─────────────────────────────────────────────────────────────
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'HiRATE 3.0 API is running',
      data: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  });

  // ─── API Routes ───────────────────────────────────────────────────────────────
  app.use('/api/v1/auth', authLimiter, authRoutes);
  app.use('/api/v1/users', apiLimiter, userRoutes);
  app.use('/api/v1/projects', apiLimiter, projectRoutes);
  app.use('/api/v1/master', apiLimiter, masterListRoutes);
  app.use('/api/v1/ship', apiLimiter, shipRoutes);
  app.use('/api/v1/reports', apiLimiter, reportRoutes);


  app.use('/api/v1/dashboard', apiLimiter, dashboardRoutes);
  app.use('/api/v1/analytics', apiLimiter, analyticsRoutes);
  app.use('/api/v1/ratings', apiLimiter, ratingsRoutes);
  app.use('/api/v1/audit', apiLimiter, auditRoutes);
  app.use('/api/v1/notifications', apiLimiter, notificationRoutes);
  app.use('/api/v1/survey', apiLimiter, surveyRoutes);
  app.use('/api/v1/inspections', apiLimiter, inspectionRoutes);
  app.use('/api/v1/inspection-engine', apiLimiter, inspectionEngineRoutes);
  app.use('/api/v1/survey-library', apiLimiter, surveyLibraryRoutes);
  app.use('/api/v1/survey-processing', apiLimiter, surveyProcessingRoutes);
  app.use('/api/v1/image-review', apiLimiter, imageReviewRoutes);
  app.use('/api/v1/work-assignments', apiLimiter, workAssignmentRoutes);
  app.use('/api/v1/ship', apiLimiter, shipRoutes);

  // ─── 404 Handler ─────────────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ─── Global Error Handler ─────────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
