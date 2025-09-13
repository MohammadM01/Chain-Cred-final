import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import api from '../utils/api';
import NFTCard from '../components/NFTCard';
import Spinner from '../components/Spinner';
import UploadForm from '../components/UploadForm';

export default function InstituteDashboard() {
  const { user } = useUser();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    if (user?.wallet) {
      fetchCertificates();
    }
  }, [user?.wallet]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/certificates/institute/${user.wallet}`);
      setCertificates(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const refreshCertificates = () => {
    fetchCertificates();
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchCertificates();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🏛️ Institute Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage and issue verifiable credentials to your students
          </p>
          <div className="mt-4 p-3 bg-green-100 rounded-lg inline-block">
            <span className="text-sm font-medium text-green-800">
              Issuer Wallet: {user?.wallet?.slice(0, 6)}...{user?.wallet?.slice(-4)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            📤 Upload New Certificate
          </button>
          <button
            onClick={refreshCertificates}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {certificates.length}
            </div>
            <div className="text-gray-600">Total Issued</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {certificates.filter(c => c.tokenId).length}
            </div>
            <div className="text-gray-600">Minted on Blockchain</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {certificates.filter(c => !c.tokenId).length}
            </div>
            <div className="text-gray-600">Pending Mint</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {certificates.filter(c => c.status === 'verified').length}
            </div>
            <div className="text-gray-600">Verified</div>
          </div>
        </div>

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Upload New Certificate</h3>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <UploadForm 
                onSuccess={handleUploadSuccess}
                issuerWallet={user?.wallet}
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button 
              onClick={refreshCertificates}
              className="ml-4 text-red-500 hover:text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Certificates Issued Yet
            </h3>
            <p className="text-gray-500">
              Start by uploading your first certificate using the button above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <NFTCard 
                key={certificate._id} 
                certificate={certificate}
                onRefresh={refreshCertificates}
                isInstitute={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
