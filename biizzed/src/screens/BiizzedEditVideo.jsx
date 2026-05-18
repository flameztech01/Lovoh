// screens/BiizzedEditVideo.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft, FaSave, FaSpinner, FaTag, FaYoutube, FaVideo,
  FaCheckCircle, FaTimes, FaInfoCircle,
} from 'react-icons/fa';
import { useGetVideoByIdQuery, useUpdateVideoMutation } from '../slices/videoApiSlice';
import { toast } from 'react-toastify';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';

const BiizzedEditVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: video, isLoading, error } = useGetVideoByIdQuery(id);
  const [updateVideo, { isLoading: isUpdating }] = useUpdateVideoMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    isEducational: false,
  });

  const categories = ['General', 'Education', 'Business', 'Technology', 'News', 'Entertainment', 'Tutorial', 'Interview'];
  const isYouTube = video?.videoType === 'youtube';

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        category: video.category || 'General',
        tags: video.tags?.join(', ') || '',
        isEducational: video.isEducational || false,
      });
    }
  }, [video]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
      isEducational: formData.isEducational,
    };

    // For YouTube videos, we could also allow updating youtubeUrl, but that's complex.
    // We'll keep it simple: metadata only.

    try {
      await updateVideo({ id, data: payload }).unwrap();
      toast.success('Video updated successfully!');
      navigate(`/videos/${id}`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update video');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" />
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Video not found</h1>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-[#1B3766] text-white rounded-xl">Go Back</button>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <BiizzedArticlesNavbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] text-sm">
            <FaArrowLeft /> Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50"
          >
            {isUpdating ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Update Video</>}
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* Video Preview / Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              {isYouTube ? <FaYoutube className="text-red-600" /> : <FaVideo className="text-[#1B3766]" />}
              Video Preview
            </h3>
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-3">
              {isYouTube ? (
                <img
                  src={video.youtubeThumbnail || video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video src={video.videoUrl} className="w-full h-full" controls />
              )}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                {isYouTube ? <FaYoutube className="text-red-500" /> : <FaVideo />}
                {isYouTube ? 'YouTube Video' : 'Uploaded Video'}
              </div>
            </div>
            {isYouTube && (
              <p className="text-xs text-gray-500 mt-1">
                <FaInfoCircle className="inline mr-1 text-blue-500" />
                Only metadata can be edited. To change the video URL, delete and re‑upload.
              </p>
            )}
          </div>

          {/* Title */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Video title..."
              className="w-full text-xl font-bold border-0 outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Video description..."
              rows={3}
              className="w-full text-sm border-0 outline-none placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2"><FaTag className="inline mr-1" />Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                required
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="tutorial, tech..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Educational Toggle */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isEducational"
                checked={formData.isEducational}
                onChange={handleChange}
                className="w-4 h-4 text-[#1B3766] rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">Mark as Educational</p>
                <p className="text-xs text-gray-400">Educational videos appear in learning feeds</p>
              </div>
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-medium hover:bg-[#142952] disabled:opacity-50 lg:hidden"
          >
            {isUpdating ? 'Updating...' : 'Update Video'}
          </button>
        </form>
      </div>
      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedEditVideo;