import React, { useState } from 'react';
import api from '../utils/api';

export default function UploadForm({ onSuccess, issuerWallet }) {
  const [formData, setFormData] = useState({
    studentWallet: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentWallet || !formData.file) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('studentWallet', formData.studentWallet);
      formDataToSend.append('issuerWallet', issuerWallet);
      formDataToSend.append('file', formData.file);

      const response = await api.post('/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        console.log('Upload successful:', response.data.data);
        setFormData({ studentWallet: '', file: null });
        onSuccess();
      } else {
        setError(response.data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, file }));
      setError(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Student Wallet Address
        </label>
        <input
          type="text"
          value={formData.studentWallet}
          onChange={(e) => setFormData(prev => ({ ...prev, studentWallet: e.target.value }))}
          placeholder="0x..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certificate PDF
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Only PDF files are supported</p>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={uploading}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
          uploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {uploading ? '⏳ Uploading...' : '📤 Upload Certificate'}
      </button>
    </form>
  );
}
