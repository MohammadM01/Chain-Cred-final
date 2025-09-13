import React, { useState } from 'react';
import api from '../utils/api';
import { useUser } from '../context/UserContext';

const UploadCertificate = ({ wallet }) => {
  const { showToast } = useUser();
  const [fileUrl, setFileUrl] = useState(''); // Mock; replace with file input

  const handleUpload = async () => {
    try {
      await api.post('/api/resume/upload-certificate', { studentWallet: wallet, fileUrl });
      showToast('success', 'Certificate uploaded!');
    } catch (error) {
      showToast('error', 'Upload failed.');
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-md shadow-md mt-6">
      <input type="text" placeholder="File URL (mock)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className="w-full p-2 mb-4 bg-black text-white border border-gray-700 rounded" />
      <button onClick={handleUpload} className="px-4 py-2 bg-yellow-400 text-black rounded">Upload Certificate</button>
    </div>
  );
};

export default UploadCertificate;
