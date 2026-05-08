// components/UduuaFooter.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaShoppingBag, FaStore, FaArrowRight, FaDownload,
  FaMapMarkerAlt, FaEnvelope, FaPhone, FaWhatsapp,
  FaShieldAlt, FaFileContract, FaSpinner, FaCheckCircle,
  FaTimesCircle, FaClock, FaPlus
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useGetSellerApplicationStatusQuery } from '../slices/sellerApiSlice';

// Privacy Policy Modal Component
const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Privacy Policy</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div className="p-6 space-y-4 text-gray-600 text-sm">
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">1. Information We Collect</h3>
          <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include your name, email address, phone number, shipping address, and payment information.</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">2. How We Use Your Information</h3>
          <p>We use your information to process orders, communicate with you about your purchases, improve our services, and protect against fraud.</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">3. Information Sharing</h3>
          <p>We do not sell your personal information. We share information only as necessary to fulfill orders (with shipping carriers), process payments (with payment processors), or comply with legal requirements.</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">4. Data Security</h3>
          <p>We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">5. Your Rights</h3>
          <p>You may access, update, or delete your account information at any time by logging into your account settings.</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">6. Contact Us</h3>
          <p>If you have questions about this Privacy Policy, please contact us at support@uduua.com</p>
        </div>
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="w-full px-4 py-2 bg-[#0043FC] text-white rounded-lg font-medium">Close</button>
        </div>
      </div>
    </div>
  );
};

// Terms of Service Modal Component
const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Terms of Service</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div className="p-6 space-y-4 text-gray-600 text-sm">
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">1. Acceptance of Terms</h3>
          <p>By accessing or using Uduua Marketplace, you agree to be bound by these Terms of Service.</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">2. Account Registration</h3>
          <p>You must be at least 18 years old to create an account. You are responsible for maintaining the security of your account.</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">3. Buying and Selling</h3>
          <p>Uduua Marketplace facilitates transactions between buyers and sellers. We are not responsible for product quality, shipping delays, or disputes between parties. However, we provide dispute resolution services.</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">4. Payments</h3>
          <p>All payments are processed securely. For on-delivery payments, payment is due upon receipt of goods. For online payments, payment is due at checkout.</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">5. Seller Terms</h3>
          <p>Sellers must provide accurate product information, fulfill orders promptly, and comply with all applicable laws. Uduua charges a 6% commission on all sales.</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">6. Prohibited Items</h3>
          <p>The following items cannot be sold on Uduua: illegal products, counterfeit goods, weapons, hazardous materials, and adult content.</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">7. Dispute Resolution</h3>
          <p>Any disputes arising from these terms shall be resolved through binding arbitration in Lagos, Nigeria.</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">8. Changes to Terms</h3>
          <p>We may modify these terms at any time. Continued use of the platform constitutes acceptance of modified terms.</p>
          
          <h3 className="font-semibold text-gray-900 mt-4">9. Contact</h3>
          <p>For questions about these terms, contact us at legal@uduua.com</p>
        </div>
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="w-full px-4 py-2 bg-[#0043FC] text-white rounded-lg font-medium">Close</button>
        </div>
      </div>
    </div>
  );
};

