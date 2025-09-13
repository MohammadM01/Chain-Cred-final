const crypto = require('crypto');

/**
 * Generates JSON metadata for a certificate.
 * Computes certificateID as SHA256(studentWallet + issuerWallet + fileHash + issuedDateISO).
 * issuedDateISO is current date in ISO format.
 * Returns metadata object ready for JSON.stringify and upload.
 * For ChainCred MVP: Now includes student and issuer names for better UX.
 */
const generateMetadata = (studentWallet, issuerWallet, fileUrl, fileHash, studentName, issuerName) => {
  const issuedDateISO = new Date().toISOString();

  const certificateID = crypto
    .createHash('sha256')
    .update(studentWallet + issuerWallet + fileHash + issuedDateISO)
    .digest('hex');

  const metadata = {
    studentWallet,
    issuerWallet,
    studentName: studentName || 'Unknown Student',
    issuerName: issuerName || 'Unknown Institute',
    fileUrl,
    issuedDateISO,
    certificateID,
  };

  return metadata;
};

module.exports = { generateMetadata };
