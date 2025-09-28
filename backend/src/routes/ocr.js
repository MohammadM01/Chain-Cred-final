const express = require('express');
const multer = require('multer');
const OCRService = require('../services/ocrService');
const router = express.Router();

/**
 * OCR routes for certificate verification
 * POST /api/ocr/extract - Extract text from uploaded image using Tesseract.js
 */

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/ocr/extract
router.post('/extract', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image file is required' });
    }

    console.log('Processing OCR for image:', req.file.originalname);

    const ocrService = new OCRService();
    const result = await ocrService.extractText(req.file.buffer, req.file.mimetype);

    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        error: 'OCR processing failed: ' + result.error 
      });
    }

    console.log('OCR completed successfully');
    console.log('Strategy used:', result.data.strategy);
    console.log('Extracted text:', result.data.text);
    console.log('Certificate ID:', result.data.certificateId);

    return res.json({
      success: true,
      data: {
        text: result.data.text,
        confidence: result.data.confidence,
        strategy: result.data.strategy,
        certificateId: result.data.certificateId,
        studentName: result.data.studentName,
        course: result.data.course,
        institution: result.data.institution,
        date: result.data.date
      }
    });

  } catch (error) {
    console.error('OCR extraction error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'OCR processing failed: ' + error.message 
    });
  }
});

module.exports = router;
