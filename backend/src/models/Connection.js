const mongoose = require('mongoose');

/**
 * Connection model to represent social connection requests and accepted connections
 * between two wallets without altering existing user/certificate flows.
 */
const connectionSchema = new mongoose.Schema({
  requesterWallet: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  recipientWallet: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    index: true,
  },
}, { timestamps: true });

// Avoid duplicate pairs in either direction
connectionSchema.index(
  { requesterWallet: 1, recipientWallet: 1 },
  { unique: true }
);

module.exports = mongoose.model('Connection', connectionSchema);
