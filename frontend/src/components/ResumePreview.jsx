import React from 'react';
import api from '../utils/api';
import { useUser } from '../context/UserContext';

const ResumePreview = ({ wallet }) => {
  const { showToast } = useUser();

  const handleGenerate = async () => {
    try {
      const response = await api.get(`/api/resume/generate-resume/${wallet}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'chaincred-resume.pdf');
      document.body.appendChild(link);
      link.click();
      showToast('success', 'Resume generated!');
    } catch (error) {
      showToast('error', error.response?.data?.error || 'Failed to generate resume.');
    }
  };

  return (
    <div className="mt-6">
      <button onClick={handleGenerate} className="px-4 py-2 bg-yellow-400 text-black rounded">Generate Resume PDF</button>
    </div>
  );
};

export default ResumePreview;
