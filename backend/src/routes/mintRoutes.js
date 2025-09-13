const express = require('express');
const { mintCertificate } = require('../controllers/mintController');
const { getLatestTokenId, getTokenIdByMetadata } = require('../utils/opbnbInteract');

const router = express.Router();

// POST /api/mint
router.post('/', mintCertificate);

// GET /api/mint/test-contract - Test contract connection
router.get('/test-contract', async (req, res) => {
  try {
    const latestTokenId = await getLatestTokenId();
    res.json({ 
      success: true, 
      data: { 
        latestTokenId,
        message: 'Contract connection test completed'
      } 
    });
  } catch (error) {
    console.error('Contract test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/mint/get-token-id - Get token ID for a specific metadata URI
router.post('/get-token-id', async (req, res) => {
  try {
    const { owner, metadataURI } = req.body;
    
    if (!owner || !metadataURI) {
      return res.status(400).json({ 
        success: false, 
        error: 'owner and metadataURI are required' 
      });
    }
    
    const tokenId = await getTokenIdByMetadata(owner, metadataURI);
    
    res.json({ 
      success: true, 
      data: { 
        tokenId,
        owner,
        metadataURI
      } 
    });
  } catch (error) {
    console.error('Get token ID error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
