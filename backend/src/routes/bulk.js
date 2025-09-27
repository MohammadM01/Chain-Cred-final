const express = require('express');
const multer = require('multer');
const csvParse = require('csv-parse/sync');
const ethers = require('ethers');
const router = express.Router();
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const { uploadToGreenfield } = require('../utils/greenfieldUpload');
const { generateMetadata } = require('../utils/generateMetadata');
const { mint } = require('../utils/opbnbInteract');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');

/**
 * Bulk operations:
 * - GET /api/bulk/template → CSV headers template
 * - POST /api/bulk/validate (multipart: csv) → parse + validate rows
 * - POST /api/bulk/estimate → estimate gas cost for N mints
 */

const upload = multer({ storage: multer.memoryStorage() });
const uploadMulti = multer({ storage: multer.memoryStorage() });

// GET /api/bulk/template
router.get('/template', (req, res) => {
  const headers = ['studentName', 'studentWallet'];
  const csv = headers.join(',') + '\n';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="chaincred_bulk_template.csv"');
  res.send(csv);
});

// POST /api/bulk/validate
router.post('/validate', upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'CSV file is required as field "csv"' });
    }

    const text = req.file.buffer.toString('utf8');
    const records = csvParse.parse(text, { columns: true, skip_empty_lines: true, trim: true });

    const results = [];
    let validCount = 0;
    let invalidCount = 0;

    for (const row of records) {
      const studentName = (row.studentName || '').toString().trim();
      const studentWallet = (row.studentWallet || '').toString().trim();
      const errors = [];

      if (!studentName) errors.push('Missing studentName');
      if (!studentWallet) errors.push('Missing studentWallet');
      else if (!ethers.isAddress(studentWallet)) errors.push('Invalid EVM wallet');

      if (errors.length) {
        invalidCount++;
      } else {
        validCount++;
      }

      results.push({ studentName, studentWallet, errors });
    }

    return res.json({ success: true, data: { rows: results, stats: { total: records.length, valid: validCount, invalid: invalidCount } } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bulk/estimate
router.post('/estimate', async (req, res) => {
  try {
    const { count } = req.body || {};
    const num = Number(count);
    if (!Number.isFinite(num) || num <= 0) {
      return res.status(400).json({ success: false, error: 'count must be a positive number' });
    }

    // Conservative estimate: use configured per-mint gas or fallback
    const perMintGas = BigInt(process.env.ESTIMATE_PER_MINT_GAS || '220000');
    const gasPriceGwei = BigInt(process.env.ESTIMATE_GAS_PRICE_GWEI || '1');
    const gasPriceWei = gasPriceGwei * BigInt(1e9);

    const totalGas = perMintGas * BigInt(num);
    const totalWei = totalGas * gasPriceWei;

    // Convert to BNB (1e18)
    const totalBNB = Number(totalWei) / 1e18; // note: safe for small estimates

    return res.json({ success: true, data: { count: num, perMintGas: perMintGas.toString(), gasPriceGwei: gasPriceGwei.toString(), totalGas: totalGas.toString(), totalBNB } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

// POST /api/bulk/mint
// Body: { issuerWallet: string, issuerName?: string, rows: [{ studentName, studentWallet }] }
router.post('/mint', uploadMulti.single('pdf'), async (req, res) => {
  try {
    let { issuerWallet, issuerName, rows, language = 'en' } = req.body || {};
    if (typeof rows === 'string') {
      try { rows = JSON.parse(rows); } catch { rows = []; }
    }
    if (!issuerWallet || !ethers.isAddress(issuerWallet)) {
      return res.status(400).json({ success: false, error: 'Valid issuerWallet is required' });
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, error: 'rows array is required' });
    }

    // Role check
    const issuer = await User.findOne({ wallet: issuerWallet.toLowerCase() });
    if (!issuer || issuer.role !== 'institute') {
      return res.status(403).json({ success: false, error: 'Only institutes can bulk mint' });
    }

    const results = [];
    for (const row of rows) {
      const studentName = (row.studentName || '').toString().trim();
      const studentWallet = (row.studentWallet || '').toString().trim();
      const item = { studentName, studentWallet };

      if (!studentName || !ethers.isAddress(studentWallet)) {
        item.status = 'skipped';
        item.error = 'Invalid row';
        results.push(item);
        continue;
      }

      try {
        // Use provided PDF if uploaded, otherwise generate a simple one
        const pdfBuffer = req.file?.buffer ? req.file.buffer : await new Promise((resolve, reject) => {
          const doc = new PDFDocument({ margin: 50 });
          const buffers = [];
          doc.on('data', b => buffers.push(b));
          doc.on('end', () => resolve(Buffer.concat(buffers)));
          doc.font('Helvetica-Bold').fontSize(24).text('Certificate of Achievement', { align: 'center' });
          doc.moveDown();
          doc.font('Helvetica').fontSize(14).text('Presented to', { align: 'center' });
          doc.moveDown(0.5);
          doc.font('Helvetica-Bold').fontSize(22).text(studentName, { align: 'center' });
          doc.moveDown();
          doc.font('Helvetica').fontSize(12).text(`Issued by ${issuerName || issuer.name || 'Institute'}`, { align: 'center' });
          doc.moveDown(2);
          doc.fontSize(10).text(`Wallet: ${studentWallet}`, { align: 'center' });
          doc.end();
        });

        // Upload PDF
        const pdfUpload = await uploadToGreenfield(pdfBuffer, `${crypto.randomBytes(8).toString('hex')}.pdf`);
        const fileUrl = pdfUpload.url;
        const fileHash = pdfUpload.hash;

        // Create metadata with language support
        const metadata = generateMetadata(
          studentWallet.toLowerCase(),
          issuerWallet.toLowerCase(),
          fileUrl,
          fileHash,
          studentName,
          issuerName || issuer.name,
          language
        );

        // Upload metadata JSON
        const metadataBuffer = Buffer.from(JSON.stringify(metadata));
        const metadataUpload = await uploadToGreenfield(metadataBuffer, `${metadata.certificateID}.json`, true);
        const metadataUrl = metadataUpload.url;

        // Save DB document (pending)
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

        // Mint on chain
        const { txHash, tokenId } = await mint(studentWallet, metadataUrl);

        // Update DB
        certificate.tokenId = tokenId ? Number(tokenId) : null;
        certificate.txHash = txHash || null;
        certificate.mintedAt = new Date();
        certificate.status = tokenId ? 'minted' : certificate.status;
        await certificate.save();

        item.status = 'minted';
        item.metadataUrl = metadataUrl;
        item.tokenId = tokenId;
        item.txHash = txHash;
        results.push(item);
      } catch (e) {
        item.status = 'error';
        item.error = e.message;
        results.push(item);
      }
    }

    return res.json({ success: true, data: { results } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bulk/issue (no minting)
// Body: { issuerWallet: string, issuerName?: string, rows: [{ studentName, studentWallet }] }
router.post('/issue', uploadMulti.single('pdf'), async (req, res) => {
  try {
    let { issuerWallet, issuerName, rows } = req.body || {};
    if (typeof rows === 'string') {
      try { rows = JSON.parse(rows); } catch { rows = []; }
    }
    if (!issuerWallet || !ethers.isAddress(issuerWallet)) {
      return res.status(400).json({ success: false, error: 'Valid issuerWallet is required' });
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, error: 'rows array is required' });
    }

    // Role check
    const issuer = await User.findOne({ wallet: issuerWallet.toLowerCase() });
    if (!issuer || issuer.role !== 'institute') {
      return res.status(403).json({ success: false, error: 'Only institutes can issue' });
    }

    const results = [];
    for (const row of rows) {
      const studentName = (row.studentName || '').toString().trim();
      const studentWallet = (row.studentWallet || '').toString().trim();
      const item = { studentName, studentWallet };

      if (!studentName || !ethers.isAddress(studentWallet)) {
        item.status = 'skipped';
        item.error = 'Invalid row';
        results.push(item);
        continue;
      }

      try {
        // Use provided PDF if uploaded, otherwise generate a simple one
        const pdfBuffer = req.file?.buffer ? req.file.buffer : await new Promise((resolve, reject) => {
          const doc = new PDFDocument({ margin: 50 });
          const buffers = [];
          doc.on('data', b => buffers.push(b));
          doc.on('end', () => resolve(Buffer.concat(buffers)));
          doc.font('Helvetica-Bold').fontSize(24).text('Certificate of Achievement', { align: 'center' });
          doc.moveDown();
          doc.font('Helvetica').fontSize(14).text('Presented to', { align: 'center' });
          doc.moveDown(0.5);
          doc.font('Helvetica-Bold').fontSize(22).text(studentName, { align: 'center' });
          doc.moveDown();
          doc.font('Helvetica').fontSize(12).text(`Issued by ${issuerName || issuer.name || 'Institute'}`, { align: 'center' });
          doc.moveDown(2);
          doc.fontSize(10).text(`Wallet: ${studentWallet}`, { align: 'center' });
          doc.end();
        });

        // Upload PDF
        const pdfUpload = await uploadToGreenfield(pdfBuffer, `${crypto.randomBytes(8).toString('hex')}.pdf`);
        const fileUrl = pdfUpload.url;
        const fileHash = pdfUpload.hash;

        // Create metadata with language support
        const metadata = generateMetadata(
          studentWallet.toLowerCase(),
          issuerWallet.toLowerCase(),
          fileUrl,
          fileHash,
          studentName,
          issuerName || issuer.name,
          language
        );

        // Upload metadata JSON
        const metadataBuffer = Buffer.from(JSON.stringify(metadata));
        const metadataUpload = await uploadToGreenfield(metadataBuffer, `${metadata.certificateID}.json`, true);
        const metadataUrl = metadataUpload.url;

        // Save DB document (pending)
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

        item.status = 'issued';
        item.metadataUrl = metadataUrl;
        item.fileUrl = fileUrl;
        item.certificateID = metadata.certificateID;
        results.push(item);
      } catch (e) {
        item.status = 'error';
        item.error = e.message;
        results.push(item);
      }
    }

    return res.json({ success: true, data: { results } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


