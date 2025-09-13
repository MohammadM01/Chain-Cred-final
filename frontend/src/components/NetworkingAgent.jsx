import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useUser } from '../context/UserContext';
import Header from './Header';

export default function NetworkingAgent() {
  const { user, showToast } = useUser();
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [suggestions, setSuggestions] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (user?.wallet) {
      loadAll();
    }
  }, [user?.wallet]);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [netRes, sugRes, reqRes, conRes] = await Promise.all([
        api.get('/api/networking/analyze'),
        api.get('/api/social/suggestions', { params: { wallet: user.wallet } }),
        api.get('/api/social/requests', { params: { wallet: user.wallet } }),
        api.get('/api/social/connections', { params: { wallet: user.wallet } }),
      ]);
      
      // Add safety checks for all responses
      if (netRes.data.success) setNetworkData(netRes.data.data);
      if (sugRes.data.success) setSuggestions(sugRes.data.data?.suggestions || []);
      if (reqRes.data.success) setRequests(reqRes.data.data || { incoming: [], outgoing: [] });
      if (conRes.data.success) setConnections(conRes.data.data?.connections || []);
    } catch (error) {
      console.error('Error loading network data:', error);
      setError(error.response?.data?.error || 'Failed to load network data');
      // Set empty defaults to prevent crashes
      setSuggestions([]);
      setRequests({ incoming: [], outgoing: [] });
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshNetwork = async () => {
    setLoading(true);
    try {
      await api.post('/api/networking/refresh');
      await loadAll();
    } catch (error) {
      console.error('Failed to refresh network:', error);
      showToast('error', 'Failed to refresh network');
    } finally {
      setLoading(false);
    }
  };

  const sendConnect = async (target) => {
    try {
      await api.post('/api/social/connect', { requesterWallet: user.wallet, recipientWallet: target });
      showToast('success', 'Connection request sent');
      await loadAll();
    } catch (e) {
      showToast('error', e.response?.data?.error || 'Failed to send request');
    }
  };

  const respond = async (from, accept) => {
    try {
      await api.post('/api/social/respond', { requesterWallet: from, recipientWallet: user.wallet, accept });
      showToast('success', accept ? 'Request accepted' : 'Request rejected');
      await loadAll();
    } catch (e) {
      showToast('error', e.response?.data?.error || 'Failed to respond');
    }
  };

  if (!user?.wallet) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-2">🤖</div>
            <h2 className="text-xl font-semibold mb-2">AI Networking Agent</h2>
            <p className="text-gray-400 mb-4">Please sign in to view suggestions and connections.</p>
            <a href="/sign-in" className="px-4 py-2 bg-[#f3ba2f] text-black rounded hover:bg-[#e0a923]">Sign In</a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3ba2f] mx-auto mb-4"></div>
              <p>Analyzing credentials and building skill graph...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Error Loading Network Data</h2>
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={loadAll}
                className="px-4 py-2 bg-[#f3ba2f] text-black rounded hover:bg-[#e0a923]"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!networkData) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">AI Networking Agent</h2>
              <p className="text-gray-400 mb-6">No network data available. Upload some certificates first.</p>
              <button
                onClick={loadAll}
                className="px-4 py-2 bg-[#f3ba2f] text-black rounded hover:bg-[#e0a923]"
              >
                Load Network Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add safety check for skillGraph
  if (!networkData.skillGraph || typeof networkData.skillGraph !== 'object') {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">AI Networking Agent</h2>
              <p className="text-gray-400 mb-6">Network data is incomplete. Please refresh or try again later.</p>
              <button
                onClick={loadAll}
                className="px-4 py-2 bg-[#f3ba2f] text-black rounded hover:bg-[#e0a923]"
              >
                Refresh Network Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#f3ba2f]">🤖 AI Networking Agent</h1>
              <p className="text-gray-400 mt-2">
                Suggestions: {suggestions?.length || 0} • Requests: {requests?.incoming?.length || 0} incoming / {requests?.outgoing?.length || 0} outgoing • Connections: {connections?.length || 0}
              </p>
            </div>
            <button
              onClick={refreshNetwork}
              disabled={loading}
              className="px-6 py-3 bg-[#f3ba2f] text-black rounded-lg hover:bg-[#e0a923] disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : '🔄 Refresh Network'}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-900 rounded-lg p-1">
            {['suggestions', 'requests', 'connections', 'skills'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-[#f3ba2f] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Suggestions */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">People you may know</h3>
              {(!suggestions || suggestions.length === 0) && <div className="text-gray-400">No suggestions yet.</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions && suggestions.map((s, idx) => (
                  <div key={idx} className="bg-gray-900 p-6 rounded-lg border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="text-[#f3ba2f] font-semibold">{s.name || 'Unknown User'}</div>
                      <div className="text-sm text-gray-400">Wallet: {s.wallet?.slice(0, 8) || 'Unknown'}...</div>
                      <div className="text-sm text-gray-400">Common institutes: {s.commonIssuerCount || 0}</div>
                    </div>
                    <button
                      onClick={() => sendConnect(s.wallet)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Incoming Requests</h3>
                {(!requests?.incoming || requests.incoming.length === 0) && <div className="text-gray-400">No incoming requests.</div>}
                <div className="space-y-2">
                  {requests?.incoming && requests.incoming.map((r) => (
                    <div key={r._id} className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex items-center justify-between">
                      <div>
                        <div className="text-gray-300">{r.requesterName || 'Unknown User'}</div>
                        <div className="text-sm text-gray-400">Wallet: {r.requesterWallet?.slice(0, 10) || 'Unknown'}...</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => respond(r.requesterWallet, true)} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded">Accept</button>
                        <button onClick={() => respond(r.requesterWallet, false)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Outgoing Requests</h3>
                {(!requests?.outgoing || requests.outgoing.length === 0) && <div className="text-gray-400">No outgoing requests.</div>}
                <div className="space-y-2">
                  {requests?.outgoing && requests.outgoing.map((r) => (
                    <div key={r._id} className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex items-center justify-between">
                      <div>
                        <div className="text-gray-300">To {r.recipientName || 'Unknown User'}</div>
                        <div className="text-sm text-gray-400">Wallet: {r.recipientWallet?.slice(0, 10) || 'Unknown'}...</div>
                      </div>
                      <span className="text-xs text-yellow-400">Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Connections */}
          {activeTab === 'connections' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Your Connections</h3>
              {(!connections || connections.length === 0) && <div className="text-gray-400">No connections yet.</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections && connections.map((w, idx) => (
                  <div key={idx} className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                    <div className="text-[#f3ba2f] font-semibold">{w.name || 'Unknown User'}</div>
                    <div className="text-sm text-gray-400 mt-1">Wallet: {w.wallet?.slice(0, 10) || 'Unknown'}...</div>
                    <div className="text-sm text-gray-400">Connected</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Skills Distribution</h3>
              {(!networkData?.skillGraph || Object.keys(networkData.skillGraph).length === 0) && (
                <div className="text-gray-400">No skill data available.</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {networkData?.skillGraph && Object.entries(networkData.skillGraph).map(([wallet, student]) => (
                  <div key={wallet} className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                    <div className="text-[#f3ba2f] font-semibold mb-3">
                      {student?.name || 'Unknown User'} ({student?.skills?.length || 0} skills)
                    </div>
                    <div className="text-sm text-gray-400 mb-2">Wallet: {wallet?.slice(0, 8) || 'Unknown'}...</div>
                    <div className="flex flex-wrap gap-2">
                      {student?.skills && student.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-[#f3ba2f] text-black text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500">
            <p>Connect with peers who share your skills and institutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
