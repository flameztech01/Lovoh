// screens/AdminOrders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEye,
  FaSearch,
  FaTimes,
  FaShoppingCart,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaClock,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaChevronLeft,
  FaChevronRight,
  FaDollarSign,
  FaWallet,
  FaUser,
  FaCalendarAlt,
  FaSyncAlt,
  FaDownload,
  FaPhone,
  FaMapMarkerAlt,
  FaBox,
  FaTag,
  FaChevronDown,
  FaChevronUp,
  FaReceipt,
  FaExternalLinkAlt,
  FaStore,
  FaMoneyBillWave,
  FaSpinner
} from 'react-icons/fa';
import {
  useGetAllOrdersQuery,
  useUpdateDeliveryStatusMutation,
  useConfirmPaymentMutation,
  useRejectPaymentMutation,
  useProcessSellerPayoutMutation
} from '../slices/orderApiSlice';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminOrders = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sellerFilter, setSellerFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAction, setPaymentAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerOrders, setSellerOrders] = useState([]);
  const itemsPerPage = 10;

  // Fetch orders
  const { data: ordersData, isLoading, refetch } = useGetAllOrdersQuery({});
  const [updateDeliveryStatus] = useUpdateDeliveryStatusMutation();
  const [confirmPayment] = useConfirmPaymentMutation();
  const [rejectPayment] = useRejectPaymentMutation();
  const [processSellerPayout, { isLoading: isPayoutProcessing }] = useProcessSellerPayoutMutation();

  const orders = ordersData?.orders || [];

  // Extract unique sellers
  const uniqueSellers = React.useMemo(() => {
    const sellers = new Map();
    orders.forEach(order => {
      if (order.seller) {
        const sellerId = order.seller._id || order.seller;
        const sellerName = order.seller.businessName || order.seller.name || 'Unknown Seller';
        if (!sellers.has(sellerId)) {
          sellers.set(sellerId, { id: sellerId, name: sellerName });
        }
      }
    });
    return Array.from(sellers.values());
  }, [orders]);

  // Group orders by seller
  const ordersBySeller = React.useMemo(() => {
    const grouped = new Map();
    orders.forEach(order => {
      const sellerId = order.seller?._id || order.seller;
      if (sellerId) {
        if (!grouped.has(sellerId)) {
          grouped.set(sellerId, {
            seller: order.seller,
            orders: [],
            totalRevenue: 0,
            pendingPayout: 0
          });
        }
        const group = grouped.get(sellerId);
        group.orders.push(order);
        if (order.isPaid && order.buyerConfirmedDelivery) {
          group.totalRevenue += order.sellerPayoutAmount || (order.totalPrice * 0.94);
        }
        if (order.sellerPayoutStatus === 'pending') {
          group.pendingPayout += order.sellerPayoutAmount || (order.totalPrice * 0.94);
        }
      }
    });
    return grouped;
  }, [orders]);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.phone?.includes(searchTerm) ||
      order.seller?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.deliveryStatus === statusFilter;
    
    let matchesPayment = true;
    if (paymentFilter === 'paid') {
      matchesPayment = order.isPaid;
    } else if (paymentFilter === 'unpaid') {
      matchesPayment = !order.isPaid && order.status !== 'cancelled';
    } else if (paymentFilter === 'pending_confirmation') {
      matchesPayment = order.paymentStatus === 'awaiting_confirmation';
    } else if (paymentFilter === 'confirmed') {
      matchesPayment = order.paymentStatus === 'confirmed';
    } else if (paymentFilter === 'rejected') {
      matchesPayment = order.paymentStatus === 'rejected';
    }
    
    const matchesSeller = sellerFilter === 'all' || 
      (order.seller?._id === sellerFilter || order.seller === sellerFilter);
    
    return matchesSearch && matchesStatus && matchesPayment && matchesSeller;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aVal, bVal;
    switch(sortBy) {
      case 'total':
        aVal = a.totalPrice || 0;
        bVal = b.totalPrice || 0;
        break;
      case 'deliveryStatus':
        aVal = a.deliveryStatus || '';
        bVal = b.deliveryStatus || '';
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
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter, sellerFilter, sortBy, sortOrder]);

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
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeliveryStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
      case 'processing':
        return { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: FaSyncAlt };
      case 'dispatched':
        return { label: 'Dispatched', color: 'bg-indigo-100 text-indigo-800', icon: FaBox };
      case 'in_transit':
        return { label: 'In Transit', color: 'bg-purple-100 text-purple-800', icon: FaTruck };
      case 'delivered':
        return { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      default:
        return { label: status || 'Pending', color: 'bg-gray-100 text-gray-800', icon: FaClock };
    }
  };

  const getPaymentBadge = (order) => {
    if (order.isPaid) {
      return { label: 'Paid', color: 'bg-green-100 text-green-800' };
    }
    if (order.paymentStatus === 'awaiting_confirmation') {
      return { label: 'Awaiting Confirmation', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (order.paymentStatus === 'rejected') {
      return { label: 'Payment Rejected', color: 'bg-red-100 text-red-800' };
    }
    if (order.paymentMethod === 'ondelivery') {
      return { label: 'Pay on Delivery', color: 'bg-purple-100 text-purple-800' };
    }
    return { label: 'Unpaid', color: 'bg-gray-100 text-gray-800' };
  };

  const getSellerPayoutBadge = (order) => {
    if (!order.isPaid || !order.buyerConfirmedDelivery) {
      return { label: 'Not Eligible', color: 'bg-gray-100 text-gray-500' };
    }
    switch(order.sellerPayoutStatus) {
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' };
      case 'processing':
        return { label: 'Processing', color: 'bg-blue-100 text-blue-700' };
      case 'completed':
        return { label: 'Completed', color: 'bg-green-100 text-green-700' };
      default:
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' };
    }
  };

  const handleDeliveryStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      await updateDeliveryStatus({ id: selectedOrder._id, status: newStatus }).unwrap();
      toast.success(`Delivery status updated to ${newStatus}`);
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update delivery status');
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;
    
    try {
      await confirmPayment(selectedOrder._id).unwrap();
      toast.success('Payment confirmed successfully');
      setShowPaymentModal(false);
      setSelectedOrder(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to confirm payment');
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedOrder) return;
    
    try {
      await rejectPayment({ id: selectedOrder._id, reason: rejectionReason }).unwrap();
      toast.success('Payment rejected');
      setShowPaymentModal(false);
      setSelectedOrder(null);
      setRejectionReason('');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to reject payment');
    }
  };

  const handleProcessPayout = async (order) => {
    try {
      await processSellerPayout(order._id).unwrap();
      toast.success(`Payout processed for order #${order._id?.slice(-8)}`);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to process payout');
    }
  };

  const openDeliveryStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.deliveryStatus);
    setShowStatusModal(true);
    setShowOrderDetails(false);
  };

  const openPaymentModal = (order, action) => {
    setSelectedOrder(order);
    setPaymentAction(action);
    setShowPaymentModal(true);
    setShowOrderDetails(false);
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const openReceiptModal = (order) => {
    setSelectedOrder(order);
    setShowReceiptModal(true);
  };

  const openSellerPayoutModal = (sellerId, sellerName) => {
    const sellerGroup = ordersBySeller.get(sellerId);
    if (sellerGroup) {
      setSelectedSeller({ id: sellerId, name: sellerName });
      setSellerOrders(sellerGroup.orders.filter(o => o.sellerPayoutStatus === 'pending' && o.isPaid && o.buyerConfirmedDelivery));
      setShowPayoutModal(true);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setSellerFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const getDeliveryStatusOptions = () => {
    return [
      { value: 'pending', label: 'Order Placed' },
      { value: 'processing', label: 'Processing' },
      { value: 'dispatched', label: 'Dispatched' },
      { value: 'in_transit', label: 'In Transit' },
      { value: 'delivered', label: 'Delivered' }
    ];
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Seller', 'Total', 'Delivery Status', 'Payment', 'Payout Status', 'Date'];
    const csvData = filteredOrders.map(order => [
      order._id,
      order.user?.name || 'N/A',
      order.user?.email || 'N/A',
      order.phone || order.user?.phone || 'N/A',
      order.seller?.businessName || order.seller?.name || 'N/A',
      order.totalPrice,
      order.deliveryStatus,
      order.isPaid ? 'Paid' : (order.paymentMethod === 'ondelivery' ? 'Pay on Delivery' : 'Unpaid'),
      order.sellerPayoutStatus || 'pending',
      new Date(order.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Orders exported successfully');
  };

  return (
    <AdminSidebar>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage customer orders and seller payouts</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="text-xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <p className="text-xs text-gray-500">Pending Delivery</p>
            <p className="text-xl font-bold text-yellow-600">
              {orders.filter(o => o.deliveryStatus === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <p className="text-xs text-gray-500">In Transit</p>
            <p className="text-xl font-bold text-blue-600">
              {orders.filter(o => o.deliveryStatus === 'in_transit').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <p className="text-xs text-gray-500">Delivered</p>
            <p className="text-xl font-bold text-green-600">
              {orders.filter(o => o.deliveryStatus === 'delivered').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-sm font-bold text-[#0043FC] truncate">
              {formatPrice(orders.filter(o => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0))}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <p className="text-xs text-gray-500">Pending Payouts</p>
            <p className="text-xl font-bold text-orange-600">
              {orders.filter(o => o.sellerPayoutStatus === 'pending' && o.isPaid && o.buyerConfirmedDelivery).length}
            </p>
          </div>
        </div>

        {/* Seller Summary Cards */}
        {uniqueSellers.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Seller Summary</h3>
            <div className="flex gap-3 pb-2">
              {uniqueSellers.map(seller => {
                const sellerData = ordersBySeller.get(seller.id);
                return (
                  <div
                    key={seller.id}
                    onClick={() => openSellerPayoutModal(seller.id, seller.name)}
                    className="min-w-[200px] bg-white rounded-lg shadow-sm border border-gray-100 p-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FaStore className="text-[#0043FC]" />
                      <p className="font-medium text-gray-900 text-sm truncate">{seller.name}</p>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Orders:</span>
                      <span className="font-semibold">{sellerData?.orders.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Revenue:</span>
                      <span className="font-semibold text-green-600">{formatPrice(sellerData?.totalRevenue || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Pending Payout:</span>
                      <span className="font-semibold text-orange-600">{formatPrice(sellerData?.pendingPayout || 0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, email, phone or seller..."
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
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] text-sm"
              >
                <option value="all">All Delivery Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] text-sm"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending_confirmation">Awaiting Confirmation</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] text-sm"
              >
                <option value="all">All Sellers</option>
                {uniqueSellers.map(seller => (
                  <option key={seller.id} value={seller.id}>{seller.name}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] text-sm"
                >
                  <option value="createdAt">Date</option>
                  <option value="total">Total</option>
                  <option value="deliveryStatus">Delivery Status</option>
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

          {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || sellerFilter !== 'all') && (
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
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs">
                  Delivery: {statusFilter}
                  <button onClick={() => setStatusFilter('all')} className="hover:text-blue-600">
                    <FaTimes className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {paymentFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs">
                  Payment: {paymentFilter}
                  <button onClick={() => setPaymentFilter('all')} className="hover:text-blue-600">
                    <FaTimes className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {sellerFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs">
                  Seller Filter
                  <button onClick={() => setSellerFilter('all')} className="hover:text-purple-600">
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

        {/* Desktop Table View */}
        <div className="hidden md:block">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin" />
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FaShoppingCart className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-[#0043FC] border border-[#0043FC] rounded-lg hover:bg-[#0043FC] hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedOrders.map((order) => {
                      const deliveryStatus = getDeliveryStatusBadge(order.deliveryStatus);
                      const payment = getPaymentBadge(order);
                      const payoutStatus = getSellerPayoutBadge(order);
                      const DeliveryIcon = deliveryStatus.icon;
                      const isEligibleForPayout = order.isPaid && order.buyerConfirmedDelivery && order.sellerPayoutStatus === 'pending';
                      
                      return (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-gray-900">#{order._id?.slice(-8)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                              <p className="text-xs text-gray-500">{order.user?.email || order.phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <FaStore className="text-gray-400 text-xs" />
                              <span className="text-sm text-gray-700">{order.seller?.businessName || order.seller?.name || '—'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{order.orderItems?.length || 0} items</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900">{formatPrice(order.totalPrice)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${deliveryStatus.color}`}>
                              <DeliveryIcon className="text-xs" />
                              {deliveryStatus.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${payment.color}`}>
                              <FaWallet className="text-xs" />
                              {payment.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${payoutStatus.color}`}>
                              <FaMoneyBillWave className="text-xs" />
                              {payoutStatus.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FaCalendarAlt />
                              {formatDate(order.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openOrderDetails(order)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              {order.paymentReceipt && order.paymentStatus === 'awaiting_confirmation' && (
                                <button
                                  onClick={() => openReceiptModal(order)}
                                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                  title="View Receipt"
                                >
                                  <FaReceipt />
                                </button>
                              )}
                              {order.deliveryStatus !== 'delivered' && order.deliveryStatus !== 'cancelled' && (
                                <button
                                  onClick={() => openDeliveryStatusModal(order)}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Update Delivery"
                                >
                                  <FaTruck />
                                </button>
                              )}
                              {order.paymentStatus === 'awaiting_confirmation' && (
                                <>
                                  <button
                                    onClick={() => openPaymentModal(order, 'confirm')}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Confirm Payment"
                                  >
                                    <FaCheckCircle />
                                  </button>
                                  <button
                                    onClick={() => openPaymentModal(order, 'reject')}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Reject Payment"
                                  >
                                    <FaTimesCircle />
                                  </button>
                                </>
                              )}
                              {isEligibleForPayout && (
                                <button
                                  onClick={() => handleProcessPayout(order)}
                                  disabled={isPayoutProcessing}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Process Payout"
                                >
                                  <FaMoneyBillWave />
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
            </div>
          )}

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
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin" />
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FaShoppingCart className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-[#0043FC] border border-[#0043FC] rounded-lg hover:bg-[#0043FC] hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {paginatedOrders.map((order) => {
                const deliveryStatus = getDeliveryStatusBadge(order.deliveryStatus);
                const payment = getPaymentBadge(order);
                const payoutStatus = getSellerPayoutBadge(order);
                const DeliveryIcon = deliveryStatus.icon;
                
                return (
                  <div
                    key={order._id}
                    onClick={() => openOrderDetails(order)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-mono text-sm font-semibold text-gray-900">
                          #{order._id?.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#0043FC]">
                          {formatPrice(order.totalPrice)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.orderItems?.length || 0} items
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <FaUser className="text-gray-400 text-xs" />
                      <span className="text-gray-700">{order.user?.name || 'Guest'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <FaStore className="text-gray-400 text-xs" />
                      <span className="text-gray-700">{order.seller?.businessName || order.seller?.name || '—'}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${deliveryStatus.color}`}>
                        <DeliveryIcon className="text-xs" />
                        {deliveryStatus.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${payment.color}`}>
                        <FaWallet className="text-xs" />
                        {payment.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${payoutStatus.color}`}>
                        <FaMoneyBillWave className="text-xs" />
                        {payoutStatus.label}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openOrderDetails(order);
                        }}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <FaEye /> View
                      </button>
                      {order.paymentReceipt && order.paymentStatus === 'awaiting_confirmation' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openReceiptModal(order);
                          }}
                          className="flex-1 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <FaReceipt /> Receipt
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              
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

        {/* Results Count */}
        {!isLoading && filteredOrders.length > 0 && (
          <div className="mt-4 text-center text-xs text-gray-500">
            Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
          </div>
        )}
      </div>

      {/* Order Details Bottom Sheet Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowOrderDetails(false)} />
          <div className="relative bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                <p className="text-xs text-gray-500 font-mono">#{selectedOrder._id?.slice(-8)}</p>
              </div>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 space-y-5">
              {/* Seller Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaStore className="text-[#0043FC]" />
                  Seller Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <p><span className="text-gray-500">Business Name:</span> {selectedOrder.seller?.businessName || selectedOrder.seller?.name || 'N/A'}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedOrder.seller?.email || 'N/A'}</p>
                  <p><span className="text-gray-500">Payout Status:</span> 
                    <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getSellerPayoutBadge(selectedOrder).color}`}>
                      {getSellerPayoutBadge(selectedOrder).label}
                    </span>
                  </p>
                </div>
              </div>
              
              {/* Customer Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaUser className="text-[#0043FC]" />
                  Customer Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <p><span className="text-gray-500">Name:</span> {selectedOrder.user?.name || 'Guest'}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedOrder.user?.email || 'N/A'}</p>
                  <p><span className="text-gray-500">Phone:</span> {selectedOrder.phone || selectedOrder.user?.phone || 'N/A'}</p>
                </div>
              </div>
              
              {/* Shipping Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#0043FC]" />
                  Shipping Address
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p>{selectedOrder.shippingAddress?.fullName}</p>
                  <p>{selectedOrder.shippingAddress?.address}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                  <p>{selectedOrder.shippingAddress?.country} - {selectedOrder.shippingAddress?.postalCode}</p>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaBox className="text-[#0043FC]" />
                  Order Items ({selectedOrder.orderItems?.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex gap-2 p-2 bg-gray-50 rounded-lg">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Payment Summary */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaWallet className="text-[#0043FC]" />
                  Payment Summary
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <span>{formatPrice(selectedOrder.itemsPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping:</span>
                    <span>{formatPrice(selectedOrder.shippingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax:</span>
                    <span>{formatPrice(selectedOrder.taxPrice)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-[#0043FC]">{formatPrice(selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
                  {selectedOrder.isPaid && selectedOrder.buyerConfirmedDelivery && (
                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-500">Seller Payout (94%):</span>
                      <span className="text-green-600 font-semibold">{formatPrice(selectedOrder.sellerPayoutAmount || (selectedOrder.totalPrice * 0.94))}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tracking Information */}
              {selectedOrder.deliveryTracking && selectedOrder.deliveryTracking.updates?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FaTruck className="text-[#0043FC]" />
                    Delivery Tracking
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {selectedOrder.deliveryTracking.riderName && (
                      <p className="text-sm"><span className="text-gray-500">Rider:</span> {selectedOrder.deliveryTracking.riderName}</p>
                    )}
                    {selectedOrder.deliveryTracking.riderPhone && (
                      <p className="text-sm"><span className="text-gray-500">Rider Phone:</span> {selectedOrder.deliveryTracking.riderPhone}</p>
                    )}
                    {selectedOrder.deliveryTracking.trackingNumber && (
                      <p className="text-sm"><span className="text-gray-500">Tracking #:</span> {selectedOrder.deliveryTracking.trackingNumber}</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Order Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
              
              {/* Receipt Button */}
              {selectedOrder.paymentReceipt && selectedOrder.paymentStatus === 'awaiting_confirmation' && (
                <div>
                  <button
                    onClick={() => {
                      setShowOrderDetails(false);
                      openReceiptModal(selectedOrder);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition"
                  >
                    <FaReceipt />
                    View Payment Receipt
                    <FaExternalLinkAlt className="text-xs" />
                  </button>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedOrder.deliveryStatus !== 'delivered' && selectedOrder.deliveryStatus !== 'cancelled' && (
                  <button
                    onClick={() => {
                      setShowOrderDetails(false);
                      openDeliveryStatusModal(selectedOrder);
                    }}
                    className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <FaTruck /> Update Delivery
                  </button>
                )}
                {selectedOrder.paymentStatus === 'awaiting_confirmation' && (
                  <>
                    <button
                      onClick={() => {
                        setShowOrderDetails(false);
                        openPaymentModal(selectedOrder, 'confirm');
                      }}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <FaCheckCircle /> Confirm Payment
                    </button>
                    <button
                      onClick={() => {
                        setShowOrderDetails(false);
                        openPaymentModal(selectedOrder, 'reject');
                      }}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <FaTimesCircle /> Reject
                    </button>
                  </>
                )}
                {selectedOrder.isPaid && selectedOrder.buyerConfirmedDelivery && selectedOrder.sellerPayoutStatus === 'pending' && (
                  <button
                    onClick={() => handleProcessPayout(selectedOrder)}
                    disabled={isPayoutProcessing}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <FaMoneyBillWave /> Process Payout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedOrder && selectedOrder.paymentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaReceipt className="text-[#0043FC]" />
                  Payment Receipt
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Order #{selectedOrder._id?.slice(-8)} - {selectedOrder.user?.name || 'Customer'}
                </p>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src={selectedOrder.paymentReceipt}
                  alt="Payment Receipt"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/800x600?text=Receipt+Not+Available';
                  }}
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <a
                href={selectedOrder.paymentReceipt}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition"
              >
                <FaExternalLinkAlt />
                Open in New Tab
              </a>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <FaTruck className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Delivery Status</h3>
              <p className="text-gray-500 mb-4 text-sm">
                Order #{selectedOrder._id?.slice(-8)} - Current: {selectedOrder.deliveryStatus}
              </p>
              <div className="mb-4">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                >
                  {getDeliveryStatusOptions().map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                    setNewStatus('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeliveryStatusUpdate}
                  disabled={newStatus === selectedOrder.deliveryStatus}
                  className="flex-1 px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-all disabled:opacity-50"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Action Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                paymentAction === 'confirm' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {paymentAction === 'confirm' ? (
                  <FaCheckCircle className="text-2xl text-green-600" />
                ) : (
                  <FaTimesCircle className="text-2xl text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {paymentAction === 'confirm' ? 'Confirm Payment' : 'Reject Payment'}
              </h3>
              <p className="text-gray-500 mb-4 text-sm">
                Order #{selectedOrder._id?.slice(-8)} - Total: {formatPrice(selectedOrder.totalPrice)}
              </p>
              
              {paymentAction === 'reject' && (
                <div className="mb-4">
                  <textarea
                    placeholder="Reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedOrder(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={paymentAction === 'confirm' ? handleConfirmPayment : handleRejectPayment}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-all ${
                    paymentAction === 'confirm'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {paymentAction === 'confirm' ? 'Confirm Payment' : 'Reject Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller Payout Modal */}
      {showPayoutModal && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaStore className="text-[#0043FC]" />
                  Seller Payout - {selectedSeller.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Pending payout orders</p>
              </div>
              <button
                onClick={() => {
                  setShowPayoutModal(false);
                  setSelectedSeller(null);
                  setSellerOrders([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {sellerOrders.length === 0 ? (
                <div className="text-center py-8">
                  <FaMoneyBillWave className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No pending payouts for this seller</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sellerOrders.map(order => (
                    <div key={order._id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm font-medium text-gray-900">#{order._id?.slice(-8)}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatPrice(order.sellerPayoutAmount || (order.totalPrice * 0.94))}</p>
                        <button
                          onClick={() => {
                            setShowPayoutModal(false);
                            handleProcessPayout(order);
                          }}
                          disabled={isPayoutProcessing}
                          className="mt-1 px-3 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition"
                        >
                          Process Payout
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </AdminSidebar>
  );
};

export default AdminOrders;