const mongoose = require('mongoose');
const Certificate = require('./src/models/Certificate');
require('dotenv').config();

/**
 * Script to fix the latest minted certificate with Token ID 2
 * Based on the logs showing successful minting
 */

async function fixLatestCertificate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chaincred');
    console.log('✅ Connected to MongoDB');

    // Find the certificate that was just minted (Token ID 2)
    const certificate = await Certificate.findOne({ 
      tokenId: 2 
    });
    
    if (certificate) {
      console.log('✅ Found certificate with Token ID 2:');
      console.log('  - Certificate ID:', certificate.certificateID);
      console.log('  - Student Wallet:', certificate.studentWallet);
      console.log('  - Issuer Wallet:', certificate.issuerWallet);
      console.log('  - Status:', certificate.status);
      console.log('  - Tx Hash:', certificate.txHash);
      
      // Update with the correct transaction hash from your logs
      const updatedCert = await Certificate.findOneAndUpdate(
        { tokenId: 2 },
        {
          txHash: '0xffc9ccb067c54286651cdef7b24737bb4d91ca5a1b3ea5ff1412277dab0cc706',
          mintedAt: new Date(),
          status: 'minted'
        },
        { new: true }
      );
      
      console.log('✅ Certificate updated successfully:');
      console.log('  - New Tx Hash:', updatedCert.txHash);
      console.log('  - Status:', updatedCert.status);
      console.log('  - Minted At:', updatedCert.mintedAt);
      
    } else {
      console.log('❌ Certificate with Token ID 2 not found');
      
      // Check for any certificates without txHash
      const incompleteCerts = await Certificate.find({ 
        tokenId: { $exists: true, $ne: null },
        $or: [
          { txHash: { $exists: false } },
          { txHash: null }
        ]
      });
      
      console.log(`\n📋 Certificates missing transaction hash: ${incompleteCerts.length}`);
      incompleteCerts.forEach((cert, index) => {
        console.log(`  ${index + 1}. Token ID: ${cert.tokenId}`);
        console.log(`     Certificate ID: ${cert.certificateID}`);
        console.log(`     Student: ${cert.studentWallet}`);
      });
    }

    console.log('\n✅ Fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixLatestCertificate();
