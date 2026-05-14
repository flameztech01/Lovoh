// components/UduuaPwaPrompt.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaDownload, FaTimes, FaMobile, FaArrowRight, FaShieldAlt } from 'react-icons/fa';

const UduuaPwaPrompt = () => {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const isUduuaRoute = location.pathname.startsWith('/uduua');

  // Check if already installed or in standalone mode
  useEffect(() => {
    // Check if app is already installed (standalone mode)
    // FIXED: window.matchStorage -> window.matchMedia
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              window.navigator.standalone === true;
    setIsStandalone(isInStandaloneMode);

    // Check if user already dismissed or installed
    const hasDismissed = localStorage.getItem('uduua-pwa-dismissed');
    const hasInstalled = localStorage.getItem('uduua-pwa-installed');
    
    if (hasInstalled) setIsInstalled(true);
    if (hasDismissed && !hasInstalled) return;

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      
      // Only show prompt on uduua routes and if not installed/dismissed
      if (isUduuaRoute && !isStandalone && !hasInstalled && !hasDismissed) {
        setDeferredPrompt(e);
        
        // Show prompt after 3 seconds on uduua routes
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('uduua-pwa-installed', 'true');
      localStorage.removeItem('uduua-pwa-dismissed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS, check if it can be installed
    if (isIOSDevice && !isStandalone && isUduuaRoute) {
      const hasShownIOSPrompt = localStorage.getItem('uduua-ios-prompt-shown');
      if (!hasShownIOSPrompt && !hasInstalled) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isUduuaRoute, isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // iOS fallback - show instructions
      if (isIOS) {
        localStorage.setItem('uduua-ios-prompt-shown', 'true');
        setShowPrompt(false);
        // Show custom iOS install instructions
        alert('To install this app on iOS:\n1. Tap the Share button\n2. Tap "Add to Home Screen"\n3. Tap "Add"');
      }
      return;
    }
    
    // Chrome/Android install
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Uduua PWA installed successfully');
      localStorage.setItem('uduua-pwa-installed', 'true');
      setIsInstalled(true);
    } else {
      console.log('Uduua PWA installation dismissed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('uduua-pwa-dismissed', 'true');
  };

  // Don't show if already installed or if not on uduua route
  if (isInstalled || isStandalone || !isUduuaRoute || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      {/* Main Prompt Card */}
      <div className="bg-gradient-to-br from-[#0043FC] to-[#0030B5] rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="relative p-5">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <FaTimes className="text-sm" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <FaShieldAlt className="text-3xl text-[#0043FC]" />
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-xl font-bold text-white text-center mb-2">
            Install Uduua App
          </h3>
          <p className="text-white/80 text-sm text-center mb-5">
            Get quick access to Uduua resources, videos, and updates directly from your home screen
          </p>

          {/* Features */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <FaMobile className="text-sm" />
              <span>Launch instantly from home screen</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <FaDownload className="text-sm" />
              <span>Works offline for saved content</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <FaArrowRight className="text-sm" />
              <span>Faster navigation and loading</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-2.5 bg-white text-[#0043FC] rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <FaDownload className="text-sm" />
              Install Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 bg-white/20 text-white rounded-xl font-medium text-sm hover:bg-white/30 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* iOS Instruction (only show on iOS) */}
          {isIOS && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-white/60 text-[10px] text-center">
                On iOS, tap the Share button then "Add to Home Screen"
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UduuaPwaPrompt;