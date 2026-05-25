// adminScreen/AdminContributors.jsx
import React, { useState } from 'react';
import {
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExternalLinkAlt,
  FaFilter,
  FaUser,
  FaFileAlt,
  FaLink,
  FaEye,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetContributorApplicationsQuery,
  useApproveContributorMutation,
  useRejectContributorMutation,
} from '../slices/contributorApiSlice';

const AdminContributors = () => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [adminNotes, setAdminNotes] = useState({});
  const [reviewModal, setReviewModal] = useState(null); // { userId, action, userName }
  const [reviewNotes, setReviewNotes] = useState('');
  const limit = 20;

  const queryParams = {
    status: filters.status || undefined,
    page: currentPage,
    limit,
  };

  const { data, isLoading, refetch } = useGetContributorApplicationsQuery(
    filters.status ? { status: filters.status } : undefined
  );
  const [approveContributor, { isLoading: isApproving }] = useApproveContributorMutation();
  const [rejectContributor, { isLoading: isRejecting }] = useRejectContributorMutation();

  const applications = data?.data || [];
  const totalPages = data?.pages || 1;
  const total = data?.count || applications.length;

  // Stats
  const stats = {
    total,
    pending: applications.filter(a => a.contributor_application?.status === 'pending').length,
    approved: applications.filter(a => a.contributor_application?.status === 'approved').length,
    rejected: applications.filter(a => a.contributor_application?.status === 'rejected').length,
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSelectUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === applications.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(applications.map(a => a._id));
    }
  };

  const openReviewModal = (userId, action, userName) => {
    setReviewModal({ userId, action, userName });
    setReviewNotes(adminNotes[userId] || '');
  };

  const closeReviewModal = () => {
    setReviewModal(null);
    setReviewNotes('');
  };

  const handleApprove = async (userId) => {
    try {
      await approveContributor({ userId, adminNotes: reviewNotes }).unwrap();
      toast.success('Contributor approved successfully');
      setAdminNotes(prev => ({ ...prev, [userId]: reviewNotes }));
      closeReviewModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (userId) => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await rejectContributor({ userId, adminNotes: reviewNotes }).unwrap();
      toast.success('Contributor application rejected');
      setAdminNotes(prev => ({ ...prev, [userId]: reviewNotes }));
      closeReviewModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reject');
    }
  };

  const handleBulkApprove = async () => {
    if (!window.confirm(`Approve ${selectedUsers.length} applications?`)) return;
    try {
      await Promise.all(
        selectedUsers.map(id => approveContributor({ userId: id, adminNotes: '' }).unwrap())
      );
      toast.success(`${selectedUsers.length} applications approved`);
      setSelectedUsers([]);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Bulk approval failed');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const icons = {
      pending: FaClock,
      approved: FaCheckCircle,
      rejected: FaTimesCircle,
    };
    const Icon = icons[status] || FaClock;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="text-[10px]" />
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const truncate = (text, max = 80) => {
    if (!text) return '—';
    return text.length > max ? text.substring(0, max) + '...' : text;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contributor Applications</h1>
        <p className="text-gray-500 mt-1">Review and manage contributor applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Approved</p>
          <p className="text-xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Rejected</p>
          <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Name, email, username..."
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-36"
            >
              <option value="">All Applications</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {selectedUsers.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              Bulk Approve ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      {/* Applications Table */}
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
                      checked={selectedUsers.length === applications.length && applications.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Works</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  applications.map((user) => {
                    const app = user.contributor_application;
                    const isPending = app?.status === 'pending';
                    const isApproved = app?.status === 'approved';

                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleSelectUser(user._id)}
                            disabled={!isPending}
                            className="rounded border-gray-300 disabled:opacity-50"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {user.profile || user.avatar ? (
                              <img src={user.profile || user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-xs font-bold">
                                {(user.name || 'U')[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                              <p className="text-xs text-gray-400">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-[200px]">
                            <p className="text-sm text-gray-600 line-clamp-2">{truncate(app?.briefBio, 100)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {app?.publishedWorks?.length > 0 ? (
                              app.publishedWorks.map((link, i) => (
                                <a
                                  key={i}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                >
                                  <FaLink className="text-[10px]" />
                                  Link {i + 1}
                                </a>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {app?.queryLetter && (
                              <a
                                href={app.queryLetter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                <FaFileAlt className="text-[10px]" />
                                Query Letter
                              </a>
                            )}
                            {app?.resume && (
                              <a
                                href={app.resume}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                <FaFileAlt className="text-[10px]" />
                                Resume
                              </a>
                            )}
                            {!app?.queryLetter && !app?.resume && (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(app?.status)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(app?.submittedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-[150px]">
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {truncate(app?.adminNotes, 60) || '—'}
                            </p>
                            {app?.reviewedAt && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Reviewed {formatDate(app.reviewedAt)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isPending ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openReviewModal(user._id, 'approve', user.name)}
                                disabled={isApproving}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                title="Approve application"
                              >
                                <FaCheckCircle className="text-[10px]" />
                                Approve
                              </button>
                              <button
                                onClick={() => openReviewModal(user._id, 'reject', user.name)}
                                disabled={isRejecting}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                title="Reject application"
                              >
                                <FaTimesCircle className="text-[10px]" />
                                Reject
                              </button>
                            </div>
                          ) : isApproved ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                              <FaCheckCircle className="text-[10px]" /> Approved
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">No actions</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
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

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeReviewModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-slideUp">
            <div className="text-center mb-6">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                reviewModal.action === 'approve' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {reviewModal.action === 'approve' ? (
                  <FaCheckCircle className="text-green-600 text-xl" />
                ) : (
                  <FaTimesCircle className="text-red-600 text-xl" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {reviewModal.action === 'approve' ? 'Approve' : 'Reject'} Application
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {reviewModal.action === 'approve'
                  ? `Grant ${reviewModal.userName} contributor access?`
                  : `Reject ${reviewModal.userName}'s application?`
                }
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes
                {reviewModal.action === 'reject' && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  reviewModal.action === 'approve'
                    ? 'Optional notes for the contributor...'
                    : 'Please provide a reason for rejection...'
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766] transition-all resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeReviewModal}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (reviewModal.action === 'approve') {
                    handleApprove(reviewModal.userId);
                  } else {
                    handleReject(reviewModal.userId);
                  }
                }}
                disabled={isApproving || isRejecting}
                className={`flex-1 py-2.5 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  reviewModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {(isApproving || isRejecting) ? (
                  <><FaSpinner className="animate-spin text-xs" /> Processing...</>
                ) : reviewModal.action === 'approve' ? (
                  <><FaCheckCircle className="text-xs" /> Confirm Approval</>
                ) : (
                  <><FaTimesCircle className="text-xs" /> Confirm Rejection</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.28s ease-out; }
      `}</style>
    </div>
  );
};

export default AdminContributors;