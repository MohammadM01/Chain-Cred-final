const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const wallet = '0x9fe561e511be06c22e674cb11bbec8190686f18b';
    const user = await User.findOne({ wallet: wallet.toLowerCase() });
    if (user) {
      console.log('✅ User found:', user);
    } else {
      console.log('❌ User NOT found in current database.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser();
