// components/ShopNavbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaQuestionCircle,
  FaUser,
  FaArrowLeft,
  FaHome,
  FaSignOutAlt,
  FaBox,
  FaStore,
  FaChartLine,
  FaWallet,
  FaCreditCard,
  FaHistory,
  FaTachometerAlt,
  FaCheckCircle, 
} from 'react-icons/fa';
import { useLogoutMutation } from '../slices/userApiSlice.js';
import { useGetCartSummaryQuery, useGetSellerBalanceQuery } from '../slices/orderApiSlice.js';
import { useGetSellerApplicationStatusQuery } from '../slices/sellerApiSlice.js';
import { logout } from '../slices/authslice.js';

const ShopNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get user info from Redux store
  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useLogoutMutation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showSellerMenu, setShowSellerMenu] = useState(false);

  // Get cart summary from API
  const { 
    data: cartSummary, 
    refetch: refetchCartSummary 
  } = useGetCartSummaryQuery(undefined, {
    skip: !userInfo,
  });

  // Get seller application status
  const { data: sellerStatus } = useGetSellerApplicationStatusQuery(undefined, {
    skip: !userInfo,
  });

  // Get seller balance for dashboard preview
  const { data: sellerBalance } = useGetSellerBalanceQuery(undefined, {
    skip: !userInfo || sellerStatus?.sellerStatus !== 'approved',
  });

  const cartCount = cartSummary?.cartCount || 0;
  const isApprovedSeller = sellerStatus?.sellerStatus === 'approved' && sellerStatus?.isSeller === true;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Refetch cart summary when user logs in or cart updates
  useEffect(() => {
    if (userInfo) {
      refetchCartSummary();
    }
  }, [userInfo, refetchCartSummary]);

  // Listen for cart update events
  useEffect(() => {
    const handleCartUpdate = () => {
      if (userInfo) {
        refetchCartSummary();
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [userInfo, refetchCartSummary]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const value = searchTerm.trim();
    
    if (location.pathname === '/shop') {
      window.dispatchEvent(new CustomEvent('shopSearch', { detail: { searchTerm: value } }));
      setIsMobileSearchOpen(false);
      setSearchTerm('');
    } else {
      if (value) {
        navigate(`/shop?search=${encodeURIComponent(value)}`);
      } else {
        navigate('/shop');
      }
      setIsMobileSearchOpen(false);
      setSearchTerm('');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/shop');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Fixed Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-white transition-all duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="w-full">
          {/* Top Bar */}
          <div className="border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-16 flex items-center justify-between gap-4">
                {/* Left - Back Button & Logo */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#0043FC] transition-all duration-200 group"
                    aria-label="Go back"
                  >
                    <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden sm:inline text-sm font-medium">Back</span>
                  </button>

                  <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>

                  <Link to="/shop" className="flex items-center gap-2 group">
                    <img
                      src="/uduua.png"
                      alt="Logo"
                      className="h-8 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
                    />
                  </Link>
                </div>

                {/* Center - Desktop Search Bar */}
                <div className="hidden md:flex flex-1 max-w-2xl mx-4">
                  <form onSubmit={handleSearch} className="w-full flex items-center">
                    <div className="relative flex-1">
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products, brands and categories..."
                        className="w-full h-11 pl-11 pr-4 border border-gray-200 border-r-0 bg-white text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC]/20 transition-all rounded-l-xl"
                      />
                    </div>
                    <button
                      type="submit"
                      className="h-11 px-6 bg-[#0043FC] hover:bg-[#0033cc] text-white font-semibold text-sm rounded-r-xl transition-colors duration-200"
                    >
                      Search
                    </button>
                  </form>
                </div>

                {/* Right - Actions */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  {/* Mobile Search Button */}
                  <button
                    onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                    className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:text-[#0043FC] hover:border-[#0043FC]/30 transition-all duration-200"
                    aria-label="Search"
                  >
                    <FaSearch className="text-base" />
                  </button>

                  {/* Help */}
                  <Link
                    to="/shop/help"
                    className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0043FC] transition-colors duration-200"
                  >
                    <FaQuestionCircle className="text-base" />
                    <span>Help</span>
                  </Link>

                  {/* Cart */}
                  <Link
                    to="/shop/cart"
                    className="relative flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0043FC] transition-colors duration-200"
                  >
                    <div className="relative">
                      <FaShoppingCart className="text-lg" />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0043FC] text-white text-[10px] font-bold flex items-center justify-center">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                    </div>
                    <span className="hidden sm:inline">Cart</span>
                  </Link>

                  {/* Seller Dashboard Button (for approved sellers) */}
                  {isApprovedSeller && (
                    <div className="relative">
                      <button
                        onClick={() => setShowSellerMenu(!showSellerMenu)}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#0043FC]/10 text-[#0043FC] rounded-lg text-sm font-medium hover:bg-[#0043FC]/20 transition-colors"
                      >
                        <FaStore className="text-sm" />
                        <span>Seller Hub</span>
                      </button>
                    </div>
                  )}

                  {/* User Section */}
                  {userInfo ? (
                    <div className="relative group">
                      <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-50 transition-colors">
                        <img 
                          src={userInfo.profile || '/default-avatar.png'} 
                          alt={userInfo.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                        <div className="hidden lg:block text-left">
                          <div className="text-sm font-semibold text-gray-900 leading-tight">
                            {userInfo.name?.split(' ')[0]}
                          </div>
                          <div className="text-xs text-gray-500 leading-tight">
                            @{userInfo.username}
                          </div>
                        </div>
                      </button>

                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="p-3 border-b border-gray-100">
                          <div className="font-semibold text-gray-900">{userInfo.name}</div>
                          <div className="text-xs text-gray-500">{userInfo.email}</div>
                          {isApprovedSeller && (
                            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">
                              <FaCheckCircle className="text-[8px]" /> Seller
                            </div>
                          )}
                        </div>
                        
                        {/* Regular User Links */}
                        <Link 
                          to="/shop/orders"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0043FC]"
                        >
                          <FaBox className="text-xs" /> My Orders
                        </Link>

                        {/* Seller Links (only for approved sellers) */}
                        {isApprovedSeller && (
                          <>
                            <div className="border-t border-gray-100 my-1"></div>
                            <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Seller Dashboard
                            </div>
                            <Link 
                              to="/seller/dashboard"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0043FC]"
                            >
                              <FaTachometerAlt className="text-xs" /> Dashboard
                            </Link>
                            <Link 
                              to="/seller/products"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0043FC]"
                            >
                              <FaStore className="text-xs" /> My Products
                            </Link>
                            <Link 
                              to="/seller/orders"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0043FC]"
                            >
                              <FaBox className="text-xs" /> Seller Orders
                            </Link>
                            <Link 
                              to="/seller/wallet"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0043FC]"
                            >
                              <FaWallet className="text-xs" /> Wallet
                            </Link>
                            <Link 
                              to="/seller/payment-history"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0043FC]"
                            >
                              <FaHistory className="text-xs" /> Payment History
                            </Link>
                            <div className="px-4 py-1 text-xs text-green-600 bg-green-50">
                              Balance: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(sellerBalance?.availableBalance || 0)}
                            </div>
                          </>
                        )}
                        
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <FaSignOutAlt className="text-xs" /> Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Link
                        to="/shop/login"
                        className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0043FC] transition-colors duration-200"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <FaUser className="text-sm" />
                        </div>
                        <span>Login</span>
                      </Link>

                      <Link
                        to="/shop/signup"
                        className="text-sm font-semibold text-white bg-[#0043FC] hover:bg-[#0033cc] px-5 py-2 rounded-xl transition-colors duration-200"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:text-[#0043FC] hover:border-[#0043FC]/30 transition-all duration-200"
                    aria-label="Toggle menu"
                  >
                    {isMobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className="hidden md:block border-b border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-12 flex items-center gap-6">
                <Link 
                  to="/shop" 
                  className="flex items-center gap-2 text-sm font-semibold text-[#0043FC] transition-colors"
                >
                  <FaBars className="text-sm" />
                  <span>All Products</span>
                </Link>

                <div className="h-4 w-px bg-gray-200"></div>

                <div className="flex items-center gap-6">
                  <Link 
                    to="/shop/help" 
                    className="text-sm font-medium text-gray-600 hover:text-[#0043FC] transition-colors"
                  >
                    Help Center
                  </Link>
                  <Link 
                    to="/shop/orders" 
                    className="text-sm font-medium text-gray-600 hover:text-[#0043FC] transition-colors"
                  >
                    My Orders
                  </Link>
                  {isApprovedSeller && (
                    <Link 
                      to="/seller/dashboard" 
                      className="text-sm font-medium text-[#0043FC] hover:text-[#0033cc] transition-colors flex items-center gap-1"
                    >
                      <FaStore className="text-xs" /> Seller Dashboard
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seller Hub Dropdown Menu */}
          {showSellerMenu && isApprovedSeller && (
            <div className="absolute right-4 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
              <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-[#0043FC]/5 to-transparent">
                <div className="flex items-center gap-2">
                  <FaStore className="text-[#0043FC]" />
                  <span className="font-semibold text-gray-900">Seller Hub</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Manage your selling business</p>
              </div>
              <div className="p-2">
                <Link
                  to="/seller/dashboard"
                  onClick={() => setShowSellerMenu(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#0043FC] transition-colors"
                >
                  <FaTachometerAlt className="text-sm" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/seller/products"
                  onClick={() => setShowSellerMenu(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#0043FC] transition-colors"
                >
                  <FaStore className="text-sm" />
                  <span>My Products</span>
                </Link>
                <Link
                  to="/seller/orders"
                  onClick={() => setShowSellerMenu(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#0043FC] transition-colors"
                >
                  <FaBox className="text-sm" />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/seller/wallet"
                  onClick={() => setShowSellerMenu(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#0043FC] transition-colors"
                >
                  <FaWallet className="text-sm" />
                  <span>Wallet & Balance</span>
                </Link>
                <Link
                  to="/uduua/seller/payment-history"
                  onClick={() => setShowSellerMenu(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#0043FC] transition-colors"
                >
                  <FaHistory className="text-sm" />
                  <span>Payment History</span>
                </Link>
                <Link
                  to="/seller/analytics"
                  onClick={() => setShowSellerMenu(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#0043FC] transition-colors"
                >
                  <FaChartLine className="text-sm" />
                  <span>Analytics</span>
                </Link>
              </div>
              <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Available Balance</span>
                  <span className="font-bold text-[#0043FC]">
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(sellerBalance?.availableBalance || 0)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowSellerMenu(false);
                    navigate('/seller/withdraw');
                  }}
                  className="w-full mt-2 py-1.5 bg-[#0043FC] text-white rounded-lg text-xs font-medium hover:bg-[#0038D4] transition-colors"
                >
                  Withdraw Funds
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-x-0 top-0 z-50 md:hidden">
          <div className="bg-white border-b border-gray-200 pt-4 pb-4 px-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Search Products</h3>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-[#0043FC] hover:bg-gray-50 transition-all"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#0043FC] focus:ring-2 focus:ring-[#0043FC]/20 focus:bg-white transition-all"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 rounded-xl font-semibold text-white bg-[#0043FC] hover:bg-[#0033cc] transition-colors duration-200"
              >
                Search
              </button>
            </form>
          </div>
          <div className="fixed inset-0 bg-black/50 -z-10" onClick={() => setIsMobileSearchOpen(false)}></div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-16 md:h-28"></div>

      {/* Mobile Sidebar Menu - Updated with Seller Links */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        <div
          className={`absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-300 transform ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/4copy.png" alt="Logo" className="h-8 w-auto" />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-[#0043FC] hover:bg-white transition-all"
              >
                <FaTimes />
              </button>
            </div>
            
            {userInfo && (
              <div className="mt-3 flex items-center gap-3">
                <img 
                  src={userInfo.profile || '/default-avatar.png'} 
                  alt={userInfo.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div>
                  <div className="font-semibold text-gray-900">{userInfo.name}</div>
                  <div className="text-xs text-gray-500">@{userInfo.username}</div>
                  {isApprovedSeller && (
                    <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-medium">
                      <FaStore className="text-[8px]" /> Seller
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!userInfo && <p className="text-xs text-gray-500 mt-2">Shop with confidence</p>}
          </div>

          <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
            <Link
              to="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-[#0043FC] font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <FaBars className="text-lg" />
              <span>All Products</span>
            </Link>

            <Link
              to="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-[#0043FC] transition-all duration-200"
            >
              <FaHome className="text-lg" />
              <span>Home</span>
            </Link>

            {userInfo ? (
              <>
                <Link
                  to="/shop/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-[#0043FC] transition-all duration-200"
                >
                  <FaBox className="text-lg" />
                  <span>My Orders</span>
                </Link>

                {/* Seller Links for Mobile */}
                {isApprovedSeller && (
                  <>
                    <div className="border-t border-gray-100 my-2"></div>
                    <p className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Seller Dashboard
                    </p>
                    <Link
                      to="/seller/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-[#0043FC] transition-all duration-200"
                    >
                      <FaTachometerAlt className="text-lg" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/seller/products"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-[#0043FC] transition-all duration-200"
                    >
                      <FaStore className="text-lg" />
                      <span>My Products</span>
                    </Link>
                    <Link
                      to="/seller/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-[#0043FC] transition-all duration-200"
                    >
                      <FaBox className="text-lg" />
                      <span>Seller Orders</span>
                    </Link>
                    <Link
                      to="/seller/wallet"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-[#0043FC] transition-all duration-200"
                    >
                      <FaWallet className="text-lg" />
                      <span>Wallet</span>
                    </Link>
                    <Link
                      to="/seller/payment-history"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-[#0043FC] transition-all duration-200"
                    >
                      <FaHistory className="text-lg" />
                      <span>Payment History</span>
                    </Link>
                  </>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-all duration-200"
                >
                  <FaSignOutAlt className="text-lg" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/shop/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-[#0043FC] transition-all duration-200"
                >
                  <FaUser className="text-lg" />
                  <span>Login</span>
                </Link>

                <Link
                  to="/shop/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3 mt-2 rounded-xl text-white font-semibold bg-[#0043FC] hover:bg-[#0033cc] transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}

            <div className="border-t border-gray-100 my-2"></div>

            <Link
              to="/shop/help"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-[#0043FC] transition-all duration-200"
            >
              <FaQuestionCircle className="text-lg" />
              <span>Help Center</span>
            </Link>

            <Link
              to="/shop/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-[#0043FC] transition-all duration-200"
            >
              <div className="relative">
                <FaShoppingCart className="text-lg" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#0043FC] text-white text-[9px] font-bold flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span>My Cart</span>
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-center text-gray-500">
              Need help? Contact our support team
            </p>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              © 2024 Úduua. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopNavbar;