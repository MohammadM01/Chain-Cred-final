const Profile = require('../models/Profile');
const Certificate = require('../models/Certificate');
const generatePDF = require('../utils/generatePDF');

exports.saveProfile = async (req, res) => {
  try {
    const { wallet, ...profileData } = req.body;
    let profile = await Profile.findOne({ wallet });
    if (profile) {
      profile = await Profile.findOneAndUpdate({ wallet }, profileData, { new: true });
    } else {
      profile = new Profile({ wallet, ...profileData });
      await profile.save();
    }
    res.json({ message: 'Profile saved', profile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save profile' });
  }
};

exports.uploadCertificate = async (req, res) => {
  try {
    const { studentWallet, issuerWallet, fileUrl, fileHash } = req.body; // Adapt for real file uploads (e.g., multer) later
    const cert = new Certificate({
      certificateID: 'temp-' + Date.now(),
      studentWallet,
      issuerWallet: issuerWallet || 'temp-issuer',
      fileUrl: fileUrl || 'mock-url',
      metadataUrl: 'mock-metadata',
      fileHash: fileHash || 'mock-hash',
      issuedDate: new Date(),
    });
    await cert.save();

    await Profile.findOneAndUpdate(
      { wallet: studentWallet },
      { $push: { certificates: cert._id } }
    );

    res.json({ message: 'Certificate uploaded', cert });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
};

exports.generateResume = async (req, res) => {
  try {
    const { wallet } = req.params;
    const profile = await Profile.findOne({ wallet }).populate('certificates');
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const certCount = await Certificate.countDocuments({ studentWallet: wallet });
    if (certCount < 5) {
      return res.status(400).json({ error: 'You need at least 5 certificates to generate a resume.' });
    }

    const pdfBuffer = await generatePDF(profile);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=chaincred-resume.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate resume' });
  }
};
