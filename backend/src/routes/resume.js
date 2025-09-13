const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');

router.post('/save-profile', resumeController.saveProfile);
router.post('/upload-certificate', resumeController.uploadCertificate);
router.get('/generate-resume/:wallet', resumeController.generateResume);

module.exports = router;
