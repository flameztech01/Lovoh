// screens/AdminAds.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaSearch,
  FaTimes,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaImage,
  FaVideo,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaSpinner,
  FaPlay,
  FaPause,
  FaArchive,
  FaCheckCircle,
  FaCalendarAlt,
  FaChartLine,
  FaGlobe,
  FaTag,
  FaAd,
  FaBullhorn,
  FaClock,
  FaStore,
  FaApple,
  FaNewspaper,
  FaCalendar,
  FaPaintBrush,
  FaCopy,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle
} from 'react-icons/fa';
import {
  useGetAllAdsQuery,
  useDeleteAdMutation,
  useUpdateAdStatusMutation,
  useBulkDeleteAdsMutation,
  useBulkUpdateStatusMutation,
  useGetAdStatsQuery,
} from '../slices/adsApiSlice';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import AdminSidebar from '../adminComponents/AdminSidebar';
import { format } from 'date-fns';

const AdminAds = () => {
  const { adminInfo } = useSelector((state) => state.auth);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState('');
  const [selectedPlacement, setSelectedPlacement] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [adToDelete, setAdToDelete] = useState(null);
  const [selectedAds, setSelectedAds] = useState([]);
  const itemsPerPage = 12;

  // Fetch data - FIXED QUERY PARAMS
  const { data: adsData, isLoading, refetch, error, isError } = useGetAllAdsQuery({
    pageName: selectedPage || undefined,        // For filtering by site (uduua, thefruiit, etc.)
    placement: selectedPlacement || undefined,
    status: statusFilter || undefined,
    mediaType: mediaTypeFilter || undefined,
    search: searchTerm || undefined,
    page: currentPage,                          // For pagination
    limit: itemsPerPage,
    sortBy,
    sortOrder,
  });

  const { data: statsData } = useGetAdStatsQuery();

  const [deleteAd] = useDeleteAdMutation();
  const [updateStatus] = useUpdateAdStatusMutation();
  const [bulkDelete] = useBulkDeleteAdsMutation();
  const [bulkUpdateStatus] = useBulkUpdateStatusMutation();

  const ads = adsData?.ads || [];
  const totalPages = adsData?.pages || 1;
  const totalAds = adsData?.total || 0;
  const stats = statsData || {};

  // Debug logging
  if (isError) {
    console.error('API Error:', error);
  }

  // Page options with icons
  const pageOptions = [
    { value: 'uduua', label: 'Úduua', icon: FaStore, color: 'bg-blue-100 text-blue-700' },
    { value: 'thefruiit', label: 'The Fruiit', icon: FaApple, color: 'bg-green-100 text-green-700' },
    { value: 'bizzed', label: 'Bizzed', icon: FaNewspaper, color: 'bg-purple-100 text-purple-700' },
    { value: 'events', label: 'Events', icon: FaCalendar, color: 'bg-orange-100 text-orange-700' },
    { value: 'lovohcreate', label: 'Lovoh Create', icon: FaPaintBrush, color: 'bg-pink-100 text-pink-700' },
  ];

  // Placement options
  const placementOptions = [
    { value: 'hero', label: 'Hero Slider' },
    { value: 'featured', label: 'Featured Section' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'banner', label: 'Banner' },
    { value: 'product-page', label: 'Product Page' },
    { value: 'cart', label: 'Cart Page' },
    { value: 'checkout', label: 'Checkout Page' },
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700', icon: FaPlay },
    { value: 'paused', label: 'Paused', color: 'bg-yellow-100 text-yellow-700', icon: FaPause },
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FaArchive },
    { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-700', icon: FaClock },
  ];

  // Media type options
  const mediaTypeOptions = [
    { value: 'image', label: 'Image', icon: FaImage },
    { value: 'video', label: 'Video', icon: FaVideo },
    { value: 'both', label: 'Image & Video', icon: FaAd },
  ];

  const getPageInfo = (page) => {
    return pageOptions.find(p => p.value === page) || { label: page, color: 'bg-gray-100 text-gray-700' };
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.value === status) || { label: status, color: 'bg-gray-100 text-gray-700', icon: FaExclamationTriangle };
  };

  const getMediaTypeInfo = (type) => {
    return mediaTypeOptions.find(m => m.value === type) || { label: type, icon: FaAd };
  };

  const getPlacementLabel = (placement) => {
    return placementOptions.find(p => p.value === placement)?.label || placement;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAds(ads.map(ad => ad._id));
    } else {
      setSelectedAds([]);
    }
  };

  const handleSelectAd = (id) => {
    setSelectedAds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Ad ${status}`);
      refetch();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAd(id).unwrap();
      toast.success('Ad deleted successfully');
      setAdToDelete(null);
      refetch();
    } catch (error) {
      toast.error('Failed to delete ad');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAds.length === 0) {
      toast.error('No ads selected');
      return;
    }
    if (window.confirm(`Delete ${selectedAds.length} ads?`)) {
      try {
        await bulkDelete(selectedAds).unwrap();
        toast.success(`${selectedAds.length} ads deleted`);
        setSelectedAds([]);
        refetch();
      } catch (error) {
        toast.error('Failed to delete ads');
      }
    }
  };

  const handleBulkStatus = async (status) => {
    if (selectedAds.length === 0) {
      toast.error('No ads selected');
      return;
    }
    try {
      await bulkUpdateStatus({ ids: selectedAds, status }).unwrap();
      toast.success(`${selectedAds.length} ads updated to ${status}`);
      setSelectedAds([]);
      refetch();
    } catch (error) {
      toast.error('Failed to update ads');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPage('');
    setSelectedPlacement('');
    setStatusFilter('');
    setMediaTypeFilter('');
    setCurrentPage(1);
  };

  const duplicateAd = (ad) => {
    // Navigate to create page with prefilled data
    window.location.href = '/admin/ads/new';
  };

  return (
    <AdminSidebar>
      <div className="px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Ads Manager</h1>
            <p className="text-gray-500 text-sm mt-1">Manage advertisements across all pages</p>
          </div>
          <button
            onClick={() => window.location.href = '/admin/ads/new'}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-lg font-medium transition-colors"
          >
            <FaPlus className="text-sm" />
            Create New Ad
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Ads</p>
                <p className="text-2xl font-bold text-gray-900">{totalAds}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <FaBullhorn className="text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalActive || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <FaPlay className="text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Views</p>
                <p className="text-2xl font-bold text-purple-600">{formatNumber(stats.totalViews || 0)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <FaEye className="text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Clicks</p>
                <p className="text-2xl font-bold text-orange-600">{formatNumber(stats.totalClicks || 0)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <FaChartLine className="text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Avg CTR</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avgCtr?.toFixed(1) || 0}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <FaChartLine className="text-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search ads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-sm" />
                </button>
              )}
            </div>

            {/* Sort By */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC]"
              >
                <option value="createdAt">Date</option>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
                <option value="views">Views</option>
                <option value="clicks">Clicks</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'desc' ? <FaSortAmountDown className="text-sm" /> : <FaSortAmountUp className="text-sm" />}
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
            >
              <FaFilter className="text-sm" />
              Filters
              {(selectedPage || selectedPlacement || statusFilter || mediaTypeFilter) && (
                <span className="w-5 h-5 rounded-full bg-[#0043FC] text-white text-xs flex items-center justify-center">
                  {[selectedPage, selectedPlacement, statusFilter, mediaTypeFilter].filter(Boolean).length}
                </span>
              )}
              <FaChevronDown className={`text-xs transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Page</label>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All Pages</option>
                  {pageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Placement</label>
                <select
                  value={selectedPlacement}
                  onChange={(e) => setSelectedPlacement(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All Placements</option>
                  {placementOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All Status</option>
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Media Type</label>
                <select
                  value={mediaTypeFilter}
                  onChange={(e) => setMediaTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All Types</option>
                  {mediaTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#0043FC] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-lg" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error Loading Ads</h3>
                <p className="text-sm text-red-600">{error?.data?.message || error?.message || 'Failed to load ads'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedAds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-blue-700">
              <strong>{selectedAds.length}</strong> ad{selectedAds.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkStatus('active')}
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 flex items-center gap-1"
              >
                <FaPlay className="text-xs" />
                Activate
              </button>
              <button
                onClick={() => handleBulkStatus('paused')}
                className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600 flex items-center gap-1"
              >
                <FaPause className="text-xs" />
                Pause
              </button>
              <button
                onClick={() => handleBulkStatus('archived')}
                className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-medium hover:bg-gray-600 flex items-center gap-1"
              >
                <FaArchive className="text-xs" />
                Archive
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 flex items-center gap-1"
              >
                <FaTrashAlt className="text-xs" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Ads Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="text-3xl text-[#0043FC] animate-spin" />
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FaBullhorn className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No ads found</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-[#0043FC] border border-[#0043FC] rounded-lg hover:bg-[#0043FC] hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="mb-3 flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedAds.length === ads.length && ads.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
              />
              <span className="text-sm text-gray-500">Select all</span>
            </div>

            {/* Ads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {ads.map((ad) => {
                const pageInfo = getPageInfo(ad.pages?.[0]);
                const statusInfo = getStatusInfo(ad.status);
                const StatusIcon = statusInfo.icon;
                const mediaInfo = getMediaTypeInfo(ad.mediaType);
                const MediaIcon = mediaInfo.icon;

                return (
                  <div
                    key={ad._id}
                    className={`bg-white rounded-xl border transition-all ${
                      selectedAds.includes(ad._id)
                        ? 'border-[#0043FC] shadow-md ring-2 ring-[#0043FC]/20'
                        : 'border-gray-200 hover:shadow-md'
                    }`}
                  >
                    {/* Media Preview */}
                    <div className="relative aspect-video rounded-t-xl overflow-hidden bg-gray-100">
                      {ad.mediaType === 'video' ? (
                        <video
                          src={ad.video}
                          poster={ad.thumbnail}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={ad.image}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedAds.includes(ad._id)}
                          onChange={() => handleSelectAd(ad._id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC] bg-white/80"
                        />
                      </div>

                      {/* Media Type Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <MediaIcon className="text-xs" />
                          {mediaInfo.label}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute bottom-2 left-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="text-xs" />
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                          {ad.title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${pageInfo.color}`}>
                          {React.createElement(pageOptions.find(p => p.value === ad.pages?.[0])?.icon || FaGlobe, { className: 'text-xs' })}
                          {pageInfo.label}
                        </span>
                      </div>

                      {ad.subtitle && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{ad.subtitle}</p>
                      )}

                      {/* Placements */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {ad.placements?.slice(0, 2).map((placement, idx) => (
                          <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {getPlacementLabel(placement)}
                          </span>
                        ))}
                        {ad.placements?.length > 2 && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            +{ad.placements.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaEye className="text-gray-400" />
                          {formatNumber(ad.views || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaChartLine className="text-gray-400" />
                          {formatNumber(ad.clicks || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          {ad.ctr || 0}%
                        </span>
                      </div>

                      {/* Schedule */}
                      <div className="flex items-center gap-2 mb-3 text-[10px] text-gray-400">
                        <FaCalendarAlt />
                        <span>
                          {formatDate(ad.startDate)} - {ad.endDate ? formatDate(ad.endDate) : 'Ongoing'}
                        </span>
                      </div>

                      {/* Priority */}
                      <div className="flex items-center gap-1 mb-3">
                        <span className="text-[10px] text-gray-400">Priority:</span>
                        <span className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-1.5 rounded-full ${
                                i < (ad.priority || 1) ? 'bg-[#0043FC]' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => window.location.href = `/admin/ads/${ad._id}`}
                          className="flex-1 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <FaEye className="text-xs" />
                          View
                        </button>
                        <button
                          onClick={() => window.location.href = `/admin/ads/edit/${ad._id}`}
                          className="flex-1 py-1.5 text-xs text-green-600 hover:bg-green-50 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <FaEdit className="text-xs" />
                          Edit
                        </button>
                        <button
                          onClick={() => duplicateAd(ad)}
                          className="flex-1 py-1.5 text-xs text-purple-600 hover:bg-purple-50 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <FaCopy className="text-xs" />
                          Duplicate
                        </button>
                        <div className="relative group">
                          <button className="px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded transition-colors">
                            <FaChevronDown className="text-xs" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] hidden group-hover:block z-10">
                            {ad.status !== 'active' && (
                              <button
                                onClick={() => handleStatusChange(ad._id, 'active')}
                                className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                              >
                                <FaPlay className="text-green-600 text-xs" />
                                Activate
                              </button>
                            )}
                            {ad.status !== 'paused' && (
                              <button
                                onClick={() => handleStatusChange(ad._id, 'paused')}
                                className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                              >
                                <FaPause className="text-yellow-600 text-xs" />
                                Pause
                              </button>
                            )}
                            <button
                              onClick={() => setAdToDelete(ad)}
                              className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                            >
                              <FaTrashAlt className="text-xs" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft className="text-sm" />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#0043FC] text-white'
                          : 'border border-gray-200 text-gray-600 hover:border-[#0043FC] hover:text-[#0043FC]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight className="text-sm" />
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="mt-4 text-center text-xs text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalAds)} of {totalAds} ads
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {adToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrashAlt className="text-xl text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Ad</h3>
              <p className="text-sm text-gray-500 mb-5">
                Are you sure you want to delete "{adToDelete.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setAdToDelete(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(adToDelete._id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
};

export default AdminAds;