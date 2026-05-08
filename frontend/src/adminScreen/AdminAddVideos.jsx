// adminScreen/AdminAddVideos.jsx - CORRECTED VERSION
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSave,
  FaVideo,
  FaTag,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaTrashAlt,
  FaPlay,
  FaCheckCircle,
  FaYoutube,
  FaUpload,
  FaLink,
  FaExchangeAlt,
} from 'react-icons/fa';
import { 
  useUploadVideoMutation, 
  usePostYoutubeVideoMutation   // ADD THIS IMPORT
} from '../slices/videoApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminAddVideos = () => {
  const navigate = useNavigate();
  const [uploadVideo, { isLoading: isUploadLoading }] = useUploadVideoMutation();
  const [postYoutubeVideo, { isLoading: isYoutubeLoading }] = usePostYoutubeVideoMutation(); // ADD THIS
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    tags: '',
    isEducational: false,
  });
  
  // Video source toggle: 'file' or 'youtube'
  const [videoSource, setVideoSource] = useState('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  // File upload state
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoName, setVideoName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Combined loading state
  const isLoading = isUploadLoading || isYoutubeLoading || uploading;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processVideoFile(file);
  };

  const processVideoFile = (file) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mov'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload MP4, WebM, or MOV video files');
      return;
    }
    
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Video size must be less than 500MB');
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      toast.warning('Large video detected. Upload may take a while for 30+ minute videos.');
    }
    
    setVideoFile(file);
    setVideoName(file.name);
    
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview('');
    setVideoName('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) processVideoFile(file);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
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
    
    if (videoSource === 'file' && !videoFile) {
      toast.error('Please select a video file');
      return;
    }
    
    if (videoSource === 'youtube') {
      if (!youtubeUrl.trim()) {
        toast.error('Please enter a YouTube URL');
        return;
      }
      
      const videoId = extractYoutubeId(youtubeUrl);
      if (!videoId) {
        toast.error('Invalid YouTube URL. Please enter a valid YouTube video link.');
        return;
      }
      
      // Prepare YouTube submission data (NOT FormData for JSON)
      const submitData = {
        youtubeUrl: youtubeUrl,
        title: formData.title.trim(),  // Add title
        description: formData.description || '',
        category: formData.category,
        isEducational: formData.isEducational,
        tags: formData.tags,
      };
      
      try {
        setUploading(true);
        // ✅ USE THE CORRECT MUTATION FOR YOUTUBE
        await postYoutubeVideo(submitData).unwrap();
        toast.success('YouTube video added successfully!');
        navigate('/admin/videos');
      } catch (error) {
        console.error('YouTube upload error:', error);
        toast.error(error?.data?.message || 'Failed to add YouTube video');
      } finally {
        setUploading(false);
      }
      return;
    }
    
    // File upload - Use FormData
    const submitData = new FormData();
    submitData.append('title', formData.title.trim());
    submitData.append('description', formData.description || '');
    submitData.append('category', formData.category);
    submitData.append('isEducational', formData.isEducational);
    
    if (formData.tags) {
      submitData.append('tags', formData.tags);
    }
    
    // ✅ IMPORTANT: The backend expects 'video' field, NOT 'videoFile'
    submitData.append('video', videoFile);
    
    try {
      setUploading(true);
      // ✅ USE uploadVideo FOR FILE UPLOADS
      await uploadVideo(submitData).unwrap();
      toast.success('Video uploaded successfully!');
      navigate('/admin/videos');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error?.data?.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Upload New Video</h1>
            <p className="text-gray-500 mt-1">Upload a video file or embed from YouTube</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0043FC] text-white rounded-lg font-medium hover:bg-[#0038D4] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave />
            {isLoading ? 'Processing...' : videoSource === 'youtube' ? 'Add YouTube Video' : 'Publish Video'}
          </button>
        </div>

        {/* Form */}
        <form className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Source Toggle */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Source</h2>
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setVideoSource('file')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                    videoSource === 'file'
                      ? 'bg-white text-[#0043FC] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaUpload className="text-sm" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSource('youtube')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                    videoSource === 'youtube'
                      ? 'bg-white text-[#0043FC] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaYoutube className="text-sm" />
                  YouTube URL
                </button>
              </div>
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
                rows="5"
                placeholder="Describe your video content..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] focus:border-transparent resize-none"
              />
            </div>

            {/* Video Upload / YouTube URL */}
            {videoSource === 'file' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaVideo className="text-[#0043FC]" />
                  Video File *
                </h2>
                
                {!videoFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      dragOver
                        ? 'border-[#0043FC] bg-blue-50'
                        : 'border-gray-300 hover:border-[#0043FC]'
                    }`}
                  >
                    <label className="cursor-pointer block">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaVideo className="text-3xl text-[#0043FC]" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Drag & drop your video here</p>
                      <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                      <p className="text-xs text-gray-400 mt-2">MP4, WebM, MOV • Max 500MB • Up to 30 minutes</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Video Preview */}
                    {videoPreview && (
                      <div className="relative rounded-lg overflow-hidden bg-black">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full max-h-[400px] object-contain"
                        />
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <FaTrashAlt className="text-sm" />
                        </button>
                      </div>
                    )}
                    
                    {/* File Info */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <FaVideo className="text-2xl text-[#0043FC]" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{videoName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(videoFile?.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaYoutube className="text-red-500" />
                  YouTube Video URL *
                </h2>
                
                <div className="relative">
                  <FaLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] focus:border-transparent"
                  />
                </div>
                
                {youtubeUrl && extractYoutubeId(youtubeUrl) && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                    <div className="aspect-video bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYoutubeId(youtubeUrl)}`}
                        title="YouTube preview"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50">
                      <FaCheckCircle className="text-green-500 text-sm" />
                      <span className="text-sm text-gray-600">Valid YouTube URL</span>
                      <span className="text-xs text-gray-400 ml-auto">ID: {extractYoutubeId(youtubeUrl)}</span>
                    </div>
                  </div>
                )}
                
                {youtubeUrl && !extractYoutubeId(youtubeUrl) && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600">Invalid YouTube URL. Please check the link.</p>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-3">
                  Supported formats: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
                </p>
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

            {/* Upload Tips */}
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <FaInfoCircle />
                {videoSource === 'file' ? 'Upload Tips' : 'YouTube Tips'}
              </h3>
              {videoSource === 'file' ? (
                <ul className="space-y-2 text-xs text-blue-700">
                  <li>• MP4 format recommended for best compatibility</li>
                  <li>• Keep videos under 30 minutes for optimal playback</li>
                  <li>• Maximum file size: 500MB</li>
                  <li>• Use descriptive titles for better discoverability</li>
                </ul>
              ) : (
                <ul className="space-y-2 text-xs text-blue-700">
                  <li>• Paste the full YouTube video URL</li>
                  <li>• Works with youtube.com, youtu.be, embed, and shorts links</li>
                  <li>• The video will be embedded directly in the player</li>
                  <li>• Make sure the video is public or unlisted</li>
                  <li>• Title and thumbnail will be auto-fetched from YouTube</li>
                </ul>
              )}
            </div>

            {/* Preview Info */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-[#0043FC]" />
                Preview Info
              </h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Title: {formData.title || '(Not set)'}</li>
                <li>• Source: {videoSource === 'file' ? 'File Upload' : 'YouTube'}</li>
                <li>• Category: {formData.category}</li>
                <li>• Educational: {formData.isEducational ? 'Yes' : 'No'}</li>
                {videoSource === 'file' && (
                  <li>• File: {videoFile ? videoName : 'Not selected'}</li>
                )}
                {videoSource === 'youtube' && (
                  <li>• YouTube: {youtubeUrl ? 'URL set' : 'Not set'}</li>
                )}
              </ul>
            </div>
          </div>
        </form>
      </div>
    </AdminSidebar>
  );
};

export default AdminAddVideos;