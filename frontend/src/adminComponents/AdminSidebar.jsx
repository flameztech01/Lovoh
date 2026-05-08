// components/AdminSidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaTachometerAlt, 
  FaBox, 
  FaShoppingCart, 
  FaBook, 
  FaCalendarAlt, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaStore,
  FaCog,
  FaBell,
  FaVideo,
} from 'react-icons/fa';
import { useAdminLogoutMutation } from '../slices/adminApiSlice';
import { logout } from '../slices/authslice';
import { toast } from 'react-toastify';

const AdminSidebar = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { adminInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useAdminLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/admin/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error Logging out');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/admin/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
    { to: '/admin/products', icon: FaBox, label: 'Products' },
    { to: '/admin/orders', icon: FaShoppingCart, label: 'Orders' },
    { to: '/admin/magazines', icon: FaBook, label: 'Magazines' },
    { to: '/admin/videos', icon: FaVideo, label: 'Clips' },
    {to : '/admin/forms', icon: FaBell, label: 'Forms' },
    {to: '/admin/articles', icon: FaBook, label: 'Articles' },
    { to: '/admin/events', icon: FaCalendarAlt, label: 'Events' },
    {to: '/admin/ads', icon: FaBell, label: 'Ads' },
  ];

  // Sidebar content component
  const SidebarContent = ({ isMobile = false, onClose = null }) => {
    const handleNavClick = () => {
      if (isMobile && onClose) {
        onClose();
      }
    };

    return (
      <div className="flex flex-col h-full bg-white">
        {/* Logo Area */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0043FC] rounded-xl flex items-center justify-center shadow-sm">
              <FaStore className="text-white text-base" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                The Brave
              </h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isSidebarOpen ? (
                <FaChevronLeft className="text-gray-500 text-sm" />
              ) : (
                <FaChevronRight className="text-gray-500 text-sm" />
              )}
            </button>
          )}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Admin Info */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0043FC]/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-[#0043FC]">
                {adminInfo?.username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {adminInfo?.username || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <FaBell className="text-xs text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className="px-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={handleNavClick}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-[#0043FC] text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#0043FC]'
                  }
                  ${!isSidebarOpen && !isMobile ? 'justify-center' : ''}
                `}
                title={!isSidebarOpen && !isMobile ? link.label : ''}
              >
                <link.icon className={`text-lg ${!isSidebarOpen && !isMobile ? 'text-xl' : ''}`} />
                {(isSidebarOpen || isMobile) && (
                  <span className="text-sm font-medium">{link.label}</span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 mx-3 border-t border-gray-100"></div>

          {/* Settings Section */}
          {(isSidebarOpen || isMobile) && (
            <div className="px-3">
              <NavLink
                to="/admin/settings"
                onClick={handleNavClick}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-[#0043FC] text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#0043FC]'
                  }
                `}
              >
                <FaCog className="text-lg" />
                <span className="text-sm font-medium">Settings</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logoutHandler}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
              text-red-600 hover:bg-red-50
              ${!isSidebarOpen && !isMobile ? 'justify-center' : ''}
            `}
            title={!isSidebarOpen && !isMobile ? 'Logout' : ''}
          >
            <FaSignOutAlt className="text-lg" />
            {(isSidebarOpen || isMobile) && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm z-30 transition-all duration-300
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          hidden md:block
        `}
      >
        <SidebarContent isMobile={false} />
      </aside>

      {/* Main Content Area (Desktop) */}
      <main
        className={`
          transition-all duration-300 min-h-screen
          ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}
        `}
      >
        {/* Top Bar for Mobile */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0043FC] rounded-lg flex items-center justify-center">
                <FaStore className="text-white text-sm" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">The Brave</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={openMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaBars className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Sidebar */}
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 md:hidden">
            <SidebarContent isMobile={true} onClose={closeMobileMenu} />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSidebar;