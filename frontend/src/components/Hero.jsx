import React, { useRef, useEffect, useState } from 'react';

const Hero = () => {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
    ? "/Lovoh Create Mobile Hero Story (x).mp4" 
    : "/vid-lg.mp4";

  if (videoError) {
    return (
      <section className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Video unavailable</p>
          <p className="text-gray-400 text-sm">
            Check: {isMobile ? 'Mobile video' : 'Desktop video'} exists
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ height: '100vh' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
          <p className="text-white">Loading video...</p>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        key={videoSrc} // Force re-render when source changes
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
    </section>
  );
};

export default Hero;