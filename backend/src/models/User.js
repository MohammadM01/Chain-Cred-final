const mongoose = require('mongoose');

/**
 * User model for ChainCred.
 * Stores wallet address (unique), role (e.g., 'institute' for issuers), and required name.
 * Used for authentication and role-based access (e.g., restrict upload/mint to 'institute').
 * Validation: Wallet is required and unique; role is required; name is required.
 */
const userSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Store wallets in lowercase for consistency
  },
  role: {
    type: String,
    required: true,
    enum: ['institute', 'student', 'verifier'], // Restrict to predefined roles for MVP
  },
  name: {
    type: String,
    required: true, // Changed from optional to required
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
