// src/adminComponents/AdminSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  FaTachometerAlt,
  FaBoxes,
  FaShoppingCart,
  FaUsers,
  FaStore,
  FaFlag,
  FaCog,
  FaSignOutAlt,
  FaTags,
  FaClipboardList,
  FaMoneyBillWave,
  FaEnvelope,
} from 'react-icons/fa';
import { logoutAdmin } from '../slices/authslice.js';
import { toast } from 'react-toastify';

const AdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutAdmin());
    toast.success('Logged out successfully');
    navigate('/superuser/login');
    if (onClose) onClose();
  };

  const menuItems = [
    { path: '/superuser/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/superuser/products', icon: FaBoxes, label: 'Products' },
    { path: '/superuser/sellers', icon: FaStore, label: 'Sellers' },
    { path: '/superuser/reports', icon: FaFlag, label: 'Reports' },
    { path: '/superuser/payouts', icon: FaMoneyBillWave, label: 'Payouts' },
    {path: '/superuser/ads', icon: FaTags, label: 'Ads' },
    { path: '/superuser/settings', icon: FaCog, label: 'Settings' },
  ];

  const sidebarClasses = `
    fixed top-0 left-0 h-full bg-gray-900 text-white z-30
    transition-transform duration-300 ease-in-out
    w-64 lg:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:block overflow-y-auto
  `;

  return (
    <aside className={sidebarClasses}>
      {/* Sidebar Header */}
      <div className="hidden lg:flex items-center gap-2 px-6 py-5 border-b border-gray-800">
        <img src="/uduua-logo.png" alt="Úduua" className="h-8 w-auto brightness-0 invert" />
        <span className="font-bold text-lg">Admin Panel</span>
      </div>

      {/* Mobile Sidebar Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <img src="/uduua-logo.png" alt="Úduua" className="h-6 w-auto brightness-0 invert" />
          <span className="font-semibold text-sm">Menu</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => onClose && onClose()}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-[#0043FC] text-white shadow-lg' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }
            `}
          >
            <item.icon className="text-lg" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200 mt-4"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-500">© 2024 Úduua</p>
        <p className="text-xs text-gray-600 mt-1">v1.0.0</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;