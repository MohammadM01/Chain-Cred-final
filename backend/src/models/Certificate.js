const mongoose = require('mongoose');

/**
 * Certificate model for ChainCred.
 * Stores credential details: certificateID (hash), wallets, URLs from Greenfield, hash, date, and tokenId from opBNB.
 * Used in upload, mint, and verify flows.
 * Validation: All fields required except tokenId (added during mint).
 */
const certificateSchema = new mongoose.Schema({
  certificateID: {
    type: String,
    required: true,
    unique: true,
  },
  studentWallet: {
    type: String,
    required: true,
    lowercase: true,
  },
  issuerWallet: {
    type: String,
    required: true,
    lowercase: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  metadataUrl: {
    type: String,
    required: true,
  },
  fileHash: {
    type: String,
    required: true,
  },
  issuedDate: {
    type: Date,
    required: true,
  },
  tokenId: {
    type: Number,
    default: null, // Updated during mint
  },
  txHash: {
    type: String,
    default: null, // Transaction hash from minting
  },
  mintedAt: {
    type: Date,
    default: null, // When the certificate was minted
  },
  status: {
    type: String,
    enum: ['pending', 'minted', 'verified'],
    default: 'pending'
  },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
