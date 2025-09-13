import React, { useEffect, useState } from 'react';

export default function PDFViewer({ url, onClose }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // If it hasn't loaded in 7s, assume remote host blocks iframes or is down
      if (loading) {
        setError(true);
        setLoading(false);
      }
    }, 7000);
    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Certificate Viewer</h3>
          <div className="flex items-center gap-2">
            <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Open in new tab</a>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          {/* Always render iframe so onLoad/onError can fire */}
          {!error && (
            <iframe
              src={url}
              className="w-full h-[72vh] border-0"
              onLoad={() => setLoading(false)}
              onError={() => { setError(true); setLoading(false); }}
              title="Certificate PDF"
            />
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3ba2f]"></div>
              <span className="ml-3 text-gray-700">Loading certificate...</span>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Certificate Unavailable</h3>
              <p className="text-gray-600 mb-4">The file host blocked embedding or the file isn't reachable right now.</p>
              <div className="bg-gray-100 rounded-lg p-3 text-left">
                <p className="text-sm text-gray-600 mb-1">File URL:</p>
                <p className="text-xs font-mono text-gray-800 break-all">{url}</p>
              </div>
              <div className="mt-4 flex justify-center gap-3">
                <a href={url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded bg-black text-white">Open in new tab</a>
                <button onClick={onClose} className="px-4 py-2 rounded border">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
