const express = require('express');
const router = express.Router();

/**
 * Index route for basic health check.
 * Returns a simple message to confirm backend is running.
 */
router.get('/', (req, res) => {
  res.json({ success: true, message: 'ChainCred backend is running' });
});

module.exports = router;
