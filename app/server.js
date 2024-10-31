require('dotenv').config({ path: '../.env' });
const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');
const { createDatabase } = require('./databaseConfig/databaseConnect.js');
const logger = require('./middleware/logger'); // Winston Logger
const { logApiMetrics } = require('./middleware/metricsMiddleware');

const app = express();

// Middleware
app.use(express.json());
app.use(logApiMetrics);

// Logging middleware for incoming requests
app.use((req, res, next) => {
  logger.info(`Received request: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/healthz', healthRoutes);
app.use('/v1', userRoutes);

// Health Check Endpoint for Unsupported Methods
app.all('/healthz', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.status(405).send();
  logger.warn(`Unsupported method for /healthz: ${req.method}`);
});

// 404 Handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).send();
});

// Database Initialization and Server Start
createDatabase()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port: ${PORT}`);
    });
  })
  .catch(err => {
    logger.error(`Failed to initialize database: ${err.message}`);
  });

module.exports = app;