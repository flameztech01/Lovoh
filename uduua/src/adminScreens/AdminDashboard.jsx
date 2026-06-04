// src/adminScreens/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBoxes,
  FaShoppingCart,
  FaUsers,
  FaStore,
  FaFlag,
  FaMoneyBillWave,
  FaSpinner,
  FaTag,
  FaClock,
} from 'react-icons/fa';
import { useGetAllProductsAdminQuery } from '../slices/productApiSlice.js';
import { useGetAllOrdersQuery } from '../slices/orderApiSlice.js';
import { useGetSellerApplicationsQuery } from '../slices/sellerApiSlice.js';
import { useGetAllReportsQuery } from '../slices/reportApiSlice.js';  // ONLY ONE OF THESE

// REMOVE THIS DUPLICATE LINE:
// import { useGetAllReportsQuery } from '../slices/reportApiSlice';

// Rest of your component code...

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSellers: 0,
    pendingSellers: 0,
    totalReports: 0,
    pendingReports: 0,
    totalRevenue: 0,
  });

  // Fetch data
  const { data: productsData, isLoading: productsLoading } = useGetAllProductsAdminQuery({});
  const { data: pendingProductsData } = useGetAllProductsAdminQuery({ isApproved: false });
  const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery({});
  const { data: sellerAppsData, isLoading: sellersLoading } = useGetSellerApplicationsQuery({ status: 'pending' });
  const { data: reportsData, isLoading: reportsLoading } = useGetAllReportsQuery({});

  useEffect(() => {
    if (productsData?.products) {
      const approved = productsData.products.filter(p => p.isApproved).length;
      setStats(prev => ({
        ...prev,
        totalProducts: productsData.total || 0,
        approvedProducts: approved,
      }));
    }
  }, [productsData]);

  useEffect(() => {
    if (pendingProductsData?.products) {
      setStats(prev => ({
        ...prev,
        pendingProducts: pendingProductsData.total || 0,
      }));
    }
  }, [pendingProductsData]);

  useEffect(() => {
    if (ordersData?.orders) {
      const pending = ordersData.orders.filter(o => o.deliveryStatus === 'pending' || o.deliveryStatus === 'processing').length;
      const delivered = ordersData.orders.filter(o => o.deliveryStatus === 'delivered').length;
      const revenue = ordersData.orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      
      setStats(prev => ({
        ...prev,
        totalOrders: ordersData.total || 0,
        pendingOrders: pending,
        deliveredOrders: delivered,
        totalRevenue: revenue,
      }));
    }
  }, [ordersData]);

  useEffect(() => {
    if (sellerAppsData?.applications) {
      setStats(prev => ({
        ...prev,
        pendingSellers: sellerAppsData.total || 0,
      }));
    }
  }, [sellerAppsData]);

  useEffect(() => {
    if (reportsData?.reports) {
      const pending = reportsData.reports.filter(r => r.status === 'pending').length;
      setStats(prev => ({
        ...prev,
        totalReports: reportsData.total || 0,
        pendingReports: pending,
      }));
    }
  }, [reportsData]);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      subValue: `${stats.approvedProducts} approved`,
      icon: FaBoxes,
      color: 'bg-blue-500',
      link: '/admin/products',
    },
    {
      title: 'Pending Products',
      value: stats.pendingProducts,
      subValue: 'Awaiting approval',
      icon: FaTag,
      color: 'bg-yellow-500',
      link: '/admin/products/pending',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      subValue: `${stats.deliveredOrders} delivered`,
      icon: FaShoppingCart,
      color: 'bg-green-500',
      link: '/admin/orders',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      subValue: 'In progress',
      icon: FaSpinner,
      color: 'bg-orange-500',
      link: '/admin/orders?status=pending',
    },
    {
      title: 'Total Revenue',
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      subValue: 'All time',
      icon: FaMoneyBillWave,
      color: 'bg-purple-500',
      link: '/admin/orders',
    },
    {
      title: 'Seller Applications',
      value: stats.pendingSellers,
      subValue: 'Pending review',
      icon: FaStore,
      color: 'bg-indigo-500',
      link: '/admin/seller-applications',
    },
    {
      title: 'Total Reports',
      value: stats.totalReports,
      subValue: `${stats.pendingReports} pending`,
      icon: FaFlag,
      color: 'bg-red-500',
      link: '/admin/reports',
    },
    {
      title: 'Active Sellers',
      value: '-',
      subValue: 'Coming soon',
      icon: FaUsers,
      color: 'bg-teal-500',
      link: '/admin/sellers',
    },
  ];

  const isLoading = productsLoading || ordersLoading || sellersLoading || reportsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#0043FC] mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your marketplace today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.subValue}</p>
              </div>
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="text-white text-lg" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-5">
            {ordersData?.orders?.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">Order #{order._id.slice(-8)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.deliveryStatus === 'delivered' 
                      ? 'bg-green-100 text-green-700'
                      : order.deliveryStatus === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.deliveryStatus || 'pending'}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₦{order.totalPrice?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            {(!ordersData?.orders || ordersData.orders.length === 0) && (
              <p className="text-center text-gray-400 py-4">No orders yet</p>
            )}
          </div>
        </div>

        {/* Recent Seller Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Seller Applications</h2>
          </div>
          <div className="p-5">
            {sellerAppsData?.applications?.slice(0, 5).map((app) => (
              <div key={app._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{app.name}</p>
                  <p className="text-xs text-gray-500">{app.email}</p>
                  <p className="text-xs text-gray-400">{app.sellerApplication?.businessName}</p>
                </div>
                <Link
                  to={`/admin/seller-applications/${app._id}`}
                  className="px-3 py-1.5 text-xs bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors"
                >
                  Review
                </Link>
              </div>
            ))}
            {(!sellerAppsData?.applications || sellerAppsData.applications.length === 0) && (
              <p className="text-center text-gray-400 py-4">No pending applications</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          to="/admin/products/pending"
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center hover:bg-yellow-100 transition-colors"
        >
          <FaTag className="text-yellow-600 text-xl mx-auto mb-2" />
          <p className="text-sm font-medium text-yellow-800">Review Products</p>
          <p className="text-xs text-yellow-600">{stats.pendingProducts} pending</p>
        </Link>
        <Link
          to="/admin/seller-applications"
          className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center hover:bg-indigo-100 transition-colors"
        >
          <FaStore className="text-indigo-600 text-xl mx-auto mb-2" />
          <p className="text-sm font-medium text-indigo-800">Review Sellers</p>
          <p className="text-xs text-indigo-600">{stats.pendingSellers} pending</p>
        </Link>
        <Link
          to="/admin/reports"
          className="bg-red-50 border border-red-200 rounded-xl p-4 text-center hover:bg-red-100 transition-colors"
        >
          <FaFlag className="text-red-600 text-xl mx-auto mb-2" />
          <p className="text-sm font-medium text-red-800">Review Reports</p>
          <p className="text-xs text-red-600">{stats.pendingReports} pending</p>
        </Link>
        <Link
          to="/admin/orders"
          className="bg-green-50 border border-green-200 rounded-xl p-4 text-center hover:bg-green-100 transition-colors"
        >
          <FaShoppingCart className="text-green-600 text-xl mx-auto mb-2" />
          <p className="text-sm font-medium text-green-800">Process Orders</p>
          <p className="text-xs text-green-600">{stats.pendingOrders} pending</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;