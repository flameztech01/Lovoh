import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEnvelopeOpenText,
  FaBell,
  FaNewspaper,
  FaBookOpen,
  FaVideo,
  FaUserPlus,
  FaUserMinus,
  FaCheckDouble,
  FaSpinner,
  FaCircle,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '../slices/notificationApiSlice';
import BizzzedArticlesNavbar from '../components/BizzzedArticlesNavbar';
import BizzzedBottomBar from '../components/BizzzedBottombar';
import { toast } from 'react-toastify';

const iconMap = {
  article: FaNewspaper,
  magazine: FaBookOpen,
  video: FaVideo,
  follow: FaUserPlus,
  unfollow: FaUserMinus,
  system: FaBell,
};

const colorMap = {
  article: 'text-blue-500',
  magazine: 'text-purple-500',
  video: 'text-red-500',
  follow: 'text-green-500',
  unfollow: 'text-orange-500',
  system: 'text-gray-500',
};

const BizzzedNotifications = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data, isLoading, isFetching, refetch } = useGetNotificationsQuery(
    { page: 1, limit: 50 },
    { skip: !userInfo }
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleMarkAll = async () => {
    try {
      await markAllRead().unwrap();
      toast.success('All notifications marked as read');
      refetch();
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read
    if (!notif.read) {
      try {
        await markRead(notif._id).unwrap();
      } catch (error) {
        console.error('Failed to mark as read');
      }
    }

    // Navigate based on type
    if (notif.type === 'article' || notif.type === 'magazine') {
      navigate(`/biizzed/${notif.data?.slug || ''}`);
    } else if (notif.type === 'video') {
      navigate(`/biizzed/videos/${notif.data?.contentId || ''}`);
    } else if (notif.type === 'follow' || notif.type === 'unfollow') {
      // Could navigate to follower's profile, but we don't store followerId in data yet
      // For now, stay on the page
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BizzzedArticlesNavbar />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <FaBell className="text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Login to view notifications</p>
          <Link
            to="/biizzed/login"
            className="px-6 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium"
          >
            Login
          </Link>
        </div>
        <BizzzedBottomBar />
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1B3766] text-white rounded-full text-sm font-medium hover:bg-[#142952] transition-colors"
            >
              <FaCheckDouble className="text-xs" />
              Mark all read
            </button>
          )}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-2xl text-gray-400" />
          </div>
        ) : notifications.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
            <FaEnvelopeOpenText className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              No notifications yet
            </h3>
            <p className="text-sm text-gray-400">
              New likes, comments, follows, and content from people you follow
              will appear here.
            </p>
          </div>
        ) : (
          /* Notifications list */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {notifications.map((notif) => {
              const Icon = iconMap[notif.type] || FaBell;
              const color = colorMap[notif.type] || 'text-gray-500';
              return (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notif.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className={`mt-1 p-2 rounded-full bg-gray-100 ${color}`}>
                    <Icon className="text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {formatTime(notif.createdAt)}
                      </span>
                      {!notif.read && (
                        <span className="flex items-center gap-1 text-xs text-blue-500 font-medium">
                          <FaCircle className="text-[6px]" /> New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isFetching && (
          <div className="flex justify-center py-4">
            <FaSpinner className="animate-spin text-sm text-gray-400" />
          </div>
        )}
      </div>

      <BizzzedBottomBar />
    </div>
  );
};

export default BizzzedNotifications;