const mongoose = require('mongoose');

/**
 * Profile model for ChainCred resume builder.
 * Stores user-entered details like name, education, skills, etc., linked to wallet.
 * Used for MVP resume generation before Web3 auto-fill.
 * Validation: Wallet required; arrays for education/skills/etc.
 */
const profileSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: String,
  linkedin: String,
  github: String,
  education: [{
    degree: String,
    institution: String,
    year: String,
  }],
  workExperience: [{
    role: String,
    company: String,
    duration: String,
  }],
  skills: [String],
  certificates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
