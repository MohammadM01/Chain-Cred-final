import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import Header from '../components/Header';

export default function OCRVerification() {
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setIsCapturing(false);
    stopCamera();
  };

  const extractTextFromImage = async (imageData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert data URL to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create FormData for OCR API
      const formData = new FormData();
      formData.append('image', blob, 'certificate.jpg');
      
      // Call OCR API (we'll create this endpoint)
      const res = await api.post('/api/ocr/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const text = res.data.data.text;
      setExtractedText(text);
      
      // Extract Certificate ID using regex pattern
      const certIdPattern = /CID:\s*([a-f0-9]{64})/i;
      const match = text.match(certIdPattern);
      
      if (match) {
        const extractedCertId = match[1];
        setCertificateId(extractedCertId);
        await verifyCertificate(extractedCertId);
      } else {
        setError('Certificate ID not found in image. Please ensure the certificate is clearly visible and contains "CID:" followed by a 64-character hex string.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'OCR extraction failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyCertificate = async (certId) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/verify?certificateID=${certId}`);
      setVerificationResult(res.data.data);
    } catch (err) {
      setError('Certificate verification failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setExtractedText('');
    setCertificateId('');
    setVerificationResult(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-6xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold text-[#f3ba2f]">OCR Certificate Verification</h1>
        <p className="text-gray-300">Capture a photo of your certificate to automatically extract and verify the Certificate ID.</p>

        {!capturedImage ? (
          <div className="bg-gray-900 rounded p-6">
            <h2 className="text-xl font-semibold mb-4">Camera Capture</h2>
            
            {!stream ? (
              <div className="text-center">
                <button 
                  onClick={startCamera}
                  className="px-6 py-3 bg-[#f3ba2f] text-black rounded-lg font-semibold hover:opacity-90"
                >
                  📷 Start Camera
                </button>
                <p className="text-gray-400 mt-2">Allow camera access to scan certificates</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    className="w-full max-w-2xl mx-auto rounded-lg"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={captureImage}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:opacity-90"
                  >
                    📸 Capture Certificate
                  </button>
                  <button 
                    onClick={stopCamera}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800"
                  >
                    Stop Camera
                  </button>
                </div>
                
                <div className="bg-blue-900/30 rounded p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">📋 Instructions:</h3>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Position the certificate so the "CID:" text is clearly visible</li>
                    <li>• Ensure good lighting and avoid shadows</li>
                    <li>• Keep the camera steady and capture a clear image</li>
                    <li>• The system will automatically extract the Certificate ID</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded p-6">
              <h2 className="text-xl font-semibold mb-4">Captured Image</h2>
              <div className="flex justify-center">
                <img 
                  src={capturedImage} 
                  alt="Captured certificate" 
                  className="max-w-full h-auto rounded-lg border border-gray-700"
                />
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button 
                  onClick={() => extractTextFromImage(capturedImage)}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  {loading ? 'Processing...' : '🔍 Extract & Verify'}
                </button>
                <button 
                  onClick={resetCapture}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800"
                >
                  📷 Capture Again
                </button>
              </div>
            </div>

            {extractedText && (
              <div className="bg-gray-900 rounded p-6">
                <h2 className="text-xl font-semibold mb-4">Extracted Text</h2>
                <pre className="bg-black/60 text-gray-200 p-4 rounded overflow-auto text-sm">
                  {extractedText}
                </pre>
              </div>
            )}

            {certificateId && (
              <div className="bg-gray-900 rounded p-6">
                <h2 className="text-xl font-semibold mb-4">Extracted Certificate ID</h2>
                <div className="bg-gray-800 rounded p-4">
                  <div className="text-sm text-gray-400 mb-1">Certificate ID:</div>
                  <div className="font-mono text-[#f3ba2f] break-all">{certificateId}</div>
                </div>
              </div>
            )}

            {verificationResult && (
              <div className="bg-gray-900 rounded p-6">
                <h2 className="text-xl font-semibold mb-4">Verification Result</h2>
                <div className={`p-4 rounded ${verificationResult.valid ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{verificationResult.valid ? '✅' : '❌'}</span>
                    <span className={`font-semibold ${verificationResult.valid ? 'text-green-400' : 'text-red-400'}`}>
                      {verificationResult.valid ? 'Valid Credential' : 'Invalid Credential'}
                    </span>
                  </div>
                  
                  {verificationResult.valid && (
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Student:</span> <span className="text-[#f3ba2f]">{verificationResult.metadata?.studentName}</span> <span className="text-gray-300">({verificationResult.studentWallet})</span></div>
                      <div><span className="text-gray-400">Issuer:</span> <span className="text-[#f3ba2f]">{verificationResult.metadata?.issuerName}</span> <span className="text-gray-300">({verificationResult.issuerWallet})</span></div>
                      <div><span className="text-gray-400">Issued:</span> <span className="text-gray-300">{new Date(verificationResult.issuedDate).toLocaleString()}</span></div>
                      <div><span className="text-gray-400">CertificateID:</span> <span className="text-[#f3ba2f] font-mono">{verificationResult.certificateID}</span></div>
                      {verificationResult.metadata?.fileUrl && (
                        <div className="mt-3">
                          <a 
                            href={verificationResult.metadata.fileUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#f3ba2f] text-black rounded hover:opacity-90"
                          >
                            📄 Open PDF
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded p-4">
                <div className="text-red-400 font-semibold mb-2">Error:</div>
                <div className="text-red-300">{error}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
