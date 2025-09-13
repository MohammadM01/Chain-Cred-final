const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const certificateRoutes = require('./routes/certificates');
const uploadRoutes = require('./routes/upload');
const verifyRoutes = require('./routes/verify');
const mintRoutes = require('./routes/mintRoutes');
const networkingRoutes = require('./routes/networking');
const socialRoutes = require('./routes/social');
const resumeRoutes = require('./routes/resume');
const indexRoutes = require('./routes/index');

// Import AI Agent routes (will be created)
const aiAgentRoutes = require('./routes/aiAgent');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));
app.use('/files', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/mint', mintRoutes);
app.use('/api/networking', networkingRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ai-agent', aiAgentRoutes);
app.use('/', indexRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ChainCred Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

module.exports = app;
