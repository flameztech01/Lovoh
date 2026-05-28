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
  FaHeart,
  FaComment,
  FaUserCheck,
  FaRegClock,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '../slices/notificationApiSlice';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';
import { toast } from 'react-toastify';

const iconMap = {
  article: FaNewspaper,
  magazine: FaBookOpen,
  video: FaVideo,
  follow: FaUserPlus,
  unfollow: FaUserMinus,
  like: FaHeart,
  comment: FaComment,
  system: FaBell,
};

const colorMap = {
  article: 'text-blue-500 bg-blue-50',
  magazine: 'text-purple-500 bg-purple-50',
  video: 'text-red-500 bg-red-50',
  follow: 'text-green-500 bg-green-50',
  unfollow: 'text-orange-500 bg-orange-50',
  like: 'text-pink-500 bg-pink-50',
  comment: 'text-teal-500 bg-teal-50',
  system: 'text-gray-500 bg-gray-50',
};

const bgColorMap = {
  article: 'border-l-blue-500',
  magazine: 'border-l-purple-500',
  video: 'border-l-red-500',
  follow: 'border-l-green-500',
  unfollow: 'border-l-orange-500',
  like: 'border-l-pink-500',
  comment: 'border-l-teal-500',
  system: 'border-l-gray-500',
};

const BiizzedNotifications = () => {
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
        refetch();
      } catch (error) {
        console.error('Failed to mark as read');
      }
    }

    // Navigate based on type
    if (notif.type === 'article') {
      const slug = notif.data?.slug || notif.data?.articleSlug;
      if (slug) navigate(`/articles/${slug}`);
    } 
    else if (notif.type === 'magazine') {
      const slug = notif.data?.slug || notif.data?.magazineSlug;
      if (slug) navigate(`/magazines/${slug}`);
    } 
    else if (notif.type === 'video') {
      const videoId = notif.data?.contentId || notif.data?.videoId;
      if (videoId) navigate(`/videos/${videoId}`);
    } 
    else if (notif.type === 'follow' || notif.type === 'unfollow') {
      // Navigate to user profile by username
      const username = notif.data?.followerUsername || 
                       notif.data?.username || 
                       notif.data?.userName;
      
      if (username) {
        navigate(`/user/${username}`);
      } else {
        // If no username, try to use ID as fallback (for old notifications)
        const userId = notif.data?.followerId || notif.data?.userId;
        if (userId) {
          navigate(`/user/${userId}`);
        } else {
          toast.info('Cannot navigate to profile - username missing');
        }
      }
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper to extract follower info from notification
  const getFollowerInfo = (notif) => {
    if (notif.type !== 'follow' && notif.type !== 'unfollow') return null;
    
    return {
      username: notif.data?.followerUsername || notif.data?.username || notif.data?.userName,
      name: notif.data?.followerName || notif.data?.userName || 'Someone',
      avatar: notif.data?.followerAvatar || notif.data?.userAvatar || null,
    };
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BiizzedArticlesNavbar />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-20 h-20 bg-[#1B3766]/10 rounded-full flex items-center justify-center mb-4">
            <FaBell className="text-3xl text-[#1B3766]" />
          </div>
          <p className="text-gray-500 mb-4">Login to view notifications</p>
          <Link
            to="/login"
            className="px-6 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-colors shadow-sm"
          >
            Login
          </Link>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BiizzedArticlesNavbar />

      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] transition-colors group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-0.5 transition-transform" /> 
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <FaBell className="text-xl text-[#1B3766]" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3766] text-white rounded-lg text-xs font-medium hover:bg-[#142952] transition-all shadow-sm"
            >
              <FaCheckDouble className="text-[10px]" />
              Mark all read
            </button>
          )}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-2xl text-[#1B3766]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelopeOpenText className="text-4xl text-[#1B3766]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All caught up!
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              When someone follows you, likes your content, or when new content is published, you'll see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Unread section header */}
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-[#1B3766] rounded-full"></div>
                <p className="text-xs font-semibold text-[#1B3766] uppercase tracking-wide">
                  New ({unreadCount})
                </p>
              </div>
            )}

            {notifications.map((notif) => {
              const Icon = iconMap[notif.type] || FaBell;
              const colorClass = colorMap[notif.type] || 'text-gray-500 bg-gray-50';
              const borderColor = bgColorMap[notif.type] || 'border-l-gray-500';
              const isUnread = !notif.read;
              const followerInfo = getFollowerInfo(notif);
              
              return (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer overflow-hidden ${
                    isUnread ? 'border-l-[3px] ' + borderColor : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar for follow/unfollow notifications */}
                      {(notif.type === 'follow' || notif.type === 'unfollow') && followerInfo ? (
                        followerInfo.avatar ? (
                          <img
                            src={followerInfo.avatar}
                            alt={followerInfo.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              const fallback = e.target.parentElement.querySelector('.fallback-avatar');
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null
                      ) : (
                        <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="text-lg" />
                        </div>
                      )}
                      
                      {/* Fallback avatar for follow/unfollow */}
                      {(notif.type === 'follow' || notif.type === 'unfollow') && followerInfo && (
                        <div 
                          className="fallback-avatar w-12 h-12 rounded-full bg-gradient-to-br from-[#1B3766] to-[#142952] text-white flex items-center justify-center text-lg font-bold shadow-sm flex-shrink-0"
                          style={{ display: followerInfo.avatar ? 'none' : 'flex' }}
                        >
                          {(followerInfo.name?.[0] || 'U').toUpperCase()}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        {/* Message */}
                        <p className={`text-sm ${isUnread ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                          {notif.message}
                        </p>
                        
                        {/* Time and status */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <FaRegClock className="text-[9px]" />
                            {formatTime(notif.createdAt)}
                          </span>
                          {isUnread && (
                            <span className="flex items-center gap-1 text-xs text-[#1B3766] font-medium">
                              <FaCircle className="text-[6px] fill-current" />
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Follow/Unfollow indicator */}
                      {(notif.type === 'follow' || notif.type === 'unfollow') && (
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full ${
                            notif.type === 'follow' ? 'bg-green-100' : 'bg-orange-100'
                          } flex items-center justify-center`}>
                            {notif.type === 'follow' ? (
                              <FaUserCheck className="text-green-600 text-xs" />
                            ) : (
                              <FaUserMinus className="text-orange-600 text-xs" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading more indicator */}
        {isFetching && (
          <div className="flex justify-center py-4 mt-4">
            <FaSpinner className="animate-spin text-sm text-[#1B3766]" />
          </div>
        )}
        
        {/* Footer note */}
        {notifications.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-6">
            You're all caught up! 🎉
          </p>
        )}
      </div>

      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedNotifications;