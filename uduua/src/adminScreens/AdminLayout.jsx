// src/adminScreens/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaBars, FaTimes, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { logoutAdmin } from '../slices/authSlice.js';
import AdminSidebar from '../adminComponents/AdminSidebar.jsx';
import { toast } from 'react-toastify';

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { adminInfo } = useSelector((state) => state.auth);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!adminInfo) {
      navigate('/admin/login', { replace: true });
    }
  }, [adminInfo, navigate]);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    toast.success('Logged out successfully');
    navigate('/admin/login', { replace: true });
  };

  // Show nothing while checking auth (prevents flash)
  if (!adminInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-30 px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? <FaTimes className="text-gray-600" /> : <FaBars className="text-gray-600" />}
        </button>
        <div className="flex items-center gap-2">
          <img src="/uduua-logo.png" alt="Úduua" className="h-6 w-auto" />
          <span className="text-sm font-semibold text-gray-800">Admin Panel</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FaSignOutAlt className="text-gray-600" />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 bg-white z-20 px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/uduua-logo.png" alt="Úduua" className="h-8 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Manage your marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaUserCircle className="text-gray-400 text-xl" />
              <div>
                <p className="text-sm font-medium text-gray-700">{adminInfo?.username || 'Admin'}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className={`
        transition-all duration-300
        lg:ml-64
        ${isMobile ? 'pt-16' : 'pt-16 lg:pt-20'}
      `}>
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;