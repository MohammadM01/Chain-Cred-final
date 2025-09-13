const express = require('express');
const { mintCertificate } = require('../controllers/mintController');
const router = express.Router();

/**
 * Mint route (institute only).
 * POST /api/mint - body { studentWallet, metadataUrl, issuerWallet }
 */
router.post('/', mintCertificate);

module.exports = router;
