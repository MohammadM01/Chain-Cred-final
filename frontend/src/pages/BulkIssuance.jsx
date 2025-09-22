import React, { useState } from 'react';
import api, { BASE_URL } from '../utils/api';
import Header from '../components/Header';

export default function BulkIssuance() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadTemplate = () => {
    window.location.href = `${BASE_URL}/api/bulk/template`;
  };

  const downloadExample = () => {
    const sample = [
      ['studentName','studentWallet'].join(','),
      ['md','0x1111111111111111111111111111111111111111'].join(','),
      ['dheeraj','0x2222222222222222222222222222222222222222'].join(','),
      ['navya','0x3333333333333333333333333333333333333333'].join(','),
      ['prachi','0x4444444444444444444444444444444444444444'].join(','),
      ['rishabh','0x5555555555555555555555555555555555555555'].join(','),
      ['yash','0x6666666666666666666666666666666666666666'].join(',')
    ].join('\n');
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chaincred_bulk_example.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleValidate = async () => {
    try {
      if (!file) {
        setError('Please select a CSV file');
        return;
      }
      setLoading(true);
      setError(null);
      setEstimate(null);
      setResults(null);

      const form = new FormData();
      form.append('csv', file);

      const res = await api.post('/api/bulk/validate', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setRows(res.data.data.rows);
      setStats(res.data.data.stats);

      // estimate gas for valid rows only
      if (res.data.data.stats?.valid > 0) {
        const est = await api.post('/api/bulk/estimate', { count: res.data.data.stats.valid });
        setEstimate(est.data.data);
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const runBulkMint = async () => {
    try {
      if (!stats || !rows?.length) return;
      setLoading(true);
      setError(null);

      // take only valid rows
      const valid = rows.filter(r => !r.errors || r.errors.length === 0).map(r => ({ studentName: r.studentName, studentWallet: r.studentWallet }));
      if (valid.length === 0) {
        setError('No valid rows to mint');
        return;
      }

      // For MVP, ask issuerWallet via prompt; ideally use logged-in user context
      const issuerWallet = window.prompt('Enter issuer wallet address to sign as (must match institute user)');
      if (!issuerWallet) return;

      const res = await api.post('/api/bulk/mint', { issuerWallet, rows: valid });
      setResults(res.data.data.results);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-6xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold text-[#f3ba2f]">Bulk Issuance</h1>
        <p className="text-gray-300">Upload a CSV to validate student names and wallets, and preview estimated tBNB for minting.</p>

        <div className="bg-gray-900 rounded p-6 space-y-4">
          <h2 className="text-xl font-semibold">Instructions</h2>
          <ul className="list-disc pl-6 text-gray-300 space-y-1">
            <li>CSV must have headers: <span className="text-[#f3ba2f] font-semibold">studentName</span>, <span className="text-[#f3ba2f] font-semibold">studentWallet</span></li>
            <li>Wallets must be valid EVM addresses (0x…)</li>
            <li>Only valid rows count towards the gas estimate</li>
          </ul>
          <div className="flex gap-3">
            <button onClick={downloadTemplate} className="px-4 py-2 bg-[#f3ba2f] text-black rounded hover:opacity-90">Download CSV Template</button>
            <button onClick={downloadExample} className="px-4 py-2 border border-[#f3ba2f] text-[#f3ba2f] rounded hover:bg-[#f3ba2f] hover:text-black">Download Example CSV</button>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-400 mb-1">Example preview:</div>
            <pre className="bg-black/60 text-gray-200 p-3 rounded overflow-auto"><code>{[
              'studentName,studentWallet',
              'md,0x1111111111111111111111111111111111111111',
              'dheeraj,0x2222222222222222222222222222222222222222',
              'navya,0x3333333333333333333333333333333333333333',
              'prachi,0x4444444444444444444444444444444444444444',
              'rishabh,0x5555555555555555555555555555555555555555',
              'yash,0x6666666666666666666666666666666666666666'
            ].join('\n')}</code></pre>
          </div>
        </div>

        <div className="bg-gray-900 rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Upload CSV</h2>
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4" />
          <button disabled={loading} onClick={handleValidate} className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50">{loading ? 'Validating…' : 'Validate & Estimate'}</button>
          {error && <div className="mt-3 text-red-400">{error}</div>}
        </div>

        {stats && (
          <div className="bg-gray-900 rounded p-6">
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded bg-gray-800">
                <div className="text-gray-400">Total Rows</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div className="p-4 rounded bg-green-900/30">
                <div className="text-gray-400">Valid</div>
                <div className="text-2xl font-bold text-green-400">{stats.valid}</div>
              </div>
              <div className="p-4 rounded bg-red-900/30">
                <div className="text-gray-400">Invalid</div>
                <div className="text-2xl font-bold text-red-400">{stats.invalid}</div>
              </div>
            </div>
          </div>
        )}

        {rows?.length > 0 && (
          <div className="bg-gray-900 rounded p-6 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-2">Preview</h2>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-2 px-3">Student Name</th>
                  <th className="py-2 px-3">Wallet</th>
                  <th className="py-2 px-3">Errors</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-2 px-3">{r.studentName}</td>
                    <td className="py-2 px-3 font-mono text-gray-300">{r.studentWallet}</td>
                    <td className="py-2 px-3 text-sm text-red-400">{r.errors?.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {estimate && (
          <div className="bg-gray-900 rounded p-6">
            <h2 className="text-xl font-semibold mb-2">Estimated Gas (opBNB testnet)</h2>
            <div className="text-gray-300">Per mint gas: {estimate.perMintGas}</div>
            <div className="text-gray-300">Gas price (gwei): {estimate.gasPriceGwei}</div>
            <div className="text-gray-300">Total gas: {estimate.totalGas}</div>
            <div className="text-white font-bold">Approx tBNB required: {estimate.totalBNB.toFixed(6)}</div>
            <button disabled={loading} onClick={runBulkMint} className="mt-4 px-4 py-2 bg-purple-600 rounded disabled:opacity-50">{loading ? 'Minting…' : 'Run Bulk Mint'}</button>
          </div>
        )}

        {results && (
          <div className="bg-gray-900 rounded p-6 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-2">Mint Results</h2>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-2 px-3">Student Name</th>
                  <th className="py-2 px-3">Wallet</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Token ID</th>
                  <th className="py-2 px-3">Tx Hash</th>
                  <th className="py-2 px-3">Error</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-2 px-3">{r.studentName}</td>
                    <td className="py-2 px-3 font-mono text-gray-300">{r.studentWallet}</td>
                    <td className="py-2 px-3">{r.status}</td>
                    <td className="py-2 px-3">{r.tokenId || '-'}</td>
                    <td className="py-2 px-3 font-mono break-all text-[#f3ba2f]">{r.txHash || '-'}</td>
                    <td className="py-2 px-3 text-red-400">{r.error || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Phase 2: Enable bulk mint button here once endpoint is ready */}
      </div>
    </div>
  );
}


