const { Client } = require('@bnb-chain/greenfield-js-sdk');
const crypto = require('crypto');
require('dotenv').config();

/**
 * Greenfield upload utility for ChainCred
 * Handles file uploads to BNB Greenfield storage
 */

// Initialize Greenfield client
const client = Client.create(
  process.env.GNFD_GRPC_URL || 'https://gnfd-testnet-sp1.bnbchain.org',
  process.env.GNFD_CHAIN_ID || '5600'
);

/**
 * Upload a buffer to Greenfield storage
 * @param {Buffer} buffer - File buffer to upload
 * @param {string} fileName - Name for the file
 * @param {boolean} isMetadata - Whether this is metadata JSON (affects bucket/path)
 * @returns {Promise<{url: string, hash: string}>} Upload result with URL and hash
 */
async function uploadToGreenfield(buffer, fileName, isMetadata = false) {
  try {
    // For development/testing, we can use local storage instead of Greenfield
    if (process.env.GREENFIELD_USE_LOCAL === 'true') {
      return uploadToLocal(buffer, fileName);
    }

    // Calculate file hash
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    // Generate object name with timestamp to avoid conflicts
    const timestamp = Date.now();
    const objectName = isMetadata ? `metadata/${timestamp}_${fileName}` : `certificates/${timestamp}_${fileName}`;
    
    // Upload to Greenfield
    const uploadResult = await client.object.putObject({
      bucketName: process.env.GREENFIELD_BUCKET_NAME || 'chaincred',
      objectName: objectName,
      body: buffer,
      txnHash: '', // Will be set by the SDK
    });

    // Construct the public URL
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
    const fileUrl = `${baseUrl}/uploads/${objectName}`;

    console.log(`File uploaded to Greenfield: ${objectName}`);
    console.log(`Upload result:`, uploadResult);

    return {
      url: fileUrl,
      hash: hash,
      objectName: objectName,
      txnHash: uploadResult.transactionHash
    };

  } catch (error) {
    console.error('Greenfield upload error:', error);
    
    // Fallback to local storage if Greenfield fails
    console.log('Falling back to local storage...');
    return uploadToLocal(buffer, fileName);
  }
}

/**
 * Fallback local storage upload (for development/testing)
 * @param {Buffer} buffer - File buffer to upload
 * @param {string} fileName - Name for the file
 * @returns {Promise<{url: string, hash: string}>} Upload result with URL and hash
 */
async function uploadToLocal(buffer, fileName) {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    const filePath = path.join(uploadsDir, uniqueFileName);
    
    // Write file to local storage
    fs.writeFileSync(filePath, buffer);
    
    // Calculate hash
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    // Construct local URL
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
    const fileUrl = `${baseUrl}/uploads/${uniqueFileName}`;
    
    console.log(`File saved locally: ${filePath}`);
    
    return {
      url: fileUrl,
      hash: hash,
      localPath: filePath
    };
    
  } catch (error) {
    console.error('Local upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

module.exports = {
  uploadToGreenfield
};
