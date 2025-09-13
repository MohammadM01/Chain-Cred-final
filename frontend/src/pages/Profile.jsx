import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useUser } from '../context/UserContext';
import axios from '../utils/api';
import Spline from '@splinetool/react-spline';
import scene from '/assets/scene.splinecode';

export default function Profile(){
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [showSpline, setShowSpline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShowSpline(!mediaQuery.matches);

    const handleChange = (e) => setShowSpline(!e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Floating particles effect
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 15 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.1,
        color: ['#fbbf24', '#3b82f6', '#10b981', '#8b5cf6'][Math.floor(Math.random() * 4)]
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 15000);

    return () => clearInterval(interval);
  }, []);

  // Animate particles
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => {
        const newX = particle.x + particle.vx;
        const newY = particle.y + particle.vy;
        return {
          ...particle,
          x: newX > window.innerWidth ? 0 : newX < 0 ? window.innerWidth : newX,
          y: newY > window.innerHeight ? 0 : newY < 0 ? window.innerHeight : newY,
        };
      }));
    };

    const interval = setInterval(animateParticles, 80);
    return () => clearInterval(interval);
  }, []);

  // Track mouse position for custom cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(()=>{
    async function load(){
      if(!user) return;
      setLoading(true);
      try{
        const q = user.role === 'institute' ? `issuerWallet=${user.wallet}` : `studentWallet=${user.wallet}`;
        const res = await axios.get(`/api/verify?${q}`);
        const data = res.data.data?.items || res.data.data || [];
        setItems(data);
        
        // Calculate stats
        setStats({
          total: data.length,
          verified: data.filter(item => item.tokenId).length,
          pending: data.filter(item => !item.tokenId).length
        });
      }catch{
        setItems([]);
        setStats({ total: 0, verified: 0, pending: 0 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const getRoleIcon = (role) => {
    switch(role) {
      case 'student': return '🎓';
      case 'institute': return '🏫';
      default: return '👤';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'student': return 'text-blue-400';
      case 'institute': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRoleGradient = (role) => {
    switch(role) {
      case 'student': return 'from-blue-400 to-blue-600';
      case 'institute': return 'from-green-400 to-green-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Spline Background - Fixed positioning and sizing */}
      {showSpline && (
        <div className="fixed inset-0 z-0 w-full h-full">
          <Spline 
            scene={scene} 
            style={{ width: '100%', height: '100%' }}
            onLoad={(splineApp) => {
              // Disable default cursor behavior to prevent flashing
              if (splineApp && splineApp.canvas) {
                splineApp.canvas.style.cursor = 'none';
              }
            }}
            onMouseDown={(e) => {
              // Handle mouse interactions
              if (e.target && e.target.name) {
                console.log('Spline interaction:', e.target.name);
              }
            }}
          />
        </div>
      )}
      
             {/* Floating Particles */}
       <div className="fixed inset-0 z-5 pointer-events-none">
         {particles.map((particle, index) => (
           <div
             key={index}
             className="absolute rounded-full animate-pulse"
             style={{
               left: particle.x,
               top: particle.y,
               width: particle.size,
               height: particle.size,
               backgroundColor: particle.color,
               opacity: particle.opacity,
               transform: `translate(-50%, -50%)`,
             }}
           />
         ))}
       </div>

       {/* Custom Cursor for Spline Interaction */}
       <div className="fixed inset-0 z-50 pointer-events-none">
         <div 
           className="w-6 h-6 bg-yellow-400/50 rounded-full border-2 border-yellow-400 shadow-lg shadow-yellow-400/30 animate-pulse"
           style={{
             left: mousePosition.x,
             top: mousePosition.y,
             transform: 'translate(-50%, -50%)',
             transition: 'all 0.1s ease-out'
           }}
         />
       </div>

       {/* Interactive Floating Elements */}
       <div className="fixed inset-0 z-10 pointer-events-none">
         {[...Array(8)].map((_, index) => (
           <div
             key={index}
             className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-blue-400 rounded-full animate-pulse"
             style={{
               left: `${20 + (index * 10)}%`,
               top: `${30 + (index * 8)}%`,
               animationDelay: `${index * 0.5}s`,
               animationDuration: '3s',
               filter: 'blur(1px)',
               opacity: 0.6
             }}
           />
         ))}
       </div>

      {/* Animated Background Pattern */}
      <div className="fixed inset-0 z-1 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-blue-400/20 to-green-400/20 animate-pulse"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)`,
          backgroundSize: '400px 400px',
          animation: 'float 20s ease-in-out infinite'
        }}></div>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen">
        <Header />
        
        {/* Hero Section with Enhanced Animation */}
        <div className="bg-gradient-to-b from-black/90 via-black/70 to-transparent pt-8 pb-16 relative overflow-hidden">
          {/* Animated Header Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-blue-400/5 to-green-400/5 animate-pulse"></div>
          
          <div className="max-w-6xl mx-auto px-6 relative">
            <div className="text-center">
              {/* Glowing Title Effect */}
              <div className="relative">
                <h1 className="text-5xl md:text-7xl font-bold text-yellow-400 mb-6 relative z-10 animate-fade-in-up">
                  Your ChainCred Profile
                </h1>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 blur-3xl animate-pulse"></div>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
                Manage your blockchain-verified credentials and showcase your achievements 
                with tamper-proof certificates on the opBNB network.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-16">
          {/* Enhanced User Info Card with 3D Effects */}
          {user ? (
            <div className="bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-800/95 backdrop-blur-xl rounded-3xl border border-yellow-400/30 p-8 shadow-2xl hover:shadow-yellow-400/20 transition-all duration-500 transform hover:scale-[1.02] mb-12 relative overflow-hidden">
              {/* Card Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-blue-400/5 opacity-50"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-8 mb-8">
                  {/* Enhanced Avatar with Glow Effect */}
                  <div className={`relative w-24 h-24 bg-gradient-to-br ${getRoleGradient(user.role)} rounded-full flex items-center justify-center text-4xl shadow-2xl shadow-yellow-400/30 animate-pulse`}>
                    {getRoleIcon(user.role)}
                    <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl animate-pulse"></div>
                  </div>
                  
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-3 animate-fade-in-up">Welcome back!</h2>
                    <div className={`text-xl font-semibold ${getRoleColor(user.role)} mb-2 flex items-center gap-2 animate-fade-in-up animation-delay-200`}>
                      {getRoleIcon(user.role)} {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                    <div className="text-gray-400 font-mono text-sm break-all bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 animate-fade-in-up animation-delay-400">
                      {user.wallet}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Quick Stats with Animations */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-yellow-400/15 to-yellow-600/15 rounded-2xl p-6 border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105 group">
                    <div className="text-3xl font-bold text-yellow-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stats.total}
                    </div>
                    <div className="text-gray-300">Total Credentials</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-400/15 to-blue-600/15 rounded-2xl p-6 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105 group">
                    <div className="text-3xl font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stats.verified}
                    </div>
                    <div className="text-gray-300">Verified</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-400/15 to-green-600/15 rounded-2xl p-6 border border-green-400/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105 group">
                    <div className="text-3xl font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                      {user.role === 'institute' ? 'Issuer' : 'Student'}
                    </div>
                    <div className="text-gray-300">Account Type</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-400/15 to-purple-600/15 rounded-2xl p-6 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105 group">
                    <div className="text-3xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%
                    </div>
                    <div className="text-gray-300">Verification Rate</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-red-400/15 to-red-600/15 backdrop-blur-xl rounded-3xl border border-red-400/30 p-8 shadow-2xl mb-12 text-center">
              <div className="text-6xl mb-6 animate-bounce">🔒</div>
              <h2 className="text-3xl font-bold text-red-400 mb-3">Not Logged In</h2>
              <p className="text-gray-300">Please connect your wallet to view your profile</p>
            </div>
          )}

          {/* Enhanced Certificates Section */}
          <div className="bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-800/95 backdrop-blur-xl rounded-3xl border border-yellow-400/30 p-8 shadow-2xl hover:shadow-yellow-400/20 transition-all duration-500 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-blue-400/5 opacity-50"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-4xl font-bold text-yellow-400 flex items-center gap-4">
                  <span className="text-5xl animate-pulse">
                    {user?.role === 'institute' ? '🏫' : '🏆'}
                  </span> 
                  {user?.role === 'institute' ? 'Issued Certificates' : 'My Certificates'}
                </h3>
                <div className="text-gray-400 text-lg">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                      Loading...
                    </div>
                  ) : (
                    `${items.length} credential${items.length !== 1 ? 's' : ''}`
                  )}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400"></div>
                  <p className="mt-6 text-gray-400 text-lg">Loading your credentials...</p>
                </div>
              ) : items?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map((it, idx)=> (
                    <div 
                      key={idx} 
                      className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 hover:border-yellow-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-400/20 transform hover:scale-[1.02] relative overflow-hidden group"
                      
                    >
                      {/* Card Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="font-mono text-yellow-400 font-bold text-lg group-hover:text-yellow-300 transition-colors duration-300">
                            {it?.metadata?.certificateID || it?.certificateID}
                          </div>
                          <div className="text-green-400 text-sm font-semibold bg-green-400/20 px-3 py-1 rounded-full border border-green-400/30 group-hover:bg-green-400/30 transition-all duration-300">
                            ✓ Verified
                          </div>
                        </div>
                        
                        <div className="space-y-3 text-sm text-gray-300">
                          <div className="flex items-center gap-2 group-hover:text-blue-200 transition-colors duration-300">
                            <span className="text-blue-400 text-lg">👤</span>
                            <span>Student: {it?.metadata?.studentWallet?.slice(0, 8)}...{it?.metadata?.studentWallet?.slice(-6)}</span>
                          </div>
                          <div className="flex items-center gap-2 group-hover:text-green-200 transition-colors duration-300">
                            <span className="text-green-400 text-lg">🏫</span>
                            <span>Issuer: {it?.metadata?.issuerWallet?.slice(0, 8)}...{it?.metadata?.issuerWallet?.slice(-6)}</span>
                          </div>
                          <div className="flex items-center gap-2 group-hover:text-yellow-200 transition-colors duration-300">
                            <span className="text-yellow-400 text-lg">📅</span>
                            <span>Date: {it?.metadata?.issuedDateISO}</span>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex gap-3 text-sm">
                          {it?.metadata?.fileUrl && (
                            <a 
                              className="bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-lg border border-yellow-400/30 hover:bg-yellow-400/30 transition-all duration-300 flex items-center gap-2 group-hover:scale-105 transform" 
                              href={it.metadata.fileUrl} 
                              target="_blank" 
                              rel="noreferrer"
                            >
                              📄 PDF
                            </a>
                          )}
                          {it?.metadata && (
                            <a 
                              className="bg-blue-400/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-400/30 hover:bg-blue-400/30 transition-all duration-300 flex items-center gap-2 group-hover:scale-105 transform" 
                              href={`data:application/json,${encodeURIComponent(JSON.stringify(it.metadata))}`} 
                              target="_blank" 
                              rel="noreferrer"
                            >
                              🔍 Metadata
                            </a>
                          )}
                          {it?.metadata?.txHash && (
                            <a 
                              className="bg-green-400/20 text-green-400 px-4 py-2 rounded-lg border border-green-400/30 hover:bg-green-400/30 transition-all duration-300 flex items-center gap-2 group-hover:scale-105 transform" 
                              href={`https://explorer.testnet.opbnb.io/tx/${it.metadata.txHash}`} 
                              target="_blank" 
                              rel="noreferrer"
                            >
                              ⛓️ Transaction
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-8xl mb-8 animate-bounce">📜</div>
                  <h4 className="text-3xl font-bold text-gray-300 mb-4">
                    {user?.role === 'institute' ? 'No Certificates Issued Yet' : 'No Certificates Yet'}
                  </h4>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg">
                    {user?.role === 'institute' 
                      ? 'Start issuing blockchain-verified certificates to students and build your reputation on ChainCred.'
                      : 'Upload your certificates and achievements to build your professional blockchain-verified resume.'
                    }
                  </p>
                  <div className="flex gap-6 justify-center">
                    {user?.role === 'student' && (
                      <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/30">
                        🚀 Build Resume
                      </button>
                    )}
                    {user?.role === 'institute' && (
                      <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/30">
                        🎓 Issue Certificate
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Blockchain Info Section */}
          <div className="mt-12 bg-gradient-to-br from-blue-400/15 to-blue-600/15 backdrop-blur-xl rounded-3xl border border-blue-400/30 p-8 shadow-2xl hover:shadow-blue-400/20 transition-all duration-500 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-purple-400/5 opacity-50"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-blue-400 mb-8 flex items-center gap-4">
                <span className="text-4xl animate-pulse">⛓️</span> Blockchain Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {[
                    { label: 'Network: opBNB Testnet', color: 'green', icon: '🌐' },
                    { label: 'Storage: Greenfield', color: 'blue', icon: '💾' },
                    { label: 'Token Type: Soulbound NFT', color: 'yellow', icon: '🔒' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className={`w-4 h-4 bg-${item.color}-400 rounded-full animate-pulse`}></div>
                      <span className="text-gray-300 text-lg">{item.icon} {item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Verification: Instant', color: 'purple', icon: '⚡' },
                    { label: 'Transferable: No', color: 'red', icon: '🚫' },
                    { label: 'Immutable: Yes', color: 'indigo', icon: '🔐' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${(index + 3) * 100}ms` }}>
                      <div className={`w-4 h-4 bg-${item.color}-400 rounded-full animate-pulse`}></div>
                      <span className="text-gray-300 text-lg">{item.icon} {item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* New: Achievement Badges Section */}
          <div className="mt-12 bg-gradient-to-br from-purple-400/15 to-purple-600/15 backdrop-blur-xl rounded-3xl border border-purple-400/30 p-8 shadow-2xl hover:shadow-purple-400/20 transition-all duration-500">
            <h3 className="text-3xl font-bold text-purple-400 mb-8 text-center flex items-center justify-center gap-4">
              <span className="text-4xl animate-bounce">🏅</span> Achievement Badges
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: '🎓', label: 'First Certificate', earned: true, color: 'yellow' },
                { icon: '🏆', label: 'Top Performer', earned: stats.total >= 5, color: 'blue' },
                { icon: '🔐', label: 'Security Expert', earned: stats.verified >= 3, color: 'green' },
                { icon: '⭐', label: 'Early Adopter', earned: true, color: 'purple' }
              ].map((badge, index) => (
                <div key={index} className={`text-center p-4 rounded-2xl transition-all duration-500 transform hover:scale-110 ${
                  badge.earned 
                    ? 'bg-gradient-to-br from-purple-400/20 to-purple-600/20 border border-purple-400/40' 
                    : 'bg-gray-800/30 border border-gray-700/50 opacity-50'
                }`}>
                  <div className={`text-4xl mb-2 ${badge.earned ? 'animate-pulse' : 'grayscale'}`}>
                    {badge.icon}
                  </div>
                  <div className={`text-sm font-semibold ${badge.earned ? 'text-purple-400' : 'text-gray-500'}`}>
                    {badge.label}
                  </div>
                  <div className={`text-xs mt-1 ${badge.earned ? 'text-green-400' : 'text-gray-600'}`}>
                    {badge.earned ? 'Earned' : 'Locked'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  )
}
