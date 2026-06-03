// adminScreen/AdminDashboard.jsx (without messages)
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
import { useGetMagazineStatsQuery } from '../slices/magApiSlice';
import { useGetAdStatsQuery } from '../slices/adsApiSlice';
import { useGetAllSubscribersQuery } from '../slices/subscribeApiSlice';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);

  // Fetch data
  const { data: magazineStats, isLoading: magazineStatsLoading } = useGetMagazineStatsQuery();
  const { data: adStats, isLoading: adStatsLoading } = useGetAdStatsQuery();
  const { data: subscribersData, isLoading: subscribersLoading } = useGetAllSubscribersQuery({ page: 1, limit: 1 });

  // Redirect if not admin
  useEffect(() => {
    if (!adminInfo) {
      navigate('/super_user/login');
    }
  }, [adminInfo, navigate]);

  if (!adminInfo) return null;

  const isLoading = magazineStatsLoading || adStatsLoading || subscribersLoading;

  // Stats cards data
  const stats = [
    {
      title: 'Active Ads',
      value: adStats?.totalActive || 0,
      icon: FaAd,
      color: 'bg-blue-500',
      link: '/super_user/ads',
    },
    {
      title: 'Subscribers',
      value: subscribersData?.total || 0,
      icon: FaUsers,
      color: 'bg-green-500',
      link: '/super_user/subscribers',
    },
    {
      title: 'Articles',
      value: magazineStats?.stats?.published || 0,
      icon: FaNewspaper,
      color: 'bg-purple-500',
      link: '/super_user/articles',
    },
    {
      title: 'Magazines',
      value: magazineStats?.stats?.published || 0,
      icon: FaBookOpen,
      color: 'bg-orange-500',
      link: '/super_user/magazines',
    },
    {
      title: 'Videos',
      value: 0,
      icon: FaVideo,
      color: 'bg-red-500',
      link: '/super_user/videos',
    },
    {
      title: 'Total Ad Views',
      value: adStats?.totalViews || 0,
      icon: FaEye,
      color: 'bg-teal-500',
      link: '/super_user/ads',
    },
    {
      title: 'Total Ad Clicks',
      value: adStats?.totalClicks || 0,
      icon: FaMousePointer,
      color: 'bg-indigo-500',
      link: '/super_user/ads',
    },
  ];

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
        </>
      )}
    </div>
  );
};

export default AdminDashboard;