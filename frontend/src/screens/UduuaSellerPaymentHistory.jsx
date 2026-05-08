// screens/UduuaSellerPaymentHistory.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaArrowLeft,
  FaHistory,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSpinner,
  FaEye,
  FaCalendarAlt,
  FaSearch,
  FaTimes,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaFileInvoice,
  FaWallet,
  FaUniversity,
  FaWhatsapp,
} from 'react-icons/fa';
import { useGetSellerBalanceQuery } from '../slices/orderApiSlice';
import { toast } from 'react-toastify';
import ShopNavbar from '../components/ShopNavbar';
import UduuaFooter from '../components/UduuaFooter';

const UduuaSellerPaymentHistory = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const itemsPerPage = 10;

  const { data: balanceData, isLoading } = useGetSellerBalanceQuery(undefined, {
    skip: !userInfo,
  });

  const transactions = balanceData?.orders || [];
  const totalEarned = balanceData?.totalEarned || 0;
  const availableBalance = balanceData?.availableBalance || 0;
  const processingBalance = balanceData?.processingBalance || 0;
  const completedBalance = balanceData?.completedBalance || 0;

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦0";
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFullDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
      case 'processing':
        return { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: FaSpinner };
      case 'completed':
        return { label: 'Completed', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      default:
        return { label: status || 'Pending', color: 'bg-gray-100 text-gray-800', icon: FaClock };
    }
  };

  // Filter transactions
  let filteredTransactions = [...transactions];
  
  if (searchTerm) {
    filteredTransactions = filteredTransactions.filter(t => 
      t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatPrice(t.amount).includes(searchTerm)
    );
  }
  
  if (statusFilter !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.status === statusFilter);
  }
  
  // Filter by timeframe
  if (selectedTimeframe !== 'all') {
    const now = new Date();
    let filterDate = new Date();
    if (selectedTimeframe === 'week') {
      filterDate.setDate(now.getDate() - 7);
    } else if (selectedTimeframe === 'month') {
      filterDate.setMonth(now.getMonth() - 1);
    } else if (selectedTimeframe === 'quarter') {
      filterDate.setMonth(now.getMonth() - 3);
    } else if (selectedTimeframe === 'year') {
      filterDate.setFullYear(now.getFullYear() - 1);
    }
    filteredTransactions = filteredTransactions.filter(t => new Date(t.createdAt) >= filterDate);
  }
  
  // Sort transactions
  filteredTransactions.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'amount_high') {
      return (b.amount || 0) - (a.amount || 0);
    } else if (sortBy === 'amount_low') {
      return (a.amount || 0) - (b.amount || 0);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSelectedTimeframe('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Amount', 'Order Total', 'Status', 'Date', 'Customer Confirmed'];
    const csvData = filteredTransactions.map(t => [
      t.id,
      t.amount,
      t.orderTotal,
      t.status,
      formatFullDate(t.createdAt),
      t.buyerConfirmedDelivery ? 'Yes' : 'No'
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Payment history exported successfully');
  };

  const getSummaryStats = () => {
    let total = 0;
    let pending = 0;
    let processing = 0;
    let completed = 0;
    
    filteredTransactions.forEach(t => {
      total += t.amount;
      if (t.status === 'pending') pending += t.amount;
      else if (t.status === 'processing') processing += t.amount;
      else if (t.status === 'completed') completed += t.amount;
    });
    
    return { total, pending, processing, completed };
  };

  const stats = getSummaryStats();

  if (isLoading) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading payment history...</p>
          </div>
        </div>
        <UduuaFooter />
      </>
    );
  }

  return (
    <>
      <ShopNavbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/uduua/seller/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0043FC] mb-4 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Back to Dashboard</span>
            </button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Payment History
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Track all your earnings and payout transactions
                </p>
              </div>
              <button
                onClick={exportToCSV}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 text-sm"
              >
                <FaDownload className="text-sm" />
                Export to CSV
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-[#0043FC]">{formatPrice(stats.total)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{formatPrice(stats.pending)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Processing</p>
              <p className="text-2xl font-bold text-blue-600">{formatPrice(stats.processing)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(stats.completed)}</p>
            </div>
          </div>

          {/* Lifetime Stats */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaWallet className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lifetime Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(totalEarned)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FaUniversity className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available for Withdrawal</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(availableBalance)}</p>
                </div>
              </div>
              <Link
                to="/uduua/seller/wallet"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0043FC] text-white rounded-lg text-sm font-medium hover:bg-[#0038D4] transition-colors"
              >
                <FaMoneyBillWave className="text-sm" />
                Withdraw Funds
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search by order ID or amount..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={selectedTimeframe}
                onChange={(e) => {
                  setSelectedTimeframe(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last Year</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Amount: High to Low</option>
                <option value="amount_low">Amount: Low to High</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== 'all' || selectedTimeframe !== 'all') && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="hover:text-blue-600">
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
                {selectedTimeframe !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs">
                    {selectedTimeframe === 'week' ? 'Last 7 Days' : 
                     selectedTimeframe === 'month' ? 'Last 30 Days' :
                     selectedTimeframe === 'quarter' ? 'Last 90 Days' : 'Last Year'}
                    <button onClick={() => setSelectedTimeframe('all')} className="hover:text-blue-600">
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

          {/* Payment History Table */}
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FaHistory className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment history found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || selectedTimeframe !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'When you make sales, your earnings will appear here.'}
              </p>
              {!searchTerm && statusFilter === 'all' && selectedTimeframe === 'all' && (
                <Link
                  to="/uduua/shop"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0043FC] text-white rounded-lg text-sm font-medium hover:bg-[#0038D4] transition-colors"
                >
                  Start Selling
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Summary of filtered results */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                </span>
                <span className="text-sm font-semibold text-[#0043FC]">
                  Total: {formatPrice(stats.total)}
                </span>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order Total</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer Confirmed</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedTransactions.map((transaction) => {
                        const status = getStatusBadge(transaction.status);
                        const StatusIcon = status.icon;
                        
                        return (
                          <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-medium text-gray-900">#{transaction.id?.slice(-8)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-green-600">{formatPrice(transaction.amount)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">{formatPrice(transaction.orderTotal)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                <StatusIcon className="text-xs" />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <FaCalendarAlt />
                                {formatDate(transaction.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {transaction.buyerConfirmedDelivery ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                  <FaCheckCircle className="text-xs" /> Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                  <FaClock className="text-xs" /> Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link
                                to={`/uduua/shop/orders/${transaction.id}`}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <FaEye className="text-xs" /> View Order
                              </Link>
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
                {paginatedTransactions.map((transaction) => {
                  const status = getStatusBadge(transaction.status);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={transaction.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-sm font-medium text-gray-900">#{transaction.id?.slice(-8)}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="text-xs" />
                          {status.label}
                        </span>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Your Earnings:</span>
                          <span className="text-lg font-semibold text-green-600">{formatPrice(transaction.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Order Total:</span>
                          <span className="text-sm text-gray-700">{formatPrice(transaction.orderTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Date:</span>
                          <span className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Customer Confirmed:</span>
                          {transaction.buyerConfirmedDelivery ? (
                            <span className="text-sm text-green-600 flex items-center gap-1">
                              <FaCheckCircle className="text-xs" /> Yes
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                              <FaClock className="text-xs" /> Pending
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/uduua/shop/orders/${transaction.id}`}
                        className="w-full inline-flex items-center justify-center gap-2 py-2 bg-gray-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                      >
                        <FaEye className="text-sm" /> View Order Details
                      </Link>
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
            </>
          )}
        </div>
      </div>
      <UduuaFooter />
    </>
  );
};

export default UduuaSellerPaymentHistory;