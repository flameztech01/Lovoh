// src/adminScreens/AdminAds.jsx
import React, { useState } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSpinner,
  FaSearch,
  FaImage,
  FaVideo,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaPauseCircle,
  FaPlayCircle,
  FaCalendarAlt,
  FaChartLine,
  FaStore,
  FaTimes,
  FaUpload,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetAllAdsQuery,
  useCreateAdMutation,
  useUpdateAdMutation,
  useDeleteAdMutation,
  useUpdateAdStatusMutation,
  useBulkDeleteAdsMutation,
  useBulkUpdateStatusMutation,
} from '../slices/adsApiSlice.js';

const AdminAds = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedAds, setSelectedAds] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [bulkAction, setBulkAction] = useState('');

  // Fetch ads (only for Uduua page)
  const { data: adsData, isLoading: isLoadingAds, refetch } = useGetAllAdsQuery({
    pageName: 'uduua',
    page,
    limit: 20,
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    placement: placementFilter === 'all' ? undefined : placementFilter,
    mediaType: mediaTypeFilter === 'all' ? undefined : mediaTypeFilter,
    sortBy,
    sortOrder,
  });

  // Mutations
  const [createAd, { isLoading: isCreating }] = useCreateAdMutation();
  const [updateAd, { isLoading: isUpdating }] = useUpdateAdMutation();
  const [deleteAd, { isLoading: isDeleting }] = useDeleteAdMutation();
  const [updateAdStatus, { isLoading: isUpdatingStatus }] = useUpdateAdStatusMutation();
  const [bulkDeleteAds, { isLoading: isBulkDeleting }] = useBulkDeleteAdsMutation();
  const [bulkUpdateStatus, { isLoading: isBulkUpdating }] = useBulkUpdateStatusMutation();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    mediaType: 'image',
    ctaText: 'Shop Now',
    ctaLink: '',
    pages: ['uduua'],
    placements: 'hero',
    bgColor: 'from-[#0043FC] to-[#0038D4]',
    accentColor: '#79FFFF',
    status: 'active',
    priority: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    displayOrder: 0,
    image: null,
    video: null,
    thumbnail: null,
  });

  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  const ads = adsData?.ads || [];

  const placements = [
    { value: 'hero', label: 'Hero Banner' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'infeed', label: 'In-feed' },
    { value: 'popup', label: 'Popup' },
    { value: 'banner', label: 'Banner' },
  ];

  const statuses = [
    { value: 'active', label: 'Active', icon: FaPlayCircle, color: 'green' },
    { value: 'paused', label: 'Paused', icon: FaPauseCircle, color: 'yellow' },
    { value: 'draft', label: 'Draft', icon: FaClock, color: 'gray' },
    { value: 'expired', label: 'Expired', icon: FaTimesCircle, color: 'red' },
  ];

  const mediaTypes = [
    { value: 'image', label: 'Image Only', icon: FaImage },
    { value: 'video', label: 'Video Only', icon: FaVideo },
    { value: 'both', label: 'Both', icon: FaImage },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [type]: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'image') setImagePreview(reader.result);
        if (type === 'video') setVideoPreview(reader.result);
        if (type === 'thumbnail') setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAd = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('subtitle', formData.subtitle);
    submitData.append('description', formData.description);
    submitData.append('mediaType', formData.mediaType);
    submitData.append('ctaText', formData.ctaText);
    submitData.append('ctaLink', formData.ctaLink);
    submitData.append('pages', JSON.stringify(['uduua']));
    submitData.append('placements', JSON.stringify([formData.placements]));
    submitData.append('bgColor', formData.bgColor);
    submitData.append('accentColor', formData.accentColor);
    submitData.append('status', formData.status);
    submitData.append('priority', formData.priority);
    submitData.append('startDate', formData.startDate);
    if (formData.endDate) submitData.append('endDate', formData.endDate);
    submitData.append('displayOrder', formData.displayOrder);
    
    if (formData.image) submitData.append('image', formData.image);
    if (formData.video) submitData.append('video', formData.video);
    if (formData.thumbnail) submitData.append('thumbnail', formData.thumbnail);

    try {
      await createAd(submitData).unwrap();
      toast.success('Ad created successfully for Uduua');
      setShowCreateModal(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to create ad');
    }
  };

  const handleUpdateAd = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('subtitle', formData.subtitle);
    submitData.append('description', formData.description);
    submitData.append('mediaType', formData.mediaType);
    submitData.append('ctaText', formData.ctaText);
    submitData.append('ctaLink', formData.ctaLink);
    submitData.append('pages', JSON.stringify(['uduua']));
    submitData.append('placements', JSON.stringify([formData.placements]));
    submitData.append('bgColor', formData.bgColor);
    submitData.append('accentColor', formData.accentColor);
    submitData.append('status', formData.status);
    submitData.append('priority', formData.priority);
    submitData.append('startDate', formData.startDate);
    if (formData.endDate) submitData.append('endDate', formData.endDate);
    submitData.append('displayOrder', formData.displayOrder);
    submitData.append('keepImage', formData.image === null || typeof formData.image === 'string');
    submitData.append('keepVideo', formData.video === null || typeof formData.video === 'string');
    submitData.append('keepThumbnail', formData.thumbnail === null || typeof formData.thumbnail === 'string');
    
    if (formData.image && typeof formData.image !== 'string') submitData.append('image', formData.image);
    if (formData.video && typeof formData.video !== 'string') submitData.append('video', formData.video);
    if (formData.thumbnail && typeof formData.thumbnail !== 'string') submitData.append('thumbnail', formData.thumbnail);

    try {
      await updateAd({ id: selectedAd._id, data: submitData }).unwrap();
      toast.success('Ad updated successfully');
      setShowEditModal(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update ad');
    }
  };

  const handleDeleteAd = async (id) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        await deleteAd(id).unwrap();
        toast.success('Ad deleted successfully');
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to delete ad');
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAdStatus({ id, status }).unwrap();
      toast.success(`Ad status updated to ${status}`);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update status');
    }
  };

  const handleBulkAction = async () => {
    if (selectedAds.length === 0) {
      toast.error('Please select ads to perform bulk action');
      return;
    }

    if (bulkAction === 'delete') {
      if (window.confirm(`Delete ${selectedAds.length} ads? This cannot be undone.`)) {
        try {
          await bulkDeleteAds(selectedAds).unwrap();
          toast.success(`${selectedAds.length} ads deleted`);
          setSelectedAds([]);
          refetch();
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to delete ads');
        }
      }
    } else if (bulkAction === 'active' || bulkAction === 'paused' || bulkAction === 'draft') {
      try {
        await bulkUpdateStatus({ ids: selectedAds, status: bulkAction }).unwrap();
        toast.success(`${selectedAds.length} ads updated to ${bulkAction}`);
        setSelectedAds([]);
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to update ads');
      }
    }
    setShowBulkModal(false);
    setBulkAction('');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      mediaType: 'image',
      ctaText: 'Shop Now',
      ctaLink: '',
      pages: ['uduua'],
      placements: 'hero',
      bgColor: 'from-[#0043FC] to-[#0038D4]',
      accentColor: '#79FFFF',
      status: 'active',
      priority: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      displayOrder: 0,
      image: null,
      video: null,
      thumbnail: null,
    });
    setImagePreview('');
    setVideoPreview('');
    setThumbnailPreview('');
    setSelectedAd(null);
  };

  const editAd = (ad) => {
    setSelectedAd(ad);
    setFormData({
      title: ad.title || '',
      subtitle: ad.subtitle || '',
      description: ad.description || '',
      mediaType: ad.mediaType || 'image',
      ctaText: ad.ctaText || 'Shop Now',
      ctaLink: ad.ctaLink || '',
      pages: ad.pages || ['uduua'],
      placements: ad.placements?.[0] || 'hero',
      bgColor: ad.bgColor || 'from-[#0043FC] to-[#0038D4]',
      accentColor: ad.accentColor || '#79FFFF',
      status: ad.status || 'active',
      priority: ad.priority || 1,
      startDate: ad.startDate ? ad.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: ad.endDate ? ad.endDate.split('T')[0] : '',
      displayOrder: ad.displayOrder || 0,
      image: ad.image || null,
      video: ad.video || null,
      thumbnail: ad.thumbnail || null,
    });
    setImagePreview(ad.image || '');
    setVideoPreview(ad.video || '');
    setThumbnailPreview(ad.thumbnail || '');
    setShowEditModal(true);
  };

  const toggleSelectAd = (adId) => {
    setSelectedAds(prev =>
      prev.includes(adId) ? prev.filter(id => id !== adId) : [...prev, adId]
    );
  };

  const selectAllAds = () => {
    if (selectedAds.length === ads.length && ads.length > 0) {
      setSelectedAds([]);
    } else {
      setSelectedAds(ads.map(ad => ad._id));
    }
  };

  const getStatusIcon = (status) => {
    const config = {
      active: { icon: FaPlayCircle, color: 'text-green-500', label: 'Active' },
      paused: { icon: FaPauseCircle, color: 'text-yellow-500', label: 'Paused' },
      draft: { icon: FaClock, color: 'text-gray-500', label: 'Draft' },
      expired: { icon: FaTimesCircle, color: 'text-red-500', label: 'Expired' },
    };
    return config[status] || config.draft;
  };

  const isLoading = isLoadingAds;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#0043FC] mx-auto mb-4" />
          <p className="text-gray-500">Loading ads...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Management - Uduua</h1>
          <p className="text-sm text-gray-500">Create and manage advertisements for the Uduua marketplace</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors flex items-center gap-2"
        >
          <FaPlus /> Create New Ad
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Ads</p>
              <p className="text-2xl font-bold text-blue-700">{adsData?.total || 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaStore className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Active Ads</p>
              <p className="text-2xl font-bold text-green-700">
                {ads.filter(ad => ad.status === 'active').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaPlayCircle className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Total Views</p>
              <p className="text-2xl font-bold text-purple-700">
                {ads.reduce((sum, ad) => sum + (ad.views || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FaEye className="text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">Total Clicks</p>
              <p className="text-2xl font-bold text-orange-700">
                {ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <FaChartLine className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search ads by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
          >
            <option value="all">All Placements</option>
            {placements.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <select
            value={mediaTypeFilter}
            onChange={(e) => setMediaTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
          >
            <option value="all">All Media</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedAds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 flex flex-wrap justify-between items-center gap-4">
          <span className="text-sm text-blue-700">{selectedAds.length} ads selected</span>
          <div className="flex gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm bg-white"
            >
              <option value="">Bulk Actions</option>
              <option value="active">Set Active</option>
              <option value="paused">Set Paused</option>
              <option value="draft">Set Draft</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={() => setShowBulkModal(true)}
              disabled={!bulkAction}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Apply
            </button>
            <button
              onClick={() => setSelectedAds([])}
              className="px-4 py-1.5 border border-blue-300 rounded-lg text-sm hover:bg-blue-100"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Ads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedAds.length === ads.length && ads.length > 0}
                    onChange={selectAllAds}
                    className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placement</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Media</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ads.map((ad) => {
                const StatusIcon = getStatusIcon(ad.status).icon;
                const statusColor = getStatusIcon(ad.status).color;
                const placement = placements.find(p => p.value === ad.placements?.[0])?.label || ad.placements?.[0] || 'Unknown';
                
                return (
                  <tr key={ad._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedAds.includes(ad._id)}
                        onChange={() => toggleSelectAd(ad._id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {ad.thumbnail ? (
                          <img src={ad.thumbnail} alt={ad.title} className="w-12 h-12 rounded-lg object-cover" />
                        ) : ad.image ? (
                          <img src={ad.image} alt={ad.title} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FaImage className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ad.title}</p>
                          <p className="text-xs text-gray-500">{ad.ctaText} →</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {placement}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {ad.mediaType === 'image' && <FaImage className="text-blue-500" />}
                        {ad.mediaType === 'video' && <FaVideo className="text-purple-500" />}
                        {ad.mediaType === 'both' && (
                          <>
                            <FaImage className="text-blue-500" />
                            <FaVideo className="text-purple-500" />
                          </>
                        )}
                        <span className="text-xs text-gray-500 capitalize">{ad.mediaType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <span className="font-medium">{ad.views?.toLocaleString() || 0}</span>
                        <span className="text-gray-400 mx-1">views</span>
                        <br />
                        <span className="font-medium">{ad.clicks?.toLocaleString() || 0}</span>
                        <span className="text-gray-400"> clicks</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={statusColor} />
                        <span className="text-sm capitalize">{ad.status}</span>
                        {ad.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(ad._id, 'paused')}
                            className="text-xs text-yellow-600 hover:underline"
                          >
                            Pause
                          </button>
                        )}
                        {ad.status === 'paused' && (
                          <button
                            onClick={() => handleStatusChange(ad._id, 'active')}
                            className="text-xs text-green-600 hover:underline"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FaCalendarAlt className="text-gray-400" />
                        {new Date(ad.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editAd(ad)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteAd(ad._id)}
                          className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {ads.length === 0 && (
          <div className="text-center py-12">
            <FaStore className="text-gray-300 text-5xl mx-auto mb-3" />
            <p className="text-gray-500">No ads found for Uduua</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 text-sm text-[#0043FC] hover:underline"
            >
              Create your first ad
            </button>
          </div>
        )}

        {/* Pagination */}
        {adsData?.pages > 1 && (
          <div className="flex justify-center gap-2 px-4 py-4 border-t border-gray-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {page} of {adsData?.pages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(adsData?.pages || 1, p + 1))}
              disabled={page === adsData?.pages}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Ad Modal */}
      {showCreateModal && (
        <AdModal
          title="Create New Ad for Uduua"
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          videoPreview={videoPreview}
          setVideoPreview={setVideoPreview}
          thumbnailPreview={thumbnailPreview}
          setThumbnailPreview={setThumbnailPreview}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          onSubmit={handleCreateAd}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          isLoading={isCreating}
          placements={placements}
          statuses={statuses}
          mediaTypes={mediaTypes}
        />
      )}

      {/* Edit Ad Modal */}
      {showEditModal && selectedAd && (
        <AdModal
          title="Edit Ad"
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          videoPreview={videoPreview}
          setVideoPreview={setVideoPreview}
          thumbnailPreview={thumbnailPreview}
          setThumbnailPreview={setThumbnailPreview}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          onSubmit={handleUpdateAd}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
          }}
          isLoading={isUpdating}
          placements={placements}
          statuses={statuses}
          mediaTypes={mediaTypes}
          isEdit={true}
        />
      )}

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaStore className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Confirm Bulk Action</h2>
                <p className="text-sm text-gray-500">{selectedAds.length} ads selected</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to {bulkAction === 'delete' ? 'delete' : `set status to ${bulkAction}`} {selectedAds.length} ads?
              {bulkAction === 'delete' && ' This action cannot be undone.'}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                disabled={isBulkDeleting || isBulkUpdating}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors flex items-center justify-center gap-2 ${
                  bulkAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                } disabled:opacity-50`}
              >
                {(isBulkDeleting || isBulkUpdating) ? <FaSpinner className="animate-spin" /> : null}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Ad Modal Component
const AdModal = ({
  title,
  formData,
  setFormData,
  imagePreview,
  setImagePreview,
  videoPreview,
  setVideoPreview,
  thumbnailPreview,
  setThumbnailPreview,
  handleInputChange,
  handleFileChange,
  onSubmit,
  onClose,
  isLoading,
  placements,
  statuses,
  mediaTypes,
  isEdit = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0043FC]/10 rounded-full flex items-center justify-center">
              <FaStore className="text-[#0043FC] text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">Ad will only show on Uduua marketplace</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              placeholder="Ad title"
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              placeholder="Ad subtitle"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC] resize-none"
              placeholder="Ad description"
            />
          </div>

          {/* Media Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
            <div className="flex gap-3">
              {mediaTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, mediaType: type.value }));
                    if (type.value === 'image') {
                      setFormData(prev => ({ ...prev, video: null }));
                      setVideoPreview('');
                    }
                    if (type.value === 'video') {
                      setFormData(prev => ({ ...prev, image: null }));
                      setImagePreview('');
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.mediaType === type.value
                      ? 'bg-[#0043FC] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <type.icon />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          {(formData.mediaType === 'image' || formData.mediaType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-[#0043FC] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image')}
                  className="hidden"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="cursor-pointer block">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                  ) : (
                    <>
                      <FaUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload image</p>
                      <p className="text-xs text-gray-400">JPG, PNG, WEBP (Max 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Video Upload */}
          {(formData.mediaType === 'video' || formData.mediaType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video *</label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-[#0043FC] transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'video')}
                  className="hidden"
                  id="videoUpload"
                />
                <label htmlFor="videoUpload" className="cursor-pointer block">
                  {videoPreview ? (
                    <video src={videoPreview} controls className="max-h-40 mx-auto rounded-lg" />
                  ) : (
                    <>
                      <FaVideo className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload video</p>
                      <p className="text-xs text-gray-400">MP4, WebM (Max 50MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Thumbnail Upload */}
          {(formData.mediaType === 'video' || formData.mediaType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail (Optional)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-[#0043FC] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                  className="hidden"
                  id="thumbnailUpload"
                />
                <label htmlFor="thumbnailUpload" className="cursor-pointer block">
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Thumbnail" className="max-h-40 mx-auto rounded-lg" />
                  ) : (
                    <>
                      <FaImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload thumbnail</p>
                      <p className="text-xs text-gray-400">Optional custom thumbnail for video</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
              <input
                type="text"
                name="ctaText"
                value={formData.ctaText}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
              <input
                type="url"
                name="ctaLink"
                value={formData.ctaLink}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                placeholder="https://uduua.com/shop/..."
              />
            </div>
          </div>

          {/* Placement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
            <select
              value={formData.placements}
              onChange={(e) => setFormData(prev => ({ ...prev, placements: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
            >
              {placements.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              >
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority (1-10)</label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <input
                type="text"
                name="bgColor"
                value={formData.bgColor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                placeholder="from-blue-500 to-purple-500"
              />
              <p className="text-xs text-gray-400 mt-1">Tailwind gradient classes</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
              <input
                type="text"
                name="accentColor"
                value={formData.accentColor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                placeholder="#79FFFF"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              />
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              placeholder="0"
            />
            <p className="text-xs text-gray-400 mt-1">Higher numbers appear first</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
              {isEdit ? 'Update Ad' : 'Create Ad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAds;