import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUser } from '../context/UserContext';
import axios from '../utils/api';
import { initWeb3Auth } from '../utils/web3auth';

export default function SignIn() {
  const { setUser, showToast } = useUser();
  const [wallet, setWallet] = useState(null);
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const navigate = useNavigate();

  async function connectWallet() {
    setLoadingConnect(true);
    try {
      const addr = await initWeb3Auth();
      if (addr) {
        setWallet(addr);
        showToast('success', 'Wallet connected');
      }
    } catch {
      showToast('error', 'Failed to connect wallet');
    } finally {
      setLoadingConnect(false);
    }
  }

  async function verifyWallet() {
    if (!wallet) return showToast('error', 'Connect your wallet');
    setLoadingVerify(true);
    try {
      const message = 'Sign this to verify: ChainCred';
      const signature = await window.ethereum?.request?.({ method: 'personal_sign', params: [message, wallet] }).catch(() => null);
      if (!signature) return showToast('error', 'Signature was rejected');
      const res = await axios.post(`/api/auth/verify-wallet`, { wallet, message, signature });
      if (res.data?.success) {
        const nextUser = res.data?.data?.user;
        if (nextUser) {
          setUser(nextUser); // Persists to local storage via UserContext
          showToast('success', 'Signed in successfully');
          navigate('/dashboard-binance');
        } else {
          showToast('error', 'User not found');
        }
      } else {
        showToast('error', 'Verification failed');
      }
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Sign-in failed');
    } finally {
      setLoadingVerify(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Left: Sign-In Card */}
          <div className="flex-1 w-full">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-lg hover:shadow-yellow-400/50 transition-shadow duration-300">
              <h1 className="text-3xl font-bold tracking-tight mb-4">
                <span className="text-[#f3ba2f]">Binance</span>-style Sign In
              </h1>
              <p className="text-gray-400">Connect and verify your wallet to access your dashboard.</p>

              {/* Wallet section */}
              <div className="mt-6 space-y-4">
                <div className="text-sm text-gray-300">
                  Wallet: {wallet ? <span className="font-mono text-[#f3ba2f]">{wallet}</span> : 'Not connected'}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={connectWallet}
                    className="px-5 py-2 rounded-lg font-semibold bg-[#f3ba2f] text-black hover:bg-[#e0a923] transition-transform transform hover:scale-105 disabled:opacity-60"
                    disabled={loadingConnect}
                  >
                    {loadingConnect ? 'Connecting…' : 'Connect Wallet'}
                  </button>
                  <button
                    onClick={verifyWallet}
                    className="px-5 py-2 rounded-lg font-semibold border-2 border-[#f3ba2f] text-[#f3ba2f] hover:bg-[#f3ba2f] hover:text-black transition-transform transform hover:scale-105 disabled:opacity-60"
                    disabled={!wallet || loadingVerify}
                  >
                    {loadingVerify ? 'Verifying…' : 'Sign In'}
                  </button>
                </div>
              </div>

              {/* Back to Register */}
              <div className="mt-6">
                <button
                  onClick={() => navigate('/auth-binance')}
                  className="text-sm text-[#f3ba2f] hover:underline hover:text-[#e0a923] transition"
                >
                  Need to register? Sign Up!
                </button>
              </div>
            </div>
          </div>

          {/* Right: Highlights */}
          <div className="w-full md:max-w-sm">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg hover:shadow-yellow-400/50 transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-[#f3ba2f] mb-4">Why ChainCred</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">🛡️ <span>Tamper-proof credentials (opBNB)</span></li>
                <li className="flex items-center gap-2">🗄️ <span>Decentralized storage (Greenfield)</span></li>
                <li className="flex items-center gap-2">⚡ <span>Instant verification, low fees</span></li>
                <li className="flex items-center gap-2">🔒 <span>Soulbound, non-transferable</span></li>
              </ul>
              <div className="mt-6 text-sm text-gray-400">
                Need help? Visit <a href="/verify" className="text-[#f3ba2f] hover:underline">Verify</a> to test a certificate ID.
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}