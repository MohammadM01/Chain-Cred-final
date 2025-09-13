const multer = require('multer');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const { uploadToGreenfield } = require('../utils/greenfieldUpload');
const { generateMetadata } = require('../utils/generateMetadata');
const { ethers } = require('ethers');
const crypto = require('crypto');

/**
 * Upload controller for ChainCred (institute only).
 * Handles PDF upload via multipart/form-data.
 * Flow: Check role, upload PDF to Greenfield, generate metadata, upload metadata JSON, save to DB.
 * Returns { metadataUrl, fileHash, certificateID }.
 * Multer config: In-memory storage for buffer handling.
 * Security: Role check from DB; validate addresses.
 * Note: Assumes file is PDF; add validation if needed for MVP.
 */

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload
const uploadCertificate = async (req, res) => {
  try {
    // Assume issuerWallet is from authenticated user; for MVP, passed in body
    const { studentWallet, issuerWallet } = req.body;

    if (!req.file || !studentWallet || !issuerWallet) {
      return res.status(400).json({ success: false, error: 'File, studentWallet, and issuerWallet are required' });
    }

    if (!ethers.isAddress(studentWallet) || !ethers.isAddress(issuerWallet)) {
      return res.status(400).json({ success: false, error: 'Invalid EVM wallet addresses' });
    }

    // Check if issuer has 'institute' role
    const issuer = await User.findOne({ wallet: issuerWallet.toLowerCase() });
    if (!issuer || issuer.role !== 'institute') {
      return res.status(403).json({ success: false, error: 'Only institutes can upload' });
    }

    // Get student user info for name
    const student = await User.findOne({ wallet: studentWallet.toLowerCase() });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Upload PDF buffer to Greenfield
    const pdfUpload = await uploadToGreenfield(req.file.buffer, `${crypto.randomBytes(16).toString('hex')}.pdf`);
    const fileUrl = pdfUpload.url;
    const fileHash = pdfUpload.hash;

    // Generate metadata with names
    const metadata = generateMetadata(
      studentWallet.toLowerCase(), 
      issuerWallet.toLowerCase(), 
      fileUrl, 
      fileHash,
      student.name,
      issuer.name
    );

    // Upload metadata JSON to Greenfield
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    const metadataUpload = await uploadToGreenfield(metadataBuffer, `${metadata.certificateID}.json`, true);
    const metadataUrl = metadataUpload.url;

    // Save to DB
    const certificate = new Certificate({
      certificateID: metadata.certificateID,
      studentWallet: studentWallet.toLowerCase(),
      issuerWallet: issuerWallet.toLowerCase(),
      fileUrl,
      metadataUrl,
      fileHash,
      issuedDate: new Date(metadata.issuedDateISO),
      status: 'pending'
    });
    await certificate.save();

    console.log('Certificate saved to database:', certificate._id);

    res.json({
      success: true,
      data: { metadataUrl, fileHash, certificateID: metadata.certificateID },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { upload, uploadCertificate };
