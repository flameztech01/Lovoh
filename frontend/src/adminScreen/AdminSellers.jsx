// screens/AdminSellers.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaStore,
  FaSearch,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaUser,
  FaPhone,
  FaWhatsapp,
  FaCalendarAlt,
  FaSpinner,
  FaDownload,
} from 'react-icons/fa';
import {
  useGetSellerApplicationsQuery,
} from '../slices/sellerApiSlice';
import { useSelector } from 'react-redux';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminSellers = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch seller applications
  const { data: applicationsData, isLoading, refetch } = useGetSellerApplicationsQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const applications = applicationsData?.applications || [];
  const totalApplications = applicationsData?.total || 0;

  // Filter applications by search term
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone?.includes(searchTerm) ||
      app.sellerApplication?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination for filtered results
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
      case 'approved':
        return { label: 'Approved', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: FaTimesCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: FaClock };
    }
  };

  const handleViewDetails = (applicationId) => {
    navigate(`/admin/sellers/${applicationId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('pending');
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Business Name', 'Business Email', 'Status', 'Submitted Date'];
    const csvData = filteredApplications.map(app => [
      app.name || 'N/A',
      app.email || 'N/A',
      app.phone || 'N/A',
      app.sellerApplication?.businessName || 'N/A',
      app.sellerApplication?.businessEmail || 'N/A',
      app.sellerStatus,
      formatDate(app.sellerApplication?.submittedAt)
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seller_applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Applications exported successfully');
  };

  // Stats
  const stats = {
    total: totalApplications,
    pending: applications.filter(a => a.sellerStatus === 'pending').length,
    approved: applications.filter(a => a.sellerStatus === 'approved').length,
    rejected: applications.filter(a => a.sellerStatus === 'rejected').length
  };

  return (
    <AdminSidebar>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Seller Applications</h1>
            <p className="text-gray-500 mt-1 text-sm">Review and manage seller registration requests</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 text-sm"
          >
            <FaDownload />
            Export to CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <p className="text-xs text-gray-500">Total Applications</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <p className="text-xs text-gray-500">Pending Review</p>
            <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <p className="text-xs text-gray-500">Approved</p>
            <p className="text-xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <p className="text-xs text-gray-500">Rejected</p>
            <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone or business name..."
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

            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] text-sm"
              >
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All Applications</option>
              </select>
            </div>
          </div>

          {(searchTerm || statusFilter !== 'pending') && (
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
              {statusFilter !== 'pending' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('pending')} className="hover:text-blue-600">
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

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin" />
          </div>
        ) : paginatedApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FaStore className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-500 mb-4">No seller applications matching your criteria</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-[#0043FC] border border-[#0043FC] rounded-lg hover:bg-[#0043FC] hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedApplications.map((application) => {
                      const status = getStatusBadge(application.sellerStatus);
                      const StatusIcon = status.icon;
                      
                      return (
                        <tr key={application._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {application.profile ? (
                                <img src={application.profile} alt="" className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#0043FC]/10 flex items-center justify-center">
                                  <FaUser className="text-[#0043FC] text-sm" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{application.name}</p>
                                <p className="text-xs text-gray-500">{application.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <FaStore className="text-gray-400 text-xs" />
                              <span className="text-sm text-gray-700">
                                {application.sellerApplication?.businessName || '—'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-700 flex items-center gap-1">
                                <FaPhone className="text-gray-400 text-xs" />
                                {application.phone || '—'}
                              </p>
                              {application.sellerApplication?.whatsappPhone && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <FaWhatsapp className="text-green-500 text-xs" />
                                  {application.sellerApplication.whatsappPhone}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FaCalendarAlt />
                              {formatDate(application.sellerApplication?.submittedAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              <StatusIcon className="text-xs" />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewDetails(application._id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FaEye />
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {paginatedApplications.map((application) => {
                const status = getStatusBadge(application.sellerStatus);
                const StatusIcon = status.icon;
                
                return (
                  <div
                    key={application._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {application.profile ? (
                          <img src={application.profile} alt="" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#0043FC]/10 flex items-center justify-center">
                            <FaUser className="text-[#0043FC] text-xl" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{application.name}</p>
                          <p className="text-xs text-gray-500">{application.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="text-xs" />
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <FaStore className="text-gray-400 text-xs" />
                        <span className="text-gray-700">
                          {application.sellerApplication?.businessName || '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaPhone className="text-gray-400 text-xs" />
                        <span className="text-gray-700">{application.phone || '—'}</span>
                      </div>
                      {application.sellerApplication?.whatsappPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <FaWhatsapp className="text-green-500 text-xs" />
                          <span className="text-gray-700">{application.sellerApplication.whatsappPhone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaCalendarAlt />
                        <span>Submitted: {formatDate(application.sellerApplication?.submittedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleViewDetails(application._id)}
                        className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <FaEye /> View Details
                      </button>
                    </div>
                  </div>
                );
              })}
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
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}

            {/* Results Count */}
            {!isLoading && filteredApplications.length > 0 && (
              <div className="mt-4 text-center text-xs text-gray-500">
                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredApplications.length)} of {filteredApplications.length} applications
              </div>
            )}
          </>
        )}
      </div>
    </AdminSidebar>
  );
};

export default AdminSellers;