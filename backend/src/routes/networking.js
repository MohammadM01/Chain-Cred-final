const express = require('express');
const {
  analyzeCredentials,
  getStudentInsights,
  getNetworkStats,
  getRecommendations,
  getConnections,
  getSkillsDistribution,
  getInstitutesDistribution,
  refreshNetwork
} = require('../controllers/networkingController');

const router = express.Router();

/**
 * AI Networking Agent Routes
 * These routes provide AI-powered networking insights without modifying existing functionality.
 * All existing certificate issuance, wallet handling, and PDF generation processes remain untouched.
 */

// GET /api/networking/analyze - Analyze all credentials and build skill graph
router.get('/analyze', analyzeCredentials);

// GET /api/networking/stats - Get overall network statistics
router.get('/stats', getNetworkStats);

// GET /api/networking/recommendations - Get top networking recommendations
router.get('/recommendations', getRecommendations);

// GET /api/networking/connections - Get student connection graph
router.get('/connections', getConnections);

// GET /api/networking/skills - Get skills distribution
router.get('/skills', getSkillsDistribution);

// GET /api/networking/institutes - Get institutes distribution
router.get('/institutes', getInstitutesDistribution);

// GET /api/networking/insights/:studentWallet - Get insights for specific student
router.get('/insights/:studentWallet', getStudentInsights);

// POST /api/networking/refresh - Force refresh network data
router.post('/refresh', refreshNetwork);

module.exports = router;
