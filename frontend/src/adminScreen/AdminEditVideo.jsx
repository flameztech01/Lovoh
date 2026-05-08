// adminScreen/AdminEditVideo.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSave,
  FaVideo,
  FaTag,
  FaInfoCircle,
  FaTrashAlt,
  FaYoutube,
  FaUpload,
  FaLink,
  FaCheckCircle,
  FaSpinner,
} from 'react-icons/fa';
import { 
  useGetVideoByIdQuery, 
  useUpdateVideoMutation,
  useDeleteVideoMutation 
} from '../slices/videoApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminEditVideo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { data: videoData, isLoading: isLoadingVideo, error: videoError } = useGetVideoByIdQuery(id);
  const [updateVideo, { isLoading: isUpdating }] = useUpdateVideoMutation();
  const [deleteVideo, { isLoading: isDeleting }] = useDeleteVideoMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    tags: '',
    isEducational: false,
  });
  
  const [videoSource, setVideoSource] = useState('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load video data when available
  useEffect(() => {
    if (videoData) {
      setFormData({
        title: videoData.title || '',
        description: videoData.description || '',
        category: videoData.category || 'General',
        tags: videoData.tags ? (Array.isArray(videoData.tags) ? videoData.tags.join(', ') : videoData.tags) : '',
        isEducational: videoData.isEducational || false,
      });
      
      if (videoData.videoType === 'youtube') {
        setVideoSource('youtube');
        setYoutubeUrl(videoData.youtubeUrl || '');
      } else {
        setVideoSource('file');
      }
    }
  }, [videoData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const extractYoutubeId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Video title is required');
      return;
    }
    
    const updateData = {
      title: formData.title.trim(),
      description: formData.description || '',
      category: formData.category,
      isEducational: formData.isEducational,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
    };
    
    // If it's a YouTube video and URL changed, validate
    if (videoSource === 'youtube' && videoData?.videoType === 'youtube') {
      if (youtubeUrl !== videoData.youtubeUrl) {
        const videoId = extractYoutubeId(youtubeUrl);
        if (!videoId) {
          toast.error('Invalid YouTube URL');
          return;
        }
        updateData.youtubeUrl = youtubeUrl;
        updateData.youtubeId = videoId;
      }
    }
    
    try {
      await updateVideo({ id, data: updateData }).unwrap();
      toast.success('Video updated successfully!');
      navigate('/admin/videos');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update video');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      try {
        await deleteVideo(id).unwrap();
        toast.success('Video deleted successfully!');
        navigate('/admin/videos');
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to delete video');
      }
    }
  };

  if (isLoadingVideo) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-[#0043FC] mx-auto mb-4" />
            <p className="text-gray-500">Loading video...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  if (videoError || !videoData) {
    return (
      <AdminSidebar>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">Video not found or error loading</p>
            <button
              onClick={() => navigate('/admin/videos')}
              className="px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4]"
            >
              Back to Videos
            </button>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate('/admin/videos')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0043FC] mb-2 transition-colors"
            >
              <FaArrowLeft />
              Back to Videos
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Video</h1>
            <p className="text-gray-500 mt-1">
              {videoData.videoType === 'youtube' ? 'Editing YouTube video' : 'Editing uploaded video'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-300 disabled:opacity-50"
            >
              <FaTrashAlt />
              {isDeleting ? 'Deleting...' : 'Delete Video'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0043FC] text-white rounded-lg font-medium hover:bg-[#0038D4] transition-all duration-300 disabled:opacity-50"
            >
              <FaSave />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Video Preview Section */}
        <div className="mb-6">
          {videoData.videoType === 'youtube' ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${videoData.youtubeId}`}
                  title={videoData.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <FaYoutube className="text-red-500 text-xl" />
                  <span className="text-sm text-gray-600">YouTube Video</span>
                  <span className="text-xs text-gray-400 ml-auto">ID: {videoData.youtubeId}</span>
                </div>
              </div>
            </div>
          ) : videoData.videoUrl && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <video
                src={videoData.videoUrl}
                controls
                className="w-full max-h-[500px] object-contain bg-black"
                poster={videoData.thumbnail}
              />
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <FaUpload className="text-[#0043FC] text-xl" />
                  <span className="text-sm text-gray-600">Uploaded Video</span>
                  {videoData.duration && (
                    <span className="text-xs text-gray-400 ml-auto">
                      Duration: {Math.floor(videoData.duration / 60)}:{(videoData.duration % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <form className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Source Info (Read-only for edit) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Source</h2>
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <div className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium ${
                  videoSource === 'file'
                    ? 'bg-white text-[#0043FC] shadow-sm'
                    : 'text-gray-600'
                }`}>
                  <FaUpload className="text-sm" />
                  Uploaded File
                </div>
                <div className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium ${
                  videoSource === 'youtube'
                    ? 'bg-white text-[#0043FC] shadow-sm'
                    : 'text-gray-600'
                }`}>
                  <FaYoutube className="text-sm" />
                  YouTube Video
                </div>
              </div>
              {videoSource === 'youtube' && (
                <p className="text-xs text-gray-500 mt-3">
                  ⚠️ Video source cannot be changed after creation
                </p>
              )}
            </div>

            {/* Title */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter video title..."
                className="w-full px-4 py-3 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Describe your video content..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                {formData.description.length} characters
              </p>
            </div>

            {/* YouTube URL (if applicable) */}
            {videoSource === 'youtube' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaLink className="inline mr-1 text-red-500" />
                  YouTube URL
                </label>
                <div className="relative">
                  <FaLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] focus:border-transparent"
                    disabled={!isEditing}
                  />
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="mt-2 text-sm text-[#0043FC] hover:underline"
                  >
                    Edit YouTube URL
                  </button>
                )}
                {isEditing && youtubeUrl !== videoData.youtubeUrl && extractYoutubeId(youtubeUrl) && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <FaCheckCircle />
                      New YouTube ID detected: {extractYoutubeId(youtubeUrl)}
                    </p>
                  </div>
                )}
                {isEditing && youtubeUrl && !extractYoutubeId(youtubeUrl) && (
                  <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600">Invalid YouTube URL format</p>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaTag className="inline mr-1 text-[#0043FC]" />
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., tutorial, technology, education"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-2">
                Separate tags with commas
              </p>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaTag className="text-[#0043FC]" />
                Category
              </h2>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              >
                <option value="General">General</option>
                <option value="Education">Education</option>
                <option value="Business">Business</option>
                <option value="Technology">Technology</option>
                <option value="News">News</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Interview">Interview</option>
                <option value="Music">Music</option>
              </select>
            </div>

            {/* Educational Toggle */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Type</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isEducational"
                  checked={formData.isEducational}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#0043FC] rounded focus:ring-[#0043FC]"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">Mark as Educational</p>
                  <p className="text-xs text-gray-400">Educational videos appear in learning feeds</p>
                </div>
              </label>
            </div>

            {/* Video Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Views:</span>
                  <span className="font-semibold text-gray-900">{videoData.views || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Likes:</span>
                  <span className="font-semibold text-gray-900">{videoData.likes?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Comments:</span>
                  <span className="font-semibold text-gray-900">{videoData.comments?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Posted:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(videoData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {videoData.videoType === 'file' && videoData.duration && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Duration:</span>
                    <span className="text-sm text-gray-600">
                      {Math.floor(videoData.duration / 60)}:{(videoData.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <FaInfoCircle />
                Edit Information
              </h3>
              <ul className="space-y-2 text-xs text-blue-700">
                <li>• Changes will be applied immediately</li>
                <li>• Video file cannot be changed after upload</li>
                <li>• Thumbnails auto-update if YouTube URL changes</li>
                <li>• Tags help users find your content</li>
              </ul>
            </div>

            {/* Metadata Info */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-[#0043FC]" />
                Video Info
              </h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• ID: {videoData._id}</li>
                <li>• Type: {videoData.videoType === 'youtube' ? 'YouTube Embed' : 'Uploaded File'}</li>
                <li>• Author: {videoData.authorName || videoData.user?.name}</li>
                {videoData.videoType === 'youtube' && videoData.youtubeId && (
                  <li>• YouTube ID: {videoData.youtubeId}</li>
                )}
              </ul>
            </div>
          </div>
        </form>
      </div>
    </AdminSidebar>
  );
};

export default AdminEditVideo;