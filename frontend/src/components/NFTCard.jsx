import React, { useState } from 'react';
import api from '../utils/api';

export default function NFTCard({ certificate, onRefresh, isInstitute = false }) {
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleMint = async () => {
    try {
      setMinting(true);
      setMintError(null);
      
      const response = await api.post('/mint', {
        studentWallet: certificate.studentWallet,
        metadataUrl: certificate.metadataUrl,
        issuerWallet: certificate.issuerWallet
      });

      if (response.data.success) {
        console.log('Minting successful:', response.data.data);
        onRefresh(); // Refresh the certificates list
      } else {
        setMintError(response.data.error || 'Minting failed');
      }
    } catch (error) {
      console.error('Minting error:', error);
      setMintError(error.response?.data?.error || 'Minting failed');
    } finally {
      setMinting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await api.delete(`/certificates/${certificate._id}`, {
        data: { wallet: certificate.studentWallet }
      });

      if (response.data.success) {
        onRefresh(); // Refresh the certificates list
        alert('Certificate deleted successfully!');
      } else {
        alert(response.data.error || 'Failed to delete certificate');
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      alert(error.response?.data?.error || 'Failed to delete certificate');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = () => {
    if (certificate.tokenId) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✅ Minted (ID: {certificate.tokenId})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        ⏳ Pending Mint
      </span>
    );
  };

  const getStatusColor = () => {
    if (certificate.tokenId) return 'border-green-200 bg-green-50';
    return 'border-yellow-200 bg-yellow-50';
  };

  return (
    <div className={`border rounded-lg p-6 shadow-md transition-all hover:shadow-lg ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="text-2xl">🎓</div>
        {getStatusBadge()}
      </div>

      {/* Certificate Info */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Certificate ID</label>
          <p className="text-sm font-mono text-gray-700 break-all">
            {certificate.certificateID?.slice(0, 12)}...
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Student Wallet</label>
          <p className="text-sm font-mono text-gray-700">
            {certificate.studentWallet?.slice(0, 6)}...{certificate.studentWallet?.slice(-4)}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Issued Date</label>
          <p className="text-sm text-gray-700">
            {new Date(certificate.issuedDate).toLocaleDateString()}
          </p>
        </div>

        {certificate.tokenId && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-500">Token ID</label>
              <p className="text-sm font-mono text-gray-700">#{certificate.tokenId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Transaction Hash</label>
              <p className="text-sm font-mono text-gray-700 break-all">
                {certificate.txHash?.slice(0, 10)}...{certificate.txHash?.slice(-8)}
              </p>
            </div>
            {certificate.mintedAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Minted At</label>
                <p className="text-sm text-gray-700">
                  {new Date(certificate.mintedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {!certificate.tokenId && isInstitute && (
          <button
            onClick={handleMint}
            disabled={minting}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              minting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {minting ? '⏳ Minting...' : '🚀 Mint on Blockchain'}
          </button>
        )}

        {certificate.tokenId && (
          <a
            href={`https://explorer.testnet.opbnb.io/tx/${certificate.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-center rounded-md font-medium transition-colors"
          >
            🔗 View on Explorer
          </a>
        )}

        {certificate.fileUrl && (
          <a
            href={certificate.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white text-center rounded-md font-medium transition-colors"
          >
            📄 View Certificate
          </a>
        )}

        {/* Delete button - only show for pending certificates (not minted ones) */}
        {certificate.status === 'pending' && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              deleting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {deleting ? '⏳ Deleting...' : '🗑️ Delete Certificate'}
          </button>
        )}
      </div>

      {/* Error Display */}
      {mintError && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700">
          {mintError}
        </div>
      )}
    </div>
  );
}
