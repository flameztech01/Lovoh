// screens/UduuaSellerWallet.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaWallet,
  FaMoneyBillWave,
  FaHistory,
  FaSpinner,
  FaArrowLeft,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaPlus,
  FaShoppingCart,
  FaCalendarAlt,
  FaCopy,
  FaWhatsapp,
  FaTimes,
} from 'react-icons/fa';
import { useGetSellerBalanceQuery, useInitiateWithdrawalMutation } from '../slices/orderApiSlice';
import { toast } from 'react-toastify';
import ShopNavbar from '../components/ShopNavbar';
import UduuaFooter from '../components/UduuaFooter';

const UduuaSellerWallet = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  const { data: balanceData, isLoading, refetch } = useGetSellerBalanceQuery(undefined, {
    skip: !userInfo,
  });
  
  const [initiateWithdrawal] = useInitiateWithdrawalMutation();

  const availableBalance = balanceData?.availableBalance || 0;
  const processingBalance = balanceData?.processingBalance || 0;
  const completedBalance = balanceData?.completedBalance || 0;
  const totalEarned = balanceData?.totalEarned || 0;
  const transactions = balanceData?.orders || [];

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

  const getTransactionStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
      case 'processing':
        return { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: FaSpinner };
      case 'completed':
        return { label: 'Completed', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: FaClock };
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount > availableBalance) {
      toast.error('Insufficient balance. Please enter a lower amount.');
      return;
    }
    
    if (amount < 1000) {
      toast.error('Minimum withdrawal amount is ₦1,000');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await initiateWithdrawal({ amount }).unwrap();
      toast.success(`Withdrawal of ${formatPrice(amount)} initiated successfully!`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to initiate withdrawal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyBankDetails = () => {
    const bankDetails = `Bank Name: OPay Digital Bank\nAccount Name: Lovoh\nAccount Number: 8123456789`;
    navigator.clipboard.writeText(bankDetails);
    setCopied(true);
    toast.success('Bank details copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  // Filter transactions by timeframe
  const getFilteredTransactions = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
    const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
    const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
    
    switch(selectedTimeframe) {
      case 'week':
        return transactions.filter(t => new Date(t.createdAt) >= oneWeekAgo);
      case 'month':
        return transactions.filter(t => new Date(t.createdAt) >= oneMonthAgo);
      case 'quarter':
        return transactions.filter(t => new Date(t.createdAt) >= threeMonthsAgo);
      default:
        return transactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();
  const totalFilteredEarnings = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading wallet data...</p>
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
                  Wallet & Payouts
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Manage your earnings and withdrawal requests
                </p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={availableBalance === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0043FC] hover:bg-[#0038D4] text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaMoneyBillWave className="text-sm" />
                Withdraw Funds
              </button>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-[#0043FC] to-[#0038D4] rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <FaWallet className="text-2xl opacity-80" />
                <span className="text-xs opacity-70">Available Balance</span>
              </div>
              <p className="text-3xl font-bold">{formatPrice(availableBalance)}</p>
              <p className="text-sm opacity-80 mt-2">Ready to withdraw</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaSpinner className="text-blue-600 text-lg" />
                </div>
                <span className="text-xs text-gray-400">Processing</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(processingBalance)}</p>
              <p className="text-xs text-gray-500 mt-1">Pending confirmation</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaCheckCircle className="text-green-600 text-lg" />
                </div>
                <span className="text-xs text-gray-400">Completed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(completedBalance)}</p>
              <p className="text-xs text-gray-500 mt-1">Successfully paid out</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaMoneyBillWave className="text-purple-600 text-lg" />
                </div>
                <span className="text-xs text-gray-400">Total Earned</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(totalEarned)}</p>
              <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
            </div>
          </div>

          {/* Withdrawal Info */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FaWhatsapp className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800 mb-1">Withdrawal Information</p>
                <p className="text-xs text-blue-700">
                  Withdrawals are processed within 1-3 business days to your registered bank account.
                  Minimum withdrawal amount is ₦1,000.
                </p>
                <button
                  onClick={copyBankDetails}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800"
                >
                  <FaCopy className="text-[10px]" />
                  {copied ? 'Copied!' : 'Copy bank details for reference'}
                </button>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FaHistory className="text-[#0043FC] text-sm" />
                Transaction History
              </h2>
              
              <div className="flex gap-2">
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 90 Days</option>
                </select>
              </div>
            </div>

            <div className="p-5">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FaHistory className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                  <p className="text-gray-500 text-sm">
                    When you make sales, your earnings will appear here.
                  </p>
                  <Link
                    to="/uduua/shop"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#0043FC] text-white rounded-lg text-sm font-medium hover:bg-[#0038D4] transition-colors"
                  >
                    <FaShoppingCart className="text-sm" />
                    Start Selling
                  </Link>
                </div>
              ) : (
                <>
                  {/* Summary for filtered period */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total for period:</span>
                    <span className="text-lg font-bold text-[#0043FC]">{formatPrice(totalFilteredEarnings)}</span>
                  </div>
                  
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order Total</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredTransactions.map((transaction) => {
                          const status = getTransactionStatusBadge(transaction.status);
                          const StatusIcon = status.icon;
                          
                          return (
                            <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <span className="font-mono text-sm text-gray-900">#{transaction.id?.slice(-8)}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-semibold text-green-600">{formatPrice(transaction.amount)}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-600">{formatPrice(transaction.orderTotal)}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                  <StatusIcon className="text-xs" />
                                  {status.label}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <FaCalendarAlt />
                                  {formatDate(transaction.createdAt)}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Link
                                  to={`/uduua/shop/orders/${transaction.id}`}
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
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

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {filteredTransactions.map((transaction) => {
                      const status = getTransactionStatusBadge(transaction.status);
                      const StatusIcon = status.icon;
                      
                      return (
                        <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-mono text-xs text-gray-500">#{transaction.id?.slice(-8)}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                              <StatusIcon className="text-[10px]" />
                              {status.label}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Your Earnings:</span>
                            <span className="text-lg font-semibold text-green-600">{formatPrice(transaction.amount)}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Order Total:</span>
                            <span className="text-sm text-gray-700">{formatPrice(transaction.orderTotal)}</span>
                          </div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-500">Date:</span>
                            <span className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</span>
                          </div>
                          <Link
                            to={`/uduua/shop/orders/${transaction.id}`}
                            className="w-full inline-flex items-center justify-center gap-1 py-2 bg-gray-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                          >
                            <FaEye className="text-xs" /> View Order Details
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-800">How long does withdrawal take?</p>
                <p className="text-xs text-gray-500 mt-1">Withdrawals are processed within 1-3 business days after request.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">What's the minimum withdrawal amount?</p>
                <p className="text-xs text-gray-500 mt-1">The minimum withdrawal amount is ₦1,000.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">How are earnings calculated?</p>
                <p className="text-xs text-gray-500 mt-1">You earn 94% of each sale. The platform takes 6% as service fee.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">When do earnings become available for withdrawal?</p>
                <p className="text-xs text-gray-500 mt-1">Earnings become available after the customer confirms delivery of their order.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Withdrawal</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-2xl font-bold text-[#0043FC]">{formatPrice(availableBalance)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Withdrawal Amount (₦)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1000"
                  max={availableBalance}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: ₦1,000 | Maximum: {formatPrice(availableBalance)}</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Withdrawals are processed to your registered bank account within 1-3 business days.
                  Please ensure your bank details are correct.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isSubmitting || withdrawAmount <= 0 || withdrawAmount > availableBalance}
                className="flex-1 px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaMoneyBillWave />}
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
      <UduuaFooter />
    </>
  );
};

export default UduuaSellerWallet;