const Certificate = require('../models/Certificate');
const { verify, getTokenURI } = require('../utils/opbnbInteract');
const crypto = require('crypto');
const axios = require('axios'); // For fetching metadata; install if needed
const User = require('../models/User'); // Added for user names

/**
 * Verify controller for ChainCred (public).
 * Verifies by certificateID or studentWallet.
 * Flow: Fetch from DB, check chain ownership/tokenURI, fetch metadata from Greenfield, recompute/match hash.
 * Returns { valid, details }.
 * Note: Uses axios to fetch metadata; add npm install axios if not present.
 * For MVP: Assumes public read on Greenfield URLs.
 */

// GET /api/verify
const verifyCertificate = async (req, res) => {
  try {
    const { certificateID, studentWallet, issuerWallet, tokenId } = req.query;

    if (!certificateID && !studentWallet && !tokenId) {
      return res.status(400).json({ success: false, error: 'certificateID, studentWallet, or tokenId is required' });
    }

    let certificate;
    if (certificateID) {
      certificate = await Certificate.findOne({ certificateID });
    } else if (studentWallet) {
      certificate = await Certificate.findOne({ studentWallet: studentWallet.toLowerCase() });
    } else if (tokenId) {
      certificate = await Certificate.findOne({ tokenId: parseInt(tokenId) });
    }

    if (!certificate) {
      return res.status(404).json({ success: false, error: 'Certificate not found' });
    }

    const { metadataUrl, studentWallet: dbStudent, fileHash, issuedDate } = certificate;
      if (!certificate.tokenId) {
        return res.status(400).json({ success: false, error: 'Certificate not minted yet' });
      }

      // If this is a local demo metadata URL, skip on-chain checks (no contract required)
      const isDemo = typeof metadataUrl === 'string' && metadataUrl.includes('/demo/metadata/');
      if (!isDemo) {
              // Check on-chain ownership
      const isOwner = await verify(dbStudent, certificate.tokenId);
      if (!isOwner) {
        return res.json({ success: true, data: { valid: false, details: 'Ownership mismatch on chain' } });
      }

      // Check tokenURI matches metadataUrl
      const chainMetadataUrl = await getTokenURI(certificate.tokenId);
      if (chainMetadataUrl !== metadataUrl) {
        return res.json({ success: true, data: { valid: false, details: 'Metadata URL mismatch on chain' } });
      }
      } else {
        // demo: proceed without chain verification
      }

    // Fetch metadata from Greenfield
    const response = await axios.get(metadataUrl);
    const fetchedMetadata = response.data;

    // Get user names for better UX
    const studentUser = await User.findOne({ wallet: dbStudent.toLowerCase() });
    const issuerUser = await User.findOne({ wallet: certificate.issuerWallet.toLowerCase() });

    // Recompute hash
    const recomputedID = crypto
      .createHash('sha256')
      .update(dbStudent + certificate.issuerWallet + fileHash + issuedDate.toISOString())
      .digest('hex');

    const valid = recomputedID === certificate.certificateID && recomputedID === fetchedMetadata.certificateID;

    // Add user names to the response
    const responseData = {
      valid,
      details: valid ? 'Certificate verified' : 'Hash mismatch',
      metadata: {
        ...fetchedMetadata,
        studentName: studentUser?.name || 'Unknown Student',
        issuerName: issuerUser?.name || 'Unknown Institute'
      },
      certificateID: certificate.certificateID,
      studentWallet: dbStudent,
      issuerWallet: certificate.issuerWallet,
      issuedDate: issuedDate.toISOString()
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { verifyCertificate };
