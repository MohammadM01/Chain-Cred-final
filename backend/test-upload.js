const fs = require('fs');
const path = require('path');
const { uploadToGreenfield } = require('./src/utils/greenfieldUpload');

async function testUpload() {
  try {
    console.log('Testing upload functionality...');
    
    // Create a test PDF buffer
    const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
    const testBuffer = Buffer.from(testPdfContent);
    
    console.log('Test PDF buffer created, size:', testBuffer.length);
    
    // Test upload
    const result = await uploadToGreenfield(testBuffer, 'test.pdf');
    
    console.log('Upload successful!');
    console.log('Result:', result);
    
    // Check if file exists locally
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir);
    console.log('Files in uploads directory:', files);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUpload();
