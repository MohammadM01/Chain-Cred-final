import React, { useState } from 'react';
import Header from '../components/Header';
import { initWeb3Auth } from '../utils/web3auth';
import { useUser } from '../context/UserContext';
import axios from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function AuthPage(){
  const { setUser, showToast } = useUser();
  const [address, setAddress] = useState(null);
  const [role, setRole] = useState('institution');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function connect(){
    const wallet = await initWeb3Auth();
    if(wallet) setAddress(wallet);
  }

  async function register(){
    if(!address) return showToast('error', 'Connect your wallet');
    setLoading(true);
    try{
      const res = await axios.post(`/api/auth/register`, { wallet: address, role: role === 'institution' ? 'institute' : role, name });
      setUser(res.data.data.user);
      showToast('success', 'Registered');
    }catch(err){
      showToast('error', err?.response?.data?.error || 'Register failed');
    }finally{setLoading(false)}
  }

  async function verifyWallet(){
    if(!address) return showToast('error', 'Connect wallet');
    try{
      const message = 'Sign this to verify: ChainCred';
      // web3auth signer placeholder
      const signature = await window.ethereum?.request?.({ method: 'personal_sign', params: [message, address] }).catch(()=>null);
      if(!signature) return showToast('error', 'Signature failed');
      const res = await axios.post(`/api/auth/verify-wallet`, { wallet: address, message, signature });
      if(res.data.success){
        showToast('success', 'Wallet verified');
        navigate('/dashboard');
      }
    }catch(err){
      showToast('error', err?.response?.data?.error || 'Verify failed');
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-6">
      <Header />
      <section className="max-w-3xl mx-auto py-12">
        <h2 className="text-2xl">Auth / Wallet</h2>
        <div className="mt-4 bg-gray-900 p-6 rounded">
          <div>Wallet: {address || 'Not connected'}</div>
          <div className="mt-3 flex gap-3">
            <button className="px-3 py-1 bg-yellow-400 text-black rounded" onClick={connect}>Connect Wallet</button>
            <button className="px-3 py-1 border border-yellow-400 rounded" onClick={verifyWallet}>Verify Wallet</button>
          </div>

          <div className="mt-6">
            <div className="flex gap-2">
              <button className={`px-3 py-1 ${role==='institution'?'bg-yellow-400 text-black':'border border-yellow-400'}`} onClick={()=>setRole('institution')}>Institute</button>
              <button className={`px-3 py-1 ${role==='student'?'bg-yellow-400 text-black':'border border-yellow-400'}`} onClick={()=>setRole('student')}>Student</button>
              <button className={`px-3 py-1 ${role==='verifier'?'bg-yellow-400 text-black':'border border-yellow-400'}`} onClick={()=>setRole('verifier')}>Verifier</button>
            </div>

            <div className="mt-4">
              <input placeholder="Name (optional)" className="w-full p-2 bg-black border" value={name} onChange={e=>setName(e.target.value)} />
              <div className="mt-3 flex justify-end">
                <button className="px-3 py-1 bg-yellow-400 text-black rounded" onClick={register} disabled={loading}>{loading ? 'Saving...' : 'Register'}</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
