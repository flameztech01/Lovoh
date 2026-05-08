// screens/AdminForms.jsx
import React, { useState } from 'react';
import {
  FaEnvelope,
  FaEye,
  FaTrashAlt,
  FaCheck,
  FaArchive,
  FaSearch,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaUser,
  FaCalendarAlt,
  FaTag,
  FaPhone,
  FaBuilding,
  FaGlobe,
  FaClock,
  FaCheckCircle,
  FaEnvelopeOpen,
  FaBox,
  FaChartBar,
  FaDownload,
  FaReply,
  FaCopy,
  FaCheckDouble,
  FaSpinner
} from 'react-icons/fa';
import {
  useGetAllFormSubmissionsQuery,
  useGetFormStatsQuery,
  useUpdateFormStatusMutation,
  useMarkAsReadMutation,
  useDeleteFormSubmissionMutation,
  useBulkDeleteFormSubmissionsMutation,
  useBulkUpdateStatusMutation
} from '../slices/formApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';
import { format } from 'date-fns';

const AdminForms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRead, setFilterRead] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch submissions
  const { 
    data: submissionsData, 
    isLoading, 
    refetch 
  } = useGetAllFormSubmissionsQuery({
    page: currentPage,
    limit: 20,
    search: searchTerm,
    formType: filterType,
    status: filterStatus,
    read: filterRead
  });

  const { data: statsData } = useGetFormStatsQuery();

  const [updateStatus] = useUpdateFormStatusMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const [deleteSubmission] = useDeleteFormSubmissionMutation();
  const [bulkDelete] = useBulkDeleteFormSubmissionsMutation();
  const [bulkUpdateStatus] = useBulkUpdateStatusMutation();

  const submissions = submissionsData?.submissions || [];
  const totalPages = submissionsData?.pages || 1;
  const totalSubmissions = submissionsData?.total || 0;
  const stats = statsData || {};

  // Form type options
  const formTypes = [
    { value: 'contact', label: 'Contact Form', color: 'bg-blue-100 text-blue-700' },
    { value: 'getintouch', label: 'Get In Touch', color: 'bg-green-100 text-green-700' },
    { value: 'startproject', label: 'Start Project', color: 'bg-purple-100 text-purple-700' },
    { value: 'servicequote', label: 'Service Quote', color: 'bg-orange-100 text-orange-700' },
    { value: 'newsletter', label: 'Newsletter', color: 'bg-pink-100 text-pink-700' },
    { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-700' }
  ];

  // Status options
  const statusOptions = [
    { value: 'new', label: 'New', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'read', label: 'Read', color: 'bg-blue-100 text-blue-700' },
    { value: 'contacted', label: 'Contacted', color: 'bg-green-100 text-green-700' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-700' }
  ];

  const getFormTypeLabel = (type) => {
    return formTypes.find(t => t.value === type)?.label || type;
  };

  const getFormTypeColor = (type) => {
    return formTypes.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-700';
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSubmissions(submissions.map(s => s._id));
    } else {
      setSelectedSubmissions([]);
    }
  };

  const handleSelectSubmission = (id) => {
    setSelectedSubmissions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleMarkAsRead = async (id, currentRead) => {
    try {
      await markAsRead({ id, read: !currentRead }).unwrap();
      toast.success(`Marked as ${!currentRead ? 'read' : 'unread'}`);
      refetch();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Status updated to ${status}`);
      refetch();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await deleteSubmission(id).unwrap();
        toast.success('Submission deleted');
        refetch();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSubmissions.length === 0) {
      toast.error('No submissions selected');
      return;
    }
    if (window.confirm(`Delete ${selectedSubmissions.length} submissions?`)) {
      try {
        await bulkDelete(selectedSubmissions).unwrap();
        toast.success(`${selectedSubmissions.length} submissions deleted`);
        setSelectedSubmissions([]);
        refetch();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleBulkStatus = async (status) => {
    if (selectedSubmissions.length === 0) {
      toast.error('No submissions selected');
      return;
    }
    try {
      await bulkUpdateStatus({ ids: selectedSubmissions, status }).unwrap();
      toast.success(`${selectedSubmissions.length} submissions updated`);
      setSelectedSubmissions([]);
      refetch();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const clearFilters = () => {
    setFilterType('');
    setFilterStatus('');
    setFilterRead('');
    setSearchTerm('');
  };

  const formatDate = (date) => {
    return format(new Date(date), 'MMM dd, yyyy h:mm a');
  };

  return (
    <AdminSidebar>
      <div className="px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Form Submissions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all incoming form submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalSubmissions}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <FaEnvelope className="text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Unread</p>
                <p className="text-2xl font-bold text-yellow-600">{statsData?.unread || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <FaEnvelopeOpen className="text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">New</p>
                <p className="text-2xl font-bold text-green-600">{statsData?.new || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <FaTag className="text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Form Types</p>
                <p className="text-2xl font-bold text-purple-600">{statsData?.byFormType?.length || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <FaBox className="text-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FaFilter className="text-sm" />
              Filters
              {(filterType || filterStatus || filterRead) && (
                <span className="w-5 h-5 rounded-full bg-[#0043FC] text-white text-xs flex items-center justify-center">
                  {[filterType, filterStatus, filterRead].filter(Boolean).length}
                </span>
              )}
            </button>
            {selectedSubmissions.length > 0 && (
              <>
                <button
                  onClick={() => handleBulkStatus('contacted')}
                  className="px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FaCheckCircle className="text-sm" />
                  Mark Contacted
                </button>
                <button
                  onClick={() => handleBulkStatus('archived')}
                  className="px-4 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <FaArchive className="text-sm" />
                  Archive
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <FaTrashAlt className="text-sm" />
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Form Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All Types</option>
                  {formTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Read Status</label>
                <select
                  value={filterRead}
                  onChange={(e) => setFilterRead(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All</option>
                  <option value="true">Read</option>
                  <option value="false">Unread</option>
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#0043FC] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="text-3xl text-[#0043FC] animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <FaEnvelope className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No form submissions found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.length === submissions.length && submissions.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Info</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {submissions.map((submission) => (
                      <React.Fragment key={submission._id}>
                        <tr 
                          className={`hover:bg-gray-50 transition-colors ${!submission.read ? 'bg-blue-50/30' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedSubmissions.includes(submission._id)}
                              onChange={() => handleSelectSubmission(submission._id)}
                              className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full ${!submission.read ? 'bg-blue-100' : 'bg-gray-100'} flex items-center justify-center flex-shrink-0`}>
                                <FaUser className={`text-sm ${!submission.read ? 'text-blue-600' : 'text-gray-500'}`} />
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${!submission.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {submission.contactInfo?.name || 'Anonymous'}
                                </p>
                                <p className="text-xs text-gray-500">{submission.contactInfo?.email || 'No email'}</p>
                                {submission.contactInfo?.company && (
                                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                    <FaBuilding className="text-[8px]" />
                                    {submission.contactInfo.company}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getFormTypeColor(submission.formType)}`}>
                              {getFormTypeLabel(submission.formType)}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">{submission.formName}</p>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={submission.status}
                              onChange={(e) => handleUpdateStatus(submission._id, e.target.value)}
                              className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getStatusColor(submission.status)}`}
                            >
                              {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FaCalendarAlt className="text-[10px]" />
                              {formatDate(submission.createdAt)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setExpandedSubmission(expandedSubmission === submission._id ? null : submission._id)}
                                className="p-2 text-gray-500 hover:text-[#0043FC] hover:bg-blue-50 rounded-lg transition-colors"
                                title="View details"
                              >
                                {expandedSubmission === submission._id ? <FaChevronDown className="text-sm" /> : <FaChevronRight className="text-sm" />}
                              </button>
                              <button
                                onClick={() => handleMarkAsRead(submission._id, submission.read)}
                                className={`p-2 rounded-lg transition-colors ${submission.read ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50'}`}
                                title={submission.read ? 'Mark as unread' : 'Mark as read'}
                              >
                                {submission.read ? <FaEnvelopeOpen className="text-sm" /> : <FaEnvelope className="text-sm" />}
                              </button>
                              <button
                                onClick={() => handleDelete(submission._id)}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <FaTrashAlt className="text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded Details Row */}
                        {expandedSubmission === submission._id && (
                          <tr>
                            <td colSpan="6" className="px-4 py-4 bg-gray-50">
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Contact Details */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FaUser className="text-[#0043FC] text-xs" />
                                    Contact Information
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <p><span className="text-gray-500">Name:</span> {submission.contactInfo?.name || '—'}</p>
                                    <p><span className="text-gray-500">Email:</span> {submission.contactInfo?.email || '—'}</p>
                                    {submission.contactInfo?.phone && (
                                      <p><span className="text-gray-500">Phone:</span> {submission.contactInfo.phone}</p>
                                    )}
                                    {submission.contactInfo?.company && (
                                      <p><span className="text-gray-500">Company:</span> {submission.contactInfo.company}</p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Form Data */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FaTag className="text-[#0043FC] text-xs" />
                                    Form Data
                                  </h4>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200 max-h-60 overflow-y-auto">
                                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                      {JSON.stringify(submission.formData, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                                
                                {/* Metadata */}
                                <div className="md:col-span-2">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FaGlobe className="text-[#0043FC] text-xs" />
                                    Submission Metadata
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div>
                                      <p className="text-gray-500">Submitted From</p>
                                      <p className="font-medium">{submission.submittedFrom}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Page URL</p>
                                      <p className="font-medium truncate">{submission.pageUrl || '—'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">IP Address</p>
                                      <p className="font-medium">{submission.metadata?.ipAddress || '—'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Submitted At</p>
                                      <p className="font-medium">{formatDate(submission.createdAt)}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="md:col-span-2 flex gap-2 pt-2 border-t border-gray-200">
                                  <button className="px-3 py-1.5 text-xs bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] flex items-center gap-1">
                                    <FaReply className="text-[10px]" />
                                    Reply
                                  </button>
                                  <button className="px-3 py-1.5 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                                    <FaCopy className="text-[10px]" />
                                    Copy Data
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalSubmissions)} of {totalSubmissions} submissions
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      ‹
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
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
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                            currentPage === pageNum
                              ? 'bg-[#0043FC] text-white'
                              : 'border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminForms;