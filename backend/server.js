require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const errorHandler = require('./middleware/errorHandler');

const reportRoutes = require('./routes/reportRoutes');
const missionRoutes = require('./routes/missionRoutes');
const investigationRoutes = require('./routes/investigationRoutes');
const labRoutes = require('./routes/labRoutes');
const interventionRoutes = require('./routes/interventionRoutes');
const animalRoutes = require('./routes/animalRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers with payload limit support for image data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint with database connectivity check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;

  try {
    const result = await db.query('SELECT 1 as alive');
    if (result && result.rows) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbError = err.message;
  }

  res.json({
    status: 'ok',
    service: 'Livestock Surveillance Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      error: dbError
    }
  });
});

// Mount Routes
app.use('/api/reports', reportRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/investigations', investigationRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/animals', animalRoutes);

// 404 Handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.method} ${req.originalUrl} not found`
  });
});

// Centralized error handling
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  Livestock Disease Surveillance Backend API Running`);
  console.log(`  Port: http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`  Reports API: http://localhost:${PORT}/api/reports`);
  console.log(`  Missions API: http://localhost:${PORT}/api/missions`);
  console.log(`  Investigations API: http://localhost:${PORT}/api/investigations`);
  console.log(`  Lab API: http://localhost:${PORT}/api/lab`);
  console.log(`  Interventions API: http://localhost:${PORT}/api/interventions`);
  console.log(`  Animals API: http://localhost:${PORT}/api/animals`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
