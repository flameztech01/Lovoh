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
} from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import {
  useGetProfileInfoQuery,
  useUpdateProfileMutation,
} from '../slices/userApiSlice';
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '../slices/notificationApiSlice';

import BizzzedArticlesNavbar from '../components/BizzzedArticlesNavbar';
import BizzzedBottomBar from '../components/BizzzedBottomBar';

const BizzzedSettings = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // ---------- Profile state ----------
  const [editName, setEditName] = useState(userInfo?.name || '');
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState('');

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetProfileInfoQuery(undefined, { skip: !userInfo });

  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();

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

  // ---------- Profile handlers ----------
  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      if (profilePic) formData.append('profile', profilePic);

      await updateProfile(formData).unwrap();
      toast.success('Profile updated');
      refetchProfile();
      if (preview) URL.revokeObjectURL(preview);
      setProfilePic(null);
      setPreview('');
      // Optionally update local Redux userInfo (but we rely on next fetch)
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

  // Discard changes for notifications (reset to server state)
  const handleDiscardNotif = () => {
    if (notifPrefs?.preferences) {
      setPrefs(notifPrefs.preferences);
    }
  };

  const currentPic = preview || profile?.profile || '';

  return (
    <div className="min-h-screen bg-gray-100">
      <BizzzedArticlesNavbar />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft /> <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <div className="w-16" /> {/* spacer */}
        </div>

        {/* ---------- Profile Section ---------- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaUserCircle className="text-[#1B3766]" />
            Profile
          </h2>

          {/* Profile picture */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              {currentPic ? (
                <img
                  src={currentPic}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-3xl font-bold">
                  {(profile?.name || 'U')[0].toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#1B3766] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#142952] transition-colors shadow">
                <FaCamera className="text-xs" />
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
                className="text-xs text-red-500 mt-1 hover:underline"
              >
                Remove new photo
              </button>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Click the camera to change photo
            </p>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent"
            />
          </div>

          {/* Save profile button */}
          <div className="text-right">
            <button
              onClick={handleSaveProfile}
              disabled={isUpdatingProfile}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-colors disabled:opacity-50"
            >
              {isUpdatingProfile ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <FaSave className="text-xs" />
              )}
              {isUpdatingProfile ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* ---------- Notification Preferences ---------- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaBell className="text-[#1B3766]" />
            Notification Preferences
          </h2>

          {notifLoading ? (
            <div className="flex justify-center py-6">
              <FaSpinner className="animate-spin text-xl text-gray-400" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Toggle for each content type */}
              {['articles', 'magazines', 'videos'].map((type) => (
                <div key={type} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {type}
                    </span>
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
                    <label className="ml-2 flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
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

              {/* Followers toggle */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-medium text-gray-700">
                  New followers
                </span>
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

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleDiscardNotif}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={handleSaveNotif}
                  disabled={isUpdatingNotif}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-colors disabled:opacity-50"
                >
                  {isUpdatingNotif ? (
                    <FaSpinner className="animate-spin text-xs" />
                  ) : (
                    <FaSave className="text-xs" />
                  )}
                  {isUpdatingNotif ? 'Saving…' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BizzzedBottomBar />
    </div>
  );
};

export default BizzzedSettings;