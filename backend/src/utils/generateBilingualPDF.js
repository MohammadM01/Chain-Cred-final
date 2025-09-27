const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generates a bilingual PDF certificate with English and Hindi text.
 * Designed for the Government of Jharkhand to support local language requirements.
 */
async function generateBilingualPDF(metadata, studentName, issuerName) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      layout: 'portrait'
    });
    
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    const { translations, language } = metadata;
    const isHindi = language === 'hi';

    // Set up fonts for Hindi support
    const primaryFont = isHindi ? 'Helvetica' : 'Helvetica-Bold';
    const secondaryFont = 'Helvetica';

    // Header - Certificate Title (Bilingual)
    doc.font(primaryFont).fontSize(28).fillColor('#DAA520').text(translations.certificateOf, { align: 'center' });
    if (isHindi) {
      doc.fontSize(20).text('Certificate of Achievement', { align: 'center' });
    } else {
      doc.fontSize(20).text('उपलब्धि प्रमाणपत्र', { align: 'center' });
    }
    doc.moveDown(1.5);

    // Presented to section
    doc.font(secondaryFont).fontSize(16).fillColor('#333').text(translations.presentedTo, { align: 'center' });
    if (isHindi) {
      doc.fontSize(14).text('Presented to', { align: 'center' });
    } else {
      doc.fontSize(14).text('प्रस्तुत किया गया', { align: 'center' });
    }
    doc.moveDown(0.5);

    // Student name (prominent)
    doc.font(primaryFont).fontSize(24).fillColor('#DAA520').text(studentName, { align: 'center' });
    doc.moveDown(1);

    // Issued by section
    doc.font(secondaryFont).fontSize(14).fillColor('#333').text(`${translations.issuedBy}: ${issuerName}`, { align: 'center' });
    if (isHindi) {
      doc.fontSize(12).text(`Issued by: ${issuerName}`, { align: 'center' });
    } else {
      doc.fontSize(12).text(`द्वारा जारी: ${issuerName}`, { align: 'center' });
    }
    doc.moveDown(1);

    // Date section
    const issueDate = new Date(metadata.issuedDateISO).toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    doc.font(secondaryFont).fontSize(12).fillColor('#666').text(`${translations.issuedOn}: ${issueDate}`, { align: 'center' });
    if (isHindi) {
      const englishDate = new Date(metadata.issuedDateISO).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.fontSize(10).text(`Issued on: ${englishDate}`, { align: 'center' });
    } else {
      const hindiDate = new Date(metadata.issuedDateISO).toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.fontSize(10).text(`जारी की गई: ${hindiDate}`, { align: 'center' });
    }
    doc.moveDown(2);

    // Certificate ID section
    doc.font(secondaryFont).fontSize(10).fillColor('#999').text(`Certificate ID: ${metadata.certificateID}`, { align: 'center' });
    if (isHindi) {
      doc.text(`प्रमाणपत्र आईडी: ${metadata.certificateID}`, { align: 'center' });
    } else {
      doc.text(`प्रमाणपत्र आईडी: ${metadata.certificateID}`, { align: 'center' });
    }
    doc.moveDown(1);

    // Wallet address
    doc.font(secondaryFont).fontSize(9).fillColor('#999').text(`${translations.walletAddress}: ${metadata.studentWallet}`, { align: 'center' });
    if (isHindi) {
      doc.text(`वॉलेट पता: ${metadata.studentWallet}`, { align: 'center' });
    } else {
      doc.text(`वॉलेट पता: ${metadata.studentWallet}`, { align: 'center' });
    }
    doc.moveDown(2);

    // QR Code for verification
    const qrUrl = `https://chaincred.app/verify?certificateID=${metadata.certificateID}`;
    QRCode.toDataURL(qrUrl, { width: 120 }, (err, url) => {
      if (err) return reject(err);
      
      // Position QR code in bottom right
      const qrX = doc.page.width - 150;
      const qrY = doc.page.height - 200;
      doc.image(url, qrX, qrY, { fit: [100, 100] });

      // Verification text
      doc.font(secondaryFont).fontSize(8).fillColor('#999').text(translations.verifiedBy, qrX, qrY + 110, { width: 100, align: 'center' });
      if (isHindi) {
        doc.text('Verified by ChainCred', qrX, qrY + 125, { width: 100, align: 'center' });
      } else {
        doc.text('चेनक्रेड द्वारा सत्यापित', qrX, qrY + 125, { width: 100, align: 'center' });
      }

      // Footer
      doc.font(secondaryFont).fontSize(8).fillColor('#999').text('This certificate is verified on the blockchain and cannot be forged.', 50, doc.page.height - 50, { align: 'center', width: doc.page.width - 100 });
      if (isHindi) {
        doc.text('यह प्रमाणपत्र ब्लॉकचेन पर सत्यापित है और नकली नहीं बनाया जा सकता।', 50, doc.page.height - 35, { align: 'center', width: doc.page.width - 100 });
      } else {
        doc.text('यह प्रमाणपत्र ब्लॉकचेन पर सत्यापित है और नकली नहीं बनाया जा सकता।', 50, doc.page.height - 35, { align: 'center', width: doc.page.width - 100 });
      }

      doc.end();
    });
  });
}

module.exports = { generateBilingualPDF };
