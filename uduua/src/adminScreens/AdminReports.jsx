// src/adminScreens/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import {
  FaFlag,
  FaSearch,
  FaSpinner,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaUser,
  FaStore,
  FaBox,
  FaComment,
  FaImage,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetAllReportsQuery,
  useGetReportStatsQuery,
  useUpdateReportStatusMutation,
  useDeleteReportMutation,
} from '../slices/reportApiSlice.js';

const AdminReports = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  // Fetch reports with filters
  const { 
    data: reportsData, 
    isLoading: isLoadingReports, 
    refetch 
  } = useGetAllReportsQuery({ 
    status: activeTab === 'resolved' ? 'resolved_refunded,resolved_replaced' : activeTab,
    page, 
    limit: 20 
  });

  // Fetch stats for dashboard
  const { data: statsData, isLoading: isLoadingStats } = useGetReportStatsQuery();

  const [updateReportStatus, { isLoading: isUpdating }] = useUpdateReportStatusMutation();
  const [deleteReport, { isLoading: isDeleting }] = useDeleteReportMutation();

  const reports = reportsData?.reports || [];
  const stats = statsData || { pending: 0, investigating: 0, resolved: 0, dismissed: 0, total: 0 };

  // Filter reports by search term
  const filteredReports = reports.filter(report => 
    report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reporter?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'pending', label: 'Pending', icon: FaClock, color: 'yellow', count: stats?.pending || 0 },
    { id: 'investigating', label: 'Investigating', icon: FaExclamationTriangle, color: 'orange', count: stats?.investigating || 0 },
    { id: 'resolved', label: 'Resolved', icon: FaCheckCircle, color: 'green', count: stats?.resolved || 0 },
    { id: 'dismissed', label: 'Dismissed', icon: FaTimesCircle, color: 'red', count: stats?.dismissed || 0 },
  ];

  const reportTypeConfig = {
    fraud: { label: 'Fraud / Counterfeit', color: 'red', icon: FaExclamationTriangle },
    damaged: { label: 'Damaged Product', color: 'orange', icon: FaBox },
    wrong_item: { label: 'Wrong Item', color: 'yellow', icon: FaBox },
    not_received: { label: 'Not Received', color: 'purple', icon: FaBox },
    defective: { label: 'Defective', color: 'blue', icon: FaBox },
    other: { label: 'Other', color: 'gray', icon: FaFlag },
  };

  const handleUpdateStatus = async (status) => {
    if (status === 'resolved_refunded' && !refundAmount) {
      toast.error('Please enter refund amount');
      return;
    }
    
    try {
      await updateReportStatus({
        reportId: selectedReport._id,
        status,
        adminNotes,
        refundAmount: status === 'resolved_refunded' ? parseFloat(refundAmount) : undefined,
      }).unwrap();
      
      toast.success(status === 'resolved_refunded' 
        ? 'Report resolved with refund' 
        : status === 'resolved_replaced' 
        ? 'Report resolved with replacement'
        : status === 'investigating'
        ? 'Investigation started'
        : 'Report dismissed'
      );
      
      setShowActionModal(false);
      setAdminNotes('');
      setRefundAmount('');
      setSelectedReport(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update report status');
    }
  };

  const handleDeleteReport = async (report) => {
    if (window.confirm(`Are you sure you want to delete this report? This action cannot be undone.`)) {
      try {
        await deleteReport(report._id).unwrap();
        toast.success('Report deleted successfully');
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to delete report');
      }
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700' },
      investigating: { label: 'Investigating', color: 'bg-orange-100 text-orange-700' },
      resolved_refunded: { label: 'Resolved (Refunded)', color: 'bg-green-100 text-green-700' },
      resolved_replaced: { label: 'Resolved (Replaced)', color: 'bg-green-100 text-green-700' },
      dismissed: { label: 'Dismissed', color: 'bg-red-100 text-red-700' },
    };
    return config[status] || config.pending;
  };

  const isLoading = isLoadingReports || isLoadingStats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#0043FC] mx-auto mb-4" />
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Reports</h1>
        <p className="text-sm text-gray-500">Review and manage buyer reports about products</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Total Reports</p>
              <p className="text-2xl font-bold text-red-700">{stats?.total || 0}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaFlag className="text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">{stats?.pending || 0}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <FaClock className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">Investigating</p>
              <p className="text-2xl font-bold text-orange-700">{stats?.investigating || 0}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Resolved</p>
              <p className="text-2xl font-bold text-green-700">{stats?.resolved || 0}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
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

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, description, product, or reporter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => {
          const typeConfig = reportTypeConfig[report.reportType] || reportTypeConfig.other;
          const statusBadge = getStatusBadge(report.status);
          
          return (
            <div key={report._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Report Type Badge */}
                  <div className="lg:w-32">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${typeConfig.color}-100 text-${typeConfig.color}-700`}>
                      <typeConfig.icon className="text-sm" />
                      <span className="text-xs font-medium">{typeConfig.label}</span>
                    </div>
                  </div>

                  {/* Report Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                    </div>

                    {/* Product & Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaBox className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-400">Product</p>
                          <p className="text-sm font-medium text-gray-800">{report.product?.name}</p>
                          <p className="text-xs text-gray-500">₦{report.product?.retailPrice?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <FaUser className="text-xs" /> Reporter
                        </p>
                        <p className="text-sm text-gray-800">{report.reporter?.name}</p>
                        <p className="text-xs text-gray-500">{report.reporter?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <FaStore className="text-xs" /> Seller
                        </p>
                        <p className="text-sm text-gray-800">{report.seller?.businessName || report.seller?.name}</p>
                        <p className="text-xs text-gray-500">{report.seller?.email}</p>
                      </div>
                    </div>

                    {/* Evidence Images */}
                    {report.images && report.images.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                          <FaImage /> Evidence ({report.images.length})
                        </p>
                        <div className="flex gap-2">
                          {report.images.slice(0, 3).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Evidence ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                              onClick={() => window.open(img, '_blank')}
                            />
                          ))}
                          {report.images.length > 3 && (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                              +{report.images.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <FaCalendarAlt />
                      {new Date(report.createdAt).toLocaleDateString()}
                      <FaClock className="ml-2" />
                      {new Date(report.createdAt).toLocaleTimeString()}
                    </div>

                    {/* Action Buttons */}
                    {report.status === 'pending' && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#0043FC] border border-gray-200 rounded-lg hover:border-[#0043FC] transition-colors flex items-center gap-1"
                        >
                          <FaEye className="text-xs" /> View Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setActionType('investigate');
                            setShowActionModal(true);
                          }}
                          className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1"
                        >
                          <FaExclamationTriangle className="text-xs" /> Start Investigation
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report)}
                          disabled={isDeleting}
                          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                        >
                          <FaTimesCircle className="text-xs" /> Delete
                        </button>
                      </div>
                    )}

                    {(report.status === 'investigating') && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#0043FC] border border-gray-200 rounded-lg hover:border-[#0043FC] transition-colors flex items-center gap-1"
                        >
                          <FaEye className="text-xs" /> View Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setActionType('resolve_refund');
                            setShowActionModal(true);
                          }}
                          className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                        >
                          <FaMoneyBillWave className="text-xs" /> Resolve (Refund)
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setActionType('dismiss');
                            setShowActionModal(true);
                          }}
                          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                        >
                          <FaTimesCircle className="text-xs" /> Dismiss
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report)}
                          disabled={isDeleting}
                          className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-1"
                        >
                          <FaTrash className="text-xs" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            {searchTerm ? (
              <>
                <FaSearch className="text-gray-300 text-5xl mx-auto mb-3" />
                <p className="text-gray-500">No reports matching "{searchTerm}"</p>
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
                <p className="text-gray-500">No pending reports</p>
                <p className="text-sm text-gray-400">All reports have been reviewed</p>
              </>
            ) : (
              <>
                <FaFlag className="text-gray-300 text-5xl mx-auto mb-3" />
                <p className="text-gray-500">No reports found</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {reportsData?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {page} of {reportsData?.pages || 1}
          </span>
          <button
            onClick={() => setPage(p => Math.min(reportsData?.pages || 1, p + 1))}
            disabled={page === reportsData?.pages}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Report Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaFlag className="text-red-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                  <p className="text-sm text-gray-500">#{selectedReport._id.slice(-8)}</p>
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
              {/* Report Info */}
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Report Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500">Type:</span> {reportTypeConfig[selectedReport.reportType]?.label || selectedReport.reportType}</p>
                  <p><span className="text-gray-500">Status:</span> {getStatusBadge(selectedReport.status).label}</p>
                  <p><span className="text-gray-500">Title:</span> {selectedReport.title}</p>
                  <p className="col-span-2"><span className="text-gray-500">Description:</span> {selectedReport.description}</p>
                  <p><span className="text-gray-500">Reported:</span> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Product Info */}
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Product Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500">Name:</span> {selectedReport.product?.name}</p>
                  <p><span className="text-gray-500">Price:</span> ₦{selectedReport.product?.retailPrice?.toLocaleString()}</p>
                  <p><span className="text-gray-500">Order ID:</span> #{selectedReport.order?._id.slice(-8)}</p>
                  <p><span className="text-gray-500">Order Status:</span> {selectedReport.order?.deliveryStatus}</p>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Reporter Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500">Name:</span> {selectedReport.reporter?.name}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedReport.reporter?.email}</p>
                  <p><span className="text-gray-500">Phone:</span> {selectedReport.reporter?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Seller Info */}
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Seller Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500">Business Name:</span> {selectedReport.seller?.businessName || selectedReport.seller?.name}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedReport.seller?.email}</p>
                </div>
              </div>

              {/* Evidence Images */}
              {selectedReport.images && selectedReport.images.length > 0 && (
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Evidence</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Evidence ${idx + 1}`}
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedReport.adminNotes && (
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Admin Notes</h3>
                  <p className="text-sm text-gray-600">{selectedReport.adminNotes}</p>
                </div>
              )}

              {/* Resolution Info */}
              {selectedReport.resolvedAt && (
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Resolution Info</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500">Resolved At:</span> {new Date(selectedReport.resolvedAt).toLocaleString()}</p>
                    {selectedReport.refundAmount && (
                      <p><span className="text-gray-500">Refund Amount:</span> ₦{selectedReport.refundAmount?.toLocaleString()}</p>
                    )}
                    <p><span className="text-gray-500">Resolved By:</span> {selectedReport.resolvedBy?.name || 'Admin'}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedReport.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setActionType('investigate');
                      setShowActionModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaExclamationTriangle /> Start Investigation
                  </button>
                </div>
              )}

              {selectedReport.status === 'investigating' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setActionType('resolve_refund');
                      setShowActionModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaMoneyBillWave /> Resolve (Refund)
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setActionType('dismiss');
                      setShowActionModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaTimesCircle /> Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Investigate/Resolve/Dismiss) */}
      {showActionModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                actionType === 'investigate' ? 'bg-orange-100' : 
                actionType === 'resolve_refund' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {actionType === 'investigate' && <FaExclamationTriangle className="text-orange-500 text-xl" />}
                {actionType === 'resolve_refund' && <FaMoneyBillWave className="text-green-500 text-xl" />}
                {actionType === 'dismiss' && <FaTimesCircle className="text-red-500 text-xl" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {actionType === 'investigate' && 'Start Investigation'}
                  {actionType === 'resolve_refund' && 'Resolve with Refund'}
                  {actionType === 'dismiss' && 'Dismiss Report'}
                </h2>
                <p className="text-sm text-gray-500">Report #{selectedReport._id.slice(-8)}</p>
              </div>
            </div>
            
            {actionType === 'resolve_refund' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Amount (₦)
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  placeholder="Enter refund amount"
                />
                <p className="text-xs text-gray-400 mt-1">Maximum: ₦{selectedReport.order?.totalPrice?.toLocaleString()}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                placeholder="Add internal notes about this decision..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setAdminNotes('');
                  setRefundAmount('');
                  setSelectedReport(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(
                  actionType === 'investigate' ? 'investigating' :
                  actionType === 'resolve_refund' ? 'resolved_refunded' : 'dismissed'
                )}
                disabled={isUpdating}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                  actionType === 'investigate' ? 'bg-orange-500 hover:bg-orange-600' :
                  actionType === 'resolve_refund' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isUpdating ? <FaSpinner className="animate-spin" /> : 
                  actionType === 'investigate' ? <FaExclamationTriangle /> :
                  actionType === 'resolve_refund' ? <FaMoneyBillWave /> : <FaTimesCircle />
                }
                {actionType === 'investigate' && 'Start Investigation'}
                {actionType === 'resolve_refund' && 'Process Refund'}
                {actionType === 'dismiss' && 'Dismiss Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;