import Header from '../components/Header';
import { useState, useEffect } from 'react';
import axios from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import scene from '/assets/scene.splinecode';
import FeatureCarousel from '../components/FeatureCarousel';

export default function LandingPage() {
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showSpline, setShowSpline] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShowSpline(!mediaQuery.matches);

    const handleChange = (e) => setShowSpline(!e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  async function quickVerify(e) {
    e.preventDefault();
    if (!q) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/verify?${q.includes('0x') ? `studentWallet=${q}` : `certificateID=${q}`}`);
      setResult(res.data.data || res.data);
    } catch (err) {
      setResult({ valid: false, error: err?.response?.data?.error || 'Not found' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="relative h-[94vh] w-full overflow-hidden">
        {/* Hero background */}
        {showSpline ? (
          <Spline scene={scene} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
            <img src="/assets/logo.png" alt="ChainCred Logo" className="w-48 h-48 animate-pulse" />
          </div>
        )}

        {/* Hero text content positioned top-left */}
        <div className="absolute top-8 left-15 max-w-xl text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400">Fraud-proof credentials with ChainCred 🚀</h1>
          <p className="mt-4 text-gray-200 max-w-sm">Tamper-proof, decentralized, verifiable on <br /> opBNB + Greenfield.</p>
          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-yellow-400 text-black rounded" onClick={() => navigate('/auth')}>Get Started</button>
            <button className="px-4 py-2 border border-yellow-400 rounded text-yellow-400" onClick={() => navigate('/verify')}>Verify a Credential</button>
          </div>
        </div>

        {/* Quick Verify box - bottom right */}
        <div className="absolute right-10 bottom-10">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 bg-opacity-80 rounded-xl border-2 border-yellow-400 p-6 w-96 shadow-2xl">
            <h3 className="font-bold text-yellow-400 text-lg mb-3 flex items-center gap-1">
              <span>🔍</span> Quick Verify
            </h3>
            <form className="mt-2" onSubmit={quickVerify}>
              <input
                className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                placeholder="Certificate ID or Wallet"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
              <div className="mt-4 flex justify-between gap-2">
                <button
                  type="button"
                  className="px-3 py-1 border border-gray-600 rounded text-gray-300 hover:border-yellow-400 hover:text-yellow-400 transition"
                  onClick={() => { setQ(''); setResult(null); }}
                >
                  Clear
                </button>
                <button
                  className="px-4 py-1 bg-yellow-400 text-black rounded font-bold hover:bg-yellow-300 transition"
                  disabled={loading}
                >
                  {loading ? 'Checking...' : 'Verify'}
                </button>
              </div>
            </form>
            <div className="mt-4">
              {result && (result.valid
                ? <div className="text-green-400 font-semibold">
                    ✅ Valid credential — {result.metadata?.certificateID}
                    <div className="text-sm text-gray-300 mt-1">
                      Student: {result.metadata?.studentName || 'Unknown'} | 
                      Issuer: {result.metadata?.issuerName || 'Unknown'}
                    </div>
                  </div>
                : <div className="text-red-400 font-semibold">❌ Invalid — {result.error || 'Not found'}</div>)}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Section */}
      <FeatureCarousel />

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 bg-gray-900 rounded-md mb-12">
        <h2 className="text-3xl font-bold text-yellow-400 mb-8 text-center">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-around gap-8 text-center text-gray-300">
          <Step number="1" title="Create Wallet & Register" />
          <Step number="2" title="Institute Uploads Certificate" />
          <Step number="3" title="Mint Credential NFT on opBNB" />
          <Step number="4" title="Instant Verification Anywhere" />
        </div>
      </section>

      {/* Who Benefits Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-yellow-400 text-center mb-8">Who Benefits?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <BenefitCard icon="🎓" title="Universities" description="Issue tamper-proof diplomas & transcripts." />
          <BenefitCard icon="🏢" title="Employers" description="Verify candidate credentials instantly." />
          <BenefitCard icon="👩‍🎓" title="Students" description="Prove achievements with NFT-based certificates." />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-950 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-yellow-400 text-center mb-8">FAQs</h2>
          <div className="space-y-6">
            <FAQ question="🔒 Are my credentials private?" answer="Yes. Sensitive data is stored securely on Greenfield, while only proofs go on-chain." />
            <FAQ question="⚡ Why use opBNB?" answer="opBNB ensures fast, low-cost, and scalable verification for institutions & students." />
            <FAQ question="🎯 What are Soulbound NFTs?" answer="They’re non-transferable NFTs that prove ownership of credentials—no one else can claim them." />
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-black py-16">
        <div className="max-w-3xl mx-auto px-6 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-8">
            Ready to secure your credentials?
          </h2>
          <div className="flex gap-4">
            <button
              className="px-6 py-3 bg-yellow-400 text-black rounded font-bold text-lg shadow hover:bg-yellow-300 transition"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </button>
            <button
              className="px-6 py-3 border-2 border-yellow-400 text-yellow-400 rounded font-bold text-lg hover:bg-yellow-400 hover:text-black transition"
              onClick={() => navigate('/verify')}
            >
              Verify Now
            </button>
          </div>
        </div>
      </section>

      {/* About Section Restyled */}
      <section className="max-w-6xl mx-auto px-6 py-12 bg-gray-900 rounded-md shadow-md">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">About ChainCred</h2>
        <p className="text-gray-300 max-w-4xl mx-auto text-center leading-relaxed">
          Fake resumes and forged certificates plague hiring and admissions. ChainCred solves this by leveraging soulbound NFTs and decentralized storage solutions like Greenfield, making credentials tamper-proof and instantly verifiable. We use the BNB ecosystem—including opBNB and Greenfield—for fast, cost-effective, and scalable verification and storage.
        </p>
      </section>

      <footer className="mt-8 flex justify-between text-sm text-gray-400 max-w-6xl mx-auto px-6 py-6">
        <div>
          <a href="https://github.com" className="mr-4">GitHub</a>
          <a href="#" className="mr-4">Docs</a>
          <a href="#">Privacy</a>
        </div>
        <div>Hackathon Badge</div>
      </footer>
    </div>
  );
}

// FeatureCard component
// No longer needed, as features are now in FeatureCarousel.jsx
// function FeatureCard({ icon, title, description }) {
//   return (
//     <div className="p-6 bg-gray-800 rounded-md shadow-md hover:shadow-yellow-400 transition-shadow">
//       <div className="text-5xl mb-4">{icon}</div>
//       <h3 className="text-xl font-semibold text-yellow-400 mb-2">{title}</h3>
//       <p className="text-gray-300">{description}</p>
//     </div>
//   );
// }

// Step component
function Step({ number, title }) {
  return (
    <div className="flex flex-col items-center max-w-xs">
      <div className="w-12 h-12 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center mb-3 text-lg">
        {number}
      </div>
      <h4 className="font-semibold mb-1">{title}</h4>
    </div>
  );
}

// BenefitCard component
function BenefitCard({ icon, title, description }) {
  return (
    <div className="p-6 bg-gray-800 rounded-md shadow-md hover:shadow-yellow-400 transition-shadow">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold text-yellow-400 mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

// FAQ component
function FAQ({ question, answer }) {
  return (
    <div>
      <h3 className="font-semibold text-white">{question}</h3>
      <p className="text-gray-400">{answer}</p>
    </div>
  );
}
