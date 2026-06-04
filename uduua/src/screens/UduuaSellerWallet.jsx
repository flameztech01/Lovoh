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
  FaChevronRight,
  FaUniversity, // Changed from FaBank to FaUniversity
  FaArrowRight,
  FaChartLine,
} from 'react-icons/fa';
import { useGetSellerBalanceQuery, useInitiateWithdrawalMutation } from '../slices/orderApiSlice';
import { useGetSellerOrdersQuery } from '../slices/orderApiSlice';
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
  const [showBankModal, setShowBankModal] = useState(false);

  // Fetch seller balance
  const { data: balanceData, isLoading: balanceLoading, refetch } = useGetSellerBalanceQuery(undefined, {
    skip: !userInfo,
  });
  
  // Fetch seller orders for transaction history
  const { data: ordersData, isLoading: ordersLoading } = useGetSellerOrdersQuery({ 
    page: 1, 
    limit: 50,
    status: 'all'
  }, {
    skip: !userInfo,
  });
  
  const [initiateWithdrawal] = useInitiateWithdrawalMutation();

  // Extract earnings from completed/delivered orders
  const getEarningsFromOrders = () => {
    const orders = ordersData?.orders || [];
    
    // Filter completed/delivered orders that have seller payout amount
    const completedOrders = orders.filter(order => 
      order.deliveryStatus === 'delivered' && 
      order.sellerPayoutAmount > 0 &&
      order.buyerConfirmedDelivery === true
    );
    
    // Calculate total earnings
    const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.sellerPayoutAmount || 0), 0);
    
    // Calculate pending earnings (orders delivered but not yet paid out)
    const pendingEarnings = completedOrders
      .filter(order => order.sellerPayoutStatus !== 'completed')
      .reduce((sum, order) => sum + (order.sellerPayoutAmount || 0), 0);
    
    // Calculate completed payouts
    const completedPayouts = completedOrders
      .filter(order => order.sellerPayoutStatus === 'completed')
      .reduce((sum, order) => sum + (order.sellerPayoutAmount || 0), 0);
    
    // Processing earnings (orders in transit/processing)
    const processingOrders = orders.filter(order => 
      order.deliveryStatus === 'in_transit' || 
      order.deliveryStatus === 'processing' ||
      order.deliveryStatus === 'dispatched'
    );
    const processingEarnings = processingOrders.reduce((sum, order) => sum + (order.sellerPayoutAmount || 0), 0);
    
    return {
      availableBalance: pendingEarnings, // Available for withdrawal
      processingBalance: processingEarnings,
      completedBalance: completedPayouts,
      totalEarned: totalEarnings,
      transactions: orders
        .filter(order => order.sellerPayoutAmount > 0)
        .map(order => ({
          id: order._id,
          amount: order.sellerPayoutAmount,
          orderTotal: order.totalPrice,
          status: order.sellerPayoutStatus === 'completed' ? 'completed' : 
                  order.deliveryStatus === 'delivered' ? 'pending' : 'processing',
          createdAt: order.createdAt,
          paidAt: order.sellerPayoutDate,
        })),
    };
  };

  const earnings = getEarningsFromOrders();
  
  const availableBalance = earnings.availableBalance;
  const processingBalance = earnings.processingBalance;
  const completedBalance = earnings.completedBalance;
  const totalEarned = earnings.totalEarned;
  const transactions = earnings.transactions;

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
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    switch(selectedTimeframe) {
      case 'week':
        return transactions.filter(t => new Date(t.createdAt) >= sevenDaysAgo);
      case 'month':
        return transactions.filter(t => new Date(t.createdAt) >= thirtyDaysAgo);
      default:
        return transactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();
  const totalFilteredEarnings = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  const isLoading = balanceLoading || ordersLoading;

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
      <div className="min-h-screen bg-gray-100 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/seller/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0043FC] mb-4 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Back to Dashboard</span>
            </button>
          </div>

          {/* Main Balance Card - Bank Style */}
          <div className="bg-gradient-to-br from-[#0043FC] to-[#002a9e] rounded-2xl shadow-xl mb-6 overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <FaWallet className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs uppercase tracking-wide">Available Balance</p>
                    <p className="text-white text-3xl sm:text-4xl font-bold mt-1">
                      {formatPrice(availableBalance)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={availableBalance === 0}
                  className="px-5 py-2.5 bg-white text-[#0043FC] rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                >
                  <FaMoneyBillWave />
                  Withdraw
                </button>
              </div>

              {/* Card Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-white/60 text-xs">Total Earned</p>
                  <p className="text-white text-lg font-semibold">{formatPrice(totalEarned)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Processing</p>
                  <p className="text-white text-lg font-semibold">{formatPrice(processingBalance)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Completed Payouts</p>
                  <p className="text-white text-lg font-semibold">{formatPrice(completedBalance)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={availableBalance === 0}
              className="bg-white rounded-xl p-4 text-center border border-gray-200 hover:shadow-md transition-all disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaMoneyBillWave className="text-green-600 text-lg" />
              </div>
              <p className="text-sm font-medium text-gray-700">Withdraw</p>
              <p className="text-xs text-gray-400 mt-1">Min ₦1,000</p>
            </button>
            
            <button
              onClick={() => navigate('/seller/orders')}
              className="bg-white rounded-xl p-4 text-center border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaShoppingCart className="text-blue-600 text-lg" />
              </div>
              <p className="text-sm font-medium text-gray-700">Orders</p>
              <p className="text-xs text-gray-400 mt-1">View sales</p>
            </button>
            
            <button
              onClick={() => setShowBankModal(true)}
              className="bg-white rounded-xl p-4 text-center border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaUniversity className="text-purple-600 text-lg" />
              </div>
              <p className="text-sm font-medium text-gray-700">Bank Info</p>
              <p className="text-xs text-gray-400 mt-1">View details</p>
            </button>
            
            <button
              onClick={copyBankDetails}
              className="bg-white rounded-xl p-4 text-center border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaCopy className="text-orange-600 text-lg" />
              </div>
              <p className="text-sm font-medium text-gray-700">Copy Details</p>
              <p className="text-xs text-gray-400 mt-1">Account info</p>
            </button>
          </div>

          {/* Withdrawal Info Banner */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <FaWhatsapp className="text-amber-600 text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 mb-1">Withdrawal Information</p>
                <p className="text-xs text-amber-700">
                  Withdrawals are processed within 1-3 business days to your registered bank account.
                  Minimum withdrawal amount is ₦1,000. You earn <strong className="font-semibold">94%</strong> of each sale.
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FaHistory className="text-[#0043FC] text-sm" />
                Transaction History
              </h2>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTimeframe('all')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    selectedTimeframe === 'all' 
                      ? 'bg-[#0043FC] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedTimeframe('month')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    selectedTimeframe === 'month' 
                      ? 'bg-[#0043FC] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setSelectedTimeframe('week')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    selectedTimeframe === 'week' 
                      ? 'bg-[#0043FC] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  7 Days
                </button>
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
                    to="/seller/products"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#0043FC] text-white rounded-lg text-sm font-medium hover:bg-[#0038D4] transition-colors"
                  >
                    <FaPlus className="text-sm" />
                    Add Products
                  </Link>
                </div>
              ) : (
                <>
                  {/* Summary for filtered period */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total earnings for period:</span>
                    <span className="text-lg font-bold text-[#0043FC]">{formatPrice(totalFilteredEarnings)}</span>
                  </div>
                  
                  {/* Transaction List */}
                  <div className="space-y-3">
                    {filteredTransactions.map((transaction) => {
                      const status = getTransactionStatusBadge(transaction.status);
                      const StatusIcon = status.icon;
                      
                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => navigate(`/shop/orders/${transaction.id}`)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {transaction.status === 'completed' ? (
                                <FaCheckCircle className="text-green-500 text-lg" />
                              ) : transaction.status === 'processing' ? (
                                <FaSpinner className="text-blue-500 text-lg animate-spin" />
                              ) : (
                                <FaClock className="text-yellow-500 text-lg" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-gray-500">
                                  #{transaction.id?.slice(-8)}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                  <StatusIcon className="text-[10px]" />
                                  {status.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <FaCalendarAlt className="text-[10px]" />
                                  {formatDate(transaction.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-bold text-green-600">
                              {formatPrice(transaction.amount)}
                            </p>
                            <p className="text-xs text-gray-400">
                              Order: {formatPrice(transaction.orderTotal)}
                            </p>
                          </div>
                          <FaChevronRight className="text-gray-300 ml-2 text-sm" />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* FAQ Section - Simple */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick FAQs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-800">Withdrawal time?</p>
                <p className="text-xs text-gray-500">1-3 business days</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800">Minimum withdrawal?</p>
                <p className="text-xs text-gray-500">₦1,000</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800">Your commission?</p>
                <p className="text-xs text-gray-500">94% of each sale</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800">When available?</p>
                <p className="text-xs text-gray-500">After customer confirms delivery</p>
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
              <div className="bg-gradient-to-r from-[#0043FC] to-[#0038D4] rounded-lg p-4 text-center">
                <p className="text-white/80 text-sm">Available Balance</p>
                <p className="text-white text-3xl font-bold">{formatPrice(availableBalance)}</p>
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
              
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> Withdrawals are processed to your registered bank account within 1-3 business days.
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

      {/* Bank Info Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bank Information</h3>
              <button
                onClick={() => setShowBankModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Bank Name:</span>
                <span className="text-sm font-medium text-gray-800">OPay Digital Bank</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Account Name:</span>
                <span className="text-sm font-medium text-gray-800">Lovoh</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Account Number:</span>
                <span className="text-sm font-medium text-gray-800">8123456789</span>
              </div>
            </div>
            
            <button
              onClick={copyBankDetails}
              className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <FaCopy /> Copy Bank Details
            </button>
          </div>
        </div>
      )}
      <UduuaFooter />
    </>
  );
};

export default UduuaSellerWallet;