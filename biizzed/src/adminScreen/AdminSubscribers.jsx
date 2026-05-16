// adminScreen/AdminSubscribers.jsx
import React, { useState } from 'react';
import {
  FaSearch,
  FaSpinner,
  FaEnvelope,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaTrashAlt,
  FaPaperPlane,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetAllSubscribersQuery,
  useSendWeeklyDigestMutation,
} from '../slices/subscribeApiSlice';
// Note: You may need to add useUnsubscribeMutation if you want to soft-delete individual subscribers
// For now, we'll assume only the built-in unsubscribe endpoint exists (POST /unsubscribe)

const AdminSubscribers = () => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sendingDigest, setSendingDigest] = useState(false);
  const limit = 20;

  const {
    data: subscribersData,
    isLoading,
    refetch,
  } = useGetAllSubscribersQuery({ page: currentPage, limit, search: search || undefined });

  const [sendWeeklyDigest] = useSendWeeklyDigestMutation();

  const subscribers = subscribersData?.subscribers || [];
  const totalPages = subscribersData?.pages || 1;
  const total = subscribersData?.total || 0;

  const handleSendDigest = async () => {
    if (!window.confirm('Send weekly digest to all active subscribers?')) return;
    setSendingDigest(true);
    try {
      const res = await sendWeeklyDigest().unwrap();
      toast.success(res.message || 'Weekly digest sent!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send digest');
    } finally {
      setSendingDigest(false);
    }
  };

  const handleUnsubscribe = async (email) => {
    // This would require a mutation – you can add useUnsubscribeMutation to subscribeApiSlice
    // For now, we show a message and suggest using the public unsubscribe link.
    toast.info(`To unsubscribe ${email}, they can use the link in any email.`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
          <p className="text-gray-500 mt-1">Manage newsletter subscribers and send updates</p>
        </div>
        <button
          onClick={handleSendDigest}
          disabled={sendingDigest}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B3766] text-white rounded-lg text-sm font-medium hover:bg-[#142952] transition-colors disabled:opacity-50"
        >
          {sendingDigest ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          Send Weekly Digest
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#1B3766] focus:border-[#1B3766]"
          />
        </div>
      </div>

      {/* Subscribers Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="animate-spin text-3xl text-[#1B3766]" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferences</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No subscribers found
                   </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{sub.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sub.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(sub.subscribedAt)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {sub.preferences?.magazines && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Magazines</span>
                        )}
                        {sub.preferences?.articles && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Articles</span>
                        )}
                        {sub.preferences?.weeklyDigest && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Weekly Digest</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {sub.active ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <FaCheckCircle className="text-xs" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 text-sm">
                          <FaTimesCircle className="text-xs" /> Unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUnsubscribe(sub.email)}
                        className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                        title="Unsubscribe (soft delete)"
                      >
                        <FaTrashAlt className="text-sm" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

export default AdminSubscribers;