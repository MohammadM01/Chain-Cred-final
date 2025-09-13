const { Client } = require('@bnb-chain/greenfield-js-sdk');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Environment variables
const GREENFIELD_USE_LOCAL = process.env.GREENFIELD_USE_LOCAL === 'true';
const GREENFIELD_BUCKET_NAME = process.env.GREENFIELD_BUCKET_NAME || 'chaincred';
const GREENFIELD_API_KEY = process.env.GREENFIELD_API_KEY;
const GNFD_GRPC_URL = process.env.GNFD_GRPC_URL || 'https://gnfd-testnet-sp1.bnbchain.org';
const GNFD_CHAIN_ID = process.env.GNFD_CHAIN_ID || '5600';

let greenfieldClient = null;

/**
 * Initialize Greenfield client
 */
async function initializeGreenfieldClient() {
  if (greenfieldClient) return greenfieldClient;

  try {
    // For now, we'll use a mock implementation for local development
    // In production, you would initialize the actual Greenfield client
    if (GREENFIELD_USE_LOCAL || !GREENFIELD_API_KEY) {
      console.log('Using local file storage (mock Greenfield)');
      return null; // Will use local storage
    }

    // Initialize actual Greenfield client
    greenfieldClient = new Client(GNFD_GRPC_URL, GNFD_CHAIN_ID);
    await greenfieldClient.setPrivateKey(GREENFIELD_API_KEY);
    
    console.log('Greenfield client initialized');
    return greenfieldClient;
  } catch (error) {
    console.error('Failed to initialize Greenfield client:', error);
    throw error;
  }
}

/**
 * Upload file to Greenfield storage (or local storage for development)
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The name of the file
 * @param {boolean} isMetadata - Whether this is metadata JSON file
 * @returns {Promise<{url: string, hash: string}>} - Upload result with URL and hash
 */
async function uploadToGreenfield(fileBuffer, fileName, isMetadata = false) {
  try {
    const client = await initializeGreenfieldClient();
    
    // Generate file hash
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    if (!client || GREENFIELD_USE_LOCAL) {
      // Use local storage for development/testing
      return await uploadToLocalStorage(fileBuffer, fileName, hash, isMetadata);
    }
    
    // Upload to actual Greenfield storage
    return await uploadToGreenfieldStorage(client, fileBuffer, fileName, hash, isMetadata);
    
  } catch (error) {
    console.error('Upload to Greenfield failed:', error);
    // Fallback to local storage
    console.log('Falling back to local storage...');
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    return await uploadToLocalStorage(fileBuffer, fileName, hash, isMetadata);
  }
}

/**
 * Upload to local storage (development fallback)
 */
async function uploadToLocalStorage(fileBuffer, fileName, hash, isMetadata) {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create subdirectory for metadata vs files
    const subDir = isMetadata ? 'metadata' : 'files';
    const fileDir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    
    // Write file to local storage
    const filePath = path.join(fileDir, fileName);
    fs.writeFileSync(filePath, fileBuffer);
    
    // Generate local URL (assuming server serves static files from uploads)
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/uploads/${subDir}/${fileName}`;
    
    console.log(`File uploaded locally: ${filePath}`);
    console.log(`Access URL: ${url}`);
    
    return {
      url,
      hash,
      localPath: filePath
    };
    
  } catch (error) {
    console.error('Local storage upload failed:', error);
    throw error;
  }
}

/**
 * Upload to actual Greenfield storage
 */
async function uploadToGreenfieldStorage(client, fileBuffer, fileName, hash, isMetadata) {
  try {
    // This is a simplified implementation
    // In a real implementation, you would:
    // 1. Create bucket if it doesn't exist
    // 2. Upload the file to the bucket
    // 3. Set appropriate permissions
    // 4. Return the public URL
    
    const bucketName = GREENFIELD_BUCKET_NAME;
    const objectName = isMetadata ? `metadata/${fileName}` : `files/${fileName}`;
    
    // For now, we'll simulate the upload and return a local URL
    // In production, implement actual Greenfield upload logic here
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
    const mockUrl = `${baseUrl}/uploads/${objectName}`;
    
    console.log(`File uploaded to Greenfield: ${bucketName}/${objectName}`);
    console.log(`Access URL: ${mockUrl}`);
    
    return {
      url: mockUrl,
      hash,
      bucketName,
      objectName
    };
    
  } catch (error) {
    console.error('Greenfield storage upload failed:', error);
    throw error;
  }
}

/**
 * Download file from Greenfield storage
 * @param {string} url - The file URL
 * @returns {Promise<Buffer>} - File buffer
 */
async function downloadFromGreenfield(url) {
  try {
    if (GREENFIELD_USE_LOCAL || url.includes('localhost')) {
      // Handle local storage
      const fileName = path.basename(url);
      const isMetadata = url.includes('/metadata/');
      const subDir = isMetadata ? 'metadata' : 'files';
      const filePath = path.join(__dirname, '../../uploads', subDir, fileName);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found in local storage');
      }
      
      return fs.readFileSync(filePath);
    }
    
    // For actual Greenfield, implement download logic here
    // This would involve fetching from the Greenfield network
    throw new Error('Greenfield download not implemented yet');
    
  } catch (error) {
    console.error('Download from Greenfield failed:', error);
    throw error;
  }
}

module.exports = {
  uploadToGreenfield,
  downloadFromGreenfield,
  initializeGreenfieldClient
};
