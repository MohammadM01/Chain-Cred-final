const mongoose = require('mongoose');
const Certificate = require('./src/models/Certificate');
require('dotenv').config();

/**
 * Script to manually fix the minted certificate in the database
 * This will update the certificate with the tokenId and transaction hash
 */

async function fixMintedCertificate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chaincred');
    console.log('✅ Connected to MongoDB');

    // The metadata URL from your minting output
    const metadataUrl = 'https://gnfd-testnet-sp1.bnbchain.org/view/chaincred-1755721751501-q16mk/1755721751501-bfbeb605f2a0e301d2f93f0ffd3adaf6238a8194f1931261c97aef2c2f21c3ed.json';
    
    // Find the certificate by metadataUrl
    const certificate = await Certificate.findOne({ metadataUrl });
    
    if (certificate) {
      console.log('✅ Found certificate to update:');
      console.log('  - Certificate ID:', certificate.certificateID);
      console.log('  - Current Token ID:', certificate.tokenId);
      console.log('  - Current Status:', certificate.status);
      
      // Update with minting information
      const updatedCert = await Certificate.findOneAndUpdate(
        { metadataUrl },
        {
          tokenId: 1, // From your minting output
          txHash: '0x2337c760b0e6b9d68e2f5e9e686e31ff190593eeb5016ce50054bcbb365001a6', // From your minting output
          mintedAt: new Date(),
          status: 'minted'
        },
        { new: true }
      );
      
      console.log('✅ Certificate updated successfully:');
      console.log('  - New Token ID:', updatedCert.tokenId);
      console.log('  - Transaction Hash:', updatedCert.txHash);
      console.log('  - Minted At:', updatedCert.mintedAt);
      console.log('  - Status:', updatedCert.status);
      
    } else {
      console.log('❌ Certificate not found with metadataUrl:', metadataUrl);
      
      // List all available certificates
      const allCerts = await Certificate.find({});
      console.log(`📊 Total certificates in database: ${allCerts.length}`);
      
      if (allCerts.length > 0) {
        console.log('📋 Available certificates:');
        allCerts.forEach((cert, index) => {
          console.log(`  ${index + 1}. ID: ${cert.certificateID}`);
          console.log(`     Student: ${cert.studentWallet}`);
          console.log(`     Metadata URL: ${cert.metadataUrl}`);
          console.log(`     Token ID: ${cert.tokenId || 'Not minted'}`);
        });
      }
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
fixMintedCertificate();
