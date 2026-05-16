// components/adminComponents/AdminSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAdminLogoutMutation } from '../slices/adminApiSlice';
import { logoutAdmin } from '../slices/authslice';
import { toast } from 'react-toastify';
import {
  FaTachometerAlt,
  FaAd,
  FaUsers,
  FaEnvelope,
  FaNewspaper,
  FaBookOpen,
  FaVideo,
  FaChartLine,
  FaSignOutAlt,
} from 'react-icons/fa';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [adminLogout] = useAdminLogoutMutation();

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    try {
      await adminLogout().unwrap();
      dispatch(logoutAdmin());
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/admin/ads', label: 'Ads Manager', icon: FaAd },
    { path: '/admin/subscribers', label: 'Subscribers', icon: FaUsers },
    { path: '/admin/messages', label: 'Messages', icon: FaEnvelope },
    { path: '/admin/articles', label: 'Articles', icon: FaNewspaper },
    { path: '/admin/magazines', label: 'Magazines', icon: FaBookOpen },
    { path: '/admin/videos', label: 'Videos', icon: FaVideo },
    { path: '/admin/analytics', label: 'Analytics', icon: FaChartLine },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex-shrink-0 min-h-screen">
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-xl font-bold">Biizzed Admin</h1>
        <p className="text-xs text-gray-400 mt-1">Content Management</p>
      </div>
      <nav className="mt-6 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1B3766] text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="text-base" />
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors mt-4"
        >
          <FaSignOutAlt className="text-base" />
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;