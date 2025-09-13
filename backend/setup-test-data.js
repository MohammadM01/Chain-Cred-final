require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Certificate = require('./src/models/Certificate');

async function setupTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create test institute user
    const instituteUser = await User.findOneAndUpdate(
      { wallet: '0x00f133ba9b04a1bbafba5f8d587340043ad32d6f' },
      {
        wallet: '0x00f133ba9b04a1bbafba5f8d587340043ad32d6f',
        role: 'institute',
        name: 'Test Institute',
        email: 'institute@test.com'
      },
      { upsert: true, new: true }
    );
    console.log('Institute user created/updated:', instituteUser.wallet);

    // Create test student user
    const studentUser = await User.findOneAndUpdate(
      { wallet: '0x1b731f778e1367b58b0c3fadb0ebd5485dcc210b' },
      {
        wallet: '0x1b731f778e1367b58b0c3fadb0ebd5485dcc210b',
        role: 'student',
        name: 'Test Student',
        email: 'student@test.com'
      },
      { upsert: true, new: true }
    );
    console.log('Student user created/updated:', studentUser.wallet);

    // Create test certificate
    const testCertificate = await Certificate.findOneAndUpdate(
      { metadataUrl: 'https://example.com/test.json' },
      {
        studentWallet: '0x1b731f778e1367b58b0c3fadb0ebd5485dcc210b',
        issuerWallet: '0x00f133ba9b04a1bbafba5f8d587340043ad32d6f',
        fileUrl: 'https://example.com/test.pdf',
        metadataUrl: 'https://example.com/test.json',
        fileHash: 'test-hash-123',
        issuedDate: new Date(),
        status: 'pending'
      },
      { upsert: true, new: true }
    );
    console.log('Test certificate created/updated:', testCertificate.metadataUrl);

    console.log('✅ Test data setup completed successfully!');
    console.log('You can now test minting with:');
    console.log('Student Wallet:', studentUser.wallet);
    console.log('Issuer Wallet:', instituteUser.wallet);
    console.log('Metadata URL:', testCertificate.metadataUrl);

  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setupTestData();
