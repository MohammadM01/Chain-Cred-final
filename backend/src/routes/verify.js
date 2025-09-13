const express = require('express');
const { verifyCertificate } = require('../controllers/verifyController');
const router = express.Router();

/**
 * Verify route (public).
 * GET /api/verify?certificateID=... or ?studentWallet=...
 */
router.get('/', verifyCertificate);

module.exports = router;
