import { useState } from 'react';
import axios from '../utils/api';

export default function VerificationForm({ onResult }){
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setLoading(true);
    try{
      const res = await axios.get(`/api/verify?${q.includes('0x') ? `studentWallet=${q}` : `certificateID=${q}`}`);
      onResult && onResult(res.data.data || res.data);
    }catch(err){
      onResult && onResult({ valid: false, error: err?.response?.data?.error || 'Not found' });
    }finally{setLoading(false)}
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input className="p-2 bg-black border" placeholder="Certificate ID or Wallet" value={q} onChange={e=>setQ(e.target.value)} />
      <button className="px-3 py-1 bg-yellow-400 text-black rounded" disabled={loading}>{loading? 'Checking...' : 'Verify'}</button>
    </form>
  )
}
