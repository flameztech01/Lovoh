// screens/AdminDashboard.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBox, 
  FaShoppingCart, 
  FaEnvelope, 
  FaBook, 
  FaCalendarAlt,
  FaChartLine,
  FaDollarSign,
  FaArrowRight,
  FaSpinner,
  FaChevronRight,
  FaPlus,
  FaPercent,
  FaArrowUp,
  FaUsers,
  FaEye,
  FaFilePdf,
  FaNewspaper
} from 'react-icons/fa';
import { useGetAllMessagesQuery } from '../slices/adminApiSlice';
import { useGetAllOrdersQuery } from '../slices/orderApiSlice';
import { useGetProductsQuery } from '../slices/productApiSlice';
import { useGetEventsQuery } from '../slices/eventApiSlice';
import { useGetMagazinesQuery, useGetMagazineStatsQuery } from '../slices/magApiSlice';
import { useSelector } from 'react-redux';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  // Fetch all data
  const { data: messages, isLoading: messagesLoading } = useGetAllMessagesQuery();
  const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery({});
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({ available: false });
  const { data: eventsData, isLoading: eventsLoading } = useGetEventsQuery({});
  const { data: magazinesData, isLoading: magazinesLoading } = useGetMagazinesQuery({});
  const { data: magazineStats, isLoading: statsLoading } = useGetMagazineStatsQuery();

  const messagesList = messages || [];
  const orders = ordersData?.orders || [];
  const products = productsData?.products || productsData || [];
  const events = eventsData?.events || eventsData || [];
  const magazines = magazinesData?.magazines || [];

  // Calculate date ranges for filtering
  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    switch(selectedPeriod) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 7);
    }
    
    return { start, end: now };
  };

  // Filter orders by date range
  const getFilteredOrders = () => {
    const { start, end } = getDateRange();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Calculate stats
  const totalRevenue = orders
    .filter(order => order.isPaid)
    .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  
  const pendingRevenue = orders
    .filter(order => !order.isPaid && order.status !== 'cancelled')
    .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'order_placed').length;
  const inTransitOrders = orders.filter(order => order.status === 'in_transit').length;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
  
  const lowStockProducts = products.filter(p => p.quantityAvailable > 0 && p.quantityAvailable < 10).length;
  const outOfStockProducts = products.filter(p => p.isSoldOut || p.quantityAvailable === 0).length;

  const unreadMessages = messagesList.filter(msg => !msg.read).length;
  const upcomingEvents = events.filter(e => new Date(e.eventDate) > new Date()).length;
  
  // Magazine stats
  const publishedMagazines = magazines.filter(m => m.status === 'published').length;
  const draftMagazines = magazines.filter(m => m.status === 'draft').length;
  const totalMagazineViews = magazineStats?.totalViews || 0;
  const totalSubscribers = magazineStats?.totalSubscribers || 0;

  // Calculate percentage change (mock for now - would need previous period data)
  const revenueChange = 12;

  // Prepare chart data from real orders
  const getChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const revenueByDay = new Array(7).fill(0);
    const ordersByDay = new Array(7).fill(0);
    
    filteredOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dayIndex = orderDate.getDay();
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      
      if (order.isPaid) {
        revenueByDay[adjustedIndex] += order.totalPrice || 0;
      }
      ordersByDay[adjustedIndex] += 1;
    });
    
    return {
      revenueData: revenueByDay,
      orderData: ordersByDay,
      weekDays: days
    };
  };

  const { revenueData, orderData, weekDays } = getChartData();
  const maxRevenue = Math.max(...revenueData, 1);
  const maxOrders = Math.max(...orderData, 1);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatShortPrice = (price) => {
    if (price >= 1000000) return `₦${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `₦${(price / 1000).toFixed(0)}K`;
    return `₦${price}`;
  };

  const getOrderStatusBadge = (status) => {
    switch(status) {
      case 'order_placed':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' };
      case 'in_transit':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Transit' };
      case 'delivered':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Delivered' };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    }
  };

  const isLoading = messagesLoading || ordersLoading || productsLoading || eventsLoading || magazinesLoading || statsLoading;

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FaSpinner className="w-10 h-10 text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back, {adminInfo?.username || 'Admin'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC]"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Main Stats Row - 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <FaDollarSign className="text-emerald-600 text-xl" />
              </div>
              {revenueChange !== 0 && (
                <span className={`text-xs ${revenueChange > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full flex items-center gap-1`}>
                  <FaArrowUp className={`text-xs ${revenueChange < 0 && 'rotate-180'}`} />
                  {Math.abs(revenueChange)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
            <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
            <p className="text-xs text-gray-400 mt-2">Pending: {formatPrice(pendingRevenue)}</p>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FaShoppingCart className="text-blue-600 text-xl" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            <p className="text-sm text-gray-500 mt-1">Total Orders</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {pendingOrders > 0 && <span className="text-xs text-amber-600">Pending: {pendingOrders}</span>}
              {inTransitOrders > 0 && <span className="text-xs text-blue-600">In Transit: {inTransitOrders}</span>}
              {completedOrders > 0 && <span className="text-xs text-emerald-600">Completed: {completedOrders}</span>}
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <FaBox className="text-purple-600 text-xl" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total Products</p>
            <div className="flex gap-3 mt-2">
              {lowStockProducts > 0 && (
                <span className="text-xs text-orange-600">Low Stock: {lowStockProducts}</span>
              )}
              {outOfStockProducts > 0 && (
                <span className="text-xs text-red-600">Out of Stock: {outOfStockProducts}</span>
              )}
            </div>
          </div>

          {/* Magazine Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/admin/magazines')}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center">
                <FaFilePdf className="text-cyan-600 text-xl" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{magazines.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total Magazines</p>
            <div className="flex gap-3 mt-2">
              <span className="text-xs text-emerald-600">Published: {publishedMagazines}</span>
              <span className="text-xs text-gray-500">Drafts: {draftMagazines}</span>
            </div>
          </div>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div 
            onClick={() => navigate('/admin/messages')}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
                <FaEnvelope className="text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{unreadMessages}</p>
                <p className="text-xs text-gray-500">Unread Messages</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/admin/events')}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents}</p>
                <p className="text-xs text-gray-500">Upcoming Events</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/admin/magazines')}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <FaEye className="text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalMagazineViews.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Magazine Views</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                <FaPercent className="text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500">Completion Rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <FaUsers className="text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalSubscribers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Subscribers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedPeriod === 'week' ? 'Last 7 days' : selectedPeriod === 'month' ? 'Last 30 days' : 'Last 12 months'}
                </p>
              </div>
              <FaChartLine className="text-gray-400" />
            </div>
            
            {revenueData.every(v => v === 0) ? (
              <div className="flex items-center justify-center h-48 text-gray-400">
                No revenue data for this period
              </div>
            ) : (
              <div className="flex items-end justify-between h-48 gap-2">
                {revenueData.map((value, idx) => {
                  const height = (value / maxRevenue) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-lg relative" style={{ height: '160px' }}>
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0043FC] to-[#79FFFF] rounded-lg transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{weekDays[idx]}</span>
                      <span className="text-xs font-semibold text-gray-700">{formatShortPrice(value)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Orders Overview</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedPeriod === 'week' ? 'Last 7 days' : selectedPeriod === 'month' ? 'Last 30 days' : 'Last 12 months'}
                </p>
              </div>
              <FaShoppingCart className="text-gray-400" />
            </div>
            
            {orderData.every(v => v === 0) ? (
              <div className="flex items-center justify-center h-48 text-gray-400">
                No order data for this period
              </div>
            ) : (
              <div className="relative h-48">
                <div className="absolute inset-0 flex items-end justify-between gap-2">
                  {orderData.map((value, idx) => {
                    const height = (value / maxOrders) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-blue-50 rounded-lg relative" style={{ height: '160px' }}>
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-lg transition-all duration-500"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{weekDays[idx]}</span>
                        <span className="text-xs font-semibold text-gray-700">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-sm text-[#0043FC] hover:text-[#0033cc] font-medium flex items-center gap-1"
              >
                View All
                <FaChevronRight className="text-xs" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {orders.slice(0, 5).map((order) => {
                const status = getOrderStatusBadge(order.status);
                return (
                  <div
                    key={order._id}
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        #{order._id?.slice(-8)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{order.shippingAddress?.fullName || 'N/A'}</span>
                      <span className="font-semibold text-gray-900">{formatPrice(order.totalPrice)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
              {orders.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">No orders yet</div>
              )}
            </div>
          </div>

          {/* Recent Magazines */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Magazines</h3>
              <button
                onClick={() => navigate('/admin/magazines')}
                className="text-sm text-[#0043FC] hover:text-[#0033cc] font-medium flex items-center gap-1"
              >
                View All
                <FaChevronRight className="text-xs" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {magazines.slice(0, 5).map((magazine) => (
                <div
                  key={magazine._id}
                  onClick={() => navigate(`/admin/magazines/${magazine._id}`)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {magazine.coverImage ? (
                      <img 
                        src={magazine.coverImage} 
                        alt={magazine.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center">
                        <FaFilePdf className="text-cyan-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{magazine.title}</p>
                      <p className="text-xs text-gray-500">By {magazine.author}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{magazine.views || 0} views</p>
                      <p className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                        magazine.status === 'published' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {magazine.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {magazines.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">No magazines yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => navigate('/admin/products/new')}
              className="p-4 bg-gradient-to-r from-[#0043FC]/5 to-[#79FFFF]/5 rounded-xl border border-[#0043FC]/20 hover:shadow-md transition-all text-center"
            >
              <FaPlus className="text-[#0043FC] text-xl mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Add Product</p>
            </button>
            <button
              onClick={() => navigate('/admin/magazines/new')}
              className="p-4 bg-gradient-to-r from-[#0043FC]/5 to-[#79FFFF]/5 rounded-xl border border-[#0043FC]/20 hover:shadow-md transition-all text-center"
            >
              <FaFilePdf className="text-[#0043FC] text-xl mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Upload Magazine</p>
            </button>
            <button
              onClick={() => navigate('/admin/events/new')}
              className="p-4 bg-gradient-to-r from-[#0043FC]/5 to-[#79FFFF]/5 rounded-xl border border-[#0043FC]/20 hover:shadow-md transition-all text-center"
            >
              <FaCalendarAlt className="text-[#0043FC] text-xl mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Create Event</p>
            </button>
            <button
              onClick={() => navigate('/admin/messages')}
              className="p-4 bg-gradient-to-r from-[#0043FC]/5 to-[#79FFFF]/5 rounded-xl border border-[#0043FC]/20 hover:shadow-md transition-all text-center"
            >
              <FaEnvelope className="text-[#0043FC] text-xl mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">View Messages</p>
            </button>
            <button
              onClick={() => navigate('/admin/subscribers')}
              className="p-4 bg-gradient-to-r from-[#0043FC]/5 to-[#79FFFF]/5 rounded-xl border border-[#0043FC]/20 hover:shadow-md transition-all text-center"
            >
              <FaUsers className="text-[#0043FC] text-xl mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Subscribers</p>
            </button>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminDashboard;