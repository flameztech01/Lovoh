// screens/CustomFormAnalytics.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaSpinner, FaEye, FaClipboardList,
  FaChartBar, FaChartLine, FaChartPie, FaUsers,
  FaClock, FaMobileAlt, FaDesktop, FaTablet,
  FaCheckCircle, FaTimesCircle, FaMinusCircle,
} from 'react-icons/fa';
import { useGetMyCustomFormsQuery, useGetCustomFormAnalyticsQuery } from '../slices/customFormApiSlice';
import CustomFormSidebar from '../components/CustomFormSidebar';

const CustomFormAnalytics = () => {
  const navigate = useNavigate();
  const [selectedFormId, setSelectedFormId] = useState('');

  const { data: formsData } = useGetMyCustomFormsQuery({ sort: '-updatedAt', limit: 50 });
  const forms = formsData?.forms || [];

  const { data: analyticsData, isLoading } = useGetCustomFormAnalyticsQuery(selectedFormId, {
    skip: !selectedFormId,
  });

  const analytics = analyticsData?.analytics || {};
  const formInfo = analyticsData?.form || {};

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toLocaleString();
  };

  const getPercentage = (part, total) => {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100);
  };

  const deviceIcons = {
    desktop: FaDesktop,
    mobile: FaMobileAlt,
    tablet: FaTablet,
    other: FaMinusCircle,
  };

  const deviceColors = {
    desktop: 'bg-blue-500',
    mobile: 'bg-green-500',
    tablet: 'bg-purple-500',
    other: 'bg-gray-400',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomFormSidebar />

      <div className="lg:ml-[280px] p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
              <FaArrowLeft className="text-sm" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-500">{formInfo.title || 'Select a form to view analytics'}</p>
            </div>
          </div>
        </div>

        {/* Form Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <select
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
          >
            <option value="">Select a form...</option>
            {forms.map((form) => (
              <option key={form._id} value={form._id}>
                {form.title} ({form.submissions || 0} submissions)
              </option>
            ))}
          </select>
        </div>

        {!selectedFormId ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
            <FaChartBar className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Form</h3>
            <p className="text-gray-500">Choose a form above to view its analytics</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={FaEye} label="Total Views" value={formatNumber(formInfo.views)} color="bg-blue-50 text-blue-600" />
              <StatCard icon={FaClipboardList} label="Submissions" value={formatNumber(formInfo.submissions)} color="bg-purple-50 text-purple-600" />
              <StatCard icon={FaChartLine} label="Conversion Rate" value={`${formInfo.conversionRate || 0}%`} color="bg-green-50 text-green-600" />
              <StatCard icon={FaClock} label="Avg Time" value={analytics.averageTimeTaken ? `${Math.round(analytics.averageTimeTaken / 60)}m` : '0m'} color="bg-orange-50 text-orange-600" />
            </div>

            {/* Completion Rate */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Completion Rate</h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#1B3766" strokeWidth="3" strokeDasharray={`${analytics.completionRate?.rate || 0}, 100`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900">{analytics.completionRate?.rate || 0}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <CompletionItem icon={FaCheckCircle} label="Completed" count={analytics.completionRate?.completed || 0} color="text-green-500" />
                  <CompletionItem icon={FaMinusCircle} label="Started" count={analytics.completionRate?.started || 0} color="text-yellow-500" />
                  <CompletionItem icon={FaTimesCircle} label="Abandoned" count={analytics.completionRate?.abandoned || 0} color="text-red-500" />
                </div>
              </div>

              {/* Devices */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Devices</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.devices || {}).map(([device, count]) => {
                    const Icon = deviceIcons[device] || FaMinusCircle;
                    const total = Object.values(analytics.devices || {}).reduce((a, b) => a + b, 0);
                    const percent = getPercentage(count, total);
                    return (
                      <div key={device}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Icon className="text-gray-500 text-sm" />
                            <span className="text-sm text-gray-700 capitalize">{device}</span>
                          </div>
                          <span className="text-sm text-gray-500">{count} ({percent}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${deviceColors[device] || 'bg-gray-400'}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily Submissions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Daily Submissions</h3>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {Object.entries(analytics.dailySubmissions || {}).slice(-14).map(([date, count]) => (
                    <div key={date} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-[#1B3766] h-1.5 rounded-full" style={{ width: `${Math.min((count / Math.max(...Object.values(analytics.dailySubmissions || {1:1}))) * 100, 100)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-4 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
        <Icon />
      </div>
    </div>
  </div>
);

const CompletionItem = ({ icon: Icon, label, count, color }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon className={`${color} text-sm`} />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-medium text-gray-900">{count}</span>
  </div>
);

export default CustomFormAnalytics;