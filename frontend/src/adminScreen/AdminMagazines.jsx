// adminScreen/AdminMagazines.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaSearch,
  FaTimes,
  FaFilePdf,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaRegStar,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaImage,
  FaTag,
  FaCalendarAlt,
  FaUser,
  FaDownload
} from 'react-icons/fa';
import {
  useGetMagazinesQuery,
  useDeleteMagazineMutation,
  useToggleFeaturedMagazineMutation
} from '../slices/magApiSlice';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminMagazines = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [categories, setCategories] = useState([]);
  const [magazineToDelete, setMagazineToDelete] = useState(null);
  const itemsPerPage = 10;

  // Fetch magazines
  const { data: magazinesData, isLoading, refetch } = useGetMagazinesQuery({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  
  const [deleteMagazine] = useDeleteMagazineMutation();
  const [toggleFeatured] = useToggleFeaturedMagazineMutation();

  const magazines = magazinesData?.magazines || magazinesData || [];

  // Extract unique categories from magazines
  useEffect(() => {
    if (magazines.length > 0) {
      const uniqueCategories = [...new Set(magazines.map(magazine => magazine.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
  }, [magazines]);

  // Filter magazines by category
  const filteredByCategory = categoryFilter === 'all' 
    ? magazines 
    : magazines.filter(magazine => magazine.category === categoryFilter);

  // Sort magazines
  const sortedMagazines = [...filteredByCategory].sort((a, b) => {
    let aVal, bVal;
    switch(sortBy) {
      case 'title':
        aVal = a.title || '';
        bVal = b.title || '';
        break;
      case 'views':
        aVal = a.views || 0;
        bVal = b.views || 0;
        break;
      case 'createdAt':
        aVal = new Date(a.createdAt || 0);
        bVal = new Date(b.createdAt || 0);
        break;
      default:
        aVal = new Date(a.createdAt || 0);
        bVal = new Date(b.createdAt || 0);
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedMagazines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMagazines = sortedMagazines.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'published':
        return { label: 'Published', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      case 'draft':
        return { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FaTimesCircle };
      default:
        return { label: status || 'Draft', color: 'bg-gray-100 text-gray-800', icon: FaTimesCircle };
    }
  };

  // Handle delete
  const handleDeleteClick = (magazine) => {
    setMagazineToDelete(magazine);
  };

  const confirmDelete = async () => {
    if (!magazineToDelete) return;
    
    try {
      await deleteMagazine(magazineToDelete._id).unwrap();
      toast.success(`${magazineToDelete.title} deleted successfully`);
      setMagazineToDelete(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete magazine');
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (magazine) => {
    try {
      await toggleFeatured(magazine._id).unwrap();
      toast.success(magazine.isFeatured ? 'Removed from featured' : 'Added to featured');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update featured status');
    }
  };

  // Open PDF in new tab
  const openPDF = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  return (
    <AdminSidebar>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Magazines</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your PDF magazine editions</p>
          </div>
          <button
            onClick={() => navigate('/admin/magazines/new')}
            className="flex items-center gap-2 px-4 py-2 bg-[#0043FC] text-white rounded-lg font-medium hover:bg-[#0038D4] transition-all duration-300"
          >
            <FaPlus />
            Upload New Magazine
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Magazines</p>
                <p className="text-2xl font-bold text-gray-900">{magazines.length}</p>
              </div>
              <div className="w-10 h-10 bg-[#0043FC]/10 rounded-full flex items-center justify-center">
                <FaFilePdf className="text-[#0043FC]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {magazines.filter(m => m.status === 'published').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Drafts</p>
                <p className="text-2xl font-bold text-gray-600">
                  {magazines.filter(m => m.status === 'draft').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <FaTimesCircle className="text-gray-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Featured</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {magazines.filter(m => m.isFeatured).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaStar className="text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Views</p>
                <p className="text-2xl font-bold text-blue-600">
                  {magazines.reduce((sum, m) => sum + (m.views || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaEye className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search magazines by title, author or summary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] focus:border-transparent text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] text-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>

              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] text-sm"
                >
                  <option value="createdAt">Date</option>
                  <option value="title">Title</option>
                  <option value="views">Views</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs">
                  Search: {searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-blue-600">
                    <FaTimes className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs">
                  Category: {categoryFilter}
                  <button onClick={() => setCategoryFilter('all')} className="hover:text-blue-600">
                    <FaTimes className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('all')} className="hover:text-blue-600">
                    <FaTimes className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Magazines Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin" />
          </div>
        ) : paginatedMagazines.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FaFilePdf className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No magazines found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or upload a new magazine</p>
            <button
              onClick={() => navigate('/admin/magazines/new')}
              className="px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors"
            >
              Upload New Magazine
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Magazine</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedMagazines.map((magazine) => {
                      const status = getStatusBadge(magazine.status);
                      const StatusIcon = status.icon;
                      
                      return (
                        <tr key={magazine._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                {magazine.coverImage ? (
                                  <img src={magazine.coverImage} alt={magazine.title} className="w-full h-full object-cover" />
                                ) : (
                                  <FaFilePdf className="text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{magazine.title}</p>
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  By {magazine.author}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs">
                              <FaTag className="text-gray-400" />
                              {magazine.category || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              <StatusIcon className="text-xs" />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{magazine.views || 0}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FaCalendarAlt />
                              {formatDate(magazine.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleToggleFeatured(magazine)}
                              className="text-yellow-400 hover:text-yellow-500 transition-colors"
                            >
                              {magazine.isFeatured ? <FaStar className="text-lg" /> : <FaRegStar className="text-lg" />}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openPDF(magazine.pdfUrl)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View PDF"
                              >
                                <FaDownload />
                              </button>
                              <button
                                onClick={() => navigate(`/admin/magazines/${magazine._id}`)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => navigate(`/admin/magazines/edit/${magazine._id}`)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Edit Magazine"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(magazine)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Magazine"
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft />
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#0043FC] text-white'
                          : 'border border-gray-200 text-gray-600 hover:border-[#0043FC] hover:text-[#0043FC]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}

        {/* Results Count */}
        {!isLoading && sortedMagazines.length > 0 && (
          <div className="mt-4 text-center text-xs text-gray-500">
            Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, sortedMagazines.length)} of {sortedMagazines.length} magazines
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {magazineToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrashAlt className="text-2xl text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Magazine</h3>
              <p className="text-gray-500 mb-4">
                Are you sure you want to delete "{magazineToDelete.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setMagazineToDelete(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
};

export default AdminMagazines;