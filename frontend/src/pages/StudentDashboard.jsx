import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import api from '../utils/api';
import NFTCard from '../components/NFTCard';
import Spinner from '../components/Spinner';

export default function StudentDashboard() {
  const { user } = useUser();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.wallet) {
      fetchCertificates();
    }
  }, [user?.wallet]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/certificates/student/${user.wallet}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎓 Student Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back! Here are your issued credentials
          </p>
          <div className="mt-4 p-3 bg-blue-100 rounded-lg inline-block">
            <span className="text-sm font-medium text-blue-800">
              Wallet: {user?.wallet?.slice(0, 6)}...{user?.wallet?.slice(-4)}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {certificates.length}
            </div>
            <div className="text-gray-600">Total Certificates</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {certificates.filter(c => c.tokenId).length}
            </div>
            <div className="text-gray-600">Minted on Blockchain</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {certificates.filter(c => c.status === 'verified').length}
            </div>
            <div className="text-gray-600">Verified</div>
          </div>
        </div>

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
            <div className="text-6xl mb-4">📜</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Certificates Yet
            </h3>
            <p className="text-gray-500">
              Your issued credentials will appear here once they're uploaded by your institution.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <NFTCard 
                key={certificate._id} 
                certificate={certificate}
                onRefresh={refreshCertificates}
              />
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={refreshCertificates}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            🔄 Refresh Certificates
          </button>
        </div>
      </div>
    </div>
  );
}
