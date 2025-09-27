const crypto = require('crypto');

/**
 * Generates JSON metadata for a certificate.
 * Computes certificateID as SHA256(studentWallet + issuerWallet + fileHash + issuedDateISO).
 * issuedDateISO is current date in ISO format.
 * Returns metadata object ready for JSON.stringify and upload.
 * For ChainCred MVP: Now includes student and issuer names for better UX.
 * Enhanced with bilingual support for Jharkhand Government.
 */
const generateMetadata = (studentWallet, issuerWallet, fileUrl, fileHash, studentName, issuerName, language = 'en') => {
  const issuedDateISO = new Date().toISOString();

  const certificateID = crypto
    .createHash('sha256')
    .update(studentWallet + issuerWallet + fileHash + issuedDateISO)
    .digest('hex');

  // Language-specific text
  const translations = {
    en: {
      studentName: 'Unknown Student',
      issuerName: 'Unknown Institute',
      issuedBy: 'Issued by',
      issuedOn: 'Issued on',
      certificateOf: 'Certificate of Achievement',
      presentedTo: 'Presented to',
      verifiedBy: 'Verified by ChainCred',
      walletAddress: 'Wallet Address'
    },
    hi: {
      studentName: 'अज्ञात छात्र',
      issuerName: 'अज्ञात संस्थान',
      issuedBy: 'द्वारा जारी',
      issuedOn: 'जारी की गई',
      certificateOf: 'उपलब्धि प्रमाणपत्र',
      presentedTo: 'प्रस्तुत किया गया',
      verifiedBy: 'चेनक्रेड द्वारा सत्यापित',
      walletAddress: 'वॉलेट पता'
    }
  };

  const t = translations[language] || translations.en;

  const metadata = {
    studentWallet,
    issuerWallet,
    studentName: studentName || t.studentName,
    issuerName: issuerName || t.issuerName,
    fileUrl,
    issuedDateISO,
    certificateID,
    language,
    translations: t // Include translations for PDF generation
  };

  return metadata;
};

module.exports = { generateMetadata };
