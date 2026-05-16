// adminScreen/AdminMagazines.jsx
import React, { useState } from 'react';
import {
  FaSearch,
  FaSpinner,
  FaTrashAlt,
  FaStar,
  FaRegStar,
  FaEye,
  FaExternalLinkAlt,
  FaBookOpen,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetMagazinesQuery,
  useDeleteMagazineMutation,
  useToggleFeaturedMagazineMutation,
} from '../slices/magApiSlice';

const AdminMagazines = () => {
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    featured: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMagazines, setSelectedMagazines] = useState([]);
  const limit = 20;

  // Build query params – fetch all statuses for admin
  const queryParams = {
    status: filters.status || 'published,coming_soon,draft',
    page: currentPage,
    limit,
  };
  if (filters.category) queryParams.category = filters.category;
  if (filters.featured === 'true') queryParams.featured = true;
  if (filters.featured === 'false') queryParams.featured = false;
  if (filters.search) queryParams.search = filters.search;

  const { data, isLoading, refetch } = useGetMagazinesQuery(queryParams);
  const [deleteMagazine] = useDeleteMagazineMutation();
  const [toggleFeatured] = useToggleFeaturedMagazineMutation();

  const magazines = data?.magazines || [];
  const totalPages = data?.pages || 1;
  const total = data?.total || 0;

  // Stats from fetched data
  const stats = {
    total,
    published: magazines.filter(m => m.status === 'published').length,
    drafts: magazines.filter(m => m.status === 'draft').length,
    comingSoon: magazines.filter(m => m.status === 'coming_soon').length,
    featured: magazines.filter(m => m.isFeatured).length,
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSelectMagazine = (id) => {
    setSelectedMagazines(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMagazines.length === magazines.length) {
      setSelectedMagazines([]);
    } else {
      setSelectedMagazines(magazines.map(m => m._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedMagazines.length} magazines? This cannot be undone.`)) return;
    try {
      await Promise.all(selectedMagazines.map(id => deleteMagazine(id).unwrap()));
      toast.success(`${selectedMagazines.length} magazines deleted`);
      setSelectedMagazines([]);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Bulk delete failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this magazine permanently?')) return;
    try {
      await deleteMagazine(id).unwrap();
      toast.success('Magazine deleted');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const handleToggleFeatured = async (id, current) => {
    try {
      await toggleFeatured(id).unwrap();
      toast.success(current ? 'Removed from featured' : 'Marked as featured');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to toggle featured');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      coming_soon: 'bg-orange-100 text-orange-800',
    };
    const labels = {
      published: 'Published',
      draft: 'Draft',
      coming_soon: 'Coming Soon',
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Magazines Management</h1>
        <p className="text-gray-500 mt-1">Manage all magazines submitted by users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
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
          <p className="text-xl font-bold text-gray-600">{stats.drafts}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Coming Soon</p>
          <p className="text-xl font-bold text-orange-600">{stats.comingSoon}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Featured</p>
          <p className="text-xl font-bold text-blue-600">{stats.featured}</p>
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
                placeholder="Title, summary, author..."
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
              <option value="coming_soon">Coming Soon</option>
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
            <label className="block text-xs font-medium text-gray-500 mb-1">Featured</label>
            <select
              name="featured"
              value={filters.featured}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-28"
            >
              <option value="">All</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
          </div>
          {selectedMagazines.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Delete Selected ({selectedMagazines.length})
            </button>
          )}
        </div>
      </div>

      {/* Magazines Table */}
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
                      checked={selectedMagazines.length === magazines.length && magazines.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {magazines.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                      No magazines found
                    </td>
                  </tr>
                ) : (
                  magazines.map((magazine) => (
                    <tr key={magazine._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedMagazines.includes(magazine._id)}
                          onChange={() => handleSelectMagazine(magazine._id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-10 h-14 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          {magazine.coverImage ? (
                            <img
                              src={magazine.coverImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FaBookOpen className="text-xs" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-gray-900 truncate">{magazine.title}</p>
                          <p className="text-xs text-gray-500 truncate">{magazine.summary?.substring(0, 60)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{magazine.author || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{magazine.category}</td>
                      <td className="px-4 py-3">{getStatusBadge(magazine.status)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleFeatured(magazine._id, magazine.isFeatured)}
                          className="text-yellow-500 hover:text-yellow-600 transition-colors"
                          title={magazine.isFeatured ? 'Remove featured' : 'Mark featured'}
                        >
                          {magazine.isFeatured ? <FaStar className="text-sm" /> : <FaRegStar className="text-sm" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(magazine.publishedAt || magazine.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.open(`/${magazine.slug}`, '_blank')}
                            className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                            title="View on site"
                          >
                            <FaExternalLinkAlt className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(magazine._id)}
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

export default AdminMagazines;