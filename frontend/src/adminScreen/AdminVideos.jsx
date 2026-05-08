// adminScreen/AdminVideos.jsx - Updated with authorType filter
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaVideo,
  FaPlay,
  FaYoutube,
  FaCalendarAlt,
  FaEye as FaEyeIcon,
  FaHeart,
  FaComment,
  FaStar,
  FaUser,
  FaUserShield,
  FaUsers,
  FaUserCircle,
} from 'react-icons/fa';
import {
  useGetVideosQuery,
  useDeleteVideoMutation,
} from '../slices/videoApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminVideos = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [educationalFilter, setEducationalFilter] = useState('');
  const [authorTypeFilter, setAuthorTypeFilter] = useState(''); // 'admin', 'user', or ''
  const [currentPage, setCurrentPage] = useState(1);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const itemsPerPage = 12;

  // Build query params with authorType filter
  const queryParams = {
    search: searchTerm || undefined,
    category: categoryFilter || undefined,
    isEducational: educationalFilter === 'true' ? true : educationalFilter === 'false' ? false : undefined,
    page: currentPage,
    limit: itemsPerPage,
    sort: '-createdAt',
  };

  // Add authorType to query params if selected
  if (authorTypeFilter === 'admin') {
    queryParams.authorType = 'admin';
  } else if (authorTypeFilter === 'user') {
    queryParams.authorType = 'user';
  }

  const { data: videosData, isLoading, refetch } = useGetVideosQuery(queryParams);

  const [deleteVideo, { isLoading: isDeleting }] = useDeleteVideoMutation();

  let videos = videosData?.videos || [];
  const totalPages = videosData?.pages || 1;
  let totalVideos = videosData?.total || 0;

  // Filter by type (YouTube vs Upload) - client-side
  let filteredVideos = [...videos];
  
  if (typeFilter === 'file') {
    filteredVideos = filteredVideos.filter(v => !v.youtubeId && v.videoType !== 'youtube');
  } else if (typeFilter === 'youtube') {
    filteredVideos = filteredVideos.filter(v => v.youtubeId || v.videoType === 'youtube');
  }

  const handleDeleteClick = (video) => setVideoToDelete(video);

  const confirmDelete = async () => {
    if (!videoToDelete) return;
    try {
      await deleteVideo(videoToDelete._id).unwrap();
      toast.success(`"${videoToDelete.title}" deleted`);
      setVideoToDelete(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete video');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setTypeFilter('');
    setEducationalFilter('');
    setAuthorTypeFilter('');
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const isYouTube = (video) => {
    return video.youtubeId || video.youtubeUrl || video.videoType === 'youtube';
  };

  const hasActiveFilters = searchTerm || categoryFilter || typeFilter || educationalFilter || authorTypeFilter;

  const categories = [...new Set(videosData?.videos?.map(v => v.category).filter(Boolean) || [])];

  // Calculate stats for filtered videos
  const stats = {
    total: filteredVideos.length,
    views: filteredVideos.reduce((sum, v) => sum + (v.views || 0), 0),
    likes: filteredVideos.reduce((sum, v) => sum + (v.likes?.length || 0), 0),
    educational: filteredVideos.filter(v => v.isEducational).length,
    youtube: filteredVideos.filter(v => isYouTube(v)).length,
  };

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <FaSpinner className="w-10 h-10 text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading videos...</p>
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {authorTypeFilter === 'admin' ? 'Admin Videos' : authorTypeFilter === 'user' ? 'User Videos' : 'All Videos'}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {authorTypeFilter === 'admin' 
                ? `Showing videos uploaded by admins (${stats.total} videos)`
                : authorTypeFilter === 'user'
                ? `Showing videos uploaded by regular users (${stats.total} videos)`
                : `Manage all video content across the platform (${totalVideos} total videos)`}
            </p>
          </div>
          <Link
            to="/admin/videos/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0043FC] text-white rounded-xl font-medium hover:bg-[#0038D4] transition-all shadow-sm"
          >
            <FaPlus />
            Add Video
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Videos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <FaVideo className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Views</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {formatViews(stats.views)}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                <FaEyeIcon className="text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Likes</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatViews(stats.likes)}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <FaHeart className="text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Educational</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.educational}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <FaStar className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">YouTube</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {stats.youtube}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <FaYoutube className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Author Type Filter - NEW */}
              <select 
                value={authorTypeFilter} 
                onChange={(e) => { 
                  setAuthorTypeFilter(e.target.value); 
                  setCurrentPage(1);
                }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white min-w-[140px]"
              >
                <option value="">All Authors</option>
                <option value="admin">👑 Admin Videos</option>
                <option value="user">👤 User Videos</option>
              </select>
              
              <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="">All Types</option>
                <option value="file">📁 Uploaded</option>
                <option value="youtube">▶️ YouTube</option>
              </select>
              <select value={educationalFilter} onChange={(e) => { setEducationalFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="">All Content</option>
                <option value="true">🎓 Educational</option>
                <option value="false">📺 Regular</option>
              </select>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Active filters:</span>
              {authorTypeFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                  <FaUserShield className="text-[10px]" />
                  {authorTypeFilter === 'admin' ? 'Admin Videos' : 'User Videos'}
                  <button onClick={() => setAuthorTypeFilter('')} className="hover:text-purple-900 ml-1">×</button>
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {categoryFilter}
                  <button onClick={() => setCategoryFilter('')} className="hover:text-gray-900 ml-1">×</button>
                </span>
              )}
              {typeFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {typeFilter === 'file' ? 'Uploaded' : 'YouTube'}
                  <button onClick={() => setTypeFilter('')} className="hover:text-gray-900 ml-1">×</button>
                </span>
              )}
              {educationalFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {educationalFilter === 'true' ? 'Educational' : 'Regular'}
                  <button onClick={() => setEducationalFilter('')} className="hover:text-gray-900 ml-1">×</button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-gray-900 ml-1">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
            <FaVideo className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Start by adding your first video'}
            </p>
            {!hasActiveFilters && (
              <Link to="/admin/videos/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0043FC] text-white rounded-xl text-sm font-medium">
                <FaPlus /> Add Video
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <div key={video._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black overflow-hidden">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : isYouTube(video) ? (
                      <div className="w-full h-full flex items-center justify-center bg-red-50">
                        <FaYoutube className="text-4xl text-red-500" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <FaVideo className="text-4xl text-gray-600" />
                      </div>
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <FaPlay className="text-[#0043FC] ml-0.5" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    {video.duration > 0 && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                        {formatDuration(video.duration)}
                      </div>
                    )}

                    {/* Source Badge */}
                    <div className="absolute top-2 left-2">
                      {isYouTube(video) ? (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center gap-1">
                          <FaYoutube className="text-[8px]" /> YouTube
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded-full flex items-center gap-1">
                          <FaVideo className="text-[8px]" /> Upload
                        </span>
                      )}
                    </div>

                    {/* Educational Badge */}
                    {video.isEducational && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-medium rounded-full flex items-center gap-1">
                          <FaStar className="text-[8px]" /> Educational
                        </span>
                      </div>
                    )}

                    {/* Author Type Badge - NEW */}
                    <div className="absolute bottom-2 left-2">
                      {video.authorType === 'admin' ? (
                        <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-medium rounded-full flex items-center gap-1">
                          <FaUserShield className="text-[8px]" /> Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-500 text-white text-[10px] font-medium rounded-full flex items-center gap-1">
                          <FaUser className="text-[8px]" /> User
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#0043FC] transition-colors">
                      {video.title}
                    </h3>

                    {video.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{video.description}</p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><FaEyeIcon className="text-gray-400" />{formatViews(video.views)}</span>
                      <span className="flex items-center gap-1"><FaHeart className="text-gray-400" />{video.likes?.length || 0}</span>
                      <span className="flex items-center gap-1"><FaComment className="text-gray-400" />{video.comments?.length || 0}</span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        {video.authorType === 'admin' ? (
                          <FaUserShield className="text-[10px] text-purple-500" />
                        ) : (
                          <FaUserCircle className="text-[10px] text-gray-400" />
                        )}
                        {video.authorName || video.user?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-[10px]" />
                        {formatDate(video.createdAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
                      <a 
                        href={isYouTube(video) ? video.youtubeUrl : video.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 py-2 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <FaPlay className="text-[10px]" /> Watch
                      </a>
                      <Link to={`/admin/videos/edit/${video._id}`}
                        className="flex-1 py-2 text-xs text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center gap-1">
                        <FaEdit className="text-[10px]" /> Edit
                      </Link>
                      <button onClick={() => handleDeleteClick(video)}
                        className="flex-1 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1">
                        <FaTrashAlt className="text-[10px]" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            <p className="text-center text-xs text-gray-500 mt-4">
              Showing {filteredVideos.length} of {stats.total} videos
            </p>
          </>
        )}
      </div>

      {/* Delete Modal */}
      {videoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setVideoToDelete(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrashAlt className="text-xl text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Video</h3>
              <p className="text-sm text-gray-500 mb-6">
                Delete "{videoToDelete.title}"? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setVideoToDelete(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={confirmDelete} disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
};

export default AdminVideos;