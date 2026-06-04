// src/adminScreens/AdminPayouts.jsx
import React, { useState } from 'react';
import {
  FaMoneyBillWave,
  FaSearch,
  FaSpinner,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaStore,
  FaUniversity, // Changed from FaBank to FaUniversity
  FaDownload,
  FaFileInvoice,
  FaChartLine,
  FaFilter,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaTrash,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetAllPayoutsQuery,
  useGetPayoutSummaryQuery,
  useProcessSinglePayoutMutation,
  useProcessBulkPayoutMutation,
  useExportPayoutsQuery,
} from '../slices/payoutApiSlice.js';

const AdminPayouts = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // pending, completed
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processNotes, setProcessNotes] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Fetch payouts based on active tab
  const { 
    data: payoutsData, 
    isLoading: isLoadingPayouts, 
    refetch 
  } = useGetAllPayoutsQuery({ 
    status: activeTab, 
    page, 
    limit: 20,
    search: searchTerm,
  });

  // Fetch summary statistics
  const { data: summaryData, isLoading: isLoadingSummary } = useGetPayoutSummaryQuery();

  // Mutations
  const [processSinglePayout, { isLoading: isProcessing }] = useProcessSinglePayoutMutation();
  const [processBulkPayout, { isLoading: isProcessingBulk }] = useProcessBulkPayoutMutation();
  const { refetch: exportPayouts } = useExportPayoutsQuery({ status: activeTab }, { skip: true });

  const payouts = payoutsData?.payouts || [];
  const summary = summaryData || {
    pending: { total: 0, count: 0 },
    completed: { total: 0, count: 0 },
    platform: { totalFees: 0, totalSales: 0 },
    topSellers: [],
  };

  const tabs = [
    { id: 'pending', label: 'Pending Payouts', icon: FaClock, count: payoutsData?.summary?.pendingCount || 0 },
    { id: 'completed', label: 'Completed', icon: FaCheckCircle, count: payoutsData?.summary?.completedCount || 0 },
  ];

  const handleProcessPayout = async (orderId) => {
    try {
      await processSinglePayout({ orderId, notes: processNotes }).unwrap();
      toast.success('Payout processed successfully');
      setShowProcessModal(false);
      setProcessNotes('');
      setSelectedPayout(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to process payout');
    }
  };

  const handleBulkProcess = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select at least one payout to process');
      return;
    }

    try {
      await processBulkPayout({ orderIds: selectedOrders, notes: processNotes }).unwrap();
      toast.success(`${selectedOrders.length} payouts processed successfully`);
      setShowBulkModal(false);
      setSelectedOrders([]);
      setProcessNotes('');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to process bulk payouts');
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await exportPayouts();
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payouts_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export started');
    } catch (error) {
      toast.error('Failed to export payouts');
    }
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === payouts.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(payouts.map(p => p._id));
    }
  };

  const formatPrice = (price) => {
    if (!price) return '₦0';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: FaClock },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
      failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
    };
    return config[status] || config.pending;
  };

  const isLoading = isLoadingPayouts || isLoadingSummary;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#0043FC] mx-auto mb-4" />
          <p className="text-gray-500">Loading payouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Seller Payouts</h1>
        <p className="text-sm text-gray-500">Manage and process seller payouts</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Pending Payouts</p>
              <p className="text-2xl font-bold text-yellow-700">{formatPrice(summary.pending?.total || 0)}</p>
              <p className="text-xs text-yellow-500 mt-1">{summary.pending?.count || 0} orders</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <FaClock className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Completed Payouts</p>
              <p className="text-2xl font-bold text-green-700">{formatPrice(summary.completed?.total || 0)}</p>
              <p className="text-xs text-green-500 mt-1">{summary.completed?.count || 0} orders</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Platform Fees</p>
              <p className="text-2xl font-bold text-purple-700">{formatPrice(summary.platform?.totalFees || 0)}</p>
              <p className="text-xs text-purple-500 mt-1">From total sales</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FaChartLine className="text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Sales</p>
              <p className="text-2xl font-bold text-blue-700">{formatPrice(summary.platform?.totalSales || 0)}</p>
              <p className="text-xs text-blue-500 mt-1">All time</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaMoneyBillWave className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Sellers Section */}
      {summary.topSellers?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaStore className="text-[#0043FC]" /> Top Sellers by Payout
          </h3>
          <div className="space-y-2">
            {summary.topSellers.slice(0, 5).map((seller, idx) => (
              <div key={seller.sellerId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{seller.businessName}</p>
                    <p className="text-xs text-gray-500">{seller.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#0043FC]">{formatPrice(seller.totalPayout)}</p>
                  <p className="text-xs text-gray-400">{seller.orderCount} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
              setSelectedOrders([]);
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? `text-[#0043FC] border-b-2 border-[#0043FC]`
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="text-sm" />
            {tab.label}
            <span className="ml-1 text-xs text-gray-400">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex-1 relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, seller name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
          />
        </div>
        <div className="flex gap-2">
          {activeTab === 'pending' && payouts.length > 0 && (
            <button
              onClick={() => setShowBulkModal(true)}
              disabled={selectedOrders.length === 0}
              className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <FaMoneyBillWave /> Process Selected ({selectedOrders.length})
            </button>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {activeTab === 'pending' && (
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === payouts.length && payouts.length > 0}
                      onChange={selectAllOrders}
                      className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform Fee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller Payout</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payouts.map((payout) => {
                const statusBadge = getStatusBadge(payout.sellerPayoutStatus);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <tr key={payout._id} className="hover:bg-gray-50 transition-colors">
                    {activeTab === 'pending' && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(payout._id)}
                          onChange={() => toggleSelectOrder(payout._id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-600">
                        #{payout._id.slice(-8)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payout.seller?.businessName || payout.seller?.name}
                        </p>
                        <p className="text-xs text-gray-500">{payout.seller?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(payout.totalPrice)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-orange-600">
                        {formatPrice(payout.platformAmount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-green-600">
                        {formatPrice(payout.sellerPayoutAmount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FaUniversity className="text-gray-400" />
                        <span>{payout.seller?.bankName || 'N/A'}</span>
                        <span className="text-gray-400">•</span>
                        <span>{payout.seller?.accountNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FaCalendarAlt className="text-gray-400" />
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayout(payout);
                            setShowDetailsModal(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-[#0043FC] transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {activeTab === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedPayout(payout);
                              setShowProcessModal(true);
                            }}
                            className="p-1.5 text-green-500 hover:text-green-700 transition-colors"
                            title="Process Payout"
                          >
                            <FaMoneyBillWave />
                          </button>
                        )}
                        {payout.payoutTransactionId && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(payout.payoutTransactionId);
                              toast.success('Transaction ID copied');
                            }}
                            className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Copy Transaction ID"
                          >
                            <FaFileInvoice />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {payouts.length === 0 && (
          <div className="text-center py-12">
            {searchTerm ? (
              <>
                <FaSearch className="text-gray-300 text-5xl mx-auto mb-3" />
                <p className="text-gray-500">No payouts matching "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-sm text-[#0043FC] hover:underline"
                >
                  Clear search
                </button>
              </>
            ) : activeTab === 'pending' ? (
              <>
                <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
                <p className="text-gray-500">No pending payouts</p>
                <p className="text-sm text-gray-400">All payouts have been processed</p>
              </>
            ) : (
              <>
                <FaMoneyBillWave className="text-gray-300 text-5xl mx-auto mb-3" />
                <p className="text-gray-500">No completed payouts found</p>
              </>
            )}
          </div>
        )}

        {/* Pagination */}
        {payoutsData?.pages > 1 && (
          <div className="flex justify-center gap-2 px-4 py-4 border-t border-gray-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {page} of {payoutsData?.pages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(payoutsData?.pages || 1, p + 1))}
              disabled={page === payoutsData?.pages}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Payout Details Modal */}
      {showDetailsModal && selectedPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaMoneyBillWave className="text-green-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payout Details</h2>
                  <p className="text-sm text-gray-500">Order #{selectedPayout._id.slice(-8)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Seller Info */}
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FaStore className="text-[#0043FC]" /> Seller Information
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500">Business Name:</span> {selectedPayout.seller?.businessName || selectedPayout.seller?.name}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedPayout.seller?.email}</p>
                  <p><span className="text-gray-500">Phone:</span> {selectedPayout.seller?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Bank Details */}
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FaUniversity className="text-[#0043FC]" /> Bank Details
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500">Bank Name:</span> {selectedPayout.seller?.bankName || 'N/A'}</p>
                  <p><span className="text-gray-500">Account Number:</span> {selectedPayout.seller?.accountNumber || 'N/A'}</p>
                  <p><span className="text-gray-500">Account Name:</span> {selectedPayout.seller?.accountName || 'N/A'}</p>
                </div>
              </div>

              {/* Payout Summary */}
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Payout Summary</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Order Amount:</span>
                    <span className="font-semibold">{formatPrice(selectedPayout.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Platform Fee (6%):</span>
                    <span className="text-orange-600">{formatPrice(selectedPayout.platformAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-700 font-medium">Seller Payout:</span>
                    <span className="font-bold text-green-600 text-lg">{formatPrice(selectedPayout.sellerPayoutAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedPayout.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Info */}
              {selectedPayout.payoutTransactionId && (
                <div className="pb-3">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Transaction Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500">Transaction ID:</span> {selectedPayout.payoutTransactionId}</p>
                    <p><span className="text-gray-500">Processed Date:</span> {new Date(selectedPayout.sellerPayoutDate).toLocaleString()}</p>
                    {selectedPayout.payoutNotes && (
                      <p className="col-span-2"><span className="text-gray-500">Notes:</span> {selectedPayout.payoutNotes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {activeTab === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowProcessModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaMoneyBillWave /> Process Payout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Process Single Payout Modal */}
      {showProcessModal && selectedPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FaMoneyBillWave className="text-green-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Process Payout</h2>
                <p className="text-sm text-gray-500">Order #{selectedPayout._id.slice(-8)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Seller:</span>
                  <span className="font-medium">{selectedPayout.seller?.businessName || selectedPayout.seller?.name}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Bank:</span>
                  <span>{selectedPayout.seller?.bankName || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Account:</span>
                  <span>{selectedPayout.seller?.accountNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="font-medium">Payout Amount:</span>
                  <span className="font-bold text-green-600 text-lg">{formatPrice(selectedPayout.sellerPayoutAmount)}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={processNotes}
                  onChange={(e) => setProcessNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  placeholder="Add internal notes about this payout..."
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800 flex items-start gap-2">
                  <FaInfoCircle className="text-yellow-600 mt-0.5" />
                  <span>This will initiate a transfer to the seller's bank account via Paystack. The seller will receive the amount after processing.</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowProcessModal(false);
                  setProcessNotes('');
                  setSelectedPayout(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProcessPayout(selectedPayout._id)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <FaSpinner className="animate-spin" /> : <FaMoneyBillWave />}
                Process Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Process Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaMoneyBillWave className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Bulk Process Payouts</h2>
                <p className="text-sm text-gray-500">{selectedOrders.length} orders selected</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                <p className="text-xs font-medium text-gray-500 mb-2">Selected Orders:</p>
                {selectedOrders.map(orderId => {
                  const order = payouts.find(p => p._id === orderId);
                  return (
                    <div key={orderId} className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">#{orderId.slice(-8)}</span>
                      <span className="font-medium text-green-600">{formatPrice(order?.sellerPayoutAmount)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm pt-2 mt-2 border-t border-gray-200">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-green-600">
                    {formatPrice(selectedOrders.reduce((sum, id) => {
                      const order = payouts.find(p => p._id === id);
                      return sum + (order?.sellerPayoutAmount || 0);
                    }, 0))}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={processNotes}
                  onChange={(e) => setProcessNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  placeholder="Add notes for all selected payouts..."
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> This will process all selected payouts at once. Each seller will receive their respective amounts.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setProcessNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkProcess}
                disabled={isProcessingBulk}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessingBulk ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                Process {selectedOrders.length} Payouts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;