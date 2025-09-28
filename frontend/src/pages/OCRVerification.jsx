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
  const [cameraError, setCameraError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setError(null);
      setIsInitializingCamera(true);
      setIsCameraReady(false);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      console.log('Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        } 
      });
      
      console.log('Camera access granted, setting stream...');
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          setIsCameraReady(true);
          setIsInitializingCamera(false);
        };
        
        videoRef.current.oncanplay = () => {
          console.log('Video can play');
          setIsCameraReady(true);
          setIsInitializingCamera(false);
        };
        
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
          setCameraError('Failed to load camera stream');
          setIsInitializingCamera(false);
        };
        
        // Fallback timeout
        setTimeout(() => {
          if (!isCameraReady && !isInitializingCamera) {
            console.log('Camera timeout, forcing ready state');
            setIsCameraReady(true);
            setIsInitializingCamera(false);
          }
        }, 5000);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setIsInitializingCamera(false);
      let errorMessage = 'Camera access denied or not available';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      }
      
      setCameraError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraReady(false);
      setIsInitializingCamera(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setExtractedText('');
    setCertificateId('');
    setVerificationResult(null);
    setError(null);
    setCameraError(null);
    setIsCameraReady(false);
    setIsInitializingCamera(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not ready. Please wait for the camera to load.');
      return;
    }

    if (!isCameraReady) {
      setError('Camera not ready. Please wait for the camera to initialize.');
      return;
    }
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    // Ensure video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Video not ready. Please wait a moment and try again.');
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setIsCapturing(false);
    
    console.log('Image captured successfully');
    console.log('Image dimensions:', canvas.width, 'x', canvas.height);
    
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
      
      const ocrData = res.data.data;
      setExtractedText(ocrData.text);
      
      // Extract certificate ID from OCR data
      if (ocrData.certificateId) {
        setCertificateId(ocrData.certificateId);
        console.log('Found certificate ID:', ocrData.certificateId);
        console.log('Student Name:', ocrData.studentName);
        console.log('Course:', ocrData.course);
        console.log('Institution:', ocrData.institution);
        console.log('Date:', ocrData.date);
        await verifyCertificate(ocrData.certificateId);
      } else {
        // Fallback to manual pattern matching
        const patterns = [
          /CID:\s*([a-fA-F0-9]{64})/i,
          /Certificate\s+ID:\s*([a-fA-F0-9]{64})/i,
          /([a-fA-F0-9]{64})/
        ];
        
        let foundId = null;
        for (const pattern of patterns) {
          const match = ocrData.text.match(pattern);
          if (match) {
            foundId = match[1] || match[0];
            break;
          }
        }
        
        if (foundId) {
          setCertificateId(foundId);
          console.log('Found certificate ID via pattern matching:', foundId);
          await verifyCertificate(foundId);
        } else {
          setError('Certificate ID not found in image. Please ensure the certificate is clearly visible and contains "CID:" followed by a 64-character hex string.');
        }
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

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle video element setup when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = stream;
      
      const handleLoadedMetadata = () => {
        console.log('Video metadata loaded');
        setIsCameraReady(true);
        setIsInitializingCamera(false);
      };
      
      const handleCanPlay = () => {
        console.log('Video can play');
        setIsCameraReady(true);
        setIsInitializingCamera(false);
      };
      
      const handleError = (e) => {
        console.error('Video error:', e);
        setCameraError('Failed to load camera stream');
        setIsInitializingCamera(false);
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      
      // Fallback timeout
      const timeout = setTimeout(() => {
        if (!isCameraReady) {
          console.log('Camera timeout, forcing ready state');
          setIsCameraReady(true);
          setIsInitializingCamera(false);
        }
      }, 5000);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        clearTimeout(timeout);
      };
    }
  }, [stream, isCameraReady]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-6xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold text-[#f3ba2f]">OCR Certificate Verification</h1>
        <p className="text-gray-300">Capture a photo of your certificate to automatically extract and verify the Certificate ID.</p>

        {!capturedImage ? (
          <div className="bg-gray-900 rounded p-6">
            <h2 className="text-xl font-semibold mb-4">Camera Capture</h2>
            
            {cameraError ? (
              <div className="text-center">
                <div className="bg-red-900/30 border border-red-500 rounded p-4 mb-4">
                  <div className="text-red-400 font-semibold mb-2">Camera Error:</div>
                  <div className="text-red-300">{cameraError}</div>
                </div>
                <button 
                  onClick={startCamera}
                  className="px-6 py-3 bg-[#f3ba2f] text-black rounded-lg font-semibold hover:opacity-90"
                >
                  🔄 Try Again
                </button>
              </div>
            ) : !stream ? (
              <div className="text-center">
                <button 
                  onClick={startCamera}
                  disabled={isInitializingCamera}
                  className={`px-6 py-3 rounded-lg font-semibold ${
                    isInitializingCamera 
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                      : 'bg-[#f3ba2f] text-black hover:opacity-90'
                  }`}
                >
                  {isInitializingCamera ? '⏳ Initializing...' : '📷 Start Camera'}
                </button>
                <p className="text-gray-400 mt-2">
                  {isInitializingCamera ? 'Setting up camera...' : 'Allow camera access to scan certificates'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted
                    webkit-playsinline="true"
                    className={`w-full max-w-2xl mx-auto rounded-lg border-2 ${
                      isCameraReady ? 'border-green-500' : 'border-yellow-500'
                    }`}
                    style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Overlay for alignment guide */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-dashed border-yellow-400 rounded-lg opacity-70">
                      <div className="absolute top-2 left-2 text-xs text-yellow-400 bg-black/50 px-1 rounded">
                        Position certificate here
                      </div>
                    </div>
                  </div>
                  
                  {/* Camera status indicator */}
                  <div className="absolute top-2 right-2">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      isCameraReady ? 'bg-green-600 text-white' : 'bg-yellow-600 text-black'
                    }`}>
                      {isCameraReady ? 'Ready' : 'Loading...'}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={captureImage}
                    disabled={!isCameraReady}
                    className={`px-6 py-3 rounded-lg font-semibold ${
                      isCameraReady 
                        ? 'bg-green-600 text-white hover:opacity-90' 
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    }`}
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
                    <li>• Position the certificate within the yellow dashed frame</li>
                    <li>• Ensure the "CID:" text is clearly visible and readable</li>
                    <li>• Make sure there's good lighting and no shadows</li>
                    <li>• Keep the camera steady and wait for "Ready" status</li>
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
                <div className="relative">
                  <img 
                    src={capturedImage} 
                    alt="Captured certificate" 
                    className="max-w-full h-auto rounded-lg border border-gray-700 max-h-96 object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    ✓ Captured
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-gray-300 mb-4">Review the captured image. If it looks good, proceed with extraction.</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => extractTextFromImage(capturedImage)}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:opacity-90"
                  >
                    {loading ? '⏳ Processing...' : '🔍 Extract & Verify'}
                  </button>
                  <button 
                    onClick={resetCapture}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800"
                  >
                    📷 Capture Again
                  </button>
                </div>
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
                <h2 className="text-xl font-semibold mb-4">📋 Certificate Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded p-4">
                    <div className="text-sm text-gray-400 mb-1">Certificate ID:</div>
                    <div className="font-mono text-[#f3ba2f] break-all text-sm">{certificateId}</div>
                  </div>
                  {extractedText && (
                    <div className="bg-gray-800 rounded p-4">
                      <div className="text-sm text-gray-400 mb-2">Additional Details:</div>
                      <div className="text-sm text-gray-300">
                        {extractedText.includes('Student Name:') && (
                          <div className="mb-1">
                            <span className="text-gray-400">Student:</span> {extractedText.match(/Student Name:\s*([^\n]+)/)?.[1] || 'Not found'}
                          </div>
                        )}
                        {extractedText.includes('Course/Program:') && (
                          <div className="mb-1">
                            <span className="text-gray-400">Course:</span> {extractedText.match(/Course\/Program:\s*([^\n]+)/)?.[1] || 'Not found'}
                          </div>
                        )}
                        {extractedText.includes('Institution:') && (
                          <div className="mb-1">
                            <span className="text-gray-400">Institution:</span> {extractedText.match(/Institution:\s*([^\n]+)/)?.[1] || 'Not found'}
                          </div>
                        )}
                        {extractedText.includes('Date:') && (
                          <div className="mb-1">
                            <span className="text-gray-400">Date:</span> {extractedText.match(/Date:\s*([^\n]+)/)?.[1] || 'Not found'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
