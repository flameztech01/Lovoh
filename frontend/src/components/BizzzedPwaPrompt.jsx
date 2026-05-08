// components/BizzzedPwaPrompt.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaMobileAlt, FaPlus, FaArrowUp, FaDownload } from 'react-icons/fa';

const BizzzedPwaPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const checkStandalone = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsStandalone(true);
      }
      // iOS detection
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      setIsIOS(isIOSDevice);
    };

    checkStandalone();

    // Don't show if already installed
    if (isStandalone) return;

    // Check if user has dismissed before
    const dismissed = localStorage.getItem('bizzzed-pwa-dismissed');
    if (dismissed) return;

    // Show prompt after a short delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstall = async () => {
    if (window.deferredPrompt) {
      // Android/Chrome native prompt
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      window.deferredPrompt = null;
    }
    setShowPrompt(false);
    localStorage.setItem('bizzzed-pwa-dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('bizzzed-pwa-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleDismiss} />
      
      {/* Prompt Card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-slideUp">
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-[#1B3766] to-[#3B5998] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FaMobileAlt className="text-white text-2xl" />
        </div>

        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          Add Bizzzed to Home Screen
        </h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          Install this app for quick access and a better experience
        </p>

        {isIOS ? (
          /* iOS Instructions */
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaArrowUp className="text-white text-sm" />
              </div>
              <p className="text-xs text-gray-600">
                Tap the <strong>Share</strong> button in Safari
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaPlus className="text-white text-sm" />
              </div>
              <p className="text-xs text-gray-600">
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </p>
            </div>
          </div>
        ) : (
          /* Android/Other Instructions */
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaDownload className="text-white text-sm" />
              </div>
              <p className="text-xs text-gray-600">
                Install Bizzzed for a faster, app-like experience
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="w-full py-3 bg-gradient-to-r from-[#1B3766] to-[#3B5998] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <FaDownload className="text-sm" />
              Install App
            </button>
          </div>
        )}

        <button
          onClick={handleDismiss}
          className="w-full mt-3 py-2.5 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
        >
          Maybe Later
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default BizzzedPwaPrompt;