// adminScreen/AdminAnalytics.jsx
import React, { useState } from 'react';
import {
  FaUsers,
  FaNewspaper,
  FaBookOpen,
  FaVideo,
  FaEye,
  FaMousePointer,
  FaChartLine,
  FaEnvelope,
  FaCalendarAlt,
  FaSpinner,
} from 'react-icons/fa';
import { useGetMagazineStatsQuery } from '../slices/magApiSlice';
import { useGetAdStatsQuery } from '../slices/adsApiSlice';
import { useGetAllSubscribersQuery } from '../slices/subscribeApiSlice';
import { useGetArticlesQuery } from '../slices/articlesApiSlice';
import { useGetVideosQuery } from '../slices/videoApiSlice';
import { useSelector } from 'react-redux';

const AdminAnalytics = () => {
  // Fetch data
  const { data: magazineStats, isLoading: magLoading } = useGetMagazineStatsQuery();
  const { data: adStats, isLoading: adLoading } = useGetAdStatsQuery();
  const { data: subscribersData, isLoading: subLoading } = useGetAllSubscribersQuery({ limit: 1 }); // just get total count
  const { data: articlesData, isLoading: articlesLoading } = useGetArticlesQuery({ status: 'published,coming_soon,draft', limit: 1 });
  const { data: videosData, isLoading: videosLoading } = useGetVideosQuery({ limit: 1 });

  const isLoading = magLoading || adLoading || subLoading || articlesLoading || videosLoading;

  // Extract totals
  const totalMagazines = magazineStats?.stats ? Object.values(magazineStats.stats).reduce((a, b) => a + b, 0) : 0;
  const publishedMagazines = magazineStats?.stats?.published || 0;
  const comingSoonMagazines = magazineStats?.stats?.coming_soon || 0;
  
  const totalArticles = articlesData?.total || 0;
  const publishedArticles = articlesData?.articles?.filter(a => a.status === 'published').length || 0;
  
  const totalVideos = videosData?.total || 0;
  
  const totalSubscribers = subscribersData?.total || 0;
  
  const totalAdViews = adStats?.totalViews || 0;
  const totalAdClicks = adStats?.totalClicks || 0;
  const ctr = totalAdViews > 0 ? ((totalAdClicks / totalAdViews) * 100).toFixed(1) : 0;
  const activeAds = adStats?.totalActive || 0;

  // Content breakdown
  const contentBreakdown = [
    { label: 'Articles', value: totalArticles, icon: FaNewspaper, color: 'bg-blue-500' },
    { label: 'Magazines', value: totalMagazines, icon: FaBookOpen, color: 'bg-green-500' },
    { label: 'Videos', value: totalVideos, icon: FaVideo, color: 'bg-red-500' },
  ];

  // Magazine status breakdown
  const magStatusBreakdown = [
    { label: 'Published', value: publishedMagazines, color: 'bg-green-500' },
    { label: 'Coming Soon', value: comingSoonMagazines, color: 'bg-orange-500' },
    { label: 'Draft', value: (totalMagazines - publishedMagazines - comingSoonMagazines) || 0, color: 'bg-gray-500' },
  ];

  // Article status breakdown (if we had counts per status, but we only have total and published approx)
  const articleStatus = [
    { label: 'Published', value: publishedArticles, color: 'bg-green-500' },
    { label: 'Other (Draft/CS)', value: totalArticles - publishedArticles, color: 'bg-gray-500' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of platform performance and content metrics</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-3xl text-[#1B3766]" />
        </div>
      ) : (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSubscribers.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Content</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(totalArticles + totalMagazines + totalVideos).toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FaChartLine className="text-indigo-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {totalArticles} articles, {totalMagazines} magazines, {totalVideos} videos
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ad Performance</p>
                  <p className="text-2xl font-bold text-gray-900">{activeAds} active</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaEye className="text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {totalAdViews.toLocaleString()} views • {totalAdClicks.toLocaleString()} clicks • {ctr}% CTR
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Views (Magazines)</p>
                  <p className="text-2xl font-bold text-gray-900">{magazineStats?.totalViews?.toLocaleString() || 0}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FaEye className="text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Content Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaChartLine className="text-[#1B3766]" /> Content Breakdown
              </h3>
              <div className="space-y-3">
                {contentBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <item.icon className="text-gray-400 text-xs" /> {item.label}
                      </span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${item.color} h-2.5 rounded-full`}
                        style={{ width: `${(item.value / (totalArticles + totalMagazines + totalVideos)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Magazine Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaBookOpen className="text-[#1B3766]" /> Magazine Status
              </h3>
              <div className="space-y-3">
                {magStatusBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${item.color} h-2.5 rounded-full`}
                        style={{ width: `${(item.value / totalMagazines) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Second Row - Article Status & Subscriber Growth (placeholder) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaNewspaper className="text-[#1B3766]" /> Article Status
              </h3>
              <div className="space-y-3">
                {articleStatus.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${item.color} h-2.5 rounded-full`}
                        style={{ width: `${(item.value / totalArticles) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ad Performance Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMousePointer className="text-[#1B3766]" /> Ad Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Views</span>
                  <span className="text-lg font-bold text-gray-900">{totalAdViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Clicks</span>
                  <span className="text-lg font-bold text-gray-900">{totalAdClicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Click‑Through Rate (CTR)</span>
                  <span className="text-lg font-bold text-blue-600">{ctr}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Ads</span>
                  <span className="text-lg font-bold text-green-600">{activeAds}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Table (optional) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 text-sm font-medium text-gray-600">Total Users</td>
                    <td className="py-2 text-sm text-gray-900">—</td>
                    <td className="py-2 text-xs text-gray-400">(User stats endpoint pending)</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 text-sm font-medium text-gray-600">Total Subscribers</td>
                    <td className="py-2 text-sm text-gray-900">{totalSubscribers}</td>
                    <td className="py-2 text-xs text-gray-400">Active email subscribers</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 text-sm font-medium text-gray-600">Total Content Items</td>
                    <td className="py-2 text-sm text-gray-900">{totalArticles + totalMagazines + totalVideos}</td>
                    <td className="py-2 text-xs text-gray-400">Articles + Magazines + Videos</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 text-sm font-medium text-gray-600">Total Ad Interactions</td>
                    <td className="py-2 text-sm text-gray-900">{totalAdViews + totalAdClicks}</td>
                    <td className="py-2 text-xs text-gray-400">Views + Clicks</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;