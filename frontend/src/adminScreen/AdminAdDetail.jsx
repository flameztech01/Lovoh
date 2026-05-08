// screens/AdminAdDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaChartLine,
  FaCalendarAlt,
  FaGlobe,
  FaTag,
  FaBullhorn,
  FaImage,
  FaVideo,
  FaPlay,
  FaPause,
  FaArchive,
  FaSpinner,
  FaStore,
  FaApple,
  FaNewspaper,
  FaCalendar,
  FaPaintBrush,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExternalLinkAlt,
  FaCopy,
  FaChartBar,
  FaMousePointer,
  FaPercentage,
  FaHashtag,
  FaLayerGroup,
  FaPalette,
  FaLink
} from 'react-icons/fa';
import { 
  useGetAdByIdQuery, 
  useDeleteAdMutation,
  useUpdateAdStatusMutation 
} from '../slices/adsApiSlice';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import AdminSidebar from '../adminComponents/AdminSidebar';
import { format } from 'date-fns';

const AdminAdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);

  const { data: ad, isLoading, error, refetch } = useGetAdByIdQuery(id);
  const [deleteAd, { isLoading: isDeleting }] = useDeleteAdMutation();
  const [updateStatus] = useUpdateAdStatusMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = React.useRef(null);

  // Page options with icons
  const pageOptions = {
    uduua: { label: 'Úduua Marketplace', icon: FaStore, color: 'bg-blue-100 text-blue-700' },
    thefruiit: { label: 'The Fruiit', icon: FaApple, color: 'bg-green-100 text-green-700' },
    bizzed: { label: 'Bizzed Magazine', icon: FaNewspaper, color: 'bg-purple-100 text-purple-700' },
    events: { label: 'Events', icon: FaCalendar, color: 'bg-orange-100 text-orange-700' },
    lovohcreate: { label: 'Lovoh Create', icon: FaPaintBrush, color: 'bg-pink-100 text-pink-700' },
  };

  // Placement options
  const placementLabels = {
    hero: 'Hero Slider',
    featured: 'Featured Section',
    sidebar: 'Sidebar',
    banner: 'Banner',
    'product-page': 'Product Page',
    cart: 'Cart Page',
    checkout: 'Checkout Page',
  };

  // Status options
  const statusOptions = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: FaPlay },
    paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-700', icon: FaPause },
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FaArchive },
    expired: { label: 'Expired', color: 'bg-red-100 text-red-700', icon: FaClock },
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM dd, yyyy h:mm a');
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num?.toString() || '0';
  };

  const handleDelete = async () => {
    try {
      await deleteAd(id).unwrap();
      toast.success('Ad deleted successfully');
      navigate('/admin/ads');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete ad');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Ad status updated to ${status}`);
      refetch();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDuplicate = () => {
    navigate('/admin/ads/new', { state: { duplicateFrom: ad } });
  };

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const isExternalUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
  };

  // Loading state
  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaSpinner className="text-4xl text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading ad details...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  // Error state
  if (error || !ad) {
    return (
      <AdminSidebar>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <FaBullhorn className="text-5xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ad Not Found</h2>
            <p className="text-gray-500 mb-4">The ad you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/admin/ads')}
              className="px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0033cc] transition-colors"
            >
              Back to Ads
            </button>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  const status = statusOptions[ad.status] || statusOptions.draft;
  const StatusIcon = status.icon;

  return (
    <AdminSidebar>
      <div className="px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/ads')}
            className="flex items-center gap-2 text-gray-500 hover:text-[#0043FC] mb-3 transition-colors group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Ads</span>
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{ad.title}</h1>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  <StatusIcon className="text-sm" />
                  {status.label}
                </span>
              </div>
              <p className="text-gray-500 text-sm">Ad ID: {ad._id}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/admin/ads/edit/${id}`)}
                className="px-4 py-2 bg-[#0043FC] text-white rounded-lg text-sm font-medium hover:bg-[#0033cc] transition-colors flex items-center gap-2"
              >
                <FaEdit className="text-sm" />
                Edit Ad
              </button>
              <button
                onClick={handleDuplicate}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <FaCopy className="text-sm" />
                Duplicate
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <FaTrashAlt className="text-sm" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Media & Basic Info */}
          <div className="lg:col-span-1 space-y-5">
            {/* Media Preview */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="aspect-video relative bg-gray-100">
                {ad.mediaType === 'video' && ad.video ? (
                  <>
                    <video
                      ref={videoRef}
                      src={ad.video}
                      poster={ad.thumbnail || ad.image}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                    <button
                      onClick={handleVideoToggle}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {isVideoPlaying ? (
                          <FaPause className="text-2xl text-gray-900" />
                        ) : (
                          <FaPlay className="text-2xl text-gray-900 ml-1" />
                        )}
                      </div>
                    </button>
                  </>
                ) : (
                  <img
                    src={ad.image || '/placeholder-ad.jpg'}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Media Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    {ad.mediaType === 'video' ? <FaVideo className="text-xs" /> : <FaImage className="text-xs" />}
                    {ad.mediaType === 'video' ? 'Video' : ad.mediaType === 'both' ? 'Image & Video' : 'Image'}
                  </span>
                </div>
              </div>

              {ad.mediaType === 'both' && ad.video && (
                <div className="p-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Video Version</p>
                  <video
                    src={ad.video}
                    poster={ad.thumbnail}
                    className="w-full h-20 object-cover rounded-lg"
                    muted
                  />
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <FaEye className="text-gray-400" />
                    Views
                  </span>
                  <span className="text-lg font-bold text-gray-900">{formatNumber(ad.views)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <FaMousePointer className="text-gray-400" />
                    Clicks
                  </span>
                  <span className="text-lg font-bold text-gray-900">{formatNumber(ad.clicks)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <FaPercentage className="text-gray-400" />
                    CTR
                  </span>
                  <span className="text-lg font-bold text-green-600">{ad.ctr || 0}%</span>
                </div>
              </div>
            </div>

            {/* Schedule Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Schedule</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Start Date</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(ad.startDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">End Date</span>
                  <span className="text-sm font-medium text-gray-900">{ad.endDate ? formatDate(ad.endDate) : 'Ongoing'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Priority</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-1.5 rounded-full ${
                          i < (ad.priority || 1) ? 'bg-[#0043FC]' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                    <span className="text-sm font-medium text-gray-900 ml-1">{ad.priority}/10</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Display Order</span>
                  <span className="text-sm font-medium text-gray-900">{ad.displayOrder}</span>
                </div>
              </div>
            </div>

            {/* Status Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Status</h3>
              <div className="flex gap-2">
                {ad.status !== 'active' && (
                  <button
                    onClick={() => handleStatusChange('active')}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <FaPlay className="text-xs" />
                    Activate
                  </button>
                )}
                {ad.status !== 'paused' && (
                  <button
                    onClick={() => handleStatusChange('paused')}
                    className="flex-1 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 flex items-center justify-center gap-2"
                  >
                    <FaPause className="text-xs" />
                    Pause
                  </button>
                )}
                {ad.status !== 'draft' && (
                  <button
                    onClick={() => handleStatusChange('draft')}
                    className="flex-1 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 flex items-center justify-center gap-2"
                  >
                    <FaArchive className="text-xs" />
                    Draft
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Middle & Right Columns */}
          <div className="lg:col-span-2 space-y-5">
            {/* Details */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-900">Ad Details</h2>
              </div>
              <div className="p-5 space-y-4">
                {ad.subtitle && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Subtitle</label>
                    <p className="text-sm text-gray-900">{ad.subtitle}</p>
                  </div>
                )}
                
                {ad.description && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <p className="text-sm text-gray-700 leading-relaxed">{ad.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Call to Action</label>
                    <p className="text-sm font-medium text-gray-900">{ad.ctaText || 'Learn More'}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Link URL</label>
                    <div className="flex items-center gap-1">
                      <FaLink className="text-gray-400 text-xs" />
                      {isExternalUrl(ad.ctaLink) ? (
                        <a
                          href={ad.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#0043FC] hover:underline flex items-center gap-1"
                        >
                          {ad.ctaLink}
                          <FaExternalLinkAlt className="text-xs" />
                        </a>
                      ) : (
                        <Link to={ad.ctaLink || '#'} className="text-sm text-[#0043FC] hover:underline">
                          {ad.ctaLink || '—'}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Pages */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FaGlobe className="text-[#0043FC] text-sm" />
                  Target Pages
                </h2>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {ad.pages?.map((page) => {
                    const pageInfo = pageOptions[page];
                    if (!pageInfo) return null;
                    const Icon = pageInfo.icon;
                    return (
                      <span
                        key={page}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${pageInfo.color}`}
                      >
                        <Icon className="text-sm" />
                        <span className="text-sm font-medium">{pageInfo.label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Placements */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FaLayerGroup className="text-[#0043FC] text-sm" />
                  Placements
                </h2>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {ad.placements?.map((placement) => (
                    <span
                      key={placement}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                    >
                      <FaTag className="text-gray-400 text-xs" />
                      {placementLabels[placement] || placement}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Styling */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FaPalette className="text-[#0043FC] text-sm" />
                  Styling
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Background Gradient</label>
                    <div className={`h-12 rounded-lg bg-gradient-to-r ${ad.bgColor}`} />
                    <p className="text-xs text-gray-400 mt-1 font-mono">{ad.bgColor}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Accent Color</label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg border border-gray-200"
                        style={{ backgroundColor: ad.accentColor }}
                      />
                      <span className="text-sm font-mono">{ad.accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Metadata</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Created By</p>
                  <p className="text-gray-900">{ad.createdBy?.name || 'Admin'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Created At</p>
                  <p className="text-gray-900">{formatDateTime(ad.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Last Updated</p>
                  <p className="text-gray-900">{formatDateTime(ad.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Ad ID</p>
                  <p className="text-gray-900 font-mono text-xs">{ad._id}</p>
                </div>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaChartBar className="text-[#0043FC]" />
                Performance Overview
              </h3>
              <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-400 text-sm">Chart coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrashAlt className="text-xl text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Ad</h3>
              <p className="text-sm text-gray-500 mb-5">
                Are you sure you want to delete "{ad.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
};

export default AdminAdDetail;