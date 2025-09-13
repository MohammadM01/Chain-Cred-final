const ethers = require('ethers');

/**
 * Utility for wallet signature verification.
 * Verifies if recovered address from signature matches the provided wallet.
 * Uses ethers.verifyMessage (v6 syntax); compares lowercase.
 * For ChainCred MVP: Simple check; message should be predefined (e.g., from frontend).
 */
const verifySignature = (wallet, message, signature) => {
  const recoveredAddress = ethers.verifyMessage(message, signature).toLowerCase();
  return recoveredAddress === wallet.toLowerCase();
};

module.exports = { verifySignature };
