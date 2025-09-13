const express = require('express');
const {
  sendConnectionRequest,
  respondToRequest,
  listRequests,
  listConnections,
  listSuggestions,
} = require('../controllers/socialController');

const router = express.Router();

// Social connection endpoints
router.post('/connect', sendConnectionRequest);
router.post('/respond', respondToRequest);
router.get('/requests', listRequests);
router.get('/connections', listConnections);
router.get('/suggestions', listSuggestions);

module.exports = router;
