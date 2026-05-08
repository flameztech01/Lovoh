import React, { useRef, useEffect, useState } from 'react';

const Hero = () => {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      return window.innerWidth <= 768;
    };
    
    setIsMobile(checkMobile());
    
    const handleResize = () => {
      setIsMobile(checkMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    
    const handleLoadedData = () => {
      setIsLoading(false);
      setVideoReady(true);
      video.play().catch(error => {
        console.log('Autoplay failed:', error);
      });
    };

    const handleError = (e) => {
      console.log('Video error:', e);
      setIsLoading(false);
      setVideoError(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setVideoReady(true);
    };

    if (video) {
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
    }

    return () => {
      if (video) {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      }
    };
  }, []);

  // Determine which video source to use
  const videoSrc = isMobile 
    ? "/Lovoh Create Mobile Hero (2).mp4" 
    : "/vid-lg.mp4";

  if (videoError) {
    return (
      <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-blue-100 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 text-lg mb-4">Video unavailable</p>
          <p className="text-gray-600 text-sm">
            Check: {isMobile ? 'Mobile video' : 'Desktop video'} exists
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-blue-100 to-gray-100 flex items-center justify-center" style={{ height: '100vh' }}>
      {/* Video container - desktop has padding, mobile is full bleed */}
      <div className={`video-container ${!isMobile ? 'desktop-container' : 'mobile-container'}`}>
        {/* Animated loading skeleton - looks like part of the design */}
        {isLoading && (
          <div className="absolute inset-0 z-10 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-100 via-gray-100 to-blue-50">
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 transform -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
            {/* Subtle pulsing gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/30 via-transparent to-blue-300/20 animate-pulse" />
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="video-element"
          style={{ 
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            position: videoReady ? 'relative' : 'absolute',
            zIndex: videoReady ? 20 : 5
          }}
          key={videoSrc}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
      </div>
      
      {/* Add custom styles */}
      <style jsx>{`
        .video-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }
        
        /* Desktop: padded with rounded corners */
        .desktop-container {
          padding-left: 2rem;
          padding-right: 2rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        
        /* Mobile: full bleed, no padding, no rounded corners */
        .mobile-container {
          padding: 0;
          border-radius: 0;
        }
        
        .video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        /* Desktop: rounded corners and shadow */
        @media (min-width: 769px) {
          .video-element {
            border-radius: 30px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
        }
        
        /* Mobile: no border radius, fills entire screen */
        @media (max-width: 768px) {
          .video-element {
            border-radius: 0;
          }
        }
        
        /* Shimmer animation */
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;