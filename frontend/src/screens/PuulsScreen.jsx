// screens/PuulsScreen.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { 
  FaPalette, 
  FaVideo, 
  FaLaptopCode, 
  FaBullhorn,
  FaClipboardList,
  FaSearch,
  FaRocket,
  FaChartLine,
  FaChevronRight,
  FaArrowRight,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

const PuulsScreen = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const talentImages = ['/now1.jpg', '/now2.jpg', '/now3.jpg', '/now4.jpg'];
  
  // Modal states
  const [showStartProjectModal, setShowStartProjectModal] = useState(false);
  const [showJoinTalentModal, setShowJoinTalentModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Form loading states
  const [startProjectLoading, setStartProjectLoading] = useState(false);
  const [joinTalentLoading, setJoinTalentLoading] = useState(false);
  const [consultationLoading, setConsultationLoading] = useState(false);
  
  // Form data states
  const [startProjectData, setStartProjectData] = useState({ name: '', email: '', projectType: '', message: '' });
  const [joinTalentData, setJoinTalentData] = useState({ name: '', email: '', skill: '', experience: '', portfolio: '' });
  const [consultationData, setConsultationData] = useState({ name: '', email: '', company: '', message: '' });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % talentImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show toast notification (auto-hides after 2 seconds)
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 2000);
  };

  // Handle Start Project form submission
  const handleStartProjectSubmit = async (e) => {
    e.preventDefault();
    setStartProjectLoading(true);
    
    try {
      const response = await fetch('https://formspree.io/f/mojprrpw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(startProjectData)
      });
      
      if (response.ok) {
        showToast('✓ Project started successfully! We\'ll contact you soon.', 'success');
        setShowStartProjectModal(false);
        setStartProjectData({ name: '', email: '', projectType: '', message: '' });
      } else {
        showToast('✗ Failed to submit. Please try again.', 'error');
      }
    } catch (error) {
      showToast('✗ Network error. Please check your connection.', 'error');
    } finally {
      setStartProjectLoading(false);
    }
  };

  // Handle Join as Talent form submission
  const handleJoinTalentSubmit = async (e) => {
    e.preventDefault();
    setJoinTalentLoading(true);
    
    try {
      const response = await fetch('https://formspree.io/f/mojprrpw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...joinTalentData, formType: 'Join as Talent' })
      });
      
      if (response.ok) {
        showToast('✓ Application submitted! We\'ll review your profile.', 'success');
        setShowJoinTalentModal(false);
        setJoinTalentData({ name: '', email: '', skill: '', experience: '', portfolio: '' });
      } else {
        showToast('✗ Submission failed. Please try again.', 'error');
      }
    } catch (error) {
      showToast('✗ Network error. Please check your connection.', 'error');
    } finally {
      setJoinTalentLoading(false);
    }
  };

  // Handle Schedule Consultation form submission
  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    setConsultationLoading(true);
    
    try {
      const response = await fetch('https://formspree.io/f/xzdkooke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultationData)
      });
      
      if (response.ok) {
        showToast('✓ Consultation scheduled! We\'ll reach out shortly.', 'success');
        setShowConsultationModal(false);
        setConsultationData({ name: '', email: '', company: '', message: '' });
      } else {
        showToast('✗ Failed to schedule. Please try again.', 'error');
      }
    } catch (error) {
      showToast('✗ Network error. Please check your connection.', 'error');
    } finally {
      setConsultationLoading(false);
    }
  };

  const talentCategories = [
    {
      icon: <FaPalette className="text-xl" />,
      title: 'Design & Visuals',
      talents: ['UI/UX Designers', 'Graphic Designers', 'Motion Designers', 'Brand Identity Specialists'],
      image: '/now1.jpg'
    },
    {
      icon: <FaVideo className="text-xl" />,
      title: 'Video & Animation',
      talents: ['Video Editors', 'Animators', 'Content Creators', 'Post-Production Experts'],
      image: '/now2.jpg'
    },
    {
      icon: <FaLaptopCode className="text-xl" />,
      title: 'Web & App Development',
      talents: ['Frontend Developers', 'Backend Developers', 'Mobile App Developers', 'Full-Stack Engineers'],
      image: '/now3.jpg'
    },
    {
      icon: <FaBullhorn className="text-xl" />,
      title: 'Digital Solutions',
      talents: ['Digital Marketers', 'SEO Specialists', 'Social Media Managers', 'Growth Hackers'],
      image: '/now4.jpg'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Define Your Needs',
      description: 'Tell us exactly what skills and expertise you require',
      icon: <FaClipboardList className="text-lg" />
    },
    {
      step: '02',
      title: 'Get Matched',
      description: 'Connect with pre-vetted experts from our talent pool',
      icon: <FaSearch className="text-lg" />
    },
    {
      step: '03',
      title: 'Start Working',
      description: 'Begin your project with your dedicated talent team',
      icon: <FaRocket className="text-lg" />
    },
    {
      step: '04',
      title: 'Scale as Needed',
      description: 'Easily scale your team based on project requirements',
      icon: <FaChartLine className="text-lg" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50" style={{ animation: 'fadeSlideUp 0.3s ease forwards, fadeOut 0.4s ease 1.8s forwards' }}>
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
      
      {/* Compact Hero Section - One Screen Height */}
      <section className="h-screen relative flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          {talentImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={img}
                alt="Creative Talent"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#004aff]/90 via-[#0033CC]/80 to-[#002699]/70"></div>
        </div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Column - Text Content */}
            <div className="space-y-6">
                {/* Sub-brand Logo */}
              <div className="mb-2">
                <img 
                  src="/2copy1.png" 
                  alt="Puuls" 
                  className="h-16 w-auto"
                />
              </div>

              {/* Brand Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                <span className="text-white font-medium text-xs uppercase tracking-wider">
                  A Lovoh Create Brand
                </span>
              </div>
              
              {/* Sub-brand Logo
              <div className="mb-2">
                <img 
                  src="/2copy1.png" 
                  alt="Puuls" 
                  className="h-16 w-auto"
                />
              </div> */}

              {/* Tagline */}
              <div className="space-y-4">
                <h1 className="text-3xl lg:text-4xl text-white font-bold leading-tight">
                  What do you need help with today?
                </h1>
                <p className="text-lg text-gray-200 leading-relaxed">
                  We're a ready pool of top creative & tech associates for design, visuals, video, 
                  web/app, and digital solutions.
                </p>
              </div>

              {/* CTA Buttons - Compact */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  onClick={() => setShowStartProjectModal(true)}
                  className="bg-white hover:bg-gray-100 text-[#004BFF] px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <FaRocket className="text-sm" /> Start Project
                </button>
                <button 
                  onClick={() => setShowJoinTalentModal(true)}
                  className="border-2 border-white text-white hover:bg-white hover:text-[#004BFF] px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FaPalette className="text-sm" /> Join as Talent
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">500+</div>
                  <div className="text-gray-300 text-xs">Expert Associates</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">50+</div>
                  <div className="text-gray-300 text-xs">Skills Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">24h</div>
                  <div className="text-gray-300 text-xs">Average Match</div>
                </div>
              </div>
            </div>

            {/* Right Column - Image Carousel */}
            <div className="hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={talentImages[currentImage]}
                  alt="Our Talent in Action"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {talentImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImage 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Carousel Controls */}
                <button 
                  onClick={() => setCurrentImage((prev) => (prev - 1 + talentImages.length) % talentImages.length)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                >
                  <FaArrowRight className="rotate-180" />
                </button>
                <button 
                  onClick={() => setCurrentImage((prev) => (prev + 1) % talentImages.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                >
                  <FaArrowRight />
                </button>
              </div>

              {/* Image Categories Preview */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {talentCategories.slice(0, 2).map((category, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-xl">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#004BFF]/80 to-transparent flex items-end p-3">
                      <span className="text-white text-sm font-semibold">{category.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <span className="text-white text-sm mb-2">Explore More</span>
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-bounce"></div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Rest of the content follows the hero section */}
      {/* Talent Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#004BFF] to-[#0033CC]">
                Talent Match
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access our army of top-tier creative and tech professionals 
              ready to bring your projects to life.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {talentCategories.map((category, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  {/* Category Image */}
                  <div className="w-1/3">
                    <div className="relative h-40 rounded-xl overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#004BFF] shadow-md">
                        {category.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Content */}
                  <div className="w-2/3">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#004BFF] transition-colors">
                      {category.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      {category.talents.map((talent, talentIndex) => (
                        <div key={talentIndex} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#004BFF] rounded-full"></div>
                          <span className="text-gray-700 text-sm">{talent}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => {
                        setStartProjectData({ ...startProjectData, projectType: category.title });
                        setShowStartProjectModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#004BFF] to-[#0033CC] hover:from-[#0033CC] hover:to-[#002699] text-white rounded-lg font-medium text-sm transition-all flex items-center gap-1"
                    >
                      Start Project <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Showcase Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              See Our Talent
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#004BFF] to-[#0033CC]">
                In Action
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get inspired by the quality and diversity of work from our associates
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {talentImages.map((img, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={img}
                  alt={`Talent Work ${index + 1}`}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#004BFF]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-semibold text-sm">View Project</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How Ƥuuls
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#004BFF] to-[#0033CC]">
                Works
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, efficient, and designed to get you the right talent exactly when you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <div 
                key={index}
                className="group text-center relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-r from-[#004BFF] to-[#0033CC] rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                  {step.step}
                </div>

                <div className="w-14 h-14 bg-[#004BFF] rounded-xl flex items-center justify-center text-white mb-4 mx-auto group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#004BFF] transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-r from-[#004BFF] to-[#0033CC]">
        <div className="absolute inset-0 opacity-10">
          <img
            src="/now1.jpg"
            alt="CTA Background"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Build Your Dream Team?
          </h2>
          <p className="text-lg text-gray-200 mb-8">
            Access top talent on demand and scale your projects with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setShowStartProjectModal(true)}
              className="bg-white hover:bg-gray-100 text-[#004BFF] px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <FaRocket /> Get Started Now
            </button>
            <button 
              onClick={() => setShowConsultationModal(true)}
              className="border-2 border-white text-white hover:bg-white hover:text-[#004BFF] px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>

      {/* START PROJECT MODAL */}
      {showStartProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowStartProjectModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Start Your Project</h3>
              <button onClick={() => setShowStartProjectModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleStartProjectSubmit} className="p-6 space-y-4">
              <input type="text" placeholder="Full Name" value={startProjectData.name} onChange={(e) => setStartProjectData({...startProjectData, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004BFF]" required />
              <input type="email" placeholder="Email Address" value={startProjectData.email} onChange={(e) => setStartProjectData({...startProjectData, email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004BFF]" required />
              <input type="text" placeholder="Project Type" value={startProjectData.projectType} onChange={(e) => setStartProjectData({...startProjectData, projectType: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004BFF]" required />
              <textarea placeholder="Tell us about your project..." rows="3" value={startProjectData.message} onChange={(e) => setStartProjectData({...startProjectData, message: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004BFF]" required></textarea>
              <button type="submit" disabled={startProjectLoading} className="w-full bg-gradient-to-r from-[#004BFF] to-[#0033CC] hover:from-[#0033CC] hover:to-[#002699] text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
                {startProjectLoading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* JOIN AS TALENT MODAL */}
      {showJoinTalentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowJoinTalentModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Join as Talent</h3>
              <button onClick={() => setShowJoinTalentModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleJoinTalentSubmit} className="p-6 space-y-4">
              <input type="text" placeholder="Full Name" value={joinTalentData.name} onChange={(e) => setJoinTalentData({...joinTalentData, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004BFF]" required />
              <input type="email" placeholder="Email Address" value={joinTalentData.email} onChange={(e) => setJoinTalentData({...joinTalentData, email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004BFF]" required />
              <input type="text" placeholder="Primary Skill / Expertise" value={joinTalentData.skill} onChange={(e) => setJoinTalentData({...joinTalentData, skill: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004BFF]" required />
              <input type="text" placeholder="Years of Experience" value={joinTalentData.experience} onChange={(e) => setJoinTalentData({...joinTalentData, experience: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004BFF]" required />
              <input type="url" placeholder="Portfolio / LinkedIn URL" value={joinTalentData.portfolio} onChange={(e) => setJoinTalentData({...joinTalentData, portfolio: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004BFF]" />
              <button type="submit" disabled={joinTalentLoading} className="w-full bg-gradient-to-r from-[#004BFF] to-[#0033CC] hover:from-[#0033CC] hover:to-[#002699] text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
                {joinTalentLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE CONSULTATION MODAL */}
      {showConsultationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowConsultationModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Schedule a Consultation</h3>
              <button onClick={() => setShowConsultationModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleConsultationSubmit} className="p-6 space-y-4">
              <input type="text" placeholder="Full Name" value={consultationData.name} onChange={(e) => setConsultationData({...consultationData, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004BFF]" required />
              <input type="email" placeholder="Email Address" value={consultationData.email} onChange={(e) => setConsultationData({...consultationData, email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004BFF]" required />
              <input type="text" placeholder="Company Name (Optional)" value={consultationData.company} onChange={(e) => setConsultationData({...consultationData, company: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004BFF]" />
              <textarea placeholder="What would you like to discuss?" rows="3" value={consultationData.message} onChange={(e) => setConsultationData({...consultationData, message: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004BFF]" required></textarea>
              <button type="submit" disabled={consultationLoading} className="w-full bg-gradient-to-r from-[#004BFF] to-[#0033CC] hover:from-[#0033CC] hover:to-[#002699] text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
                {consultationLoading ? 'Submitting...' : 'Schedule'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); visibility: hidden; }
        }
      `}</style>
    </div>
  );
};

export default PuulsScreen;