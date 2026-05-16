// adminScreen/AdminDashboard.jsx
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FaAd,
  FaUsers,
  FaNewspaper,
  FaBookOpen,
  FaVideo,
  FaEye,
  FaMousePointer,
  FaSpinner,
} from 'react-icons/fa';
import { useGetAllMessagesQuery } from '../slices/adminApiSlice';
import { useGetMagazineStatsQuery } from '../slices/magApiSlice';
import { useGetAdStatsQuery } from '../slices/adsApiSlice';
import { useGetAllSubscribersQuery } from '../slices/subscribeApiSlice';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);

  // Fetch data
  const { data: messagesData, isLoading: messagesLoading } = useGetAllMessagesQuery();
  const { data: magazineStats, isLoading: magazineStatsLoading } = useGetMagazineStatsQuery();
  const { data: adStats, isLoading: adStatsLoading } = useGetAdStatsQuery();
  const { data: subscribersData, isLoading: subscribersLoading } = useGetAllSubscribersQuery({ page: 1, limit: 1 });

  // Redirect if not admin
  useEffect(() => {
    if (!adminInfo) {
      navigate('/admin/login');
    }
  }, [adminInfo, navigate]);

  if (!adminInfo) return null;

  const isLoading = messagesLoading || magazineStatsLoading || adStatsLoading || subscribersLoading;

  // Stats cards data
  const stats = [
    {
      title: 'Active Ads',
      value: adStats?.totalActive || 0,
      icon: FaAd,
      color: 'bg-blue-500',
      link: '/admin/ads',
    },
    {
      title: 'Subscribers',
      value: subscribersData?.total || 0,
      icon: FaUsers,
      color: 'bg-green-500',
      link: '/admin/subscribers',
    },
    {
      title: 'Articles',
      value: magazineStats?.stats?.published || 0,
      icon: FaNewspaper,
      color: 'bg-purple-500',
      link: '/admin/articles',
    },
    {
      title: 'Magazines',
      value: magazineStats?.stats?.published || 0,
      icon: FaBookOpen,
      color: 'bg-orange-500',
      link: '/admin/magazines',
    },
    {
      title: 'Videos',
      value: 0,
      icon: FaVideo,
      color: 'bg-red-500',
      link: '/admin/videos',
    },
    {
      title: 'Total Ad Views',
      value: adStats?.totalViews || 0,
      icon: FaEye,
      color: 'bg-teal-500',
      link: '/admin/ads',
    },
    {
      title: 'Total Ad Clicks',
      value: adStats?.totalClicks || 0,
      icon: FaMousePointer,
      color: 'bg-indigo-500',
      link: '/admin/ads',
    },
  ];

  const recentMessages = messagesData?.slice(0, 5) || [];

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {adminInfo.username}</p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-3xl text-[#1B3766]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.slice(0, 4).map((stat) => (
              <div
                key={stat.title}
                onClick={() => navigate(stat.link)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                    <stat.icon className="text-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            {stats.slice(4, 7).map((stat) => (
              <div
                key={stat.title}
                onClick={() => navigate(stat.link)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                    <stat.icon className="text-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Contact Messages</h2>
              <button
                onClick={() => navigate('/admin/messages')}
                className="text-sm text-[#1B3766] hover:underline"
              >
                View all
              </button>
            </div>
            {recentMessages.length === 0 ? (
              <p className="text-gray-500 text-sm">No messages yet.</p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`/admin/messages/${msg._id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {msg.name} - {msg.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{msg.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!msg.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;