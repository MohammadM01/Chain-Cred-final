const mongoose = require('mongoose');
const Certificate = require('./src/models/Certificate');
const User = require('./src/models/User');
require('dotenv').config();

/**
 * Test script to verify the complete certificate flow
 * This will help debug the database update and display issues
 */

async function testCompleteFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chaincred');
    console.log('✅ Connected to MongoDB');

    // Check if the minted certificate exists in database
    const mintedCert = await Certificate.findOne({ 
      tokenId: { $exists: true, $ne: null } 
    });
    
    if (mintedCert) {
      console.log('✅ Found minted certificate in database:');
      console.log('  - Certificate ID:', mintedCert.certificateID);
      console.log('  - Token ID:', mintedCert.tokenId);
      console.log('  - Transaction Hash:', mintedCert.txHash);
      console.log('  - Student Wallet:', mintedCert.studentWallet);
      console.log('  - Issuer Wallet:', mintedCert.issuerWallet);
      console.log('  - Status:', mintedCert.status);
      console.log('  - Minted At:', mintedCert.mintedAt);
    } else {
      console.log('❌ No minted certificates found in database');
      
      // Check for any certificates
      const allCerts = await Certificate.find({});
      console.log(`📊 Total certificates in database: ${allCerts.length}`);
      
      if (allCerts.length > 0) {
        console.log('📋 Available certificates:');
        allCerts.forEach((cert, index) => {
          console.log(`  ${index + 1}. ID: ${cert.certificateID}`);
          console.log(`     Student: ${cert.studentWallet}`);
          console.log(`     Token ID: ${cert.tokenId || 'Not minted'}`);
          console.log(`     Status: ${cert.status}`);
        });
      }
    }

    // Test API endpoints
    console.log('\n🔍 Testing API endpoints...');
    
    // Test student certificates endpoint
    const studentWallet = '0x1b731f778e1367b58b0c3fadb0ebd5485dcc210b';
    const studentCerts = await Certificate.find({ 
      studentWallet: studentWallet.toLowerCase() 
    });
    console.log(`📚 Student ${studentWallet.slice(0, 6)}... has ${studentCerts.length} certificates`);

    // Test institute certificates endpoint
    const issuerWallet = '0x00f133ba9b04a1bbafba5f8d587340043ad32d6f';
    const instituteCerts = await Certificate.find({ 
      issuerWallet: issuerWallet.toLowerCase() 
    });
    console.log(`🏛️ Institute ${issuerWallet.slice(0, 6)}... has issued ${instituteCerts.length} certificates`);

    // Check for any pending mint operations
    const pendingMints = await Certificate.find({ 
      tokenId: { $exists: false } 
    });
    console.log(`⏳ Certificates pending mint: ${pendingMints.length}`);

    console.log('\n✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testCompleteFlow();
