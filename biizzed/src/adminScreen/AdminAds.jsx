// adminScreen/AdminAds.jsx
import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaUpload,
  FaImage,
  FaVideo,
  FaCheck,
  FaFilter,
  FaCalendarAlt,
  FaChartLine,
  FaMousePointer,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetAllAdsQuery,
  useGetAdStatsQuery,
  useCreateAdMutation,
  useUpdateAdMutation,
  useDeleteAdMutation,
  useUpdateAdStatusMutation,
  useBulkDeleteAdsMutation,
  useBulkUpdateStatusMutation,
} from '../slices/adsApiSlice';

const AdminAds = () => {
  // ========== State ==========
  const [filters, setFilters] = useState({
    status: '',
    placement: '',
    mediaType: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const [selectedAds, setSelectedAds] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    mediaType: 'image',
    ctaText: 'Learn More',
    ctaLink: '',
    pages: ['biizzed'],
    placements: ['hero'],
    bgColor: 'from-[#0043FC] to-[#0038D4]',
    accentColor: '#79FFFF',
    status: 'active',
    priority: 1,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    displayOrder: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [keepImage, setKeepImage] = useState(true);
  const [keepVideo, setKeepVideo] = useState(true);
  const [keepThumbnail, setKeepThumbnail] = useState(true);

  // Queries
  const { data: adsData, isLoading, refetch } = useGetAllAdsQuery({
    pageName: 'biizzed', // Hardcoded for Biizzed
    placement: filters.placement || undefined,
    status: filters.status || undefined,
    mediaType: filters.mediaType || undefined,
    search: filters.search || undefined,
    page: currentPage,
    limit,
  });
  const { data: stats, refetch: refetchStats } = useGetAdStatsQuery();

  const [createAd] = useCreateAdMutation();
  const [updateAd] = useUpdateAdMutation();
  const [deleteAd] = useDeleteAdMutation();
  const [updateAdStatus] = useUpdateAdStatusMutation();
  const [bulkDeleteAds] = useBulkDeleteAdsMutation();
  const [bulkUpdateStatus] = useBulkUpdateStatusMutation();

  const ads = adsData?.ads || [];
  const totalPages = adsData?.pages || 1;
  const total = adsData?.total || 0;
  const statsData = stats || { totalActive: 0, totalViews: 0, totalClicks: 0 };

  // Reset form when modals close
  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      mediaType: 'image',
      ctaText: 'Learn More',
      ctaLink: '',
      pages: ['biizzed'],
      placements: ['hero'],
      bgColor: 'from-[#0043FC] to-[#0038D4]',
      accentColor: '#79FFFF',
      status: 'active',
      priority: 1,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      displayOrder: 0,
    });
    setImageFile(null);
    setVideoFile(null);
    setThumbnailFile(null);
    setImagePreview('');
    setVideoPreview('');
    setThumbnailPreview('');
    setKeepImage(true);
    setKeepVideo(true);
    setKeepThumbnail(true);
  };

  // ========== Handlers ==========
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSelectAd = (adId) => {
    setSelectedAds(prev =>
      prev.includes(adId) ? prev.filter(id => id !== adId) : [...prev, adId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAds.length === ads.length) {
      setSelectedAds([]);
    } else {
      setSelectedAds(ads.map(ad => ad._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedAds.length === 0) return;
    if (bulkAction === 'delete') {
      if (!window.confirm(`Delete ${selectedAds.length} ads?`)) return;
      try {
        await bulkDeleteAds(selectedAds).unwrap();
        toast.success(`${selectedAds.length} ads deleted`);
        setSelectedAds([]);
        refetch();
        refetchStats();
      } catch (err) {
        toast.error(err?.data?.message || 'Bulk delete failed');
      }
    } else if (bulkAction === 'activate' || bulkAction === 'pause' || bulkAction === 'draft') {
      try {
        await bulkUpdateStatus({ ids: selectedAds, status: bulkAction }).unwrap();
        toast.success(`${selectedAds.length} ads updated to ${bulkAction}`);
        setSelectedAds([]);
        refetch();
        refetchStats();
      } catch (err) {
        toast.error(err?.data?.message || 'Bulk status update failed');
      }
    }
    setBulkAction('');
  };

  const handleStatusToggle = async (adId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    if (!window.confirm(`Change ad status to ${newStatus}?`)) return;
    try {
      await updateAdStatus({ id: adId, status: newStatus }).unwrap();
      toast.success(`Ad status updated to ${newStatus}`);
      refetch();
      refetchStats();
    } catch (err) {
      toast.error(err?.data?.message || 'Status update failed');
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!window.confirm('Delete this ad permanently?')) return;
    try {
      await deleteAd(adId).unwrap();
      toast.success('Ad deleted');
      refetch();
      refetchStats();
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const handleOpenEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || '',
      subtitle: ad.subtitle || '',
      description: ad.description || '',
      mediaType: ad.mediaType || 'image',
      ctaText: ad.ctaText || 'Learn More',
      ctaLink: ad.ctaLink || '',
      pages: ad.pages || ['biizzed'],
      placements: ad.placements || ['hero'],
      bgColor: ad.bgColor || 'from-[#0043FC] to-[#0038D4]',
      accentColor: ad.accentColor || '#79FFFF',
      status: ad.status || 'active',
      priority: ad.priority || 1,
      startDate: ad.startDate ? ad.startDate.slice(0, 10) : '',
      endDate: ad.endDate ? ad.endDate.slice(0, 10) : '',
      displayOrder: ad.displayOrder || 0,
    });
    setImagePreview(ad.image || '');
    setVideoPreview(ad.video || '');
    setThumbnailPreview(ad.thumbnail || '');
    setKeepImage(true);
    setKeepVideo(true);
    setKeepThumbnail(true);
    setImageFile(null);
    setVideoFile(null);
    setThumbnailFile(null);
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formDataObj = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        if (key === 'pages' || key === 'placements') {
          formDataObj.append(key, JSON.stringify(value));
        } else {
          formDataObj.append(key, value);
        }
      }
      if (imageFile) formDataObj.append('image', imageFile);
      if (videoFile) formDataObj.append('video', videoFile);
      if (thumbnailFile) formDataObj.append('thumbnail', thumbnailFile);
      await createAd(formDataObj).unwrap();
      toast.success('Ad created successfully');
      resetForm();
      setShowCreateModal(false);
      refetch();
      refetchStats();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create ad');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formDataObj = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        if (key === 'pages' || key === 'placements') {
          formDataObj.append(key, JSON.stringify(value));
        } else {
          formDataObj.append(key, value);
        }
      }
      if (imageFile) formDataObj.append('image', imageFile);
      if (videoFile) formDataObj.append('video', videoFile);
      if (thumbnailFile) formDataObj.append('thumbnail', thumbnailFile);
      formDataObj.append('keepImage', keepImage);
      formDataObj.append('keepVideo', keepVideo);
      formDataObj.append('keepThumbnail', keepThumbnail);
      await updateAd({ id: editingAd._id, data: formDataObj }).unwrap();
      toast.success('Ad updated successfully');
      setShowEditModal(false);
      refetch();
      refetchStats();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update ad');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const isImage = type === 'image' || type === 'thumbnail';
    const isVideo = type === 'video';
    if (isImage && !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (isVideo && !file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    if (isImage && file.size > 10 * 1024 * 1024) {
      toast.error('Image must be < 10MB');
      return;
    }
    if (isVideo && file.size > 100 * 1024 * 1024) {
      toast.error('Video must be < 100MB');
      return;
    }
    if (type === 'image') {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else if (type === 'video') {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    } else if (type === 'thumbnail') {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeMedia = (type) => {
    if (type === 'image') {
      setImageFile(null);
      setImagePreview('');
      setKeepImage(false);
    } else if (type === 'video') {
      setVideoFile(null);
      setVideoPreview('');
      setKeepVideo(false);
    } else if (type === 'thumbnail') {
      setThumbnailFile(null);
      setThumbnailPreview('');
      setKeepThumbnail(false);
    }
  };

  // Helper for status badge
  const StatusBadge = ({ status }) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || styles.draft}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header and Stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ad Manager</h1>
        <p className="text-gray-500 mt-1">Manage advertisements for Biizzed</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Ads</p>
              <p className="text-2xl font-bold text-gray-900">{statsData.totalActive || 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaEye className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{statsData.totalViews?.toLocaleString() || 0}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaChartLine className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{statsData.totalClicks?.toLocaleString() || 0}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FaMousePointer className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#1B3766] focus:border-[#1B3766]"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
            </select>
            <select
              name="placement"
              value={filters.placement}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#1B3766] focus:border-[#1B3766]"
            >
              <option value="">All Placements</option>
              <option value="hero">Hero</option>
              <option value="sidebar">Sidebar</option>
              <option value="inline">Inline</option>
              <option value="banner">Banner</option>
            </select>
            <select
              name="mediaType"
              value={filters.mediaType}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#1B3766] focus:border-[#1B3766]"
            >
              <option value="">All Media</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="both">Both</option>
            </select>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by title..."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-48 focus:ring-[#1B3766] focus:border-[#1B3766]"
              />
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B3766] text-white rounded-lg text-sm font-medium hover:bg-[#142952] transition-colors"
          >
            <FaPlus className="text-xs" /> Create Ad
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedAds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">{selectedAds.length} selected</span>
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Bulk Actions</option>
                <option value="activate">Activate</option>
                <option value="pause">Pause</option>
                <option value="draft">Move to Draft</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-sm disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ads Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="animate-spin text-3xl text-[#1B3766]" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAds.length === ads.length && ads.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Media</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placement</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views / Clicks</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No ads found
                  </td>
                </tr>
              ) : (
                ads.map((ad) => (
                  <tr key={ad._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedAds.includes(ad._id)}
                        onChange={() => handleSelectAd(ad._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        {ad.mediaType === 'video' && ad.thumbnail ? (
                          <img src={ad.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : ad.image ? (
                          <img src={ad.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            {ad.mediaType === 'video' ? <FaVideo /> : <FaImage />}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{ad.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{ad.subtitle}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 capitalize">{ad.placements?.[0] || 'hero'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ad.status} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{ad.views?.toLocaleString() || 0} / {ad.clicks?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-400">
                        CTR: {ad.views ? ((ad.clicks / ad.views) * 100).toFixed(1) : 0}%
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusToggle(ad._id, ad.status)}
                          className="p-1.5 text-gray-500 hover:text-[#1B3766] transition-colors"
                          title={ad.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {ad.status === 'active' ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(ad)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteAd(ad._id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <FaTrashAlt className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* ========== CREATE MODAL ========== */}
      {showCreateModal && (
        <AdFormModal
          title="Create New Ad"
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          videoPreview={videoPreview}
          thumbnailPreview={thumbnailPreview}
          imageFile={imageFile}
          videoFile={videoFile}
          thumbnailFile={thumbnailFile}
          setImageFile={setImageFile}
          setVideoFile={setVideoFile}
          setThumbnailFile={setThumbnailFile}
          setImagePreview={setImagePreview}
          setVideoPreview={setVideoPreview}
          setThumbnailPreview={setThumbnailPreview}
          handleFileChange={handleFileChange}
          removeMedia={removeMedia}
          submitting={submitting}
          onSubmit={handleCreateSubmit}
          onClose={() => { resetForm(); setShowCreateModal(false); }}
        />
      )}

      {/* ========== EDIT MODAL ========== */}
      {showEditModal && editingAd && (
        <AdFormModal
          title="Edit Ad"
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          videoPreview={videoPreview}
          thumbnailPreview={thumbnailPreview}
          imageFile={imageFile}
          videoFile={videoFile}
          thumbnailFile={thumbnailFile}
          setImageFile={setImageFile}
          setVideoFile={setVideoFile}
          setThumbnailFile={setThumbnailFile}
          setImagePreview={setImagePreview}
          setVideoPreview={setVideoPreview}
          setThumbnailPreview={setThumbnailPreview}
          handleFileChange={handleFileChange}
          removeMedia={removeMedia}
          submitting={submitting}
          onSubmit={handleUpdateSubmit}
          onClose={() => { resetForm(); setShowEditModal(false); }}
          isEdit
        />
      )}
    </div>
  );
};

// Separate Modal component to keep code organized
const AdFormModal = ({
  title,
  formData,
  setFormData,
  imagePreview,
  videoPreview,
  thumbnailPreview,
  imageFile,
  videoFile,
  thumbnailFile,
  setImageFile,
  setVideoFile,
  setThumbnailFile,
  setImagePreview,
  setVideoPreview,
  setThumbnailPreview,
  handleFileChange,
  removeMedia,
  submitting,
  onSubmit,
  onClose,
  isEdit = false,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#1B3766] focus:border-[#1B3766]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#1B3766] focus:border-[#1B3766]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#1B3766] focus:border-[#1B3766]"
            />
          </div>

          {/* Media Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
            <div className="flex gap-4">
              {['image', 'video', 'both'].map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mediaType"
                    value={type}
                    checked={formData.mediaType === type}
                    onChange={handleChange}
                    className="text-[#1B3766]"
                  />
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* File Uploads */}
          {(formData.mediaType === 'image' || formData.mediaType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image (required for image ads)</label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeMedia('image')}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1B3766]">
                    <FaUpload className="text-2xl text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
                  </label>
                )}
                {isEdit && <span className="text-xs text-gray-400">Leave empty to keep existing</span>}
              </div>
            </div>
          )}

          {(formData.mediaType === 'video' || formData.mediaType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video (required for video ads)</label>
              <div className="flex items-center gap-4">
                {videoPreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 bg-black">
                    {formData.mediaType === 'video' && videoPreview.endsWith('.mp4') ? (
                      <video src={videoPreview} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={videoPreview} alt="Video preview" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia('video')}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1B3766]">
                    <FaUpload className="text-2xl text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Upload Video</span>
                    <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Max 100MB. MP4, WebM, MOV</p>
            </div>
          )}

          {(formData.mediaType === 'video' || formData.mediaType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail (optional)</label>
              <div className="flex items-center gap-4">
                {thumbnailPreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeMedia('thumbnail')}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1B3766]">
                    <FaUpload className="text-2xl text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Upload Thumbnail</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnail')} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* CTA and Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
              <input
                type="text"
                name="ctaText"
                value={formData.ctaText}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
              <input
                type="url"
                name="ctaLink"
                value={formData.ctaLink}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Placements and Pages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placements (comma separated)</label>
              <input
                type="text"
                name="placements"
                value={formData.placements.join(', ')}
                onChange={(e) => setFormData(prev => ({ ...prev, placements: e.target.value.split(',').map(s => s.trim()) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-400">e.g., hero, sidebar, inline</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Priority and Display Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority (higher = more important)</label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Gradient</label>
              <input
                type="text"
                name="bgColor"
                value={formData.bgColor}
                onChange={handleChange}
                placeholder="from-[color] to-[color]"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
              <input
                type="text"
                name="accentColor"
                value={formData.accentColor}
                onChange={handleChange}
                placeholder="#79FFFF"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#1B3766] text-white rounded-lg hover:bg-[#142952] disabled:opacity-50">
              {submitting ? <FaSpinner className="animate-spin" /> : (isEdit ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAds;