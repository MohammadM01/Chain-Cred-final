const express = require('express');
const { uploadCertificate } = require('../controllers/uploadController');
const multer = require('multer');
const router = express.Router();

/**
 * Upload route (institute only).
 * POST /api/upload - multipart/form-data with 'file', studentWallet, issuerWallet.
 * Uses multer for file handling (in-memory for buffer).
 */
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), uploadCertificate);

module.exports = router;
