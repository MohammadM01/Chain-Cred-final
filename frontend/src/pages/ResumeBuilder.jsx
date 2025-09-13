import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import ProfileForm from '../components/ProfileForm';
import UploadCertificate from '../components/UploadCertificate';
import ResumePreview from '../components/ResumePreview';
import Spline from '@splinetool/react-spline';
import scene from '/assets/scene.splinecode';
import Header from '../components/Header';

const ResumeBuilder = () => {
  const { user, showToast } = useUser();
  const [profileSaved, setProfileSaved] = useState(false);
  const [showSpline, setShowSpline] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [particles, setParticles] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
      const newParticles = Array.from({ length: 20 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        color: ['#fbbf24', '#3b82f6', '#10b981', '#8b5cf6'][Math.floor(Math.random() * 4)]
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 10000);

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

    const interval = setInterval(animateParticles, 50);
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

  if (!user?.wallet) {
    showToast('error', 'Please log in with wallet.');
    return <p className="text-white">Please log in.</p>;
  }
  if (user.role !== 'student') {
    showToast('error', 'This feature is only for students.');
    return <p className="text-white">Access denied: Students only.</p>;
  }

  const steps = [
    { number: 1, title: 'Profile Setup', description: 'Fill in your personal and professional details', icon: '👤' },
    { number: 2, title: 'Upload Certificates', description: 'Add your achievements and credentials', icon: '🏆' },
    { number: 3, title: 'Preview & Generate', description: 'Review and create your professional resume', icon: '📄' }
  ];

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
         {/* Header Section with Enhanced Animation */}
        <div className="bg-gradient-to-b from-black/90 via-black/70 to-transparent pt-8 pb-16 relative overflow-hidden">
          {/* Animated Header Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-blue-400/5 to-green-400/5 animate-pulse"></div>
          
          <div className="max-w-6xl mx-auto px-6 relative">
            {/* Glowing Title Effect */}
            <div className="relative">
              <h1 className="text-5xl md:text-7xl font-bold text-yellow-400 mb-4 relative z-10 animate-fade-in-up">
                Build Your ChainCred Resume
              </h1>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 blur-3xl animate-pulse"></div>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl animate-fade-in-up animation-delay-200">
              Create a professional, blockchain-verified resume that showcases your achievements 
              with tamper-proof credentials on the opBNB network.
            </p>
            
            {/* Animated Stats */}
            <div className="flex gap-8 mt-8 animate-fade-in-up animation-delay-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 animate-count-up" data-target="100">0</div>
                <div className="text-gray-400">% Tamper-Proof</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 animate-count-up" data-target="1000">0</div>
                <div className="text-gray-400">+ Credentials</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 animate-count-up" data-target="50">0</div>
                <div className="text-gray-400">+ Universities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Steps with 3D Effect */}
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <div className="flex justify-center mb-12">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center group">
                <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'mr-20' : ''}`}>
                  {/* 3D Step Circle */}
                  <div 
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-500 transform hover:scale-110 hover:rotate-3 ${
                      currentStep >= step.number 
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-2xl shadow-yellow-400/50 animate-bounce' 
                        : 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-400 shadow-lg'
                    }`}
                    onMouseEnter={() => setIsHovering(step.number)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    {step.icon}
                    {/* Glow Effect */}
                    {currentStep >= step.number && (
                      <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-xl animate-pulse"></div>
                    )}
                  </div>
                  
                  <h3 className={`mt-4 font-bold text-center max-w-36 transition-all duration-300 ${
                    currentStep >= step.number ? 'text-yellow-400 scale-110' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm text-center mt-2 max-w-36 transition-all duration-300 ${
                    currentStep >= step.number ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                  
                  {/* Floating Elements */}
                  {isHovering === step.number && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                      Step {step.number}
                    </div>
                  )}
                </div>
                
                {/* Animated Connection Line */}
                {index < steps.length - 1 && (
                  <div className="relative">
                    <div className={`w-20 h-1 transition-all duration-1000 ${
                      currentStep > step.number ? 'bg-gradient-to-r from-yellow-400 to-blue-400' : 'bg-gray-700'
                    }`} />
                    {/* Animated Dots */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                        currentStep > step.number ? 'bg-yellow-400 animate-ping' : 'bg-gray-600'
                      }`}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content with Enhanced Cards */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Form with Enhanced Styling */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-800/95 backdrop-blur-xl rounded-3xl border border-yellow-400/30 p-8 shadow-2xl hover:shadow-yellow-400/20 transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden">
                {/* Card Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-blue-400/5 opacity-50"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <ProfileForm 
                    wallet={user.wallet} 
                    onSave={() => {
                      setProfileSaved(true);
                      setCurrentStep(2);
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Enhanced Info Panels */}
            <div className="space-y-6">
              {/* Resume Tips with Enhanced Animation */}
              <div className="bg-gradient-to-br from-yellow-400/15 to-yellow-600/15 backdrop-blur-xl rounded-3xl border border-yellow-400/40 p-6 shadow-2xl hover:shadow-yellow-400/30 transition-all duration-500 transform hover:scale-105 relative overflow-hidden group">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2 relative z-10">
                  <span className="text-2xl animate-bounce">💡</span> Resume Tips
                </h3>
                <ul className="space-y-3 text-gray-300 relative z-10">
                  {[
                    'Keep descriptions concise and achievement-focused',
                    'Use action verbs to start bullet points',
                    'Quantify achievements with numbers when possible',
                    'Include relevant keywords for ATS systems'
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <span className="text-yellow-400 text-lg">•</span>
                      <span className="group-hover:text-yellow-200 transition-colors duration-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Blockchain Benefits with Enhanced Styling */}
              <div className="bg-gradient-to-br from-blue-400/15 to-blue-600/15 backdrop-blur-xl rounded-3xl border border-blue-400/40 p-6 shadow-2xl hover:shadow-blue-400/30 transition-all duration-500 transform hover:scale-105 relative overflow-hidden group">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2 relative z-10">
                  <span className="text-2xl animate-pulse">⛓️</span> Blockchain Benefits
                </h3>
                <ul className="space-y-3 text-gray-300 relative z-10">
                  {[
                    'Tamper-proof credentials',
                    'Instant verification',
                    'Decentralized storage',
                    'Professional credibility'
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <span className="text-blue-400 text-lg">•</span>
                      <span className="group-hover:text-blue-200 transition-colors duration-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* New: AI-Powered Features Panel */}
              <div className="bg-gradient-to-br from-purple-400/15 to-purple-600/15 backdrop-blur-xl rounded-3xl border border-purple-400/40 p-6 shadow-2xl hover:shadow-purple-400/30 transition-all duration-500 transform hover:scale-105 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2 relative z-10">
                  <span className="text-2xl animate-spin">🤖</span> AI-Powered Features
                </h3>
                <ul className="space-y-3 text-gray-300 relative z-10">
                  {[
                    'Smart content suggestions',
                    'ATS optimization',
                    'Skill gap analysis',
                    'Industry templates'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <span className="text-purple-400 text-lg">•</span>
                      <span className="group-hover:text-purple-200 transition-colors duration-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Enhanced Certificate Upload Section */}
          {profileSaved && (
            <div className="mt-16">
              <div className="bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-800/95 backdrop-blur-xl rounded-3xl border border-yellow-400/30 p-8 shadow-2xl hover:shadow-yellow-400/20 transition-all duration-500 transform hover:scale-[1.01] relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-blue-400/5 opacity-50"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
                
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold text-yellow-400 mb-8 flex items-center gap-4">
                    <span className="text-5xl animate-bounce">🏆</span> Upload Your Certificates
                  </h2>
                  <UploadCertificate wallet={user.wallet} />
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Resume Preview Section */}
          {profileSaved && (
            <div className="mt-16">
              <div className="bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-800/95 backdrop-blur-xl rounded-3xl border border-yellow-400/30 p-8 shadow-2xl hover:shadow-yellow-400/20 transition-all duration-500 transform hover:scale-[1.01] relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-transparent to-yellow-400/5 opacity-50"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
                
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold text-yellow-400 mb-8 flex items-center gap-4">
                    <span className="text-5xl animate-pulse">📄</span> Resume Preview
                  </h2>
                  <ResumePreview wallet={user.wallet} />
                </div>
              </div>
            </div>
          )}

                     {/* New: Success Metrics Section */}
           <div className="mt-16 bg-gradient-to-br from-green-400/10 to-green-600/10 backdrop-blur-xl rounded-3xl border border-green-400/30 p-8 shadow-2xl">
             <h2 className="text-3xl font-bold text-green-400 mb-8 text-center flex items-center justify-center gap-3">
               <span className="text-4xl animate-pulse">📊</span> Success Metrics
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                 { label: 'Resumes Built', value: '1,247', color: 'yellow' },
                 { label: 'Certificates Verified', value: '5,892', color: 'blue' },
                 { label: 'Success Rate', value: '98.7%', color: 'green' },
                 { label: 'Time Saved', value: '2.5hrs', color: 'purple' }
               ].map((metric, index) => (
                 <div key={index} className="text-center group">
                   <div className={`text-4xl font-bold text-${metric.color}-400 mb-2 animate-count-up`} data-target={metric.value.replace(/[^\d]/g, '')}>
                     {metric.value}
                   </div>
                   <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                     {metric.label}
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {/* New: How It Works Section */}
           <div className="mt-16 bg-gradient-to-br from-blue-400/10 to-blue-600/10 backdrop-blur-xl rounded-3xl border border-blue-400/30 p-8 shadow-2xl">
             <h2 className="text-3xl font-bold text-blue-400 mb-8 text-center flex items-center justify-center gap-3">
               <span className="text-4xl animate-bounce">⚡</span> How It Works
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { icon: '🔐', title: 'Secure Upload', description: 'Upload your certificates securely to Greenfield storage' },
                 { icon: '⛓️', title: 'Blockchain Mint', description: 'Mint as Soulbound NFTs on opBNB network' },
                 { icon: '✅', title: 'Instant Verify', description: 'Anyone can verify your credentials instantly' }
               ].map((step, index) => (
                 <div key={index} className="text-center group">
                   <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                     {step.icon}
                   </div>
                   <h3 className="text-xl font-bold text-blue-400 mb-3">{step.title}</h3>
                   <p className="text-gray-300">{step.description}</p>
                 </div>
               ))}
             </div>
           </div>

           {/* New: Testimonials Section */}
           <div className="mt-16 bg-gradient-to-br from-purple-400/10 to-purple-600/10 backdrop-blur-xl rounded-3xl border border-purple-400/30 p-8 shadow-2xl">
             <h2 className="text-3xl font-bold text-purple-400 mb-8 text-center flex items-center justify-center gap-3">
               <span className="text-4xl animate-pulse">💬</span> What Users Say
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { 
                   name: 'Sarah Chen', 
                   role: 'Software Engineer', 
                   company: 'TechCorp',
                   avatar: '👩‍💻',
                   quote: 'ChainCred helped me land my dream job! The blockchain verification gave me instant credibility.',
                   rating: 5
                 },
                 { 
                   name: 'Dr. Michael Rodriguez', 
                   role: 'Professor', 
                   company: 'Stanford University',
                   avatar: '👨‍🏫',
                   quote: 'As an institution, we love how easy it is to issue tamper-proof certificates to our students.',
                   rating: 5
                 }
               ].map((testimonial, index) => (
                 <div key={index} className="bg-gradient-to-br from-purple-400/5 to-purple-600/5 rounded-2xl p-6 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
                   <div className="flex items-center gap-4 mb-4">
                     <div className="text-4xl">{testimonial.avatar}</div>
                     <div>
                       <div className="font-bold text-white">{testimonial.name}</div>
                       <div className="text-purple-400">{testimonial.role}</div>
                       <div className="text-gray-400 text-sm">{testimonial.company}</div>
                     </div>
                   </div>
                   <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                   <div className="flex gap-1">
                     {[...Array(testimonial.rating)].map((_, i) => (
                       <span key={i} className="text-yellow-400 text-lg">⭐</span>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {/* New: Features Comparison Section */}
           <div className="mt-16 bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 backdrop-blur-xl rounded-3xl border border-yellow-400/30 p-8 shadow-2xl">
             <h2 className="text-3xl font-bold text-yellow-400 mb-8 text-center flex items-center justify-center gap-3">
               <span className="text-4xl animate-pulse">🚀</span> Why Choose ChainCred?
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                 <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                   <span className="text-2xl">✅</span> ChainCred Advantages
                 </h3>
                 <ul className="space-y-3 text-gray-300">
                   <li className="flex items-start gap-2">
                     <span className="text-green-400 text-lg">•</span>
                     <span>Blockchain-verified credentials</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <span className="text-green-400 text-lg">•</span>
                     <span>Instant verification worldwide</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <span className="text-green-400 text-lg">•</span>
                     <span>Decentralized storage</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <span className="text-green-400 text-lg">•</span>
                     <span>Zero maintenance fees</span>
                   </li>
                 </ul>
               </div>
               <div>
                 <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                   <span className="text-2xl">❌</span> Traditional Problems
                 </h3>
                 <ul className="space-y-3 text-gray-300">
                   <li className="flex items-start gap-2">
                     <span className="text-red-400 text-lg">•</span>
                     <span>Paper certificates can be forged</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <span className="text-red-400 text-lg">•</span>
                     <span>Slow verification process</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <span className="text-red-400 text-lg">•</span>
                     <span>Centralized storage risks</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <span className="text-red-400 text-lg">•</span>
                     <span>High administrative costs</span>
                   </li>
                 </ul>
               </div>
             </div>
           </div>

           {/* New: Call to Action Section */}
           <div className="mt-16 bg-gradient-to-br from-gradient-to-r from-yellow-400/20 to-blue-400/20 backdrop-blur-xl rounded-3xl border border-yellow-400/40 p-12 shadow-2xl text-center">
             <h2 className="text-4xl font-bold text-yellow-400 mb-6">
               Ready to Build Your Future?
             </h2>
             <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
               Join thousands of professionals who trust ChainCred for their credential verification. 
               Start building your blockchain-verified resume today!
             </p>
             <div className="flex gap-6 justify-center flex-wrap">
               <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/30">
                 🚀 Get Started Now
               </button>
               <button className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-300 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-400/30">
                 📚 Learn More
               </button>
             </div>
           </div>

           {/* New: Footer Section */}
           <div className="mt-16 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-3xl border border-gray-700/30 p-8 text-center">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
               <div>
                 <h4 className="text-yellow-400 font-bold mb-4">Product</h4>
                 <ul className="space-y-2 text-gray-400">
                   <li>Resume Builder</li>
                   <li>Certificate Upload</li>
                   <li>Verification</li>
                   <li>API Access</li>
                 </ul>
               </div>
               <div>
                 <h4 className="text-blue-400 font-bold mb-4">Company</h4>
                 <ul className="space-y-2 text-gray-400">
                   <li>About Us</li>
                   <li>Careers</li>
                   <li>Press</li>
                   <li>Contact</li>
                 </ul>
               </div>
               <div>
                 <h4 className="text-green-400 font-bold mb-4">Resources</h4>
                 <ul className="space-y-2 text-gray-400">
                   <li>Documentation</li>
                   <li>Blog</li>
                   <li>Support</li>
                   <li>Community</li>
                 </ul>
               </div>
               <div>
                 <h4 className="text-purple-400 font-bold mb-4">Legal</h4>
                 <ul className="space-y-2 text-gray-400">
                   <li>Privacy Policy</li>
                   <li>Terms of Service</li>
                   <li>Cookie Policy</li>
                   <li>GDPR</li>
                 </ul>
               </div>
             </div>
             <div className="border-t border-gray-700/50 pt-8">
               <p className="text-gray-400">
                 © 2024 ChainCred. Built with ❤️ for the BNB ecosystem. 
                 Powered by opBNB and Greenfield.
               </p>
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
        
        @keyframes count-up {
          from { content: "0"; }
          to { content: attr(data-target); }
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
        
        .animate-count-up {
          animation: count-up 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;
