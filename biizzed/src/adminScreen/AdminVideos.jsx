// adminScreen/AdminVideos.jsx
import React, { useState } from 'react';
import {
  FaSearch,
  FaSpinner,
  FaTrashAlt,
  FaEye,
  FaExternalLinkAlt,
  FaVideo,
  FaGraduationCap,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetVideosQuery,
  useDeleteVideoMutation,
} from '../slices/videoApiSlice';

const AdminVideos = () => {
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    isEducational: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const limit = 20;

  // Build query params – fetch all statuses for admin
  const queryParams = {
    status: filters.status || 'published,draft,private',
    page: currentPage,
    limit,
  };
  if (filters.category) queryParams.category = filters.category;
  if (filters.isEducational === 'true') queryParams.isEducational = true;
  if (filters.isEducational === 'false') queryParams.isEducational = false;
  if (filters.search) queryParams.search = filters.search;

  const { data, isLoading, refetch } = useGetVideosQuery(queryParams);
  const [deleteVideo] = useDeleteVideoMutation();

  const videos = data?.videos || [];
  const totalPages = data?.pages || 1;
  const total = data?.total || 0;

  // Stats from fetched data
  const stats = {
    total,
    published: videos.filter(v => v.status === 'published').length,
    draft: videos.filter(v => v.status === 'draft').length,
    private: videos.filter(v => v.status === 'private').length,
    educational: videos.filter(v => v.isEducational).length,
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSelectVideo = (id) => {
    setSelectedVideos(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedVideos.length === videos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos.map(v => v._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedVideos.length} videos? This cannot be undone.`)) return;
    try {
      await Promise.all(selectedVideos.map(id => deleteVideo(id).unwrap()));
      toast.success(`${selectedVideos.length} videos deleted`);
      setSelectedVideos([]);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Bulk delete failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video permanently?')) return;
    try {
      await deleteVideo(id).unwrap();
      toast.success('Video deleted');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      private: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      published: 'Published',
      draft: 'Draft',
      private: 'Private',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Videos Management</h1>
        <p className="text-gray-500 mt-1">Manage all videos submitted by users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Published</p>
          <p className="text-xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Drafts</p>
          <p className="text-xl font-bold text-gray-600">{stats.draft}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Private</p>
          <p className="text-xl font-bold text-yellow-600">{stats.private}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Educational</p>
          <p className="text-xl font-bold text-blue-600">{stats.educational}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Title, description..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
            >
              <option value="">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              placeholder="Category"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Educational</label>
            <select
              name="isEducational"
              value={filters.isEducational}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-28"
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          {selectedVideos.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Delete Selected ({selectedVideos.length})
            </button>
          )}
        </div>
      </div>

      {/* Videos Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="animate-spin text-3xl text-[#1B3766]" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedVideos.length === videos.length && videos.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Educational</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {videos.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      No videos found
                    </td>
                  </tr>
                ) : (
                  videos.map((video) => (
                    <tr key={video._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedVideos.includes(video._id)}
                          onChange={() => handleSelectVideo(video._id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-20 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0 relative">
                          {video.thumbnail ? (
                            <img
                              src={video.thumbnail}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FaVideo className="text-sm" />
                            </div>
                          )}
                          {video.duration && (
                            <span className="absolute bottom-0 right-0 px-1 text-[8px] bg-black/70 text-white rounded-tl">
                              {formatDuration(video.duration)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                          <p className="text-xs text-gray-500 truncate">{video.description?.substring(0, 60)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {video.authorName || video.user?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{video.category || 'General'}</td>
                      <td className="px-4 py-3">{getStatusBadge(video.status)}</td>
                      <td className="px-4 py-3 text-center">
                        {video.isEducational ? (
                          <FaGraduationCap className="text-blue-500 text-sm mx-auto" title="Educational" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{video.views || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(video.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.open(`/videos/${video._id}`, '_blank')}
                            className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                            title="View on site"
                          >
                            <FaExternalLinkAlt className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(video._id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete"
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
    </div>
  );
};

export default AdminVideos;