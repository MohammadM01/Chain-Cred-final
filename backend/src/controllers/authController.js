// backend/controllers/authController.js
const User = require('../models/User');
const { verifySignature } = require('../utils/authUtils');
const ethers = require('ethers');

/**
 * Auth controllers for ChainCred.
 * register: Creates a new user with wallet, role, name.
 * verifyWallet: Verifies signature against wallet.
 * getUser: Fetches user by wallet address.
 * Validation: Checks if address is valid EVM address.
 * Role-based: No restrictions here; restrictions in upload/mint.
 * Responses: Uniform JSON format.
 */

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { wallet, role, name } = req.body;

    if (!wallet || !role || !name) {
      return res.status(400).json({ success: false, error: 'Wallet, role, and name are required' });
    }

    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({ success: false, error: 'Invalid EVM wallet address' });
    }

    // Validate name is not empty
    if (!name.trim()) {
      return res.status(400).json({ success: false, error: 'Name cannot be empty' });
    }

    const existingUser = await User.findOne({ wallet: wallet.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = new User({ wallet: wallet.toLowerCase(), role, name: name.trim() });
    await user.save();

    res.status(201).json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/auth/verify-wallet
const verifyWallet = async (req, res) => {
  try {
    const { wallet, message, signature } = req.body;

    if (!wallet || !message || !signature) {
      return res.status(400).json({ success: false, error: 'Wallet, message, and signature are required' });
    }

    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({ success: false, error: 'Invalid EVM wallet address' });
    }

    const isValid = verifySignature(wallet, message, signature);

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid signature' });
    }

    // Check if user exists
    const user = await User.findOne({ wallet: wallet.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: { verified: true, user } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/auth/user/:wallet
const getUser = async (req, res) => {
  try {
    const { wallet } = req.params;

    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({ success: false, error: 'Invalid EVM wallet address' });
    }

    const user = await User.findOne({ wallet: wallet.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { register, verifyWallet, getUser };