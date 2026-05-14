// components/UduuaHero.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaRocket, 
  FaShoppingBag, 
  FaArrowRight,
  FaStar,
  FaGem,
  FaChevronLeft,
  FaChevronRight,
  FaBullhorn,
  FaWhatsapp,
  FaPlay,
  FaPause,
  FaExternalLinkAlt,
  FaDownload
} from 'react-icons/fa';
import { useGetAdsQuery, useTrackAdClickMutation, useTrackAdViewMutation } from '../slices/adsApiSlice';

const UduuaHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState({});
  const [viewedAds, setViewedAds] = useState(() => {
    const saved = sessionStorage.getItem('uduua_hero_viewed_ads');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  
  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);
  const videoRefs = useRef({});
  const viewTimerRef = useRef(null);

  const { data: adsData, isLoading } = useGetAdsQuery({
    page: 'uduua',
    placement: 'hero',
    supportsImage: true,
    supportsVideo: true,
    limit: 10,
  });

  const [trackClick] = useTrackAdClickMutation();
  const [trackView] = useTrackAdViewMutation();

  const fetchedAds = adsData?.ads || [];

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
    
    if (isStandalone) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Uduua PWA installed');
      setShowInstallButton(false);
    }
    
    setDeferredPrompt(null);
  };

  useEffect(() => {
    sessionStorage.setItem('uduua_hero_viewed_ads', JSON.stringify([...viewedAds]));
  }, [viewedAds]);

  const isExternalUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//') ||
           /\.(com|ng|org|net|io|co|uk|app|dev)/.test(url);
  };

  const formatExternalUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.includes('.') && !url.includes('/') && !url.includes(' ')) return `https://${url}`;
    return url;
  };

  const advertiseSlide = {
    _id: 'advertise-slide',
    title: 'Advertise With Us',
    subtitle: 'Grow your brand on Úduua',
    description: 'Reach thousands of active shoppers and grow your business with our premium ad placements.',
    ctaText: 'Message on WhatsApp',
    ctaLink: 'https://wa.me/2348055766461?text=Hello%2C%20I%27m%20interested%20in%20advertising%20on%20%C3%9Aduua',
    mediaType: 'image',
    image: '/campus1.jpg',
    isAdvertiseSlide: true,
  };

  const ads = React.useMemo(() => {
    if (fetchedAds.length === 0) return [advertiseSlide];
    if (fetchedAds.length < 10) return [...fetchedAds, advertiseSlide];
    return fetchedAds.slice(0, 10);
  }, [fetchedAds]);

  useEffect(() => {
    if (viewTimerRef.current) {
      clearTimeout(viewTimerRef.current);
      viewTimerRef.current = null;
    }
    const currentAd = ads[currentSlide];
    if (currentAd && !currentAd.isAdvertiseSlide && currentAd._id && !viewedAds.has(currentAd._id)) {
      viewTimerRef.current = setTimeout(() => {
        trackView(currentAd._id);
        setViewedAds(prev => new Set([...prev, currentAd._id]));
        viewTimerRef.current = null;
      }, 2000);
    }
    return () => {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
        viewTimerRef.current = null;
      }
    };
  }, [currentSlide, ads, trackView, viewedAds]);

  useEffect(() => {
    if (ads.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % ads.length);
      }, 5000);
    }
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [ads.length]);

  useEffect(() => {
    Object.values(videoRefs.current).forEach(video => {
      if (video) { video.pause(); video.currentTime = 0; }
    });
    setIsVideoPlaying({});
  }, [currentSlide]);

  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => setCurrentSlide((prev) => (prev + 1) % ads.length), 5000);
    }
  };

  const nextSlide = () => { setCurrentSlide((prev) => (prev + 1) % ads.length); resetAutoPlay(); };
  const prevSlide = () => { setCurrentSlide((prev) => (prev - 1 + ads.length) % ads.length); resetAutoPlay(); };

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    setTouchStart(null); setTouchEnd(null);
  };

  const handleAdClick = (ad) => { if (!ad.isAdvertiseSlide) trackClick(ad._id); };

  const handleVideoToggle = (adId, videoElement) => {
    if (videoElement.paused) {
      videoElement.play();
      setIsVideoPlaying(prev => ({ ...prev, [adId]: true }));
      resetAutoPlay();
    } else {
      videoElement.pause();
      setIsVideoPlaying(prev => ({ ...prev, [adId]: false }));
    }
  };

  const renderAdLink = (ad, isAdvertiseSlide) => {
    const external = isExternalUrl(ad.ctaLink);
    const formattedUrl = external ? formatExternalUrl(ad.ctaLink) : ad.ctaLink;
    const linkClassName = isAdvertiseSlide
      ? "inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
      : "inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all duration-300";
    const content = (
      <>
        {isAdvertiseSlide && <FaWhatsapp className="text-sm" />}
        {ad.ctaText || 'Learn More'}
        {!isAdvertiseSlide && (external ? <FaExternalLinkAlt className="text-xs" /> : <FaArrowRight className="text-xs" />)}
      </>
    );
    if (external || isAdvertiseSlide) {
      return <a href={formattedUrl} target="_blank" rel="noopener noreferrer" className={linkClassName} onClick={() => handleAdClick(ad)}>{content}</a>;
    }
    return <Link to={formattedUrl || '#'} onClick={() => handleAdClick(ad)} className={linkClassName}>{content}</Link>;
  };

  if (isLoading) {
    return (
      <section className="relative min-h-screen bg-white overflow-hidden mt-10">
        <div className="flex justify-center items-center h-96">
          <div className="w-12 h-12 border-4 border-[#0043FC] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen bg-white overflow-hidden mt-10">
      <div className="absolute inset-0">
        <div className="absolute top-10 -left-20 w-72 h-72 rounded-full bg-[#0043FC]/5 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-[#79FFFF]/10 blur-3xl"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(#0043FC 1px, transparent 1px), linear-gradient(90deg, #0043FC 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#0043FC]/10 border border-[#0043FC]/20 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-[#0043FC] rounded-full animate-pulse"></span>
              <span className="text-xs sm:text-sm font-semibold text-[#0043FC]">Where Products Meet the Market</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Marketplace for <span className="block text-[#0043FC]">Fast-Growing Brands You'll Love</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-md leading-relaxed">
                Quality products. Better pricing. For everyday shoppers and bulk buyers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/uduua/shop" className="group inline-flex items-center justify-center gap-2 bg-[#0043FC] hover:bg-[#0038D4] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                <FaShoppingBag /> Shop Marketplace <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/uduua/services" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-[#0043FC] text-[#0043FC] hover:text-[#0043FC] px-6 py-3 rounded-xl font-semibold transition-all duration-300">
                <FaRocket /> Grow your Brand
              </Link>
              {/* Install App Button - Added Here */}
              {showInstallButton && (
                <button 
                  onClick={handleInstallClick}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0043FC] to-[#79FFFF] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg animate-pulse"
                >
                  <FaDownload className="text-sm" /> Install App
                </button>
              )}
            </div>
            <p className="text-base sm:text-lg text-gray-600 max-w-md leading-relaxed font-bold">Retail & Bulk Pricing Available</p>
          </div>

          {/* Right Content - Ads Slider */}
          <div className="relative">
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-full h-full bg-[#0043FC]/10 rounded-3xl transform rotate-3"></div>
              <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-[#79FFFF]/20 rounded-full blur-2xl"></div>
              
              <div ref={sliderRef} className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
                onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                  {ads.map((ad) => {
                    const isAdvertiseSlide = ad.isAdvertiseSlide;
                    const adId = ad._id;
                    return (
                      <div key={adId} className="w-full flex-shrink-0" data-ad-id={adId}>
                        <div className="aspect-[4/3] relative">
                          {ad.mediaType === 'video' && ad.video ? (
                            <video ref={el => videoRefs.current[adId] = el} src={ad.video} poster={ad.thumbnail || ad.image}
                              className="w-full h-full object-cover" muted loop playsInline />
                          ) : (
                            <img src={ad.image || '/campus1.jpg'} alt={ad.title} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0" style={{
                            background: isAdvertiseSlide ? 'linear-gradient(to bottom right, #0043FC, #0038D4)' : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)',
                            opacity: isAdvertiseSlide ? 0.85 : 1
                          }}></div>
                          <div className="absolute inset-0 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                {isAdvertiseSlide ? <FaBullhorn className="text-white text-xl" /> : ad.mediaType === 'video' ? (
                                  <button onClick={(e) => { e.stopPropagation(); handleVideoToggle(adId, videoRefs.current[adId]); }} className="w-full h-full flex items-center justify-center">
                                    {isVideoPlaying[adId] ? <FaPause className="text-white text-sm" /> : <FaPlay className="text-white text-sm" />}
                                  </button>
                                ) : <FaBullhorn className="text-white text-xl" />}
                              </div>
                              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                                {isAdvertiseSlide ? 'Advertise Here' : ad.ctaText?.includes('Shop') ? 'Limited Offer' : 'Sponsored'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white/90 mb-1 drop-shadow-lg">{ad.subtitle}</p>
                              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-lg">{ad.title}</h3>
                              <p className="text-white/90 text-sm mb-4 line-clamp-2 drop-shadow-md">{ad.description}</p>
                              {renderAdLink(ad, isAdvertiseSlide)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {ads.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {ads.map((_, idx) => (
                      <button key={idx} onClick={() => { setCurrentSlide(idx); resetAutoPlay(); }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-white' : 'bg-white/50 hover:bg-white/80'}`} />
                    ))}
                  </div>
                )}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/70 text-xs flex items-center gap-1 md:hidden">
                  <FaChevronLeft className="text-xs" /> Swipe to view more <FaChevronRight className="text-xs" />
                </div>
              </div>

              <div className="absolute -bottom-5 -right-5 bg-white rounded-xl shadow-lg p-3 border border-gray-100 hidden sm:flex items-center gap-3 z-20">
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400 text-sm" /><FaStar className="text-yellow-400 text-sm" /><FaStar className="text-yellow-400 text-sm" /><FaStar className="text-yellow-400 text-sm" /><FaStar className="text-yellow-400 text-sm" />
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div><p className="text-xs text-gray-500">Trusted by</p><p className="text-sm font-bold text-gray-900">Active Buyers</p></div>
              </div>
              <div className="absolute -top-4 -left-4 bg-[#0043FC] rounded-xl shadow-lg p-2 hidden sm:flex items-center gap-2 z-20">
                <FaGem className="text-white text-sm" /><span className="text-xs font-bold text-white">Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UduuaHero;