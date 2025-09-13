import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { useUser } from '../context/UserContext';
import axios from '../utils/api';

export default function Dashboard(){
  const { user, showToast } = useUser();
  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [studentWallet, setStudentWallet] = useState('');
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [issued, setIssued] = useState([]);
  const [myCreds, setMyCreds] = useState([]);
  const [query, setQuery] = useState('');
  const dashboardRole = useMemo(()=>user?.role, [user]);

  if(!user) return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="p-8">Please login to access dashboard (Go to /auth)</div>
    </div>
  );

  async function handleUpload(e){
    e.preventDefault();
    if(!file || !studentWallet) return showToast('error', 'Select file and student wallet');
    setUploading(true);
    try{
      const fd = new FormData();
      fd.append('file', file);
      fd.append('studentWallet', studentWallet);
      fd.append('issuerWallet', user.wallet);
      const res = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      setUploadResult(res.data.data || res.data);
      showToast('success', 'Uploaded');
    }catch(err){
      showToast('error', err?.response?.data?.error || 'Upload failed');
    }finally{ setUploading(false) }
  }

  async function handleMint(){
    if(!uploadResult?.metadataUrl || !studentWallet) return showToast('error', 'Upload first');
    setMinting(true);
    try{
      const res = await axios.post('/api/mint', {
        studentWallet,
        metadataUrl: uploadResult.metadataUrl,
        issuerWallet: user.wallet,
      });
      showToast('success', 'Minted');
      // refresh issued list
      await loadIssued();
      setUploadResult((prev)=> ({ ...prev, txHash: res.data.data?.txHash, tokenId: res.data.data?.tokenId }));
    }catch(err){
      showToast('error', err?.response?.data?.error || 'Mint failed');
    }finally{ setMinting(false) }
  }

  async function loadIssued(){
    try{
      const res = await axios.get(`/api/verify?issuerWallet=${user.wallet}`);
      setIssued(res.data.data?.items || res.data.data || []);
    }catch{
      setIssued([]);
    }
  }

  async function loadMyCreds(){
    try{
      const res = await axios.get(`/api/verify?studentWallet=${user.wallet}`);
      setMyCreds(res.data.data?.items || res.data.data || []);
    }catch{
      setMyCreds([]);
    }
  }

  useEffect(()=>{
    if(user?.role === 'institute') loadIssued();
    if(user?.role === 'student') loadMyCreds();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  if(user.role === 'institute'){
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="p-8 space-y-8">
          <div className="bg-gray-900 p-6 rounded">
            <h3 className="text-xl font-semibold">Upload PDF</h3>
            <form className="mt-4 space-y-3" onSubmit={handleUpload}>
              <input type="file" accept="application/pdf" onChange={(e)=> setFile(e.target.files?.[0] || null)} className="block" />
              <input className="p-2 bg-black border rounded w-full" placeholder="Student Wallet" value={studentWallet} onChange={(e)=> setStudentWallet(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-yellow-400 text-black rounded" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
              </div>
            </form>
            {uploadResult && (
              <div className="mt-4 text-sm text-gray-300 space-y-1">
                <div>metadataUrl: <a href={uploadResult.metadataUrl} target="_blank" rel="noreferrer" className="text-yellow-400">open</a></div>
                <div>fileHash: {uploadResult.fileHash}</div>
                <div>certificateID: {uploadResult.certificateID}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={handleMint} className="px-3 py-1 border border-yellow-400 rounded" disabled={minting}>{minting ? 'Minting...' : 'Mint Credential'}</button>
                </div>
                {uploadResult.txHash && (
                  <div className="mt-2">Tx: <a className="text-yellow-400" target="_blank" rel="noreferrer" href={`https://explorer.testnet.opbnb.io/tx/${uploadResult.txHash}`}>{uploadResult.txHash.slice(0,10)}...</a></div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-900 p-6 rounded">
            <h3 className="text-xl font-semibold">Issued Certificates</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-400">
                  <tr>
                    <th className="py-2">CertificateID</th>
                    <th>Student Name</th>
                    <th>Student Wallet</th>
                    <th>Tx Hash</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issued?.length ? issued.map((it, idx)=> (
                    <tr key={idx} className="border-t border-gray-800">
                      <td className="py-2">{it?.metadata?.certificateID || it?.certificateID}</td>
                      <td className="text-yellow-400 font-medium">{it?.metadata?.studentName || it?.studentName || 'Unknown'}</td>
                      <td className="font-mono text-gray-300">{it?.metadata?.studentWallet || it?.studentWallet}</td>
                      <td>
                        {it?.metadata?.txHash ? (
                          <a className="text-yellow-400" href={`https://explorer.testnet.opbnb.io/tx/${it.metadata.txHash}`} target="_blank" rel="noreferrer">{it.metadata.txHash.slice(0,10)}...</a>
                        ) : '-'}
                      </td>
                      <td>{it?.metadata?.issuedDateISO || it?.createdAt || '-'}</td>
                      <td>{it?.valid === false ? 'Invalid' : 'Valid'}</td>
                    </tr>
                  )) : (
                    <tr><td className="py-3" colSpan="6">No items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if(user.role === 'student'){
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="p-8 space-y-6">
          <div className="bg-gray-900 p-6 rounded">
            <h3 className="text-xl font-semibold">My Credentials</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCreds?.length ? myCreds.map((it, idx)=> (
                <div key={idx} className="border border-gray-800 rounded p-4">
                  <div className="font-mono text-yellow-400">{it?.metadata?.certificateID || it?.certificateID}</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Issuer: <span className="text-yellow-400 font-medium">{it?.metadata?.issuerName || 'Unknown'}</span>
                    <span className="text-gray-500 ml-2">({it?.metadata?.issuerWallet})</span>
                  </div>
                  <div className="text-sm text-gray-300">Date: {it?.metadata?.issuedDateISO}</div>
                  <div className="mt-2 flex gap-3 text-sm">
                    {it?.metadata?.fileUrl && <a className="text-yellow-400" href={it.metadata.fileUrl} target="_blank" rel="noreferrer">PDF</a>}
                    {it?.metadata && <a className="text-yellow-400" href={`data:application/json,${encodeURIComponent(JSON.stringify(it.metadata))}`} target="_blank" rel="noreferrer">Metadata</a>}
                    {it?.metadata?.txHash && <a className="text-yellow-400" href={`https://explorer.testnet.opbnb.io/tx/${it.metadata.txHash}`} target="_blank" rel="noreferrer">Tx</a>}
                    <button className="text-yellow-400" onClick={()=> setQuery(it?.metadata?.certificateID || it?.certificateID)}>Share Link</button>
                  </div>
                </div>
              )) : <div>No credentials</div>}
            </div>
            {query && (
              <div className="mt-4 text-sm text-gray-300">Share: <span className="text-yellow-400">/verify?certificateID={query}</span></div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="p-8">
        <div className="bg-gray-900 p-6 rounded max-w-2xl">
          <h3 className="text-xl font-semibold">Verify Panel</h3>
          <form className="mt-4 flex gap-2" onSubmit={async (e)=>{
            e.preventDefault();
            if(!query) return;
            try{
              const res = await axios.get(`/api/verify?${query.includes('0x') ? `studentWallet=${query}` : `certificateID=${query}`}`);
              const data = res.data.data || res.data;
              if(data?.valid){
                showToast('success', 'Valid credential');
              }else{
                showToast('error', 'Invalid');
              }
            }catch{
              showToast('error', 'Lookup failed');
            }
          }}>
            <input className="p-2 bg-black border rounded w-full" placeholder="Certificate ID or Wallet" value={query} onChange={(e)=> setQuery(e.target.value)} />
            <button className="px-3 py-1 bg-yellow-400 text-black rounded">Check</button>
          </form>
        </div>
      </div>
    </div>
  )
}
