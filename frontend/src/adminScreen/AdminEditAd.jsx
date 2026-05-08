// screens/AdminEditAd.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaImage,
  FaVideo,
  FaTrashAlt,
  FaInfoCircle,
  FaGlobe,
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaStore,
  FaApple,
  FaNewspaper,
  FaCalendar,
  FaPaintBrush,
  FaBullhorn,
  FaPlay,
  FaPause,
  FaArchive,
  FaPalette,
  FaLink,
  FaHeading,
  FaAlignLeft,
  FaList,
  FaUpload,
  FaEye,
  FaChartBar
} from 'react-icons/fa';
import { 
  useGetAdByIdQuery, 
  useUpdateAdMutation,
  useDeleteAdMutation 
} from '../slices/adsApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminEditAd = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: adData, isLoading: isLoadingAd, error } = useGetAdByIdQuery(id);
  const [updateAd, { isLoading: isUpdating }] = useUpdateAdMutation();
  const [deleteAd, { isLoading: isDeleting }] = useDeleteAdMutation();

  const ad = adData;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    mediaType: 'image',
    ctaText: 'Learn More',
    ctaLink: '',
    pages: ['uduua'],
    placements: ['hero'],
    bgColor: 'from-[#0043FC] to-[#0038D4]',
    accentColor: '#79FFFF',
    status: 'active',
    priority: 1,
    startDate: '',
    endDate: '',
    displayOrder: 0,
  });

  // Media state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [keepImage, setKeepImage] = useState(true);
  const [keepVideo, setKeepVideo] = useState(true);
  const [keepThumbnail, setKeepThumbnail] = useState(true);

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load ad data
  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title || '',
        subtitle: ad.subtitle || '',
        description: ad.description || '',
        mediaType: ad.mediaType || 'image',
        ctaText: ad.ctaText || 'Learn More',
        ctaLink: ad.ctaLink || '',
        pages: Array.isArray(ad.pages) ? ad.pages : ['uduua'],
        placements: Array.isArray(ad.placements) ? ad.placements : ['hero'],
        bgColor: ad.bgColor || 'from-[#0043FC] to-[#0038D4]',
        accentColor: ad.accentColor || '#79FFFF',
        status: ad.status || 'active',
        priority: ad.priority || 1,
        startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
        endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
        displayOrder: ad.displayOrder || 0,
      });
      setImagePreview(ad.image || '');
      setVideoPreview(ad.video || '');
      setThumbnailPreview(ad.thumbnail || '');
    }
  }, [ad]);

  // Handle not found
  useEffect(() => {
    if (error) {
      toast.error('Ad not found');
      navigate('/admin/ads');
    }
  }, [error, navigate]);

  // Page options with icons
  const pageOptions = [
    { value: 'uduua', label: 'Úduua Marketplace', icon: FaStore, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'thefruiit', label: 'The Fruiit', icon: FaApple, color: 'bg-green-100 text-green-700 border-green-300' },
    { value: 'bizzed', label: 'Bizzed Magazine', icon: FaNewspaper, color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { value: 'events', label: 'Events', icon: FaCalendar, color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { value: 'lovohcreate', label: 'Lovoh Create', icon: FaPaintBrush, color: 'bg-pink-100 text-pink-700 border-pink-300' },
  ];

  // Placement options
  const placementOptions = [
    { value: 'hero', label: 'Hero Slider', description: 'Main hero section slider' },
    { value: 'featured', label: 'Featured Section', description: 'Featured ads area' },
    { value: 'sidebar', label: 'Sidebar', description: 'Sidebar ad placements' },
    { value: 'banner', label: 'Banner', description: 'Banner ads across pages' },
    { value: 'product-page', label: 'Product Page', description: 'Individual product pages' },
    { value: 'cart', label: 'Cart Page', description: 'Shopping cart page' },
    { value: 'checkout', label: 'Checkout Page', description: 'Checkout process' },
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active', icon: FaPlay, color: 'bg-green-100 text-green-700' },
    { value: 'paused', label: 'Paused', icon: FaPause, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'draft', label: 'Draft', icon: FaArchive, color: 'bg-gray-100 text-gray-700' },
  ];

  // Color presets
  const colorPresets = [
    { bg: 'from-[#0043FC] to-[#0038D4]', accent: '#79FFFF', name: 'Blue' },
    { bg: 'from-[#FF6B00] to-[#E85D00]', accent: '#FFD700', name: 'Orange' },
    { bg: 'from-[#00A86B] to-[#008F5A]', accent: '#A8FFD2', name: 'Green' },
    { bg: 'from-[#9333EA] to-[#7E22CE]', accent: '#D8B4FE', name: 'Purple' },
    { bg: 'from-[#DC2626] to-[#B91C1C]', accent: '#FCA5A5', name: 'Red' },
    { bg: 'from-[#F59E0B] to-[#D97706]', accent: '#FDE68A', name: 'Amber' },
    { bg: 'from-gray-800 to-gray-900', accent: '#9CA3AF', name: 'Dark' },
  ];

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle page selection
  const handlePageToggle = (page) => {
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.includes(page)
        ? prev.pages.filter(p => p !== page)
        : [...prev.pages, page]
    }));
  };

  // Handle placement selection
  const handlePlacementToggle = (placement) => {
    setFormData(prev => ({
      ...prev,
      placements: prev.placements.includes(placement)
        ? prev.placements.filter(p => p !== placement)
        : [...prev.placements, placement]
    }));
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setKeepImage(false);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  // Handle video selection
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setKeepVideo(false);
        const reader = new FileReader();
        reader.onloadend = () => setVideoPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select a video file');
      }
    }
  };

  // Handle thumbnail selection
  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setThumbnailFile(file);
        setKeepThumbnail(false);
        const reader = new FileReader();
        reader.onloadend = () => setThumbnailPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  // Remove media
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setKeepImage(false);
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview('');
    setKeepVideo(false);
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    setKeepThumbnail(false);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Ad title is required');
      return;
    }

    if (formData.pages.length === 0) {
      toast.error('At least one page must be selected');
      return;
    }

    if (formData.placements.length === 0) {
      toast.error('At least one placement must be selected');
      return;
    }

    if (formData.mediaType === 'image' && !imageFile && !imagePreview) {
      toast.error('Image is required for image ads');
      return;
    }

    if (formData.mediaType === 'video' && !videoFile && !videoPreview) {
      toast.error('Video is required for video ads');
      return;
    }

    if (formData.mediaType === 'both' && ((!imageFile && !imagePreview) || (!videoFile && !videoPreview))) {
      toast.error('Both image and video are required for mixed media ads');
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title.trim());
    submitData.append('subtitle', formData.subtitle.trim());
    submitData.append('description', formData.description.trim());
    submitData.append('mediaType', formData.mediaType);
    submitData.append('ctaText', formData.ctaText.trim());
    submitData.append('ctaLink', formData.ctaLink.trim());
    
    // IMPORTANT: Send pages and placements as JSON strings
    submitData.append('pages', JSON.stringify(formData.pages));
    submitData.append('placements', JSON.stringify(formData.placements));
    
    submitData.append('bgColor', formData.bgColor);
    submitData.append('accentColor', formData.accentColor);
    submitData.append('status', formData.status);
    submitData.append('priority', formData.priority);
    submitData.append('startDate', formData.startDate);
    if (formData.endDate) submitData.append('endDate', formData.endDate);
    submitData.append('displayOrder', formData.displayOrder);

    // Handle media
    submitData.append('keepImage', keepImage);
    submitData.append('keepVideo', keepVideo);
    submitData.append('keepThumbnail', keepThumbnail);

    if (imageFile) submitData.append('image', imageFile);
    if (videoFile) submitData.append('video', videoFile);
    if (thumbnailFile) submitData.append('thumbnail', thumbnailFile);

    // Debug log
    console.log('Updating ad with:');
    console.log('Pages:', formData.pages);
    console.log('Placements:', formData.placements);

    try {
      setUploading(true);
      await updateAd({ id, data: submitData }).unwrap();
      toast.success('Ad updated successfully!');
      navigate('/admin/ads');
    } catch (error) {
      console.error('Update ad error:', error);
      toast.error(error?.data?.message || 'Failed to update ad');
    } finally {
      setUploading(false);
    }
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

  const applyColorPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      bgColor: preset.bg,
      accentColor: preset.accent
    }));
  };

  // Loading state
  if (isLoadingAd) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaSpinner className="text-4xl text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading ad...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Ad</h1>
              <p className="text-gray-500 text-sm mt-1">Update advertisement details</p>
            </div>
            
            <div className="flex items-center gap-2">
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

        {/* Ad Stats Summary */}
        {ad && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Views</p>
              <p className="text-xl font-bold text-gray-900">{ad.views || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Clicks</p>
              <p className="text-xl font-bold text-gray-900">{ad.clicks || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <p className="text-xs text-gray-500">CTR</p>
              <p className="text-xl font-bold text-gray-900">{ad.ctr || 0}%</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content - Left */}
            <div className="flex-1 space-y-5">
              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FaInfoCircle className="text-[#0043FC] text-sm" />
                    Basic Information
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Title <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaHeading className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Summer Sale - 50% Off"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <div className="relative">
                      <FaAlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleChange}
                        placeholder="e.g., Limited time offer"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Brief description of the ad..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors resize-none"
                    />
                  </div>

                  {/* Media Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Media Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {[
                        { value: 'image', label: 'Image Only', icon: FaImage },
                        { value: 'video', label: 'Video Only', icon: FaVideo },
                        { value: 'both', label: 'Image & Video', icon: FaBullhorn },
                      ].map((type) => (
                        <label
                          key={type.value}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                            formData.mediaType === type.value
                              ? 'border-[#0043FC] bg-[#0043FC]/5 text-[#0043FC]'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="mediaType"
                            value={type.value}
                            checked={formData.mediaType === type.value}
                            onChange={handleChange}
                            className="hidden"
                          />
                          <type.icon className="text-sm" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Pages */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FaGlobe className="text-[#0043FC] text-sm" />
                    Target Pages <span className="text-red-500">*</span>
                  </h2>
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-500 mb-3">Select which pages this ad should appear on</p>
                  <div className="flex flex-wrap gap-2">
                    {pageOptions.map((page) => {
                      const Icon = page.icon;
                      const isSelected = formData.pages.includes(page.value);
                      return (
                        <button
                          key={page.value}
                          type="button"
                          onClick={() => handlePageToggle(page.value)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                            isSelected
                              ? `${page.color} border-current`
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="text-sm" />
                          <span className="text-sm font-medium">{page.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {formData.pages.length === 0 && (
                    <p className="text-red-500 text-xs mt-2">Please select at least one page</p>
                  )}
                </div>
              </div>

              {/* Placements */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FaList className="text-[#0043FC] text-sm" />
                    Placements <span className="text-red-500">*</span>
                  </h2>
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-500 mb-3">Select where on the page this ad should appear</p>
                  <div className="grid grid-cols-2 gap-2">
                    {placementOptions.map((placement) => {
                      const isSelected = formData.placements.includes(placement.value);
                      return (
                        <button
                          key={placement.value}
                          type="button"
                          onClick={() => handlePlacementToggle(placement.value)}
                          className={`flex flex-col p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-[#0043FC] bg-[#0043FC]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className={`text-sm font-medium ${isSelected ? 'text-[#0043FC]' : 'text-gray-700'}`}>
                            {placement.label}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">{placement.description}</span>
                        </button>
                      );
                    })}
                  </div>
                  {formData.placements.length === 0 && (
                    <p className="text-red-500 text-xs mt-2">Please select at least one placement</p>
                  )}
                </div>
              </div>

              {/* CTA Settings */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FaLink className="text-[#0043FC] text-sm" />
                    Call to Action
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      name="ctaText"
                      value={formData.ctaText}
                      onChange={handleChange}
                      placeholder="e.g., Shop Now, Learn More"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link URL
                    </label>
                    <input
                      type="text"
                      name="ctaLink"
                      value={formData.ctaLink}
                      onChange={handleChange}
                      placeholder="e.g., /uduua/shop or https://..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Settings - Collapsible */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FaChartLine className="text-[#0043FC] text-sm" />
                    <h2 className="text-base font-semibold text-gray-900">Advanced Settings</h2>
                  </div>
                  {showAdvanced ? <FaChevronUp className="text-gray-400 text-sm" /> : <FaChevronDown className="text-gray-400 text-sm" />}
                </button>

                {showAdvanced && (
                  <div className="p-5 space-y-4">
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <div className="flex gap-3">
                        {statusOptions.map((status) => {
                          const Icon = status.icon;
                          return (
                            <label
                              key={status.value}
                              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                                formData.status === status.value
                                  ? `${status.color} border-current`
                                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="status"
                                value={status.value}
                                checked={formData.status === status.value}
                                onChange={handleChange}
                                className="hidden"
                              />
                              <Icon className="text-sm" />
                              <span className="text-sm font-medium">{status.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority (1-10)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          name="priority"
                          min="1"
                          max="10"
                          value={formData.priority}
                          onChange={handleChange}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0043FC]"
                        />
                        <span className="w-8 text-center text-sm font-medium text-gray-900">
                          {formData.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Higher priority ads appear first</p>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date (Optional)
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Display Order */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="displayOrder"
                        value={formData.displayOrder}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                      />
                      <p className="text-xs text-gray-400 mt-1">Lower numbers appear first within same priority</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Media & Styling */}
            <div className="lg:w-96 space-y-5">
              {/* Media Upload */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FaImage className="text-[#0043FC] text-sm" />
                    Media <span className="text-red-500">*</span>
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  {/* Image Upload */}
                  {(formData.mediaType === 'image' || formData.mediaType === 'both') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Image <span className="text-red-500">*</span>
                      </label>
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <FaTrashAlt className="text-xs" />
                          </button>
                          {!imageFile && keepImage && (
                            <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Current Image
                            </span>
                          )}
                        </div>
                      ) : (
                        <label className="block w-full cursor-pointer">
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#0043FC] transition-colors">
                            <FaUpload className="text-2xl text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Click to upload image</p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (Max 5MB)</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                            />
                          </div>
                        </label>
                      )}
                    </div>
                  )}

                  {/* Video Upload */}
                  {(formData.mediaType === 'video' || formData.mediaType === 'both') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Video <span className="text-red-500">*</span>
                      </label>
                      {videoPreview ? (
                        <div className="relative">
                          <video
                            src={videoPreview}
                            controls
                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removeVideo}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <FaTrashAlt className="text-xs" />
                          </button>
                          {!videoFile && keepVideo && (
                            <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Current Video
                            </span>
                          )}
                        </div>
                      ) : (
                        <label className="block w-full cursor-pointer">
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#0043FC] transition-colors">
                            <FaVideo className="text-2xl text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Click to upload video</p>
                            <p className="text-xs text-gray-400 mt-1">MP4, WebM (Max 50MB)</p>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoSelect}
                              className="hidden"
                            />
                          </div>
                        </label>
                      )}
                    </div>
                  )}

                  {/* Thumbnail Upload (for video) */}
                  {(formData.mediaType === 'video' || formData.mediaType === 'both') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Thumbnail (Optional)
                      </label>
                      {thumbnailPreview ? (
                        <div className="relative">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail"
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removeThumbnail}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <FaTrashAlt className="text-xs" />
                          </button>
                          {!thumbnailFile && keepThumbnail && (
                            <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                        </div>
                      ) : (
                        <label className="block w-full cursor-pointer">
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#0043FC] transition-colors">
                            <FaImage className="text-xl text-gray-300 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Upload thumbnail</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailSelect}
                              className="hidden"
                            />
                          </div>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Color Presets */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FaPalette className="text-[#0043FC] text-sm" />
                    Color Theme
                  </h2>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyColorPreset(preset)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          formData.bgColor === preset.bg
                            ? 'border-[#0043FC]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`h-8 rounded bg-gradient-to-r ${preset.bg} mb-1`} />
                        <p className="text-[10px] text-gray-500 text-center">{preset.name}</p>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Background Gradient</label>
                      <input
                        type="text"
                        name="bgColor"
                        value={formData.bgColor}
                        onChange={handleChange}
                        placeholder="from-[#0043FC] to-[#0038D4]"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0043FC]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          name="accentColor"
                          value={formData.accentColor}
                          onChange={handleChange}
                          className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          name="accentColor"
                          value={formData.accentColor}
                          onChange={handleChange}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0043FC]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="hidden lg:block bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaInfoCircle className="text-[#0043FC] text-sm" />
                  Quick Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <FaImage className="text-[#0043FC] text-xs mt-0.5" />
                    <span>Use high-quality images (1200x900 recommended)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaChartBar className="text-[#0043FC] text-xs mt-0.5" />
                    <span>Track performance with views and clicks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaGlobe className="text-[#0043FC] text-xs mt-0.5" />
                    <span>Target specific pages for better results</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button - Sticky on Mobile */}
          <div className="fixed bottom-0 left-0 right-0 md:relative md:mt-6 bg-white border-t border-gray-200 md:border-0 p-4 md:p-0 shadow-lg md:shadow-none z-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/ads')}
                  className="flex-1 md:flex-none px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || uploading}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-[#0043FC] text-white rounded-lg font-medium hover:bg-[#0033cc] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating || uploading ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave className="text-sm" />
                      Update Ad
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Spacer for Mobile */}
          <div className="h-20 md:h-0"></div>
        </form>
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
                Are you sure you want to delete "{ad?.title}"? This action cannot be undone.
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

export default AdminEditAd;