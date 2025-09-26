const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
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

    // Use Tesseract.js to extract text from image
    const { data: { text } } = await Tesseract.recognize(
      req.file.buffer,
      'eng',
      {
        logger: m => console.log(m) // Log progress
      }
    );

    console.log('Extracted text:', text);

    return res.json({
      success: true,
      data: {
        text: text.trim(),
        confidence: 'OCR processing completed'
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
