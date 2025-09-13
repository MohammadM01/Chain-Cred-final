const mongoose = require('mongoose');
const Certificate = require('./src/models/Certificate');
require('dotenv').config();

/**
 * Test script to check certificate data for dashboards
 */

async function testDashboardData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chaincred');
    console.log('✅ Connected to MongoDB');

    // Check all certificates
    const allCerts = await Certificate.find({});
    console.log(`📊 Total certificates in database: ${allCerts.length}`);

    if (allCerts.length > 0) {
      console.log('\n📋 All Certificates:');
      allCerts.forEach((cert, index) => {
        console.log(`\n  ${index + 1}. Certificate ID: ${cert.certificateID}`);
        console.log(`     Student: ${cert.studentWallet}`);
        console.log(`     Issuer: ${cert.issuerWallet}`);
        console.log(`     Token ID: ${cert.tokenId || 'Not minted'}`);
        console.log(`     Status: ${cert.status || 'pending'}`);
        console.log(`     Tx Hash: ${cert.txHash || 'None'}`);
        console.log(`     Issued Date: ${cert.issuedDate}`);
        console.log(`     Created: ${cert.createdAt}`);
      });
    }

    // Test student certificates endpoint
    const studentWallet = '0x1b731f778e1367b58b0c3fadb0ebd5485dcc210b';
    const studentCerts = await Certificate.find({ 
      studentWallet: studentWallet.toLowerCase() 
    });
    console.log(`\n📚 Student ${studentWallet.slice(0, 6)}... has ${studentCerts.length} certificates`);

    // Test institute certificates endpoint
    const issuerWallet = '0x00f133ba9b04a1bbafba5f8d587340043ad32d6f';
    const instituteCerts = await Certificate.find({ 
      issuerWallet: issuerWallet.toLowerCase() 
    });
    console.log(`🏛️ Institute ${issuerWallet.slice(0, 6)}... has issued ${instituteCerts.length} certificates`);

    // Check for minted certificates
    const mintedCerts = await Certificate.find({ 
      tokenId: { $exists: true, $ne: null } 
    });
    console.log(`\n✅ Minted certificates: ${mintedCerts.length}`);

    // Check for pending certificates
    const pendingCerts = await Certificate.find({ 
      tokenId: { $exists: false } 
    });
    console.log(`⏳ Pending mint: ${pendingCerts.length}`);

    console.log('\n✅ Dashboard data test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testDashboardData();
