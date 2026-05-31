import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSpinner,
  FaCamera,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaSave,
  FaUserCircle,
  FaBell,
  FaSignOutAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaInfoCircle,
  FaShieldAlt,
  FaTrashAlt,
  FaExclamationTriangle,
  FaLock,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import {
  useGetProfileInfoQuery,
  useUpdateProfileMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} from '../slices/userApiSlice';
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '../slices/notificationApiSlice';
import { clearAllAuth } from '../slices/authslice';

import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';

// Password Change Modal
const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [changePassword] = useChangePasswordMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="bg-gradient-to-r from-[#1B3766] to-[#142952] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaLock className="text-white/80 text-lg" />
              <h3 className="text-lg font-bold text-white">Change Password</h3>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
          <p className="text-white/60 text-xs mt-1">Update your password to keep your account secure</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]/20 focus:border-[#1B3766] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]/20 focus:border-[#1B3766] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]/20 focus:border-[#1B3766] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? <><FaSpinner className="animate-spin text-xs" /> Changing...</> : <><FaCheck className="text-xs" /> Change Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Account Modal
const DeleteAccountModal = ({ isOpen, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      toast.error('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-white/80 text-lg" />
              <h3 className="text-lg font-bold text-white">Delete Account</h3>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
          <p className="text-white/60 text-xs mt-1">This action cannot be undone</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <p className="text-sm text-red-800 font-medium mb-2">⚠️ Warning</p>
            <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
              <li>Your profile and all personal data will be permanently deleted</li>
              <li>All your articles, magazines, and videos will be removed</li>
              <li>Your followers and following data will be lost</li>
              <li>You will not be able to recover your account</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Type <span className="font-bold text-red-600">"DELETE MY ACCOUNT"</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? <><FaSpinner className="animate-spin text-xs" /> Deleting...</> : <><FaTrashAlt className="text-xs" /> Permanently Delete</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BiizzedSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  // ---------- Profile state ----------
  const [editName, setEditName] = useState(userInfo?.name || '');
  const [editUsername, setEditUsername] = useState(userInfo?.username || '');
  const [editEmail, setEditEmail] = useState(userInfo?.email || '');
  const [editPhone, setEditPhone] = useState(userInfo?.phone || '');
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState('');
  const [activeSection, setActiveSection] = useState('profile');
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetProfileInfoQuery(undefined, { skip: !userInfo });

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [logout] = useLogoutMutation();
  const [deleteAccount] = useDeleteAccountMutation();

  // ---------- Notification state ----------
  const {
    data: notifPrefs,
    isLoading: notifLoading,
    refetch: refetchPrefs,
  } = useGetNotificationPreferencesQuery();

  const [updateNotifPrefs, { isLoading: isUpdatingNotif }] =
    useUpdateNotificationPreferencesMutation();

  // Local copy of preferences for easy toggling
  const [prefs, setPrefs] = useState({
    articles: { enabled: true, fromFollowingOnly: false },
    magazines: { enabled: true, fromFollowingOnly: false },
    videos: { enabled: true, fromFollowingOnly: false },
    followers: { enabled: true },
  });

  // Sync local state when server data arrives
  useEffect(() => {
    if (notifPrefs?.preferences) {
      setPrefs(notifPrefs.preferences);
    }
  }, [notifPrefs]);

  // Populate form fields when profile loads
  useEffect(() => {
    if (profile) {
      setEditName(profile.name || '');
      setEditUsername(profile.username || '');
      setEditEmail(profile.email || '');
      setEditPhone(profile.phone || '');
    }
  }, [profile]);

  // ---------- Profile handlers ----------
  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!editUsername.trim()) {
      toast.error('Username is required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('username', editUsername.trim());
      formData.append('email', editEmail.trim());
      if (editPhone) formData.append('phone', editPhone.trim());
      if (profilePic) formData.append('profile', profilePic);

      await updateProfile(formData).unwrap();
      toast.success('Profile updated successfully');
      refetchProfile();
      if (preview) URL.revokeObjectURL(preview);
      setProfilePic(null);
      setPreview('');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancelPic = () => {
    if (preview) URL.revokeObjectURL(preview);
    setProfilePic(null);
    setPreview('');
  };

  // ---------- Notification handlers ----------
  const toggleEnabled = (type) => {
    setPrefs((prev) => ({
      ...prev,
      [type]: { ...prev[type], enabled: !prev[type].enabled },
    }));
  };

  const toggleFollowingOnly = (type) => {
    setPrefs((prev) => ({
      ...prev,
      [type]: { ...prev[type], fromFollowingOnly: !prev[type].fromFollowingOnly },
    }));
  };

  const handleSaveNotif = async () => {
    try {
      await updateNotifPrefs({ preferences: prefs }).unwrap();
      toast.success('Notification preferences saved');
      refetchPrefs();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save preferences');
    }
  };

  const handleDiscardNotif = () => {
    if (notifPrefs?.preferences) {
      setPrefs(notifPrefs.preferences);
    }
  };

  // ---------- Logout handler ----------
  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    try {
      await logout().unwrap();
      dispatch(clearAllAuth());
      localStorage.removeItem('userInfo');
      localStorage.removeItem('biizzed-pwa-dismissed');
      sessionStorage.clear();
      toast.success('Logged out successfully');
      navigate('/login');
      setTimeout(() => window.location.reload(), 300);
    } catch {
      toast.error('Logout failed');
    }
  };

  // ---------- Delete Account handler ----------
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount().unwrap();
      dispatch(clearAllAuth());
      localStorage.removeItem('userInfo');
      localStorage.removeItem('biizzed-pwa-dismissed');
      sessionStorage.clear();
      toast.success('Account deleted permanently');
      navigate('/');
      setTimeout(() => window.location.reload(), 300);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete account');
    }
  };

  const currentPic = preview || profile?.profile || '';

  // Sidebar menu items
  const menuItems = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'security', label: 'Security', icon: FaShieldAlt },
    { id: 'danger', label: 'Danger Zone', icon: FaExclamationTriangle },
  ];

  // Mobile menu component
  const MobileMenu = () => (
    <div className="lg:hidden mb-4 overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeSection === item.id
                  ? 'bg-[#1B3766] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="text-sm" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:block w-72 flex-shrink-0">
      <div className="sticky top-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#1B3766]/5 to-transparent">
            <h3 className="font-semibold text-gray-900">Settings</h3>
            <p className="text-xs text-gray-500 mt-0.5">Manage your account</p>
          </div>
          <div className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all mb-1 ${
                    isActive
                      ? 'bg-[#1B3766] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`text-base ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <BiizzedArticlesNavbar />

      <div className="max-w-6xl mx-auto px-4 py-6 pt-20 lg:pt-24 pb-24">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] transition-colors text-sm group"
          >
            <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" /> 
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">Settings</h1>
          <div className="w-16 lg:w-20" />
        </div>

        {/* Mobile Menu */}
        <MobileMenu />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <DesktopSidebar />

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#1B3766] to-[#142952] px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FaUser className="text-white/80" />
                    Profile Information
                  </h2>
                  <p className="text-white/60 text-xs mt-1">
                    Update your personal information and profile picture
                  </p>
                </div>

                <div className="p-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center mb-6 pb-4 border-b border-gray-100">
                    <div className="relative group">
                      {currentPic ? (
                        <img
                          src={currentPic}
                          alt="Profile"
                          className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1B3766] to-[#142952] text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                          {(profile?.name || userInfo?.name || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <label className="absolute bottom-1 right-1 w-9 h-9 bg-[#1B3766] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#142952] transition-colors shadow-md group-hover:scale-105 transition-transform">
                        <FaCamera className="text-sm" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePicChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {preview && (
                      <button
                        onClick={handleCancelPic}
                        className="text-xs text-red-500 mt-2 hover:underline flex items-center gap-1"
                      >
                        <FaTimes className="text-[10px]" /> Cancel new photo
                      </button>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Click the camera to change profile picture
                    </p>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]/20 focus:border-[#1B3766] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Username *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                          <input
                            type="text"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            placeholder="username"
                            className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]/20 focus:border-[#1B3766] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]/20 focus:border-[#1B3766] transition-all bg-gray-50"
                          disabled
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Email cannot be changed. Contact support for assistance.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="Your phone number"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]/20 focus:border-[#1B3766] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isUpdatingProfile}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 transition-all shadow-sm"
                    >
                      {isUpdatingProfile ? (
                        <><FaSpinner className="animate-spin text-xs" /> Saving...</>
                      ) : (
                        <><FaSave className="text-xs" /> Save Changes</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#1B3766] to-[#142952] px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FaBell className="text-white/80" />
                    Notification Preferences
                  </h2>
                  <p className="text-white/60 text-xs mt-1">
                    Choose what notifications you want to receive
                  </p>
                </div>

                <div className="p-6">
                  {notifLoading ? (
                    <div className="flex justify-center py-12">
                      <FaSpinner className="animate-spin text-3xl text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Content Type Notifications */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Content Updates</h3>
                        <div className="space-y-3">
                          {['articles', 'magazines', 'videos'].map((type) => (
                            <div key={type} className="bg-gray-50 rounded-xl p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium text-gray-700 capitalize">
                                    New {type}
                                  </span>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    Get notified when new {type} are published
                                  </p>
                                </div>
                                <button
                                  onClick={() => toggleEnabled(type)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    prefs[type]?.enabled ? 'bg-[#1B3766]' : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      prefs[type]?.enabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                              {prefs[type]?.enabled && (
                                <label className="mt-3 flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={prefs[type]?.fromFollowingOnly || false}
                                    onChange={() => toggleFollowingOnly(type)}
                                    className="rounded border-gray-300 text-[#1B3766] focus:ring-[#1B3766]"
                                  />
                                  Only from people I follow
                                </label>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Social Notifications */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Social Updates</h3>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                New followers
                              </span>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Get notified when someone follows you
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setPrefs((prev) => ({
                                  ...prev,
                                  followers: { enabled: !prev.followers.enabled },
                                }))
                              }
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                prefs.followers?.enabled ? 'bg-[#1B3766]' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  prefs.followers?.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={handleDiscardNotif}
                          className="px-5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Reset
                        </button>
                        <button
                          onClick={handleSaveNotif}
                          disabled={isUpdatingNotif}
                          className="flex items-center gap-2 px-6 py-2 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 transition-all shadow-sm"
                        >
                          {isUpdatingNotif ? (
                            <><FaSpinner className="animate-spin text-xs" /> Saving...</>
                          ) : (
                            <><FaSave className="text-xs" /> Save Preferences</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Section - Simplified */}
            {activeSection === 'security' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#1B3766] to-[#142952] px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FaShieldAlt className="text-white/80" />
                    Security
                  </h2>
                  <p className="text-white/60 text-xs mt-1">
                    Manage your account security
                  </p>
                </div>

                <div className="p-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Change Password</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Update your password to keep your account secure
                        </p>
                      </div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-all shadow-sm"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone Section */}
            {activeSection === 'danger' && (
              <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FaExclamationTriangle className="text-white/80" />
                    Danger Zone
                  </h2>
                  <p className="text-white/60 text-xs mt-1">
                    Irreversible actions - proceed with caution
                  </p>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {/* Logout Button */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">Logout</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Sign out of your account on this device
                          </p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-5 py-2 bg-gray-600 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-all shadow-sm"
                        >
                          <FaSignOutAlt className="text-xs" />
                          Logout
                        </button>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-red-800">Delete Account</h3>
                          <p className="text-xs text-red-600 mt-0.5">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="flex items-center gap-2 px-5 py-2 border-2 border-red-600 text-red-600 rounded-xl text-sm font-medium hover:bg-red-600 hover:text-white transition-all"
                        >
                          <FaTrashAlt className="text-xs" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
      <DeleteAccountModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={handleDeleteAccount}
      />

      <BiizzedBottomBar />
      
      <style>{`
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(20px) scale(0.98); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default BiizzedSettings;