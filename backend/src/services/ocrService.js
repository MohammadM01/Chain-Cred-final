const Tesseract = require('tesseract.js');

class OCRService {
  constructor() {
    this.worker = null;
  }

  async initializeWorker() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker({
        logger: m => console.log(m)
      });
      await this.worker.load();
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
    }
    return this.worker;
  }

  async extractText(imageBuffer, mimeType) {
    try {
      console.log('Processing image with OCR...');
      
      // Use the modern Tesseract.js API directly
      const { data: { text, confidence } } = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: m => console.log(m)
      });
      
      console.log('OCR extraction completed');
      console.log('Confidence:', confidence);
      console.log('Extracted text length:', text.length);

      // Parse the extracted text to find certificate information
      const parsedData = this.parseCertificateText(text);
      
      return {
        success: true,
        data: {
          text: text,
          confidence: confidence,
          strategy: 'tesseract',
          certificateId: parsedData.certificateId,
          studentName: parsedData.studentName,
          course: parsedData.course,
          institution: parsedData.institution,
          date: parsedData.date
        }
      };

    } catch (error) {
      console.error('OCR processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  parseCertificateText(text) {
    // Basic parsing logic to extract certificate information
    // This can be enhanced based on specific certificate formats
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let certificateId = '';
    let studentName = '';
    let course = '';
    let institution = '';
    let date = '';

    // Look for common patterns in certificate text
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      // Certificate ID patterns
      if (line.includes('certificate') && line.includes('no') || line.includes('id')) {
        certificateId = lines[i];
      }
      
      // Student name patterns
      if (line.includes('awarded to') || line.includes('this is to certify that')) {
        if (i + 1 < lines.length) {
          studentName = lines[i + 1];
        }
      }
      
      // Course patterns
      if (line.includes('course') || line.includes('program') || line.includes('degree')) {
        course = lines[i];
      }
      
      // Institution patterns
      if (line.includes('university') || line.includes('college') || line.includes('institute')) {
        institution = lines[i];
      }
      
      // Date patterns
      if (line.includes('date') || /\d{1,2}\/\d{1,2}\/\d{4}/.test(line) || /\d{4}-\d{2}-\d{2}/.test(line)) {
        date = lines[i];
      }
    }

    // If we didn't find specific patterns, try to extract from the first few lines
    if (!studentName && lines.length > 0) {
      // Look for name-like patterns (capitalized words)
      const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+/;
      for (const line of lines.slice(0, 5)) {
        if (namePattern.test(line)) {
          studentName = line;
          break;
        }
      }
    }

    return {
      certificateId,
      studentName,
      course,
      institution,
      date
    };
  }

  async terminate() {
    // No persistent worker to terminate with the new API
    this.worker = null;
  }
}

module.exports = OCRService;
