// screens/BizzzedCreateVideo.jsx - With YouTube Link + Direct Upload
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaSave, FaUpload, FaVideo, FaTrashAlt,
  FaSpinner, FaTag, FaPlay, FaTimes, FaCheckCircle,
  FaYoutube, FaLink, FaExternalLinkAlt, FaExchangeAlt,
} from 'react-icons/fa';
import { useUploadVideoMutation, usePostYoutubeVideoMutation } from '../slices/videoApiSlice';
import { toast } from 'react-toastify';
import BizzzedArticlesNavbar from '../components/BizzzedArticlesNavbar';
import BizzzedBottomBar from '../components/BizzzedBottombar';

const BizzzedCreateVideo = () => {
  const navigate = useNavigate();
  const [uploadVideo, { isLoading: isUploading }] = useUploadVideoMutation();
  const [postYoutube, { isLoading: isPostingYoutube }] = usePostYoutubeVideoMutation();

  // Tab state: 'upload' or 'youtube'
  const [activeTab, setActiveTab] = useState('upload');

  // Upload form state
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', tags: '', isEducational: false,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // YouTube form state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeCategory, setYoutubeCategory] = useState('');
  const [youtubeTags, setYoutubeTags] = useState('');
  const [isValidYoutube, setIsValidYoutube] = useState(false);
  const [isCheckingYoutube, setIsCheckingYoutube] = useState(false);
  const [youtubePreview, setYoutubePreview] = useState(null);

  const categories = ['General', 'Education', 'Business', 'Technology', 'News', 'Entertainment', 'Tutorial', 'Interview'];

  // Validate YouTube URL with debounce
  useEffect(() => {
    if (activeTab !== 'youtube') return;

    const validateYoutubeUrl = async () => {
      if (!youtubeUrl.trim()) {
        setIsValidYoutube(false);
        setYoutubePreview(null);
        return;
      }

      setIsCheckingYoutube(true);

      const extractYoutubeId = (url) => {
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
          /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
        ];
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) return match[1];
        }
        return null;
      };

      const videoId = extractYoutubeId(youtubeUrl);

      if (videoId) {
        try {
          const response = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
          );
          
          if (response.ok) {
            const data = await response.json();
            setIsValidYoutube(true);
            setYoutubePreview({
              id: videoId,
              title: data.title,
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              authorName: data.author_name,
            });
          } else {
            setIsValidYoutube(true);
            setYoutubePreview({
              id: videoId,
              title: 'YouTube Video',
              thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              authorName: 'YouTube Creator',
            });
          }
        } catch (error) {
          setIsValidYoutube(true);
          setYoutubePreview({
            id: videoId,
            title: 'YouTube Video',
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            authorName: 'YouTube Creator',
          });
        }
      } else {
        setIsValidYoutube(false);
        setYoutubePreview(null);
      }

      setIsCheckingYoutube(false);
    };

    const timeoutId = setTimeout(validateYoutubeUrl, 500);
    return () => clearTimeout(timeoutId);
  }, [youtubeUrl, activeTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) { toast.error('Only MP4, WebM, MOV allowed'); return; }
    if (file.size > 500 * 1024 * 1024) { toast.error('Video must be under 500MB'); return; }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview('');
    setUploadProgress(0);
  };

  // Handle direct upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    if (!videoFile) { toast.error('Video file is required'); return; }

    const fd = new FormData();
    fd.append('title', formData.title.trim());
    fd.append('description', formData.description);
    fd.append('category', formData.category || 'General');
    fd.append('tags', formData.tags);
    fd.append('isEducational', formData.isEducational);
    fd.append('video', videoFile);

    try {
      await uploadVideo(fd).unwrap();
      toast.success('Video uploaded successfully!');
      navigate('/biizzed/videos');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to upload');
    }
  };

  // Handle YouTube post
  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    if (!isValidYoutube || !youtubePreview) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    try {
      await postYoutube({
        youtubeUrl: `https://www.youtube.com/watch?v=${youtubePreview.id}`,
        category: youtubeCategory || 'General',
        tags: youtubeTags,
      }).unwrap();

      toast.success('YouTube video posted successfully!');
      navigate('/biizzed/videos');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to post YouTube video');
    }
  };

  const isLoading = isUploading || isPostingYoutube;

  return (
    <div className="min-h-screen bg-gray-100">
      <BizzzedArticlesNavbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] text-sm">
            <FaArrowLeft /> Back
          </button>
          <button 
            onClick={activeTab === 'upload' ? handleUploadSubmit : handleYoutubeSubmit} 
            disabled={isLoading || (activeTab === 'youtube' && !isValidYoutube)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50"
          >
            {isLoading ? (
              <><FaSpinner className="animate-spin" /> Posting...</>
            ) : (
              <><FaSave /> {activeTab === 'upload' ? 'Upload Video' : 'Post YouTube Video'}</>
            )}
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-200 mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-[#1B3766] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaVideo className="text-sm" />
              Upload Video
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'youtube'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaYoutube className="text-sm" />
              YouTube Link
            </button>
          </div>
        </div>

        {/* ==================== UPLOAD TAB ==================== */}
        {activeTab === 'upload' && (
          <form onSubmit={e => e.preventDefault()} className="space-y-4">
            {/* Video Upload */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FaVideo className="text-[#1B3766]" /> Video File *
              </h3>
              
              {!videoPreview ? (
                <label className="block cursor-pointer">
                  <div className="aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-[#1B3766] transition-colors p-8 bg-gray-50">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
                      <FaVideo className="text-red-500 text-2xl" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Upload Video</p>
                    <p className="text-xs text-gray-400 mt-1">MP4, WebM, MOV • Max 500MB • Up to 30 min</p>
                  </div>
                  <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                    <video src={videoPreview} controls className="w-full h-full" />
                    <button type="button" onClick={removeVideo} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      <span className="text-gray-700 font-medium truncate max-w-[200px]">{videoFile?.name}</span>
                    </div>
                    <span className="text-gray-400 text-xs">{(videoFile?.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#1B3766] h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <input
                type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="Video title..."
                className="w-full text-xl font-bold border-0 outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <textarea
                name="description" value={formData.description} onChange={handleChange}
                placeholder="Video description..."
                rows={3}
                className="w-full text-sm border-0 outline-none placeholder:text-gray-400 resize-none"
              />
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <label className="block text-xs font-semibold text-gray-500 mb-2"><FaTag className="inline mr-1" />Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="">Select</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <label className="block text-xs font-semibold text-gray-500 mb-2">Tags</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="tutorial, tech..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

            {/* Educational Toggle */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="isEducational" checked={formData.isEducational} onChange={handleChange} className="w-4 h-4 text-[#1B3766] rounded" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Mark as Educational</p>
                  <p className="text-xs text-gray-400">Educational videos appear in learning feeds</p>
                </div>
              </label>
            </div>

            <button onClick={handleUploadSubmit} disabled={isUploading} className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-medium hover:bg-[#142952] disabled:opacity-50 lg:hidden">
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>
        )}

        {/* ==================== YOUTUBE TAB ==================== */}
        {activeTab === 'youtube' && (
          <form onSubmit={e => e.preventDefault()} className="space-y-4">
            {/* YouTube URL Input */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FaYoutube className="text-red-600" /> YouTube Video URL *
              </h3>
              
              <div className="relative">
                <FaLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                    youtubeUrl && isValidYoutube
                      ? "border-green-500 focus:ring-green-500"
                      : youtubeUrl && !isValidYoutube
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-[#1B3766] focus:border-transparent"
                  }`}
                />
                {isCheckingYoutube ? (
                  <FaSpinner className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                ) : youtubeUrl && isValidYoutube ? (
                  <FaCheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500" />
                ) : youtubeUrl && !isValidYoutube ? (
                  <FaTimes className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500" />
                ) : null}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Supports: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/
              </p>

              {/* Invalid URL Message */}
              {youtubeUrl && !isValidYoutube && !isCheckingYoutube && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-600 flex items-center gap-2">
                    <FaTimes className="flex-shrink-0" />
                    Please enter a valid YouTube URL
                  </p>
                </div>
              )}
            </div>

            {/* YouTube Preview */}
            {youtubePreview && isValidYoutube && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 animate-slideUp">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FaYoutube className="text-red-600" /> Video Preview
                </h3>
                
                <div className="relative rounded-xl overflow-hidden mb-4">
                  <img
                    src={youtubePreview.thumbnail}
                    alt={youtubePreview.title}
                    className="w-full aspect-video object-cover"
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${youtubePreview.id}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <FaPlay className="text-white text-xl ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <FaYoutube /> YouTube
                  </div>
                </div>

                <h4 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                  {youtubePreview.title}
                </h4>
                <p className="text-xs text-gray-500 mb-3">{youtubePreview.authorName}</p>

                <a
                  href={`https://www.youtube.com/watch?v=${youtubePreview.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  <FaExternalLinkAlt className="text-[10px]" /> Watch on YouTube
                </a>
              </div>
            )}

            {/* Category & Tags for YouTube */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <label className="block text-xs font-semibold text-gray-500 mb-2"><FaTag className="inline mr-1" />Category</label>
                <select 
                  value={youtubeCategory} 
                  onChange={(e) => setYoutubeCategory(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">Select</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <label className="block text-xs font-semibold text-gray-500 mb-2">Tags</label>
                <input 
                  type="text" 
                  value={youtubeTags} 
                  onChange={(e) => setYoutubeTags(e.target.value)} 
                  placeholder="tutorial, tech..." 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" 
                />
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaYoutube className="text-blue-600 text-sm" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-900 mb-1">How it works</p>
                  <p className="text-xs text-blue-700">
                    The video title and thumbnail will be fetched automatically from YouTube. 
                    The video will play directly on Bizzzed using our built-in YouTube player.
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleYoutubeSubmit} 
              disabled={isPostingYoutube || !isValidYoutube} 
              className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 lg:hidden"
            >
              {isPostingYoutube ? 'Posting...' : 'Post YouTube Video'}
            </button>
          </form>
        )}

        {/* Swap Button - Quick toggle between tabs */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setActiveTab(activeTab === 'upload' ? 'youtube' : 'upload')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-[#1B3766] transition-colors"
          >
            <FaExchangeAlt className="text-xs" />
            {activeTab === 'upload' ? 'Share a YouTube link instead' : 'Upload a video file instead'}
          </button>
        </div>
      </div>
      <BizzzedBottomBar />
    </div>
  );
};

export default BizzzedCreateVideo;