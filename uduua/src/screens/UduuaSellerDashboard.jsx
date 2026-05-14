// screens/UduuaSellerDashboard.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaStore,
  FaBox,
  FaShoppingCart,
  FaWallet,
  FaChartLine,
  FaEye,
  FaStar,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaPlus,
  FaArrowRight,
  FaUsers,
  FaTag,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaDownload,
  FaFileInvoice,
} from 'react-icons/fa';
import { useGetSellerDashboardQuery } from '../slices/sellerApiSlice';
import { useGetSellerBalanceQuery } from '../slices/orderApiSlice';
import ShopNavbar from '../components/ShopNavbar';
import UduuaFooter from '../components/UduuaFooter';

const UduuaSellerDashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: dashboardData, isLoading, error } = useGetSellerDashboardQuery(undefined, {
    skip: !userInfo,
  });
  
  const { data: balanceData, refetch: refetchBalance } = useGetSellerBalanceQuery(undefined, {
    skip: !userInfo,
  });

  const [timeRange, setTimeRange] = useState('week');

  const stats = dashboardData?.stats || {
    totalProducts: 0,
    activeProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  };

  const recentOrders = dashboardData?.recentOrders || [];
  const sellerMetrics = dashboardData?.sellerMetrics || {};

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

  const getOrderStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
      case 'processing':
        return { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: FaSpinner };
      case 'dispatched':
        return { label: 'Dispatched', color: 'bg-purple-100 text-purple-800', icon: FaTruck };
      case 'in_transit':
        return { label: 'In Transit', color: 'bg-indigo-100 text-indigo-800', icon: FaTruck };
      case 'delivered':
        return { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: FaClock };
    }
  };

  if (isLoading) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
        <UduuaFooter />
      </>
    );
  }

  if (error || !userInfo) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <FaStore className="text-5xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-6">
              You need to be an approved seller to view this page.
            </p>
            <Link
              to="/uduua/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-md font-medium transition-colors"
            >
              Back to Shop
            </Link>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Seller Dashboard
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Welcome back, {userInfo?.name?.split(' ')[0]}! Here's what's happening with your store.
                </p>
              </div>
              <Link
                to="/uduua/seller/add-product"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0043FC] hover:bg-[#0038D4] text-white rounded-lg font-medium transition-all duration-300"
              >
                <FaPlus className="text-sm" />
                Add New Product
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaStore className="text-blue-600 text-lg" />
                </div>
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-sm text-gray-500 mt-1">Products</p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-green-600">{stats.activeProducts} active</span>
                <span className="text-gray-300">•</span>
                <span className="text-yellow-600">{stats.pendingProducts} pending</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaShoppingCart className="text-green-600 text-lg" />
                </div>
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-sm text-gray-500 mt-1">Orders</p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-yellow-600">{stats.pendingOrders} pending</span>
                <span className="text-gray-300">•</span>
                <span className="text-green-600">{stats.deliveredOrders} delivered</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaMoneyBillWave className="text-purple-600 text-lg" />
                </div>
                <span className="text-xs text-gray-400">Revenue</span>
              </div>
              <p className="text-2xl font-bold text-[#0043FC]">{formatPrice(stats.totalRevenue)}</p>
              <p className="text-sm text-gray-500 mt-1">Total Earnings</p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-green-600">{formatPrice(balanceData?.availableBalance || 0)} available</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FaChartLine className="text-orange-600 text-lg" />
                </div>
                <span className="text-xs text-gray-400">Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-gray-900">{sellerMetrics.rating?.toFixed(1) || '0.0'}</p>
                <div className="flex items-center gap-0.5 ml-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={`text-sm ${i < Math.floor(sellerMetrics.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{sellerMetrics.totalReviews || 0} reviews</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <Link
              to="/uduua/seller/products"
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 mx-auto mb-2 bg-[#0043FC]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0043FC]/20 transition-colors">
                <FaBox className="text-[#0043FC] text-lg" />
              </div>
              <p className="text-sm font-medium text-gray-900">Manage Products</p>
              <p className="text-xs text-gray-500 mt-0.5">View and edit products</p>
            </Link>
            <Link
              to="/uduua/seller/orders"
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 mx-auto mb-2 bg-[#0043FC]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0043FC]/20 transition-colors">
                <FaShoppingCart className="text-[#0043FC] text-lg" />
              </div>
              <p className="text-sm font-medium text-gray-900">View Orders</p>
              <p className="text-xs text-gray-500 mt-0.5">Track customer orders</p>
            </Link>
            <Link
              to="/uduua/seller/wallet"
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 mx-auto mb-2 bg-[#0043FC]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0043FC]/20 transition-colors">
                <FaWallet className="text-[#0043FC] text-lg" />
              </div>
              <p className="text-sm font-medium text-gray-900">Wallet</p>
              <p className="text-xs text-gray-500 mt-0.5">View balance & withdraw</p>
            </Link>
            <Link
              to="/uduua/seller/payment-history"
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 mx-auto mb-2 bg-[#0043FC]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0043FC]/20 transition-colors">
                <FaFileInvoice className="text-[#0043FC] text-lg" />
              </div>
              <p className="text-sm font-medium text-gray-900">Payout History</p>
              <p className="text-xs text-gray-500 mt-0.5">Track your earnings</p>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FaShoppingCart className="text-[#0043FC] text-sm" />
                  Recent Orders
                </h2>
                <Link
                  to="/uduua/seller/orders"
                  className="text-xs text-[#0043FC] hover:text-[#0033cc] flex items-center gap-1"
                >
                  View all <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
              
              <div className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <FaShoppingCart className="text-3xl text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No orders yet</p>
                  </div>
                ) : (
                  recentOrders.map((order) => {
                    const status = getOrderStatusBadge(order.deliveryStatus);
                    const StatusIcon = status.icon;
                    return (
                      <div key={order._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">#{order._id?.slice(-8)}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <FaCalendarAlt className="text-[10px]" />
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-[#0043FC]">{formatPrice(order.totalPrice)}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color} mt-1`}>
                              <StatusIcon className="text-[10px]" />
                              {status.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Customer: {order.user?.name || 'Guest'}</span>
                          <span className="text-gray-500">{order.orderItems?.length} item(s)</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FaChartLine className="text-[#0043FC] text-sm" />
                  Quick Stats
                </h2>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Total Views</p>
                    <p className="text-xl font-bold text-gray-900">{sellerMetrics.totalViews || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Conversion Rate</p>
                    <p className="text-xl font-bold text-gray-900">
                      {stats.totalOrders > 0 && sellerMetrics.totalViews > 0 
                        ? `${((stats.totalOrders / sellerMetrics.totalViews) * 100).toFixed(1)}%` 
                        : '0%'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Order Status Distribution</p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Pending</span>
                        <span>{stats.pendingOrders}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Processing/In Transit</span>
                        <span>{stats.processingOrders + stats.inTransitOrders}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.totalOrders > 0 ? ((stats.processingOrders + stats.inTransitOrders) / stats.totalOrders) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Delivered</span>
                        <span>{stats.deliveredOrders}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.totalOrders > 0 ? (stats.deliveredOrders / stats.totalOrders) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <Link
                    to="/uduua/seller/analytics"
                    className="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <FaChartLine className="text-sm" />
                    View Detailed Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Tips */}
          <div className="mt-6 bg-gradient-to-r from-[#0043FC]/5 to-transparent rounded-xl border border-[#0043FC]/10 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0043FC]/20 flex items-center justify-center flex-shrink-0">
                <FaStore className="text-[#0043FC] text-lg" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Seller Tips</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <FaTag className="text-[#0043FC] text-xs" />
                    <span>Add high-quality images to increase sales by up to 40%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaUsers className="text-[#0043FC] text-xs" />
                    <span>Respond to customer questions promptly to build trust</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaTruck className="text-[#0043FC] text-xs" />
                    <span>Update delivery status regularly to keep customers informed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UduuaFooter />
    </>
  );
};

export default UduuaSellerDashboard;