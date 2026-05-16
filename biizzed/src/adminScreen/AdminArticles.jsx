// adminScreen/AdminArticles.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaSpinner,
  FaEdit,
  FaTrashAlt,
  FaStar,
  FaRegStar,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaFilter,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetArticlesQuery,
  useDeleteArticleMutation,
  useToggleArticleFeaturedMutation,
  useToggleEditorsPickMutation,
} from '../slices/articlesApiSlice';

const AdminArticles = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    featured: '',
    editorsPick: '',
    author: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const limit = 20;

  // Build query params – we want all articles regardless of status for admin
  const queryParams = {
    status: filters.status || 'published,coming_soon,draft',
    page: currentPage,
    limit,
  };
  if (filters.category) queryParams.category = filters.category;
  if (filters.featured === 'true') queryParams.featured = true;
  if (filters.featured === 'false') queryParams.featured = false;
  if (filters.editorsPick === 'true') queryParams.editorsPick = true;
  if (filters.search) queryParams.search = filters.search;
  // author filter would require backend support (we assume getArticles supports author param)
  if (filters.author) queryParams.author = filters.author;

  const { data, isLoading, refetch } = useGetArticlesQuery(queryParams);
  const [deleteArticle] = useDeleteArticleMutation();
  const [toggleFeatured] = useToggleArticleFeaturedMutation();
  const [toggleEditorsPick] = useToggleEditorsPickMutation();

  const articles = data?.articles || [];
  const totalPages = data?.pages || 1;
  const total = data?.total || 0;

  // Stats from fetched data (we could also add a separate stats endpoint, but this is fine)
  const stats = {
    total,
    published: articles.filter(a => a.status === 'published').length,
    drafts: articles.filter(a => a.status === 'draft').length,
    comingSoon: articles.filter(a => a.status === 'coming_soon').length,
    featured: articles.filter(a => a.isFeatured).length,
    editorsPick: articles.filter(a => a.isEditorsPick).length,
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSelectArticle = (id) => {
    setSelectedArticles(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === articles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(articles.map(a => a._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedArticles.length} articles? This cannot be undone.`)) return;
    try {
      // Delete one by one (bulk endpoint not available)
      await Promise.all(selectedArticles.map(id => deleteArticle(id).unwrap()));
      toast.success(`${selectedArticles.length} articles deleted`);
      setSelectedArticles([]);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Bulk delete failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article permanently?')) return;
    try {
      await deleteArticle(id).unwrap();
      toast.success('Article deleted');
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

  const handleToggleEditorsPick = async (id, current) => {
    try {
      await toggleEditorsPick(id).unwrap();
      toast.success(current ? 'Removed from editor\'s pick' : 'Marked as editor\'s pick');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to toggle editor\'s pick');
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
        <h1 className="text-2xl font-bold text-gray-900">Articles Management</h1>
        <p className="text-gray-500 mt-1">Manage all articles submitted by users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Editor's Pick</p>
          <p className="text-xl font-bold text-purple-600">{stats.editorsPick}</p>
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
                placeholder="Title, excerpt..."
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
            <label className="block text-xs font-medium text-gray-500 mb-1">Author</label>
            <input
              type="text"
              name="author"
              value={filters.author}
              onChange={handleFilterChange}
              placeholder="Author name"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-36"
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
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Editor's Pick</label>
            <select
              name="editorsPick"
              value={filters.editorsPick}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-28"
            >
              <option value="">All</option>
              <option value="true">Editor's Pick</option>
              <option value="false">Not Pick</option>
            </select>
          </div>
          {selectedArticles.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Delete Selected ({selectedArticles.length})
            </button>
          )}
        </div>
      </div>

      {/* Articles Table */}
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
                      checked={selectedArticles.length === articles.length && articles.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Editor's Pick</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                      No articles found
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
                    <tr key={article._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedArticles.includes(article._id)}
                          onChange={() => handleSelectArticle(article._id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                          <p className="text-xs text-gray-500 truncate">{article.excerpt?.substring(0, 60)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {article.author || article.authorId?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{article.category}</td>
                      <td className="px-4 py-3">{getStatusBadge(article.status)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleFeatured(article._id, article.isFeatured)}
                          className="text-yellow-500 hover:text-yellow-600 transition-colors"
                          title={article.isFeatured ? 'Remove featured' : 'Mark featured'}
                        >
                          {article.isFeatured ? <FaStar className="text-sm" /> : <FaRegStar className="text-sm" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleEditorsPick(article._id, article.isEditorsPick)}
                          className={`transition-colors ${article.isEditorsPick ? 'text-purple-600' : 'text-gray-400 hover:text-purple-500'}`}
                          title={article.isEditorsPick ? 'Remove editor\'s pick' : 'Mark editor\'s pick'}
                        >
                          <FaCheckCircle className="text-sm" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(article.publishedAt || article.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.open(`/articles/${article.slug}`, '_blank')}
                            className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                            title="View on site"
                          >
                            <FaExternalLinkAlt className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(article._id)}
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

export default AdminArticles;