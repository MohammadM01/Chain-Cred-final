const mongoose = require('mongoose');
const Certificate = require('./src/models/Certificate');

async function fixCertificateUrls() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/chaincred');
    console.log('Connected to MongoDB');

    // Find certificates with old Greenfield URLs
    const certificates = await Certificate.find({
      $or: [
        { fileUrl: { $regex: /gnfd-testnet\.bnbchain\.org/ } },
        { metadataUrl: { $regex: /gnfd-testnet\.bnbchain\.org/ } }
      ]
    });

    console.log(`Found ${certificates.length} certificates with old URLs`);

    // Update each certificate
    for (const cert of certificates) {
      const updates = {};
      
      if (cert.fileUrl && cert.fileUrl.includes('gnfd-testnet.bnbchain.org')) {
        // Extract filename from old URL
        const filename = cert.fileUrl.split('/').pop();
        updates.fileUrl = `http://localhost:3000/uploads/files/${filename}`;
      }
      
      if (cert.metadataUrl && cert.metadataUrl.includes('gnfd-testnet.bnbchain.org')) {
        // Extract filename from old URL
        const filename = cert.metadataUrl.split('/').pop();
        updates.metadataUrl = `http://localhost:3000/uploads/metadata/${filename}`;
      }

      if (Object.keys(updates).length > 0) {
        await Certificate.findByIdAndUpdate(cert._id, updates);
        console.log(`Updated certificate ${cert._id}:`, updates);
      }
    }

    console.log('Certificate URLs updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing certificate URLs:', error);
    process.exit(1);
  }
}

fixCertificateUrls();
