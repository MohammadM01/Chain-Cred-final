const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

async function generatePDF(profile) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // Header (gold-inspired bold text)
    doc.font('Helvetica-Bold').fontSize(26).fillColor('#DAA520').text(`${profile.name}'s ChainCred Resume`, { align: 'center' }); // Gold color
    doc.font('Helvetica').fontSize(12).fillColor('gray').text(`Wallet: ${profile.wallet}`, { align: 'center' });
    doc.moveDown(1.5);

    // Contact
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#DAA520').text('Contact Information');
    doc.fontSize(12).fillColor('black').text(`Email: ${profile.email || 'N/A'}`);
    doc.text(`LinkedIn: ${profile.linkedin || 'N/A'}`);
    doc.text(`GitHub: ${profile.github || 'N/A'}`);
    doc.moveDown();

    // Education (bullets)
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#DAA520').text('Education');
    profile.education.forEach(edu => {
      doc.fontSize(12).text(`• ${edu.degree} from ${edu.institution} (${edu.year})`);
    });
    doc.moveDown();

    // Work Experience (bullets)
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#DAA520').text('Work Experience');
    profile.workExperience.forEach(work => {
      doc.fontSize(12).text(`• ${work.role} at ${work.company} (${work.duration})`);
    });
    doc.moveDown();

    // Skills (bullets)
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#DAA520').text('Skills');
    profile.skills.forEach(skill => {
      doc.fontSize(12).text(`• ${skill}`);
    });
    doc.moveDown();

    // Certificates (unique section with verification note)
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#DAA520').text(`Verified Certificates (${profile.certificates.length})`);
    profile.certificates.forEach(cert => {
      doc.fontSize(12).text(`• ID: ${cert.certificateID} - Issued: ${cert.issuedDate.toDateString()} (ChainCred Verified)`);
    });
    doc.moveDown();

    // QR Code (unique verification link)
    const qrUrl = `https://chaincred.app/verify/${profile.wallet}`; // Customize to your app URL
    QRCode.toDataURL(qrUrl, (err, url) => {
      if (err) return reject(err);
      doc.image(url, doc.page.width - 150, doc.y, { fit: [100, 100] });

      // Small footer (like watermark)
      doc.fontSize(8).fillColor('gray').opacity(0.5).text('Generated and verified by ChainCred', 0, doc.page.height - 30, { align: 'center', width: doc.page.width });

      doc.end();
    });
  });
}

module.exports = generatePDF;
