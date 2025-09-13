import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from '../utils/api';

export default function ProLanding(){
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function quickVerify(e){
    e.preventDefault();
    if(!query) return;
    setLoading(true);
    try{
      const res = await axios.get(`/api/verify?${query.includes('0x') ? `studentWallet=${query}` : `certificateID=${query}`}`);
      setResult(res.data.data || res.data);
    }catch(err){
      setResult({ valid: false, error: err?.response?.data?.error || 'Not found' });
    }finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-28">
          <div className="flex flex-col-reverse md:flex-row items-center gap-10">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="text-yellow-400">Fraud-proof</span> credentials for a trust-first world
              </h1>
              <p className="mt-5 text-gray-300 max-w-xl">
                Soulbound credentials stored on decentralized infrastructure and verified on opBNB + Greenfield.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="px-5 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-300 transition" onClick={()=>navigate('/auth')}>Get Started</button>
                <button className="px-5 py-2 border-2 border-yellow-400 text-yellow-400 rounded font-semibold hover:bg-yellow-400 hover:text-black transition" onClick={()=>navigate('/verify')}>Verify a Credential</button>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-yellow-400">Quick Verify</h3>
                <form className="mt-4" onSubmit={quickVerify}>
                  <input className="w-full p-3 bg-black border border-gray-700 rounded placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Certificate ID or Wallet" value={query} onChange={(e)=>setQuery(e.target.value)} />
                  <div className="mt-3 flex justify-end gap-2">
                    <button type="button" className="px-4 py-2 border border-gray-700 rounded text-gray-300 hover:border-yellow-400 hover:text-yellow-400" onClick={()=>{ setQuery(''); setResult(null); }}>Clear</button>
                    <button className="px-5 py-2 bg-yellow-400 text-black rounded font-semibold" disabled={loading}>{loading ? 'Checking…' : 'Verify'}</button>
                  </div>
                </form>
                <div className="mt-4 min-h-[24px]">
                  {result && (result.valid
                    ? <div className="text-green-400 font-medium">✅ Valid — {result.metadata?.certificateID}</div>
                    : <div className="text-red-400 font-medium">❌ Invalid — {result.error || 'Not found'}</div>) }
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card icon="🛡️" title="Tamper-Proof" desc="On-chain proofs on opBNB ensure authenticity that cannot be forged." />
          <Card icon="🗄️" title="Decentralized" desc="Documents live on resilient, distributed storage for longevity." />
          <Card icon="⚡" title="Instant" desc="Certificates can be verified in seconds—no middlemen." />
          <Card icon="🔒" title="Soulbound" desc="Non-transferable NFTs tie credentials to their rightful owners." />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-950 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-yellow-400 text-center">How It Works</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Step n="1" t="Register & Connect Wallet" />
            <Step n="2" t="Institute Uploads PDF" />
            <Step n="3" t="Mint Credential on opBNB" />
            <Step n="4" t="Verify Anywhere" />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-yellow-400 text-center">Why BNB Ecosystem</h2>
        <p className="mt-6 text-gray-300 text-center leading-relaxed">
          Fake resumes and forged certificates hurt institutions and employers. ChainCred uses
          soulbound NFTs with decentralized storage to make credentials tamper-proof and instantly
          verifiable. The BNB stack—opBNB for low-cost, high-throughput settlement and Greenfield for
          scalable storage—delivers performance without compromise.
        </p>
      </section>

      {/* CTA */}
      <section className="bg-black py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-yellow-400">Ready to secure your credentials?</h3>
          <div className="mt-8 flex justify-center gap-4">
            <button className="px-6 py-3 bg-yellow-400 text-black rounded font-bold hover:bg-yellow-300" onClick={()=>navigate('/auth')}>Get Started</button>
            <button className="px-6 py-3 border-2 border-yellow-400 text-yellow-400 rounded font-bold hover:bg-yellow-400 hover:text-black" onClick={()=>navigate('/verify')}>Verify Now</button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-6 text-gray-400 text-sm">Tip: Prefer this fast page? Use <span className="text-yellow-400">/home</span> as your entry URL.</div>

      <Footer />
    </div>
  );
}

function Card({ icon, title, desc }){
  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-yellow-400/60 transition-colors">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-lg font-semibold text-yellow-400">{title}</div>
      <p className="mt-2 text-gray-300">{desc}</p>
    </div>
  );
}

function Step({ n, t }){
  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center">{n}</div>
      <div className="font-medium">{t}</div>
    </div>
  );
}


