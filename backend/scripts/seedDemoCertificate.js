const connectDB = require('../src/config/db');
const Certificate = require('../src/models/Certificate');
const crypto = require('crypto');

(async () => {
  try {
    await connectDB();
    const student = '0x000000000000000000000000000000000000dEaD'.toLowerCase();
    const issuer = '0x000000000000000000000000000000000000bEEF'.toLowerCase();
    const fileHash = 'demo-filehash-123';
    const issuedDate = new Date();

    const certificateID = crypto.createHash('sha256').update(student + issuer + fileHash + issuedDate.toISOString()).digest('hex');

    const metadataUrl = `http://localhost:3000/demo/metadata/${certificateID}`;

    const doc = {
      certificateID,
      studentWallet: student,
      issuerWallet: issuer,
      fileUrl: 'https://example.com/demo.pdf',
      metadataUrl,
      fileHash,
      issuedDate,
      tokenId: 1, // mark as minted for demo
    };

    await Certificate.deleteOne({ certificateID }).catch(()=>{});
    const created = await Certificate.create(doc);
    console.log('Seeded demo certificate:', created.certificateID);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();
