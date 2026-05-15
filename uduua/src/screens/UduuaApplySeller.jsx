// screens/UduuaApplySeller.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaStore,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaBuilding,
  FaIdCard,
  FaFileInvoice,
  FaUniversity,
  FaUpload,
  FaCheckCircle,
  FaSpinner,
  FaShieldAlt,
  FaLightbulb,
  FaRegBuilding,
  FaSearch,
  FaSpinner as FaSpinnerIcon,
} from 'react-icons/fa';
import { useApplyForSellerMutation, useGetSellerApplicationStatusQuery } from '../slices/sellerApiSlice';
import { useGetBankListQuery, useResolveBankAccountMutation } from '../slices/orderApiSlice';
import ShopNavbar from '../components/ShopNavbar';
import UduuaFooter from '../components/UduuaFooter';

const UduuaApplySeller = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [applyForSeller, { isLoading: isSubmitting }] = useApplyForSellerMutation();
  const { data: applicationStatus, isLoading: isLoadingStatus } = useGetSellerApplicationStatusQuery(undefined, {
    skip: !userInfo,
  });
  
  // Get banks from Paystack
  const { data: banksList, isLoading: isLoadingBanks } = useGetBankListQuery();
  const [resolveBankAccount, { isLoading: isResolving }] = useResolveBankAccountMutation();

  const [formData, setFormData] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    whatsappPhone: '',
    callingPhone: '',
    businessAddress: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankCode: '',
    bankName: '',
    taxIdentificationNumber: '',
  });

  const [files, setFiles] = useState({
    brandLogo: null,
    profileImage: null,
    cacCertificate: null,
    governmentId: null,
    proofOfAddress: null,
  });

  const [filePreviews, setFilePreviews] = useState({
    brandLogo: null,
    profileImage: null,
    cacCertificate: null,
    governmentId: null,
    proofOfAddress: null,
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [verifiedAccountName, setVerifiedAccountName] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!userInfo) {
      toast.error('Please login to apply as a seller');
      navigate('/shop/login', { state: { from: '/apply-seller' } });
    }
  }, [userInfo, navigate]);

  // Check if already a seller
  useEffect(() => {
    if (applicationStatus) {
      if (applicationStatus.isSeller) {
        toast.success('You are already a seller!');
        navigate('/seller/dashboard');
      } else if (applicationStatus.sellerStatus === 'pending') {
        toast.info('Your application is already pending review');
      }
    }
  }, [applicationStatus, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBankCodeChange = async (e) => {
    const bankCode = e.target.value;
    const selectedBank = banksList?.find(bank => bank.code === bankCode);
    
    setFormData(prev => ({
      ...prev,
      bankCode: bankCode,
      bankName: selectedBank?.name || '',
    }));
    
    // Clear verification when bank changes
    setVerifiedAccountName('');
    if (errors.bankAccountNumber) {
      setErrors(prev => ({ ...prev, bankAccountNumber: '' }));
    }
  };

  const handleVerifyAccount = async () => {
    if (!formData.bankAccountNumber || formData.bankAccountNumber.length < 10) {
      toast.error('Please enter a valid 10-digit account number');
      return;
    }
    
    if (!formData.bankCode) {
      toast.error('Please select a bank first');
      return;
    }
    
    setIsVerifyingAccount(true);
    try {
      const result = await resolveBankAccount({
        accountNumber: formData.bankAccountNumber,
        bankCode: formData.bankCode,
      }).unwrap();
      
      if (result.success && result.accountName) {
        setVerifiedAccountName(result.accountName);
        setFormData(prev => ({
          ...prev,
          bankAccountName: result.accountName,
        }));
        toast.success(`Account verified: ${result.accountName}`);
        setErrors(prev => ({ ...prev, bankAccountNumber: '' }));
      } else {
        toast.error('Could not verify account. Please check the account number.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error?.data?.message || 'Failed to verify account. Please check the account number and bank.');
    } finally {
      setIsVerifyingAccount(false);
    }
  };

  const handleFileChange = (field, file) => {
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(`${field} must be an image or PDF file`);
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${field} must be less than 5MB`);
      return;
    }
    
    setFiles(prev => ({ ...prev, [field]: file }));
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviews(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.businessEmail.trim()) newErrors.businessEmail = 'Business email is required';
    if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Business phone is required';
    if (!formData.businessAddress.trim()) newErrors.businessAddress = 'Business address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!files.brandLogo) newErrors.brandLogo = 'Brand logo is required';
    if (!files.profileImage) newErrors.profileImage = 'Profile image is required';
    if (!files.cacCertificate) newErrors.cacCertificate = 'CAC certificate is required';
    if (!files.governmentId) newErrors.governmentId = 'Government ID is required';
    if (!files.proofOfAddress) newErrors.proofOfAddress = 'Proof of address is required';
    if (!formData.taxIdentificationNumber.trim()) newErrors.taxIdentificationNumber = 'Tax Identification Number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.bankAccountName.trim()) newErrors.bankAccountName = 'Account name is required';
    if (!formData.bankAccountNumber.trim()) newErrors.bankAccountNumber = 'Account number is required';
    if (!formData.bankCode) newErrors.bankCode = 'Please select a bank';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) return;
    
    const submitData = new FormData();
    
    // Business info
    submitData.append('businessName', formData.businessName);
    submitData.append('businessEmail', formData.businessEmail);
    submitData.append('businessPhone', formData.businessPhone);
    submitData.append('whatsappPhone', formData.whatsappPhone);
    submitData.append('callingPhone', formData.callingPhone);
    submitData.append('businessAddress', formData.businessAddress);
    
    // Bank details (send bankCode instead of bankName)
    submitData.append('bankAccountName', formData.bankAccountName);
    submitData.append('bankAccountNumber', formData.bankAccountNumber);
    submitData.append('bankCode', formData.bankCode);
    submitData.append('taxIdentificationNumber', formData.taxIdentificationNumber);
    
    // Files
    if (files.brandLogo) submitData.append('brandLogo', files.brandLogo);
    if (files.profileImage) submitData.append('profileImage', files.profileImage);
    if (files.cacCertificate) submitData.append('cacCertificate', files.cacCertificate);
    if (files.governmentId) submitData.append('governmentId', files.governmentId);
    if (files.proofOfAddress) submitData.append('proofOfAddress', files.proofOfAddress);
    
    try {
      await applyForSeller(submitData).unwrap();
      toast.success('Application submitted successfully!');
      navigate('/shop');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error?.data?.message || 'Failed to submit application');
    }
  };

  if (isLoadingStatus) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
          <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin" />
        </div>
        <UduuaFooter />
      </>
    );
  }

  if (applicationStatus?.sellerStatus === 'pending') {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSpinner className="w-10 h-10 text-yellow-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Pending</h2>
              <p className="text-gray-600 mb-6">
                Your seller application is currently being reviewed by our team.
                You will be notified once your application is approved.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors"
              >
                <FaArrowLeft className="text-sm" /> Back to Shop
              </Link>
            </div>
          </div>
        </div>
        <UduuaFooter />
      </>
    );
  }

  if (applicationStatus?.sellerStatus === 'rejected') {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaStore className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Rejected</h2>
              <p className="text-gray-600 mb-4">
                Your seller application was rejected.
              </p>
              {applicationStatus.sellerApplication?.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-medium text-red-800 mb-1">Reason:</p>
                  <p className="text-sm text-red-700">{applicationStatus.sellerApplication.rejectionReason}</p>
                </div>
              )}
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors"
              >
                <FaArrowLeft className="text-sm" /> Back to Shop
              </Link>
            </div>
          </div>
        </div>
        <UduuaFooter />
      </>
    );
  }

  return (
    <>
      <ShopNavbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0043FC]/10 rounded-full mb-3">
              <FaStore className="w-8 h-8 text-[#0043FC]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Become a Seller on Uduua
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm">
              Join thousands of successful sellers and grow your business on Nigeria's premier marketplace
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step
                      ? 'bg-[#0043FC] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step ? <FaCheckCircle className="w-5 h-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 ${
                      currentStep > step ? 'bg-[#0043FC]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-16 mt-2">
              <span className="text-xs text-gray-500">Business Info</span>
              <span className="text-xs text-gray-500">Documents</span>
              <span className="text-xs text-gray-500">Bank Details</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaRegBuilding className="text-[#0043FC]" />
                  Business Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <div className="relative">
                      <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                          errors.businessName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your business name"
                      />
                    </div>
                    {errors.businessName && (
                      <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Email *
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="email"
                        name="businessEmail"
                        value={formData.businessEmail}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                          errors.businessEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="business@example.com"
                      />
                    </div>
                    {errors.businessEmail && (
                      <p className="mt-1 text-xs text-red-500">{errors.businessEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Phone *
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="tel"
                        name="businessPhone"
                        value={formData.businessPhone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                          errors.businessPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="08012345678"
                      />
                    </div>
                    {errors.businessPhone && (
                      <p className="mt-1 text-xs text-red-500">{errors.businessPhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp Number (Optional)
                    </label>
                    <div className="relative">
                      <FaWhatsapp className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-sm" />
                      <input
                        type="tel"
                        name="whatsappPhone"
                        value={formData.whatsappPhone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                        placeholder="08012345678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calling Line (Optional)
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="tel"
                        name="callingPhone"
                        value={formData.callingPhone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                        placeholder="08012345678"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Address *
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 text-sm" />
                      <textarea
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        rows="2"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                          errors.businessAddress ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full business address"
                      />
                    </div>
                    {errors.businessAddress && (
                      <p className="mt-1 text-xs text-red-500">{errors.businessAddress}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Documents */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaIdCard className="text-[#0043FC]" />
                  Required Documents
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Brand Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Logo *
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      files.brandLogo ? 'border-green-500 bg-green-50' : errors.brandLogo ? 'border-red-500' : 'border-gray-300 hover:border-[#0043FC]'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('brandLogo', e.target.files[0])}
                        className="hidden"
                        id="brandLogo"
                      />
                      <label htmlFor="brandLogo" className="cursor-pointer block">
                        {filePreviews.brandLogo ? (
                          <div className="space-y-2">
                            <img src={filePreviews.brandLogo} alt="Brand Logo" className="w-24 h-24 object-contain mx-auto" />
                            <p className="text-sm text-green-600">Logo uploaded ✓</p>
                          </div>
                        ) : (
                          <div>
                            <FaUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload brand logo</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.brandLogo && <p className="mt-1 text-xs text-red-500">{errors.brandLogo}</p>}
                  </div>

                  {/* Profile Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Image *
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      files.profileImage ? 'border-green-500 bg-green-50' : errors.profileImage ? 'border-red-500' : 'border-gray-300 hover:border-[#0043FC]'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('profileImage', e.target.files[0])}
                        className="hidden"
                        id="profileImage"
                      />
                      <label htmlFor="profileImage" className="cursor-pointer block">
                        {filePreviews.profileImage ? (
                          <div className="space-y-2">
                            <img src={filePreviews.profileImage} alt="Profile" className="w-24 h-24 object-cover rounded-full mx-auto" />
                            <p className="text-sm text-green-600">Photo uploaded ✓</p>
                          </div>
                        ) : (
                          <div>
                            <FaUser className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload profile photo</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.profileImage && <p className="mt-1 text-xs text-red-500">{errors.profileImage}</p>}
                  </div>

                  {/* CAC Certificate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Registration (CAC) *
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      files.cacCertificate ? 'border-green-500 bg-green-50' : errors.cacCertificate ? 'border-red-500' : 'border-gray-300 hover:border-[#0043FC]'
                    }`}>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange('cacCertificate', e.target.files[0])}
                        className="hidden"
                        id="cacCertificate"
                      />
                      <label htmlFor="cacCertificate" className="cursor-pointer block">
                        {files.cacCertificate ? (
                          <div>
                            <FaCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-green-600">CAC Certificate uploaded ✓</p>
                            <p className="text-xs text-gray-500">{files.cacCertificate.name}</p>
                          </div>
                        ) : (
                          <div>
                            <FaFileInvoice className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload CAC certificate</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, Image (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.cacCertificate && <p className="mt-1 text-xs text-red-500">{errors.cacCertificate}</p>}
                  </div>

                  {/* Government ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Government ID *
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      files.governmentId ? 'border-green-500 bg-green-50' : errors.governmentId ? 'border-red-500' : 'border-gray-300 hover:border-[#0043FC]'
                    }`}>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange('governmentId', e.target.files[0])}
                        className="hidden"
                        id="governmentId"
                      />
                      <label htmlFor="governmentId" className="cursor-pointer block">
                        {files.governmentId ? (
                          <div>
                            <FaCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-green-600">Government ID uploaded ✓</p>
                            <p className="text-xs text-gray-500">{files.governmentId.name}</p>
                          </div>
                        ) : (
                          <div>
                            <FaIdCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload NIN/Passport/DL</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, Image (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.governmentId && <p className="mt-1 text-xs text-red-500">{errors.governmentId}</p>}
                  </div>

                  {/* Proof of Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proof of Address *
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      files.proofOfAddress ? 'border-green-500 bg-green-50' : errors.proofOfAddress ? 'border-red-500' : 'border-gray-300 hover:border-[#0043FC]'
                    }`}>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange('proofOfAddress', e.target.files[0])}
                        className="hidden"
                        id="proofOfAddress"
                      />
                      <label htmlFor="proofOfAddress" className="cursor-pointer block">
                        {files.proofOfAddress ? (
                          <div>
                            <FaCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-green-600">Proof of Address uploaded ✓</p>
                            <p className="text-xs text-gray-500">{files.proofOfAddress.name}</p>
                          </div>
                        ) : (
                          <div>
                            <FaMapMarkerAlt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload utility bill</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, Image (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.proofOfAddress && <p className="mt-1 text-xs text-red-500">{errors.proofOfAddress}</p>}
                  </div>

                  {/* TIN */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Identification Number (TIN) *
                    </label>
                    <input
                      type="text"
                      name="taxIdentificationNumber"
                      value={formData.taxIdentificationNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                        errors.taxIdentificationNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your TIN"
                    />
                    {errors.taxIdentificationNumber && (
                      <p className="mt-1 text-xs text-red-500">{errors.taxIdentificationNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Bank Details - Updated with Paystack Integration */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaUniversity className="text-[#0043FC]" />
                  Bank Account Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Bank Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Bank *
                    </label>
                    <select
                      name="bankCode"
                      value={formData.bankCode}
                      onChange={handleBankCodeChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                        errors.bankCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isLoadingBanks}
                    >
                      <option value="">-- Select Bank --</option>
                      {banksList?.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                    {errors.bankCode && <p className="mt-1 text-xs text-red-500">{errors.bankCode}</p>}
                    {isLoadingBanks && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <FaSpinnerIcon className="animate-spin" /> Loading banks...
                      </p>
                    )}
                  </div>

                  {/* Account Number with Verification */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={handleInputChange}
                        className={`flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                          errors.bankAccountNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0123456789"
                        maxLength="10"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyAccount}
                        disabled={!formData.bankCode || !formData.bankAccountNumber || isVerifyingAccount}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isVerifyingAccount ? (
                          <FaSpinnerIcon className="animate-spin" />
                        ) : (
                          <FaSearch className="text-sm" />
                        )}
                        Verify
                      </button>
                    </div>
                    {errors.bankAccountNumber && <p className="mt-1 text-xs text-red-500">{errors.bankAccountNumber}</p>}
                    {verifiedAccountName && (
                      <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <FaCheckCircle className="text-xs" /> Verified: {verifiedAccountName}
                      </p>
                    )}
                  </div>

                  {/* Account Name (Auto-filled or Manual) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      name="bankAccountName"
                      value={formData.bankAccountName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                        errors.bankAccountName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Account name will auto-fill after verification"
                      readOnly={!!verifiedAccountName}
                    />
                    {errors.bankAccountName && <p className="mt-1 text-xs text-red-500">{errors.bankAccountName}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {verifiedAccountName 
                        ? 'Account verified successfully' 
                        : 'Enter account number and click Verify to auto-fill account name'}
                    </p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <FaShieldAlt className="text-blue-600 text-lg mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">Secure Payment Processing with Paystack</h4>
                      <p className="text-sm text-blue-700">
                        Your bank details will be verified with Paystack and used for secure payouts. 
                        All information is encrypted and protected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Navigation Buttons */}
            <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-[#0043FC] text-white rounded-lg font-medium hover:bg-[#0038D4] transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#0043FC] text-white rounded-lg font-medium hover:bg-[#0038D4] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Benefits Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">Why Sell on Uduua?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaStore className="text-green-600 text-xl" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Large Audience</h4>
                <p className="text-sm text-gray-500">Reach thousands of active buyers across Nigeria</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaShieldAlt className="text-blue-600 text-xl" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Secure Payments</h4>
                <p className="text-sm text-gray-500">Safe and reliable payment processing via Paystack</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaLightbulb className="text-purple-600 text-xl" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Seller Support</h4>
                <p className="text-sm text-gray-500">Dedicated support team to help you succeed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UduuaFooter />
    </>
  );
};

export default UduuaApplySeller;