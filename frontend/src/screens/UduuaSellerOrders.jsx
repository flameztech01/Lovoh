// screens/UduuaSellerOrders.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaEye,
  FaSearch,
  FaTimes,
  FaBox,
  FaSpinner,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaSortAmountDown,
  FaSortAmountUp,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaCalendarAlt,
  FaPhone,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaWhatsapp,
  FaShippingFast,
  FaPrint,
  FaDownload,
  FaCopy,
  FaRegCreditCard,
  FaStore,
} from 'react-icons/fa';
import { useGetSellerOrdersQuery } from '../slices/orderApiSlice';
import { useUpdateDeliveryStatusMutation } from '../slices/orderApiSlice';
import { toast } from 'react-toastify';
import ShopNavbar from '../components/ShopNavbar';
import UduuaFooter from '../components/UduuaFooter';

const UduuaSellerOrders = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newDeliveryStatus, setNewDeliveryStatus] = useState('');
  const [trackingInfo, setTrackingInfo] = useState({
    riderName: '',
    riderPhone: '',
    trackingNumber: '',
    message: '',
  });
  const itemsPerPage = 10;
  const detailsRef = useRef(null);

  const { data: ordersData, isLoading, refetch } = useGetSellerOrdersQuery({
    page: currentPage,
    limit: itemsPerPage,
  });
  
  const [updateDeliveryStatus, { isLoading: isUpdating }] = useUpdateDeliveryStatusMutation();

  const orders = ordersData?.orders || [];
  const totalPages = ordersData?.pages || 1;
  const totalOrders = ordersData?.total || 0;

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getDeliveryStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
      case 'processing':
        return { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: FaSpinner };
      case 'dispatched':
        return { label: 'Dispatched', color: 'bg-purple-100 text-purple-800', icon: FaShippingFast };
      case 'in_transit':
        return { label: 'In Transit', color: 'bg-indigo-100 text-indigo-800', icon: FaTruck };
      case 'delivered':
        return { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      default:
        return { label: status || 'Pending', color: 'bg-gray-100 text-gray-800', icon: FaClock };
    }
  };

  const getPaymentStatusBadge = (order) => {
    if (order.isPaid) {
      return { label: 'Paid', color: 'bg-green-100 text-green-800' };
    }
    if (order.paymentStatus === 'pending_payment') {
      return { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (order.paymentMethod === 'ondelivery') {
      return { label: 'Pay on Delivery', color: 'bg-purple-100 text-purple-800' };
    }
    return { label: 'Unpaid', color: 'bg-gray-100 text-gray-800' };
  };

  const handleUpdateDelivery = (order) => {
    setSelectedOrder(order);
    setNewDeliveryStatus(order.deliveryStatus);
    setTrackingInfo({
      riderName: order.deliveryTracking?.riderName || '',
      riderPhone: order.deliveryTracking?.riderPhone || '',
      trackingNumber: order.deliveryTracking?.trackingNumber || '',
      message: '',
    });
    setShowUpdateModal(true);
    setShowDetailsModal(false);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedOrder) return;
    
    try {
      await updateDeliveryStatus({
        id: selectedOrder._id,
        status: newDeliveryStatus,
        riderName: trackingInfo.riderName,
        riderPhone: trackingInfo.riderPhone,
        trackingNumber: trackingInfo.trackingNumber,
        message: trackingInfo.message,
      }).unwrap();
      
      toast.success(`Delivery status updated to ${newDeliveryStatus.replace('_', ' ')}`);
      setShowUpdateModal(false);
      setSelectedOrder(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update delivery status');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handlePrint = () => {
    const printContent = detailsRef.current;
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const copyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId);
    toast.success('Order ID copied!');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  let filteredOrders = [...orders];
  
  if (searchTerm) {
    filteredOrders = filteredOrders.filter(order => 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.phone?.includes(searchTerm)
    );
  }
  
  if (statusFilter !== 'all') {
    filteredOrders = filteredOrders.filter(order => order.deliveryStatus === statusFilter);
  }
  
  filteredOrders.sort((a, b) => {
    switch(sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'amount_high':
        return (b.totalPrice || 0) - (a.totalPrice || 0);
      case 'amount_low':
        return (a.totalPrice || 0) - (b.totalPrice || 0);
      default:
        return 0;
    }
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  const filteredTotalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const deliveryStatusOptions = [
    { value: 'pending', label: 'Order Placed' },
    { value: 'processing', label: 'Processing' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
  ];

  if (isLoading && orders.length === 0) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading orders...</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Sales Orders
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage and track customer orders for your products
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.deliveryStatus === 'pending').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500">In Transit</p>
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.deliveryStatus === 'in_transit').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.deliveryStatus === 'delivered').length}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <FaTimes className="text-sm" />
                  </button>
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Amount: High to Low</option>
                <option value="amount_low">Amount: Low to High</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== 'all') && (
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
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600">
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FaBox className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t received any orders yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Delivery</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedOrders.map((order) => {
                        const deliveryStatus = getDeliveryStatusBadge(order.deliveryStatus);
                        const paymentStatus = getPaymentStatusBadge(order);
                        const DeliveryIcon = deliveryStatus.icon;
                        
                        return (
                          <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-medium text-gray-900">#{order._id?.slice(-8)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                                <p className="text-xs text-gray-500">{order.user?.email || order.phone}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">{order.orderItems?.length || 0} items</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-[#0043FC]">{formatPrice(order.totalPrice)}</span>
                              {order.sellerPayoutAmount > 0 && (
                                <p className="text-xs text-green-600">You get: {formatPrice(order.sellerPayoutAmount)}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${deliveryStatus.color}`}>
                                <DeliveryIcon className="text-xs" />
                                {deliveryStatus.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentStatus.color}`}>
                                {paymentStatus.label}
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
                                  onClick={() => handleViewDetails(order)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <FaEye className="text-sm" />
                                </button>
                                {order.deliveryStatus !== 'delivered' && order.deliveryStatus !== 'cancelled' && (
                                  <button
                                    onClick={() => handleUpdateDelivery(order)}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="Update Delivery"
                                  >
                                    <FaTruck className="text-sm" />
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {paginatedOrders.map((order) => {
                  const deliveryStatus = getDeliveryStatusBadge(order.deliveryStatus);
                  const paymentStatus = getPaymentStatusBadge(order);
                  const DeliveryIcon = deliveryStatus.icon;
                  
                  return (
                    <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-mono text-sm font-semibold text-gray-900">#{order._id?.slice(-8)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#0043FC]">{formatPrice(order.totalPrice)}</p>
                          <p className="text-xs text-gray-500">{order.orderItems?.length || 0} items</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2 text-sm">
                        <FaUser className="text-gray-400 text-xs" />
                        <span className="text-gray-700">{order.user?.name || 'Guest'}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${deliveryStatus.color}`}>
                          <DeliveryIcon className="text-xs" />
                          {deliveryStatus.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentStatus.color}`}>
                          {paymentStatus.label}
                        </span>
                      </div>
                      
                      {order.sellerPayoutAmount > 0 && (
                        <div className="text-xs text-green-600 mb-3">Your earnings: {formatPrice(order.sellerPayoutAmount)}</div>
                      )}
                      
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button onClick={() => handleViewDetails(order)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                          <FaEye /> View
                        </button>
                        {order.deliveryStatus !== 'delivered' && order.deliveryStatus !== 'cancelled' && (
                          <button onClick={() => handleUpdateDelivery(order)} className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                            <FaTruck /> Update
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {filteredTotalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronLeft />
                  </button>
                  <span className="text-sm text-gray-600">Page {currentPage} of {filteredTotalPages}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, filteredTotalPages))}
                    disabled={currentPage === filteredTotalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-xs text-gray-500">
                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Details Modal - Popup with Print/Download */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-500 font-mono">#{selectedOrder._id}</p>
                  <button onClick={() => copyOrderId(selectedOrder._id)} className="text-gray-400 hover:text-[#0043FC] transition-colors">
                    <FaCopy className="text-xs" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-[#0043FC] hover:text-[#0043FC] transition-all text-sm"
                >
                  <FaPrint className="text-sm" />
                  Print
                </button>
                <button
                  onClick={handleDownloadPDF}
 className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-[#0043FC] hover:text-[#0043FC] transition-all text-sm"
                >
                  <FaDownload className="text-sm" />
                  Download
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Order Details Content - Printable Area */}
            <div ref={detailsRef} className="p-6 space-y-6" id="order-details-print">
              {/* Order Header */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FaStore className="text-[#0043FC] text-xl" />
                      <span className="text-xl font-bold text-gray-900">Uduua Marketplace</span>
                    </div>
                    <p className="text-xs text-gray-500">Order Confirmation</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Order Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatFullDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500">Delivery Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const status = getDeliveryStatusBadge(selectedOrder.deliveryStatus);
                      const StatusIcon = status.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="text-xs" /> {status.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500">Payment Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const paymentStatus = getPaymentStatusBadge(selectedOrder);
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentStatus.color}`}>
                          {paymentStatus.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaUser className="text-[#0043FC]" /> Customer Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm border border-gray-200">
                  <p><span className="text-gray-500">Name:</span> <span className="text-gray-900">{selectedOrder.user?.name || 'Guest'}</span></p>
                  <p><span className="text-gray-500">Email:</span> <span className="text-gray-900">{selectedOrder.user?.email || 'N/A'}</span></p>
                  <p><span className="text-gray-500">Phone:</span> <span className="text-gray-900">{selectedOrder.phone}</span></p>
                </div>
              </div>

              {/* Shipping Information */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#0043FC]" /> Shipping Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm border border-gray-200">
                  <p><span className="text-gray-500">Name:</span> <span className="text-gray-900">{selectedOrder.shippingAddress?.fullName}</span></p>
                  <p><span className="text-gray-500">Address:</span> <span className="text-gray-900">{selectedOrder.shippingAddress?.address}</span></p>
                  <p><span className="text-gray-500">City:</span> <span className="text-gray-900">{selectedOrder.shippingAddress?.city}</span></p>
                  <p><span className="text-gray-500">State:</span> <span className="text-gray-900">{selectedOrder.shippingAddress?.state}</span></p>
                  <p><span className="text-gray-500">Country:</span> <span className="text-gray-900">{selectedOrder.shippingAddress?.country}</span></p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaBox className="text-[#0043FC]" /> Order Items
                </h3>
                <div className="space-y-3">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.orderItems?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-3">
                              <img src={item.image || '/placeholder-product.jpg'} alt={item.name} className="w-10 h-10 rounded-md object-cover" onError={(e) => { e.target.src = '/placeholder-product.jpg'; }} />
                              <span className="text-sm text-gray-900">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center text-sm text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-2 text-right text-sm text-gray-600">{formatPrice(item.price)}</td>
                          <td className="px-4 py-2 text-right font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-right font-medium text-gray-600">Subtotal:</td>
                        <td className="px-4 py-2 text-right font-medium text-gray-900">{formatPrice(selectedOrder.itemsPrice)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-right font-medium text-gray-600">Shipping:</td>
                        <td className="px-4 py-2 text-right font-medium text-gray-900">{selectedOrder.shippingPrice === 0 ? 'Free' : formatPrice(selectedOrder.shippingPrice)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-right font-medium text-gray-600">Tax:</td>
                        <td className="px-4 py-2 text-right font-medium text-gray-900">{formatPrice(selectedOrder.taxPrice)}</td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td colSpan="3" className="px-4 py-2 text-right font-bold text-gray-900">Total:</td>
                        <td className="px-4 py-2 text-right font-bold text-[#0043FC] text-lg">{formatPrice(selectedOrder.totalPrice)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaRegCreditCard className="text-[#0043FC]" /> Payment Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="text-gray-900 capitalize">{selectedOrder.paymentMethod}</span>
                  </div>
                  {selectedOrder.paymentReference && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reference:</span>
                      <span className="text-gray-900 font-mono text-xs">{selectedOrder.paymentReference}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Status:</span>
                    <span className="text-gray-900">{selectedOrder.isPaid ? 'Paid' : 'Pending'}</span>
                  </div>
                  {selectedOrder.sellerPayoutAmount > 0 && (
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-500">Your Earnings (94%):</span>
                      <span className="text-green-600 font-semibold">{formatPrice(selectedOrder.sellerPayoutAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Tracking */}
              {selectedOrder.deliveryTracking && (selectedOrder.deliveryTracking.riderName || selectedOrder.deliveryTracking.trackingNumber) && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaTruck className="text-[#0043FC]" /> Delivery Tracking
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm border border-gray-200">
                    {selectedOrder.deliveryTracking.riderName && <p><span className="text-gray-500">Rider:</span> {selectedOrder.deliveryTracking.riderName}</p>}
                    {selectedOrder.deliveryTracking.riderPhone && <p><span className="text-gray-500">Rider Phone:</span> {selectedOrder.deliveryTracking.riderPhone}</p>}
                    {selectedOrder.deliveryTracking.trackingNumber && <p><span className="text-gray-500">Tracking #:</span> {selectedOrder.deliveryTracking.trackingNumber}</p>}
                  </div>
                </div>
              )}

              {/* Order Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Order Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  if (selectedOrder.deliveryStatus !== 'delivered' && selectedOrder.deliveryStatus !== 'cancelled') {
                    handleUpdateDelivery(selectedOrder);
                  }
                }}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaTruck className="text-sm" /> Update Delivery Status
              </button>
              <button
                onClick={() => navigate(`/uduua/shop/orders/${selectedOrder._id}`)}
                className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <FaEye className="text-sm" /> Full Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Delivery Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Delivery Status</h3>
              <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order #{selectedOrder._id?.slice(-8)}
                </label>
                <p className="text-sm text-gray-500">Customer: {selectedOrder.user?.name || 'Guest'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Status *</label>
                <select
                  value={newDeliveryStatus}
                  onChange={(e) => setNewDeliveryStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                >
                  {deliveryStatusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              {(newDeliveryStatus === 'dispatched' || newDeliveryStatus === 'in_transit') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rider Name (Optional)</label>
                    <input type="text" value={trackingInfo.riderName} onChange={(e) => setTrackingInfo({ ...trackingInfo, riderName: e.target.value })} placeholder="Enter rider name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rider Phone (Optional)</label>
                    <input type="tel" value={trackingInfo.riderPhone} onChange={(e) => setTrackingInfo({ ...trackingInfo, riderPhone: e.target.value })} placeholder="Enter rider phone number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number (Optional)</label>
                    <input type="text" value={trackingInfo.trackingNumber} onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })} placeholder="Enter tracking number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]" />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Message (Optional)</label>
                <textarea value={trackingInfo.message} onChange={(e) => setTrackingInfo({ ...trackingInfo, message: e.target.value })} placeholder="Add a status update message for the customer" rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] resize-none" />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUpdateModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleUpdateSubmit} disabled={isUpdating} className="flex-1 px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isUpdating ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Update Status
              </button>
            </div>
          </div>
        </div>
      )}
      <UduuaFooter />

      {/* Print Styles */}
      <style>{`
        @media print {
          nav, button, .no-print, .fixed, .sticky, .absolute {
            display: none !important;
          }
          body {
            background: white;
            padding: 0;
            margin: 0;
          }
          #order-details-print {
            margin: 0;
            padding: 20px;
          }
          .bg-gray-50, .bg-gray-100 {
            background: #f9fafb !important;
          }
          .border {
            border-color: #e5e7eb !important;
          }
          .shadow-sm {
            box-shadow: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default UduuaSellerOrders;