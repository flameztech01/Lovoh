// screens/UduuaShop.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaPlus, 
  FaStore, 
  FaSpinner, 
  FaCheckCircle, 
  FaTimesCircle,
  FaClock,
  FaArrowRight
} from 'react-icons/fa';
import ShopNavbar from '../components/ShopNavbar.jsx';
import UduuaProducts from '../components/UduuaProducts.jsx';
import UduuaFooter from '../components/UduuaFooter.jsx';
import { useGetSellerApplicationStatusQuery } from '../slices/sellerApiSlice';

const UduuaShop = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // Fetch seller application status - skip if no user
  const { data: applicationStatus, isLoading: isLoadingStatus, refetch } = useGetSellerApplicationStatusQuery(undefined, {
    skip: !userInfo,
  });

  // Check user's seller status
  const sellerStatus = applicationStatus?.sellerStatus || 'not_applied';
  
  // Determine states based on sellerStatus
  const hasNotApplied = sellerStatus === 'not_applied';
  const isPendingSeller = sellerStatus === 'pending';
  const isApprovedSeller = sellerStatus === 'approved';
  const isRejectedSeller = sellerStatus === 'rejected';
  
  // User has applied if status is pending, approved, or rejected
  const hasApplied = isPendingSeller || isApprovedSeller || isRejectedSeller;
  
  // Auto-refetch every 30 seconds if pending
  useEffect(() => {
    if (isPendingSeller) {
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isPendingSeller, refetch]);

  const handleAddProduct = () => {
    navigate('/seller/add-product');
  };

  const handleCheckStatus = () => {
    setShowStatusModal(true);
  };

  const getStatusIcon = () => {
    if (isApprovedSeller) return <FaCheckCircle className="text-green-500 text-xl" />;
    if (isPendingSeller) return <FaClock className="text-yellow-500 text-xl animate-pulse" />;
    if (isRejectedSeller) return <FaTimesCircle className="text-red-500 text-xl" />;
    return null;
  };

  const getStatusText = () => {
    if (isApprovedSeller) return "Approved Seller";
    if (isPendingSeller) return "Application Pending";
    if (isRejectedSeller) return "Application Rejected";
    return "";
  };

  const getStatusColor = () => {
    if (isApprovedSeller) return "bg-green-50 border-green-200 text-green-700";
    if (isPendingSeller) return "bg-yellow-50 border-yellow-200 text-yellow-700";
    if (isRejectedSeller) return "bg-red-50 border-red-200 text-red-700";
    return "";
  };

  // Don't show anything while loading or if no user
  if (!userInfo) {
    return (
      <div>
        <ShopNavbar />
        <UduuaProducts />
        <UduuaFooter />
      </div>
    );
  }

  return (
    <div>
      <ShopNavbar />
      <UduuaProducts />
      <UduuaFooter />

      {/* Floating Button for Sellers - ONLY show if user has actually applied */}
      {userInfo && hasApplied && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">
          {/* Status Indicator Badge (for pending/rejected - not approved) */}
          {!isApprovedSeller && (
            <button
              onClick={handleCheckStatus}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group"
            >
              {getStatusIcon()}
              <span className="text-xs font-medium text-gray-700">{getStatusText()}</span>
              <FaArrowRight className="text-xs text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Add Product Button (only for approved sellers) */}
          {isApprovedSeller && (
            <button
              onClick={handleAddProduct}
              className="group relative flex items-center justify-center w-14 h-14 bg-[#0043FC] text-white rounded-full shadow-lg hover:bg-[#0038D4] hover:scale-110 transition-all duration-300"
            >
              <FaPlus className="text-xl" />
              <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Add New Product
              </span>
            </button>
          )}
        </div>
      )}

      {/* Status Modal - only show if user has applied */}
      {showStatusModal && hasApplied && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowStatusModal(false)}
        >
          <div 
            className={`max-w-md w-full rounded-2xl shadow-xl ${getStatusColor()} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  {getStatusIcon()}
                </div>
                <div>
                  <h3 className="text-lg font-bold">Seller Status</h3>
                  <p className="text-sm opacity-80">{getStatusText()}</p>
                </div>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Content based on status */}
            <div className="space-y-4">
              {isApprovedSeller && (
                <>
                  <div className="bg-white/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">✨ You're all set!</p>
                    <p className="text-sm opacity-80">
                      You can now start selling your products on Uduua Marketplace. 
                      Click the + button to add your first product.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      handleAddProduct();
                    }}
                    className="w-full py-2.5 bg-white text-[#0043FC] rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaPlus className="text-sm" /> Add Your First Product
                  </button>
                </>
              )}

              {isPendingSeller && (
                <>
                  <div className="bg-white/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">⏳ Application Under Review</p>
                    <p className="text-sm opacity-80">
                      Your seller application is currently being reviewed by our team. 
                      This usually takes 1-2 business days. You'll be notified once approved.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <span className="flex items-center gap-1">
                      <FaSpinner className="animate-spin" /> Pending Review
                    </span>
                  </div>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="w-full py-2.5 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </>
              )}

              {isRejectedSeller && (
                <>
                  <div className="bg-white/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">❌ Application Rejected</p>
                    <p className="text-sm opacity-80">
                      Unfortunately, your seller application was not approved at this time.
                    </p>
                    {applicationStatus?.sellerApplication?.rejectionReason && (
                      <div className="mt-2 p-2 bg-white/30 rounded-lg">
                        <p className="text-xs font-medium">Reason given:</p>
                        <p className="text-xs opacity-80 mt-1">{applicationStatus.sellerApplication.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      navigate('/apply-seller');
                    }}
                    className="w-full py-2.5 bg-white text-[#0043FC] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Reapply as Seller
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/20 text-center">
              <p className="text-xs opacity-60">
                Need help? Contact our support team
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UduuaShop;