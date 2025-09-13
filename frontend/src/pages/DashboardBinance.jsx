import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUser } from '../context/UserContext';
import axios from '../utils/api';
import PDFViewer from '../components/PDFViewer';

export default function DashboardBinance() {
  const { user, showToast, loading } = useUser();
  const role = useMemo(() => user?.role, [user]);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-16">
          {loading ? 'Loading...' : 'Please sign in at '}
          {!loading && (
            <span className="text-[#f3ba2f]">
              <a href="/sign-in">/sign-in</a>
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#f3ba2f] mb-2">🎓 ChainCred Dashboard</h1>
            <div className="text-gray-400">
              Welcome, <span className="font-mono text-[#f3ba2f]">{user.wallet}</span> • Role:{' '}
              <span className="text-[#f3ba2f] font-semibold capitalize">{user.role}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-4 lg:mt-0">
            <button 
              onClick={() => window.open('/verify', '_blank')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              🔍 Verify Credential
            </button>
            {role === 'institute' && (
              <button 
                onClick={() => document.querySelector('input[type="file"]')?.click()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                📤 Quick Upload
              </button>
            )}
          </div>
        </div>

        {role === 'institute' && <InstitutePanel user={user} showToast={showToast} />}
        {role === 'student' && <StudentPanel user={user} />}
        {role !== 'institute' && role !== 'student' && <VerifierPanel />}
      </main>
      <Footer />
    </div>
  );
}

function InstitutePanel({ user, showToast }) {
  const [file, setFile] = useState(null);
  const [studentWallet, setStudentWallet] = useState('');
  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [issued, setIssued] = useState([]);

  async function loadIssued() {
    try {
      const res = await axios.get(`/api/certificates/institute/${user.wallet}`);
      setIssued(res.data?.data || []);
    } catch {
      setIssued([]);
    }
  }

  useEffect(() => {
    loadIssued();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file || !studentWallet) return showToast('error', 'Select file and student wallet');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('studentWallet', studentWallet);
      fd.append('issuerWallet', user.wallet);
      const res = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadResult(res.data?.data || res.data);
      showToast('success', 'Uploaded');
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleMint() {
    if (!uploadResult?.metadataUrl) return showToast('error', 'Upload first');
    setMinting(true);
    try {
      const res = await axios.post('/api/mint', {
        studentWallet,
        metadataUrl: uploadResult.metadataUrl,
        issuerWallet: user.wallet,
      });
      setUploadResult((prev) => ({ ...prev, txHash: res.data?.data?.txHash, tokenId: res.data?.data?.tokenId }));
      showToast('success', 'Minted');
      await loadIssued();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Mint failed');
    } finally {
      setMinting(false);
    }
  }

  return (
    <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg hover:shadow-yellow-400/50 transition-shadow">
        <h3 className="text-lg font-semibold text-[#f3ba2f]">Issue Credential</h3>
        <form className="mt-4 space-y-3" onSubmit={handleUpload}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block text-sm text-gray-300"
          />
          <input
            className="w-full p-3 rounded bg-black border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f3ba2f] transition"
            placeholder="Student Wallet (0x...)"
            value={studentWallet}
            onChange={(e) => setStudentWallet(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              className="px-5 py-2 rounded font-semibold bg-[#f3ba2f] text-black hover:bg-[#e0a923] transition-transform transform hover:scale-105 disabled:opacity-60"
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Upload PDF'}
            </button>
          </div>
        </form>
        {uploadResult && (
          <div className="mt-4 text-sm text-gray-300 space-y-1">
            <div>
              metadataUrl:{' '}
              <a className="text-[#f3ba2f]" target="_blank" rel="noreferrer" href={uploadResult.metadataUrl}>
                open
              </a>
            </div>
            <div>fileHash: {uploadResult.fileHash}</div>
            <div>certificateID: {uploadResult.certificateID}</div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleMint}
                className="px-4 py-2 rounded border-2 border-[#f3ba2f] text-[#f3ba2f] hover:bg-[#f3ba2f] hover:text-black transition-transform transform hover:scale-105 disabled:opacity-60"
                disabled={minting}
              >
                {minting ? 'Minting…' : 'Mint Credential'}
              </button>
            </div>
            {uploadResult.txHash && (
              <div className="mt-2">
                Tx:{' '}
                <a
                  className="text-[#f3ba2f]"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://opbnb-testnet.bscscan.com/tx/${uploadResult.txHash}`}
                >
                  {uploadResult.txHash.slice(0, 10)}…
                </a>
              </div>
            )}
            {uploadResult.tokenId && (
              <div className="mt-2 text-green-400">
                Token ID: #{uploadResult.tokenId}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg hover:shadow-yellow-400/50 transition-shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#f3ba2f]">Issued Credentials</h3>
          <div className="text-sm text-gray-400">{issued?.length || 0} total</div>
        </div>
        
        <div className="max-h-[420px] overflow-auto space-y-3">
          {issued?.length ? (
            issued.map((it, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-gray-700 bg-gray-800 hover:border-[#f3ba2f] transition-all duration-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono text-xs text-[#f3ba2f] break-all">
                    {it?.certificateID?.slice(0, 16)}...
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    it?.status === 'minted' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {it?.status || 'pending'}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Student:</span>
                    <span className="text-gray-300 font-mono">
                      {it?.studentWallet?.slice(0, 8)}...{it?.studentWallet?.slice(-6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="text-gray-300">
                      {new Date(it?.issuedDate).toLocaleDateString()}
                    </span>
                  </div>
                  {it?.tokenId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Token ID:</span>
                      <span className="text-green-400 font-bold">#{it.tokenId}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎓</div>
              <div className="text-gray-500">No credentials issued yet</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StudentPanel({ user }) {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [currentPDFUrl, setCurrentPDFUrl] = useState('');
  const [qrFor, setQrFor] = useState(null); // data URL
  const [deletingId, setDeletingId] = useState(null); // Track which certificate is being deleted

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/api/certificates/student/${user.wallet}`);
        setItems(res.data?.data || []);
      } catch {
        setItems([]);
      }
    })();
  }, []);

  const handleViewPDF = (url) => {
    setCurrentPDFUrl(url);
    setShowPDFViewer(true);
  };

  const handleViewMetadata = (url) => {
    // For now, show a modal with the URL since Greenfield links are broken
    alert(`Metadata URL: ${url}\n\nNote: Greenfield links are currently broken in testnet. In production, this would open the actual metadata.`);
  };

  const handleViewExplorer = (txHash) => {
    // Use the correct opBNB explorer URL
    const explorerUrl = `https://opbnb-testnet.bscscan.com/tx/${txHash}`;
    window.open(explorerUrl, '_blank');
  };

  const openQR = async (cert) => {
    // Prefer verify URL; fallback to explorer
    const verifyUrl = `${window.location.origin}/verify?certificateID=${cert.certificateID}`;
    const encoded = await QRCode.toDataURL(verifyUrl, { width: 320, margin: 1 });
    setQrFor({ img: encoded, verifyUrl, tx: cert.txHash });
  };

  const handleDelete = async (certId) => {
    if (!window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(certId);
      const response = await axios.delete(`/api/certificates/${certId}`, {
        data: { wallet: user.wallet }
      });

      if (response.data.success) {
        // Remove the deleted certificate from the local state
        setItems(prevItems => prevItems.filter(item => item._id !== certId));
        alert('Certificate deleted successfully!');
      } else {
        alert(response.data.error || 'Failed to delete certificate');
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      alert(error.response?.data?.error || 'Failed to delete certificate');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.certificateID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.issuerWallet?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <section className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg hover:shadow-yellow-400/50 transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-lg font-semibold text-[#f3ba2f] mb-4 sm:mb-0">My Credentials</h3>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by ID or issuer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f3ba2f]"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f3ba2f]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="minted">Minted</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#f3ba2f]">{items.length}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{items.filter(i => i.status === 'minted').length}</div>
          <div className="text-xs text-gray-400">Minted</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{items.filter(i => i.status === 'pending').length}</div>
          <div className="text-xs text-gray-400">Pending</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{items.filter(i => i.txHash).length}</div>
          <div className="text-xs text-gray-400">On Blockchain</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems?.length ? (
          filteredItems.map((it, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-gray-700 bg-gray-800 hover:border-[#f3ba2f] transition-all duration-200">
              {/* Certificate Header */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Certificate ID</div>
                <div className="font-mono text-sm text-[#f3ba2f] break-all">
                  {it?.certificateID?.slice(0, 20)}...
                </div>
              </div>
              
              {/* Certificate Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Issuer:</span>
                  <span className="text-xs text-gray-300 font-mono">
                    {it?.issuerWallet?.slice(0, 8)}...{it?.issuerWallet?.slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Date:</span>
                  <span className="text-xs text-gray-300">
                    {new Date(it?.issuedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Status:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    it?.status === 'minted' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {it?.status || 'pending'}
                  </span>
                </div>
                {it?.tokenId && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Token ID:</span>
                    <span className="text-xs text-green-400 font-bold">#{it.tokenId}</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {it?.fileUrl && (
                  <button 
                    onClick={() => handleViewPDF(it.fileUrl)}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    📄 PDF
                  </button>
                )}
                {it?.metadataUrl && (
                  <a 
                    href={it.metadataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors inline-flex items-center justify-center"
                  >
                    📋 Metadata
                  </a>
                )}
                {it?.txHash && (
                  <button
                    onClick={() => handleViewExplorer(it.txHash)}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                  >
                    🔗 Explorer
                  </button>
                )}
                <button
                  onClick={() => openQR(it)}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  🔳 QR
                </button>
                {/* Only show delete button for pending certificates (not minted ones) */}
                {it?.status === 'pending' && (
                  <button
                    onClick={() => handleDelete(it._id)}
                    disabled={deletingId === it._id}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      deletingId === it._id
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {deletingId === it._id ? '⏳ Deleting...' : '🗑️ Delete'}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📜</div>
            <div className="text-gray-500">No credentials yet</div>
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {showPDFViewer && (
        <PDFViewer
          url={currentPDFUrl}
          onClose={() => {
            setShowPDFViewer(false);
            setCurrentPDFUrl('');
          }}
        />
      )}

      {/* QR Modal */}
      {qrFor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm text-center">
            <h4 className="text-lg font-semibold text-white mb-4">Scan to Verify</h4>
            <img src={qrFor.img} alt="QR" className="mx-auto mb-4 rounded bg-white p-2" />
            <a href={qrFor.verifyUrl} target="_blank" rel="noreferrer" className="block text-[#f3ba2f] mb-2 break-all">{qrFor.verifyUrl}</a>
            {qrFor.tx && (
              <a href={`https://opbnb-testnet.bscscan.com/tx/${qrFor.tx}`} target="_blank" rel="noreferrer" className="block text-blue-400 break-all">View on opBNB</a>
            )}
            <div className="mt-4">
              <button onClick={() => setQrFor(null)} className="px-4 py-2 rounded bg-[#f3ba2f] text-black">Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function VerifierPanel() {
  const { showToast } = useUser();
  const [query, setQuery] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!query) return;
    try {
      const res = await axios.get(`/api/verify?${query.includes('0x') ? `studentWallet=${query}` : `certificateID=${query}`}`);
      const data = res.data?.data || res.data;
      if (data?.valid) {
        showToast('success', 'Valid credential');
      } else {
        showToast('error', 'Invalid');
      }
    } catch {
      showToast('error', 'Lookup failed');
    }
  }

  return (
    <section className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg hover:shadow-yellow-400/50 transition-shadow">
      <h3 className="text-lg font-semibold text-[#f3ba2f]">Verifier Panel</h3>
      <form className="mt-4 flex gap-2" onSubmit={submit}>
        <input
          className="w-full p-3 rounded bg-black border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f3ba2f] transition"
          placeholder="Certificate ID or Wallet"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="px-5 py-2 rounded font-semibold bg-[#f3ba2f] text-black hover:bg-[#e0a923] transition-transform transform hover:scale-105">
          Check
        </button>
      </form>
    </section>
  );
}