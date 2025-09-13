const express = require('express');
const router = express.Router();
const {
  getStudentCertificates,
  getInstituteCertificates,
  getCertificateById,
  verifyCertificate,
  deleteCertificate
} = require('../controllers/certificateController');

// Get all certificates for a student
router.get('/student/:wallet', getStudentCertificates);

// Get all certificates issued by an institute
router.get('/institute/:wallet', getInstituteCertificates);

// Get a specific certificate by ID
router.get('/:id', getCertificateById);

// Verify a certificate by tokenId
router.get('/verify/:tokenId', verifyCertificate);

// Delete a certificate by ID
router.delete('/:id', deleteCertificate);

module.exports = router;
