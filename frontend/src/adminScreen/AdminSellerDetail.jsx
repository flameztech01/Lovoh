// screens/AdminSellerDetail.jsx - Updated with correct hook
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaStore,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaIdCard,
  FaFileInvoice,
  FaBuilding,
  FaUniversity,
  FaSpinner,
  FaExternalLinkAlt,
  FaWhatsapp,
  FaCalendarAlt,
  FaBan,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from 'react-icons/fa';
import {
  useGetSellerApplicationByIdQuery,
  useApproveSellerMutation,
  useRejectSellerMutation,
} from '../slices/sellerApiSlice';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminSellerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Use the correct hook for getting a specific seller application by ID
  const { data: application, isLoading, error, refetch } = useGetSellerApplicationByIdQuery(id);
  const [approveSeller, { isLoading: isApproving }] = useApproveSellerMutation();
  const [rejectSeller, { isLoading: isRejecting }] = useRejectSellerMutation();

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

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
      case 'approved':
        return { label: 'Approved', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: FaTimesCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: FaClock };
    }
  };

  const handleApprove = async () => {
    try {
      await approveSeller(id).unwrap();
      toast.success('Seller application approved successfully');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to approve seller');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      await rejectSeller({ userId: id, reason: rejectionReason }).unwrap();
      toast.success('Seller application rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to reject seller');
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaSpinner className="text-4xl text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading application details...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  // Handle error or not found
  if (error || !application) {
    return (
      <AdminSidebar>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <FaStore className="text-5xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Not Found</h2>
            <p className="text-gray-500 mb-4">The seller application you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/admin/sellers')}
              className="px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0033cc] transition-colors"
            >
              Back to Applications
            </button>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  const sellerData = application.sellerApplication || {};
  const status = getStatusBadge(application.sellerStatus);
  const StatusIcon = status.icon;

  return (
    <AdminSidebar>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/sellers')}
            className="flex items-center gap-2 text-gray-500 hover:text-[#0043FC] mb-3 transition-colors group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Sellers</span>
          </button>
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Seller Application Details
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  <StatusIcon className="text-sm" />
                  {status.label}
                </span>
                <span className="text-sm text-gray-500">
                  Submitted: {formatDate(sellerData.submittedAt)}
                </span>
              </div>
            </div>
            
            {application.sellerStatus === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  {isApproving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  Approve Seller
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isRejecting}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <FaTimesCircle /> Reject
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FaUser className="text-[#0043FC] text-sm" />
                Personal Information
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {application.profile ? (
                  <img src={application.profile} alt={application.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#0043FC]/20 flex items-center justify-center">
                    <FaUser className="text-[#0043FC] text-2xl" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{application.name}</p>
                  <p className="text-sm text-gray-500">@{application.username || application.name.split(' ')[0].toLowerCase()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <FaEnvelope className="text-gray-400 text-xs" />
                    {application.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <FaPhone className="text-gray-400 text-xs" />
                    {application.phone || '—'}
                  </p>
                </div>
                {sellerData.whatsappPhone && (
                  <div>
                    <p className="text-xs text-gray-500">WhatsApp Number</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <FaWhatsapp className="text-green-500 text-xs" />
                      {sellerData.whatsappPhone}
                    </p>
                  </div>
                )}
                {sellerData.callingPhone && (
                  <div>
                    <p className="text-xs text-gray-500">Calling Line</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <FaPhone className="text-gray-400 text-xs" />
                      {sellerData.callingPhone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FaBuilding className="text-[#0043FC] text-sm" />
                Business Information
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Business Name</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <FaStore className="text-gray-400 text-xs" />
                    {sellerData.businessName || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Business Email</p>
                  <p className="text-sm font-medium text-gray-900">{sellerData.businessEmail || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Business Phone</p>
                  <p className="text-sm font-medium text-gray-900">{sellerData.businessPhone || '—'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">Business Address</p>
                  <p className="text-sm font-medium text-gray-900 flex items-start gap-1">
                    <FaMapMarkerAlt className="text-gray-400 text-xs mt-0.5" />
                    {sellerData.businessAddress || '—'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">Tax Identification Number (TIN)</p>
                  <p className="text-sm font-medium text-gray-900">{sellerData.taxIdentificationNumber || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FaUniversity className="text-[#0043FC] text-sm" />
                Bank Account Details
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Account Name</p>
                  <p className="text-sm font-medium text-gray-900">{sellerData.bankAccountName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Account Number</p>
                  <p className="text-sm font-medium text-gray-900">{sellerData.bankAccountNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bank Name</p>
                  <p className="text-sm font-medium text-gray-900">{sellerData.bankName || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Documents */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FaFileInvoice className="text-[#0043FC] text-sm" />
                Uploaded Documents
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sellerData.brandLogo && (
                  <div className="border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-medium text-gray-600 mb-2">Brand Logo</p>
                    <img 
                      src={sellerData.brandLogo} 
                      alt="Brand Logo" 
                      className="w-24 h-24 object-contain mx-auto rounded-lg"
                      onError={(e) => e.target.src = '/placeholder-image.jpg'}
                    />
                    <a
                      href={sellerData.brandLogo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0043FC] hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      <FaExternalLinkAlt className="text-[10px]" /> View Full
                    </a>
                  </div>
                )}
                {sellerData.profileImage && (
                  <div className="border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-medium text-gray-600 mb-2">Profile Image</p>
                    <img 
                      src={sellerData.profileImage} 
                      alt="Profile" 
                      className="w-24 h-24 object-cover rounded-full mx-auto"
                      onError={(e) => e.target.src = '/placeholder-image.jpg'}
                    />
                    <a
                      href={sellerData.profileImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0043FC] hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      <FaExternalLinkAlt className="text-[10px]" /> View Full
                    </a>
                  </div>
                )}
                {sellerData.cacCertificate && (
                  <div className="border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-medium text-gray-600 mb-2">CAC Certificate</p>
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                      <FaFileInvoice className="text-3xl text-gray-400" />
                    </div>
                    <a
                      href={sellerData.cacCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0043FC] hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      <FaExternalLinkAlt className="text-[10px]" /> View Document
                    </a>
                  </div>
                )}
                {sellerData.governmentId && (
                  <div className="border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-medium text-gray-600 mb-2">Government ID</p>
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                      <FaIdCard className="text-3xl text-gray-400" />
                    </div>
                    <a
                      href={sellerData.governmentId}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0043FC] hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      <FaExternalLinkAlt className="text-[10px]" /> View Document
                    </a>
                  </div>
                )}
                {sellerData.proofOfAddress && (
                  <div className="border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-medium text-gray-600 mb-2">Proof of Address</p>
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                      <FaMapMarkerAlt className="text-3xl text-gray-400" />
                    </div>
                    <a
                      href={sellerData.proofOfAddress}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0043FC] hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      <FaExternalLinkAlt className="text-[10px]" /> View Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Reason (if rejected) */}
        {application.sellerStatus === 'rejected' && sellerData.rejectionReason && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FaBan className="text-red-500 text-lg mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Rejection Reason</h4>
                <p className="text-sm text-red-700">{sellerData.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Metadata</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Submitted At</p>
              <p className="text-gray-900">{formatDate(sellerData.submittedAt)}</p>
            </div>
            {sellerData.reviewedAt && (
              <div>
                <p className="text-gray-500 text-xs">Reviewed At</p>
                <p className="text-gray-900">{formatDate(sellerData.reviewedAt)}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500 text-xs">User ID</p>
              <p className="text-gray-900 font-mono text-xs">{application._id}</p>
            </div>
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTimesCircle className="text-2xl text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Application</h3>
                <p className="text-gray-500 mb-4 text-sm">
                  Reject seller application for "{application.name}"
                </p>
                <div className="mb-4">
                  <textarea
                    placeholder="Reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isRejecting || !rejectionReason.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isRejecting ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

export default AdminSellerDetail;