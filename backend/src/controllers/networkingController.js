const NetworkingAgent = require('../utils/networkingAgent');

/**
 * Networking Agent Controller - Provides AI-powered networking insights
 * This controller handles all networking agent requests without modifying existing functionality.
 * All existing certificate issuance, wallet handling, and PDF generation processes remain untouched.
 */

// Initialize the networking agent
const networkingAgent = new NetworkingAgent();

/**
 * GET /api/networking/analyze
 * Analyze all credentials and build skill graph
 */
const analyzeCredentials = async (req, res) => {
  try {
    console.log('Networking Controller: Starting credential analysis...');
    
    const result = await networkingAgent.analyzeCredentials();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Networking Controller Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze credentials'
    });
  }
};

/**
 * GET /api/networking/insights/:studentWallet
 * Get networking insights for a specific student
 */
const getStudentInsights = async (req, res) => {
  try {
    const { studentWallet } = req.params;
    
    if (!studentWallet) {
      return res.status(400).json({
        success: false,
        error: 'Student wallet address is required'
      });
    }

    // First analyze credentials if not already done
    await networkingAgent.analyzeCredentials();
    
    const result = await networkingAgent.getStudentInsights(studentWallet);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Student Insights Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get student insights'
    });
  }
};

/**
 * GET /api/networking/stats
 * Get overall network statistics
 */
const getNetworkStats = async (req, res) => {
  try {
    // First analyze credentials if not already done
    await networkingAgent.analyzeCredentials();
    
    const stats = networkingAgent.getNetworkStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Network Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get network statistics'
    });
  }
};

/**
 * GET /api/networking/recommendations
 * Get top networking recommendations
 */
const getRecommendations = async (req, res) => {
  try {
    // First analyze credentials if not already done
    await networkingAgent.analyzeCredentials();
    
    const recommendations = networkingAgent.generateRecommendations();
    
    res.json({
      success: true,
      data: {
        recommendations: recommendations,
        totalRecommendations: recommendations.length
      }
    });
  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations'
    });
  }
};

/**
 * GET /api/networking/connections
 * Get student connection graph
 */
const getConnections = async (req, res) => {
  try {
    // First analyze credentials if not already done
    await networkingAgent.analyzeCredentials();
    
    const connections = networkingAgent.buildStudentConnections();
    
    res.json({
      success: true,
      data: {
        connections: connections,
        totalConnections: connections.length
      }
    });
  } catch (error) {
    console.error('Connections Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get connections'
    });
  }
};

/**
 * GET /api/networking/skills
 * Get all skills and their distribution across students
 */
const getSkillsDistribution = async (req, res) => {
  try {
    // First analyze credentials if not already done
    await networkingAgent.analyzeCredentials();
    
    const stats = networkingAgent.getNetworkStats();
    
    res.json({
      success: true,
      data: {
        skills: stats.mostCommonSkills,
        totalSkills: stats.totalSkills,
        averageSkillsPerStudent: stats.averageSkillsPerStudent
      }
    });
  } catch (error) {
    console.error('Skills Distribution Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get skills distribution'
    });
  }
};

/**
 * GET /api/networking/institutes
 * Get all institutes and their student distribution
 */
const getInstitutesDistribution = async (req, res) => {
  try {
    // First analyze credentials if not already done
    await networkingAgent.analyzeCredentials();
    
    const stats = networkingAgent.getNetworkStats();
    
    res.json({
      success: true,
      data: {
        institutes: stats.topInstitutes,
        totalInstitutes: stats.totalInstitutes
      }
    });
  } catch (error) {
    console.error('Institutes Distribution Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get institutes distribution'
    });
  }
};

/**
 * POST /api/networking/refresh
 * Force refresh of the skill graph and connections
 */
const refreshNetwork = async (req, res) => {
  try {
    console.log('Networking Controller: Refreshing network data...');
    
    // Clear existing data and re-analyze
    const result = await networkingAgent.analyzeCredentials();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Network data refreshed successfully',
        data: {
          totalStudents: result.data.totalStudents,
          totalConnections: result.data.totalConnections,
          timestamp: result.data.analysisTimestamp
        }
      });
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Network Refresh Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh network data'
    });
  }
};

module.exports = {
  analyzeCredentials,
  getStudentInsights,
  getNetworkStats,
  getRecommendations,
  getConnections,
  getSkillsDistribution,
  getInstitutesDistribution,
  refreshNetwork
};