const UduuaFooter = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: applicationStatus, isLoading: isLoadingStatus } = useGetSellerApplicationStatusQuery(undefined, {
    skip: !userInfo,
  });
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Get seller status
  const sellerStatus = applicationStatus?.sellerStatus || 'not_applied';
  const isApprovedSeller = sellerStatus === 'approved';
  const isPendingSeller = sellerStatus === 'pending';
  const isRejectedSeller = sellerStatus === 'rejected';
  const hasNotApplied = sellerStatus === 'not_applied';

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

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

  const handleApplySeller = () => {
    if (!userInfo) {
      navigate('/uduua/shop/login', { state: { from: '/uduua/apply-seller' } });
    } else {
      navigate('/uduua/apply-seller');
    }
  };

  const handleAddProduct = () => {
    navigate('/uduua/seller/add-product');
  };

  const getSellerButton = () => {
    // If no user is logged in
    if (!userInfo) {
      return (
        <button
          onClick={handleApplySeller}
          className="inline-flex items-center gap-2 bg-white text-[#0043FC] px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
        >
          <FaStore /> Apply as Seller <FaArrowRight className="text-sm" />
        </button>
      );
    }

    // Show loading state
    if (isLoadingStatus) {
      return (
        <button
          disabled
          className="inline-flex items-center gap-2 bg-gray-500 text-white px-6 py-2.5 rounded-xl font-semibold cursor-not-allowed"
        >
          <FaSpinner className="animate-spin" /> Loading...
        </button>
      );
    }

    // Case 1: Not applied yet
    if (hasNotApplied) {
      return (
        <button
          onClick={handleApplySeller}
          className="inline-flex items-center gap-2 bg-white text-[#0043FC] px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
        >
          <FaStore /> Apply as Seller <FaArrowRight className="text-sm" />
        </button>
      );
    }

    // Case 2: Application pending
    if (isPendingSeller) {
      return (
        <button
          disabled
          className="inline-flex items-center gap-2 bg-yellow-500 text-white px-6 py-2.5 rounded-xl font-semibold cursor-not-allowed"
        >
          <FaClock className="animate-pulse" /> Application Pending
        </button>
      );
    }

    // Case 3: Application approved
    if (isApprovedSeller) {
      return (
        <button
          onClick={handleAddProduct}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all transform hover:scale-105"
        >
          <FaPlus /> Add New Product <FaArrowRight className="text-sm" />
        </button>
      );
    }

    // Case 4: Application rejected
    if (isRejectedSeller) {
      return (
        <button
          disabled
          className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold cursor-not-allowed opacity-75"
        >
          <FaTimesCircle /> Rejected - Cannot be a seller
        </button>
      );
    }

    // Fallback
    return (
      <button
        onClick={handleApplySeller}
        className="inline-flex items-center gap-2 bg-white text-[#0043FC] px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
      >
        <FaStore /> Apply as Seller <FaArrowRight className="text-sm" />
      </button>
    );
  };

  return (
    <>
      <footer className="bg-[#0A0A0A] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Top Section with CTA */}
          <div className="bg-gradient-to-r from-[#0043FC] to-[#0030B5] rounded-2xl p-8 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-2">Sell on Uduua Marketplace</h3>
                <p className="text-white/80 mb-4">
                  Reach thousands of customers and grow your business. Join our marketplace 
                  and start selling your products today!
                </p>
                <div className="flex flex-wrap gap-3">
                  {getSellerButton()}
                  {showInstallButton && (
                    <button
                      onClick={handleInstallClick}
                      className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-white/30 transition-all"
                    >
                      <FaDownload /> Install App
                    </button>
                  )}
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">Trusted</p>
                      <p className="text-xs text-white/70">Marketplace</p>
                    </div>
                    <div className="w-px h-10 bg-white/30"></div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">Quality</p>
                      <p className="text-xs text-white/70">Guaranteed</p>
                    </div>
                    <div className="w-px h-10 bg-white/30"></div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">Secure</p>
                      <p className="text-xs text-white/70">Payments</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            
            {/* Column 1 - About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FaShoppingBag className="text-[#0043FC] text-2xl" />
                <span className="text-xl font-bold">Uduua</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Nigeria's premier marketplace for quality products at competitive prices. 
                Shop from trusted sellers across the country.
              </p>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/uduua/shop" className="text-gray-400 hover:text-[#0043FC] transition-colors text-sm">Shop</Link></li>
                <li><Link to="/uduua/services" className="text-gray-400 hover:text-[#0043FC] transition-colors text-sm">Grow your Brand</Link></li>
                <li>
                  <button onClick={() => setShowPrivacyModal(true)} className="text-gray-400 hover:text-[#0043FC] transition-colors text-sm">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowTermsModal(true)} className="text-gray-400 hover:text-[#0043FC] transition-colors text-sm">
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3 - Contact */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-400 text-sm">
                  <FaMapMarkerAlt className="text-[#0043FC] mt-0.5" />
                  <span>Lagos, Nigeria</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400 text-sm">
                  <FaEnvelope className="text-[#0043FC] mt-0.5" />
                  <a href="mailto:support@uduua.com" className="hover:text-[#0043FC]">support@uduua.com</a>
                </li>
                <li className="flex items-start gap-3 text-gray-400 text-sm">
                  <FaPhone className="text-[#0043FC] mt-0.5" />
                  <a href="tel:+2341234567890" className="hover:text-[#0043FC]">+234 (0) 123 456 7890</a>
                </li>
                <li className="flex items-start gap-3 text-gray-400 text-sm">
                  <FaWhatsapp className="text-[#0043FC] mt-0.5" />
                  <a href="https://wa.me/2341234567890" className="hover:text-[#0043FC]">Chat on WhatsApp</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p className="text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} Uduua Marketplace. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-gray-500">
              <FaShieldAlt className="text-xs" />
              <span>Secure Shopping</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <FaFileContract className="text-xs" />
              <span>Trusted Sellers</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </>
  );
};

export default UduuaFooter;