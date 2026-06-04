// src/adminScreens/AdminSellers.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaStore,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaIdCard,
  FaFileAlt,
  FaEye,
  FaClock,
  FaUserCheck,
  FaUserTimes,
  FaMoneyBillWave,
  FaUniversity, // Changed from FaBank to FaUniversity
  FaCalendarAlt,
} from 'react-icons/fa';
import { useGetSellerApplicationsQuery, useApproveSellerMutation, useRejectSellerMutation } from '../slices/sellerApiSlice.js';
import { toast } from 'react-toastify';

const AdminSellers = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected

  const { data, isLoading, refetch } = useGetSellerApplicationsQuery({ 
    status: activeTab, 
    page, 
    limit: 20 
  });
  
  const [approveSeller, { isLoading: isApproving }] = useApproveSellerMutation();
  const [rejectSeller, { isLoading: isRejecting }] = useRejectSellerMutation();

  const handleApprove = async (userId) => {
    try {
      await approveSeller(userId).unwrap();
      toast.success('Seller application approved successfully!');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to approve seller');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await rejectSeller({ userId: selectedApplication._id, reason: rejectReason }).unwrap();
      toast.success('Seller application rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedApplication(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to reject seller');
    }
  };

  const applications = data?.applications || [];
  
  const filteredApplications = applications.filter(app => 
    app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.sellerApplication?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.phone?.includes(searchTerm)
  );

  const tabs = [
    { id: 'pending', label: 'Pending', icon: FaClock, color: 'yellow' },
    { id: 'approved', label: 'Approved', icon: FaCheckCircle, color: 'green' },
    { id: 'rejected', label: 'Rejected', icon: FaTimesCircle, color: 'red' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#0043FC] mx-auto mb-4" />
          <p className="text-gray-500">Loading seller applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
        <p className="text-sm text-gray-500">Review seller applications and manage approved sellers</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Pending Applications</p>
              <p className="text-2xl font-bold text-yellow-700">{data?.total || 0}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <FaClock className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Approved Sellers</p>
              <p className="text-2xl font-bold text-green-700">-</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaStore className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Products</p>
              <p className="text-2xl font-bold text-blue-700">-</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaStore className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? `text-${tab.color}-600 border-b-2 border-${tab.color}-500`
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="text-sm" />
            {tab.label}
            {activeTab === tab.id && data?.total > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full bg-${tab.color}-100 text-${tab.color}-700`}>
                {data?.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, business name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
          />
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          {searchTerm ? (
            <>
              <FaSearch className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-gray-500">No applications matching "{searchTerm}"</p>
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
              <p className="text-gray-500">No pending seller applications</p>
              <p className="text-sm text-gray-400">All applications have been reviewed</p>
            </>
          ) : activeTab === 'approved' ? (
            <>
              <FaStore className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-gray-500">No approved sellers yet</p>
            </>
          ) : (
            <>
              <FaTimesCircle className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-gray-500">No rejected applications</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div key={application._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Seller Image/Avatar */}
                  <div className="lg:w-24">
                    <img
                      src={application.profile || application.sellerApplication?.brandLogo || '/avatar-placeholder.png'}
                      alt={application.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto lg:mx-0"
                      onError={(e) => { e.target.src = '/avatar-placeholder.png'; }}
                    />
                  </div>

                  {/* Seller Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{application.name}</h3>
                        <p className="text-sm text-gray-500">{application.email}</p>
                        {application.phone && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <FaPhone className="text-xs" /> {application.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                          application.sellerStatus === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : application.sellerStatus === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {application.sellerStatus === 'approved' ? <FaCheckCircle className="text-xs" /> : 
                           application.sellerStatus === 'rejected' ? <FaTimesCircle className="text-xs" /> : 
                           <FaClock className="text-xs" />}
                          {application.sellerStatus || 'pending'}
                        </span>
                      </div>
                    </div>

                    {/* Business Details */}
                    {application.sellerApplication && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-400">Business Name</p>
                          <p className="text-sm font-medium text-gray-800">{application.sellerApplication.businessName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Business Email</p>
                          <p className="text-sm text-gray-700">{application.sellerApplication.businessEmail}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Business Phone</p>
                          <p className="text-sm text-gray-700">{application.sellerApplication.businessPhone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">TIN</p>
                          <p className="text-sm text-gray-700">{application.sellerApplication.taxIdentificationNumber}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-400">Business Address</p>
                          <p className="text-sm text-gray-700">{application.sellerApplication.businessAddress}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Bank</p>
                          <p className="text-sm text-gray-700">{application.sellerApplication.bankName || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Account Number</p>
                          <p className="text-sm text-gray-700">{application.sellerApplication.bankAccountNumber}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {activeTab === 'pending' && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#0043FC] border border-gray-200 rounded-lg hover:border-[#0043FC] transition-colors flex items-center gap-1"
                        >
                          <FaEye className="text-xs" /> View Details
                        </button>
                        <button
                          onClick={() => handleApprove(application._id)}
                          disabled={isApproving}
                          className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          {isApproving ? <FaSpinner className="animate-spin text-xs" /> : <FaCheckCircle className="text-xs" />}
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowRejectModal(true);
                          }}
                          disabled={isRejecting}
                          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <FaTimesCircle className="text-xs" /> Reject
                        </button>
                      </div>
                    )}

                    {activeTab === 'approved' && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#0043FC] border border-gray-200 rounded-lg hover:border-[#0043FC] transition-colors flex items-center gap-1"
                        >
                          <FaEye className="text-xs" /> View Details
                        </button>
                        <Link
                          to={`/superuser/seller-products/${application._id}`}
                          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                          <FaStore className="text-xs" /> View Products
                        </Link>
                      </div>
                    )}

                    {activeTab === 'rejected' && application.sellerApplication?.rejectionReason && (
                      <div className="mt-3 p-2 bg-red-50 rounded-lg">
                        <p className="text-xs text-red-600 font-medium">Rejection Reason:</p>
                        <p className="text-sm text-red-700">{application.sellerApplication.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {page} of {data?.pages || 1}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data?.pages || 1, p + 1))}
            disabled={page === data?.pages}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#0043FC]/10 rounded-full flex items-center justify-center">
                  <FaStore className="text-[#0043FC] text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Seller Application Details</h2>
                  <p className="text-sm text-gray-500">{selectedApplication.name}</p>
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
              {/* Personal Info */}
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FaUserCheck className="text-[#0043FC]" /> Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500">Name:</span> {selectedApplication.name}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedApplication.email}</p>
                  <p><span className="text-gray-500">Phone:</span> {selectedApplication.phone || 'N/A'}</p>
                  <p><span className="text-gray-500">Username:</span> {selectedApplication.username}</p>
                </div>
              </div>

              {/* Business Info */}
              {selectedApplication.sellerApplication && (
                <>
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FaBuilding className="text-[#0043FC]" /> Business Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="text-gray-500">Business Name:</span> {selectedApplication.sellerApplication.businessName}</p>
                      <p><span className="text-gray-500">Business Email:</span> {selectedApplication.sellerApplication.businessEmail}</p>
                      <p><span className="text-gray-500">Business Phone:</span> {selectedApplication.sellerApplication.businessPhone}</p>
                      <p><span className="text-gray-500">WhatsApp:</span> {selectedApplication.sellerApplication.whatsappPhone || 'N/A'}</p>
                      <p><span className="text-gray-500">Calling Phone:</span> {selectedApplication.sellerApplication.callingPhone || 'N/A'}</p>
                      <p><span className="text-gray-500">TIN:</span> {selectedApplication.sellerApplication.taxIdentificationNumber}</p>
                      <p className="col-span-2"><span className="text-gray-500">Address:</span> {selectedApplication.sellerApplication.businessAddress}</p>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FaUniversity className="text-[#0043FC]" /> Bank Details
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="text-gray-500">Bank Name:</span> {selectedApplication.sellerApplication.bankName || 'N/A'}</p>
                      <p><span className="text-gray-500">Account Name:</span> {selectedApplication.sellerApplication.bankAccountName}</p>
                      <p><span className="text-gray-500">Account Number:</span> {selectedApplication.sellerApplication.bankAccountNumber}</p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="pb-3">
                    <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FaFileAlt className="text-[#0043FC]" /> Documents
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedApplication.sellerApplication.brandLogo && (
                        <div>
                          <p className="text-gray-500">Brand Logo:</p>
                          <img src={selectedApplication.sellerApplication.brandLogo} alt="Brand Logo" className="w-20 h-20 object-cover rounded-lg mt-1" />
                        </div>
                      )}
                      {selectedApplication.sellerApplication.profileImage && (
                        <div>
                          <p className="text-gray-500">Profile Image:</p>
                          <img src={selectedApplication.sellerApplication.profileImage} alt="Profile" className="w-20 h-20 object-cover rounded-full mt-1" />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm mt-2">
                      <p><span className="text-gray-500">CAC Certificate:</span> 
                        <a href={selectedApplication.sellerApplication.cacCertificate} target="_blank" rel="noopener noreferrer" className="text-[#0043FC] ml-2 underline">View Document</a>
                      </p>
                      <p><span className="text-gray-500">Government ID:</span>
                        <a href={selectedApplication.sellerApplication.governmentId} target="_blank" rel="noopener noreferrer" className="text-[#0043FC] ml-2 underline">View Document</a>
                      </p>
                      <p><span className="text-gray-500">Proof of Address:</span>
                        <a href={selectedApplication.sellerApplication.proofOfAddress} target="_blank" rel="noopener noreferrer" className="text-[#0043FC] ml-2 underline">View Document</a>
                      </p>
                    </div>
                  </div>

                  {/* Submission Info */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <FaCalendarAlt className="text-xs" />
                      Submitted: {new Date(selectedApplication.sellerApplication.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </>
              )}

              {/* Action Buttons in Modal */}
              {activeTab === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(selectedApplication._id)}
                    disabled={isApproving}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {isApproving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                    Approve Seller
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowRejectModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaTimesCircle /> Reject Seller
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FaTimesCircle className="text-red-500 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reject Seller Application</h2>
                <p className="text-sm text-gray-500">{selectedApplication.name} - {selectedApplication.sellerApplication?.businessName}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              Please provide a reason for rejecting this seller application. This will be shared with the applicant.
            </p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC] mb-4"
              placeholder="Enter rejection reason (e.g., Incomplete documents, Business not verified, Invalid bank details...)"
              autoFocus
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedApplication(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isRejecting ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellers;