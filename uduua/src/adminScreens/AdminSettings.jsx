// src/adminScreens/AdminSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  FaCog,
  FaStore,
  FaShippingFast,
  FaMoneyBillWave,
  FaEnvelope,
  FaLock,
  FaBell,
  FaPalette,
  FaGlobe,
  FaDatabase,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEyeSlash,
  FaUserShield,
  FaCreditCard,
  FaPercent,
  FaLanguage,
  FaImage,
  FaChartLine,
  FaUpload,
  FaBullhorn,
  FaMailBulk,
  FaTag,
  FaLink,
  FaImage as FaImageIcon,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetSettingsQuery,
  useUpdateGeneralSettingsMutation,
  useUpdateStoreSettingsMutation,
  useUpdatePaymentSettingsMutation,
  useUpdateEmailSettingsMutation,
  useUpdateSecuritySettingsMutation,
  useUpdateAppearanceSettingsMutation,
  useUpdateSeoSettingsMutation,
  useTestEmailConfigMutation,
  useSendPromoEmailMutation,
  useSendProductNotificationMutation,
  useClearCacheMutation,
} from '../slices/settingsApiSlice.js';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // Promo email form state
  const [promoForm, setPromoForm] = useState({
    subject: '',
    content: '',
    offerLink: '',
    buttonText: 'Shop Now',
    imageUrl: '',
  });
  
  // Product notification form state
  const [productForm, setProductForm] = useState({
    productId: '',
    productName: '',
    productImage: '',
    productPrice: '',
    productLink: '',
  });
  
  // Fetch settings
  const { data: settingsData, isLoading: isLoadingSettings, refetch } = useGetSettingsQuery();
  
  // Update mutations
  const [updateGeneral, { isLoading: isUpdatingGeneral }] = useUpdateGeneralSettingsMutation();
  const [updateStore, { isLoading: isUpdatingStore }] = useUpdateStoreSettingsMutation();
  const [updatePayment, { isLoading: isUpdatingPayment }] = useUpdatePaymentSettingsMutation();
  const [updateEmail, { isLoading: isUpdatingEmail }] = useUpdateEmailSettingsMutation();
  const [updateSecurity, { isLoading: isUpdatingSecurity }] = useUpdateSecuritySettingsMutation();
  const [updateAppearance, { isLoading: isUpdatingAppearance }] = useUpdateAppearanceSettingsMutation();
  const [updateSeo, { isLoading: isUpdatingSeo }] = useUpdateSeoSettingsMutation();
  const [testEmail, { isLoading: isTestingEmail }] = useTestEmailConfigMutation();
  const [sendPromoEmail, { isLoading: isSendingPromo }] = useSendPromoEmailMutation();
  const [sendProductNotification, { isLoading: isSendingProduct }] = useSendProductNotificationMutation();
  const [clearCache, { isLoading: isClearingCache }] = useClearCacheMutation();
  
  // Local state for each settings section
  const [generalSettings, setGeneralSettings] = useState({
    siteName: '',
    siteDescription: '',
    siteLogo: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    timezone: '',
    currency: '',
  });
  
  const [storeSettings, setStoreSettings] = useState({
    enablePreorder: true,
    enableBackorder: false,
    maxQuantityPerOrder: 50,
    defaultShippingDays: 3,
    freeShippingThreshold: 50000,
    shippingFee: 3000,
    enableBulkPricing: true,
    enableDiscounts: true,
  });
  
  const [paymentSettings, setPaymentSettings] = useState({
    paystackPublicKey: '',
    paystackSecretKey: '',
    paystackEnabled: true,
    payOnDeliveryEnabled: true,
    payOnlineEnabled: true,
    platformFeePercentage: 6,
    sellerPayoutPercentage: 94,
    minimumWithdrawal: 10000,
  });
  
  const [emailSettings, setEmailSettings] = useState({
    resendApiKey: '',
    fromEmail: '',
    fromName: '',
    orderConfirmationEnabled: true,
    orderStatusEnabled: true,
    welcomeEmailEnabled: true,
    newsletterEnabled: true,
    promoEmailEnabled: true,
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    minPasswordLength: 6,
    otpExpiryMinutes: 10,
    resetTokenExpiry: 10,
    passwordExpiryDays: 90,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    enableCaptcha: true,
    adminEmailNotifications: true,
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: '#0043FC',
    secondaryColor: '#0038D4',
    accentColor: '#79FFFF',
    darkModeEnabled: false,
    showHeroSection: true,
    heroTitle: '',
    heroSubtitle: '',
    heroButtonText: 'Shop Now',
    heroButtonLink: '/shop',
    footerText: '',
  });
  
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
    enableSitemap: true,
    robotsTxt: '',
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  
  // Load settings data when available
  useEffect(() => {
    if (settingsData) {
      // General settings
      if (settingsData.general) {
        setGeneralSettings({
          siteName: settingsData.general.siteName || '',
          siteDescription: settingsData.general.siteDescription || '',
          siteLogo: settingsData.general.siteLogo || '/uduua-logo.png',
          contactEmail: settingsData.general.contactEmail || '',
          contactPhone: settingsData.general.contactPhone || '',
          address: settingsData.general.address || '',
          timezone: settingsData.general.timezone || 'Africa/Lagos',
          currency: settingsData.general.currency || 'NGN',
        });
        setLogoPreview(settingsData.general.siteLogo || '/uduua-logo.png');
      }
      
      // Store settings
      if (settingsData.store) {
        setStoreSettings({
          enablePreorder: settingsData.store.enablePreorder ?? true,
          enableBackorder: settingsData.store.enableBackorder ?? false,
          maxQuantityPerOrder: settingsData.store.maxQuantityPerOrder || 50,
          defaultShippingDays: settingsData.store.defaultShippingDays || 3,
          freeShippingThreshold: settingsData.store.freeShippingThreshold || 50000,
          shippingFee: settingsData.store.shippingFee || 3000,
          enableBulkPricing: settingsData.store.enableBulkPricing ?? true,
          enableDiscounts: settingsData.store.enableDiscounts ?? true,
        });
      }
      
      // Payment settings
      if (settingsData.payment) {
        setPaymentSettings({
          paystackPublicKey: settingsData.payment.paystackPublicKey || '',
          paystackSecretKey: settingsData.payment.paystackSecretKey || '',
          paystackEnabled: settingsData.payment.paystackEnabled ?? true,
          payOnDeliveryEnabled: settingsData.payment.payOnDeliveryEnabled ?? true,
          payOnlineEnabled: settingsData.payment.payOnlineEnabled ?? true,
          platformFeePercentage: settingsData.payment.platformFeePercentage || 6,
          sellerPayoutPercentage: settingsData.payment.sellerPayoutPercentage || 94,
          minimumWithdrawal: settingsData.payment.minimumWithdrawal || 10000,
        });
      }
      
      // Email settings
      if (settingsData.email) {
        setEmailSettings({
          resendApiKey: settingsData.email.resendApiKey || '',
          fromEmail: settingsData.email.fromEmail || '',
          fromName: settingsData.email.fromName || '',
          orderConfirmationEnabled: settingsData.email.orderConfirmationEnabled ?? true,
          orderStatusEnabled: settingsData.email.orderStatusEnabled ?? true,
          welcomeEmailEnabled: settingsData.email.welcomeEmailEnabled ?? true,
          newsletterEnabled: settingsData.email.newsletterEnabled ?? true,
          promoEmailEnabled: settingsData.email.promoEmailEnabled ?? true,
        });
      }
      
      // Security settings
      if (settingsData.security) {
        setSecuritySettings({
          twoFactorEnabled: settingsData.security.twoFactorEnabled ?? false,
          sessionTimeout: settingsData.security.sessionTimeout || 60,
          maxLoginAttempts: settingsData.security.maxLoginAttempts || 5,
          minPasswordLength: settingsData.security.minPasswordLength || 6,
          otpExpiryMinutes: settingsData.security.otpExpiryMinutes || 10,
          resetTokenExpiry: settingsData.security.resetTokenExpiry || 10,
          passwordExpiryDays: settingsData.security.passwordExpiryDays || 90,
          requireEmailVerification: settingsData.security.requireEmailVerification ?? true,
          requirePhoneVerification: settingsData.security.requirePhoneVerification ?? false,
          enableCaptcha: settingsData.security.enableCaptcha ?? true,
          adminEmailNotifications: settingsData.security.adminEmailNotifications ?? true,
        });
      }
      
      // Appearance settings
      if (settingsData.appearance) {
        setAppearanceSettings({
          primaryColor: settingsData.appearance.primaryColor || '#0043FC',
          secondaryColor: settingsData.appearance.secondaryColor || '#0038D4',
          accentColor: settingsData.appearance.accentColor || '#79FFFF',
          darkModeEnabled: settingsData.appearance.darkModeEnabled ?? false,
          showHeroSection: settingsData.appearance.showHeroSection ?? true,
          heroTitle: settingsData.appearance.heroTitle || '',
          heroSubtitle: settingsData.appearance.heroSubtitle || '',
          heroButtonText: settingsData.appearance.heroButtonText || 'Shop Now',
          heroButtonLink: settingsData.appearance.heroButtonLink || '/shop',
          footerText: settingsData.appearance.footerText || '',
        });
      }
      
      // SEO settings
      if (settingsData.seo) {
        setSeoSettings({
          metaTitle: settingsData.seo.metaTitle || '',
          metaDescription: settingsData.seo.metaDescription || '',
          metaKeywords: settingsData.seo.metaKeywords || '',
          googleAnalyticsId: settingsData.seo.googleAnalyticsId || '',
          facebookPixelId: settingsData.seo.facebookPixelId || '',
          enableSitemap: settingsData.seo.enableSitemap ?? true,
          robotsTxt: settingsData.seo.robotsTxt || '',
        });
      }
    }
  }, [settingsData]);
  
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleStoreChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStoreSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleEmailChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleAppearanceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppearanceSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSeoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSeoSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveGeneral = async () => {
    const formData = new FormData();
    formData.append('siteName', generalSettings.siteName);
    formData.append('siteDescription', generalSettings.siteDescription);
    formData.append('contactEmail', generalSettings.contactEmail);
    formData.append('contactPhone', generalSettings.contactPhone);
    formData.append('address', generalSettings.address);
    formData.append('timezone', generalSettings.timezone);
    formData.append('currency', generalSettings.currency);
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    
    try {
      await updateGeneral(formData).unwrap();
      toast.success('General settings saved successfully!');
      refetch();
      setLogoFile(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save general settings');
    }
  };
  
  const handleSaveStore = async () => {
    try {
      await updateStore(storeSettings).unwrap();
      toast.success('Store settings saved successfully!');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save store settings');
    }
  };
  
  const handleSavePayment = async () => {
    try {
      await updatePayment(paymentSettings).unwrap();
      toast.success('Payment settings saved successfully!');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save payment settings');
    }
  };
  
  const handleSaveEmail = async () => {
    try {
      await updateEmail(emailSettings).unwrap();
      toast.success('Email settings saved successfully!');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save email settings');
    }
  };
  
  const handleSaveSecurity = async () => {
    try {
      await updateSecurity(securitySettings).unwrap();
      toast.success('Security settings saved successfully!');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save security settings');
    }
  };
  
  const handleSaveAppearance = async () => {
    try {
      await updateAppearance(appearanceSettings).unwrap();
      toast.success('Appearance settings saved successfully!');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save appearance settings');
    }
  };
  
  const handleSaveSeo = async () => {
    try {
      await updateSeo(seoSettings).unwrap();
      toast.success('SEO settings saved successfully!');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save SEO settings');
    }
  };
  
  const handleTestEmail = async () => {
    try {
      await testEmail({ email: generalSettings.contactEmail }).unwrap();
      toast.success(`Test email sent to ${generalSettings.contactEmail}`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to send test email');
    }
  };
  
  const handleSendPromoEmail = async () => {
    if (!promoForm.subject || !promoForm.content) {
      toast.error('Please fill in subject and content');
      return;
    }
    
    try {
      await sendPromoEmail(promoForm).unwrap();
      toast.success('Promo emails sent to all subscribers!');
      setShowPromoModal(false);
      setPromoForm({
        subject: '',
        content: '',
        offerLink: '',
        buttonText: 'Shop Now',
        imageUrl: '',
      });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to send promo emails');
    }
  };
  
  const handleSendProductNotification = async () => {
    if (!productForm.productId && (!productForm.productName || !productForm.productLink)) {
      toast.error('Please provide product ID or product details');
      return;
    }
    
    try {
      await sendProductNotification(productForm).unwrap();
      toast.success('Product notifications sent to all subscribers!');
      setShowProductModal(false);
      setProductForm({
        productId: '',
        productName: '',
        productImage: '',
        productPrice: '',
        productLink: '',
      });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to send product notifications');
    }
  };
  
  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear the cache? This may temporarily slow down the site.')) {
      try {
        await clearCache().unwrap();
        toast.success('Cache cleared successfully!');
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to clear cache');
      }
    }
  };
  
  const tabs = [
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'store', label: 'Store', icon: FaStore },
    { id: 'payment', label: 'Payment', icon: FaMoneyBillWave },
    { id: 'email', label: 'Email', icon: FaEnvelope },
    { id: 'security', label: 'Security', icon: FaLock },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'seo', label: 'SEO', icon: FaGlobe },
  ];
  
  const isLoading = isLoadingSettings;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#0043FC] mx-auto mb-4" />
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your marketplace configuration and preferences</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPromoModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <FaBullhorn /> Send Promo Email
          </button>
          <button
            onClick={() => setShowProductModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FaTag /> New Product Alert
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-[#0043FC] border-b-2 border-[#0043FC]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="text-sm" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                <input
                  type="text"
                  name="siteName"
                  value={generalSettings.siteName}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={generalSettings.contactEmail}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                <textarea
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={generalSettings.contactPhone}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={generalSettings.address}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  name="timezone"
                  value={generalSettings.timezone}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                >
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                  <option value="Africa/Abidjan">Africa/Abidjan (GMT)</option>
                  <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                  <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  name="currency"
                  value={generalSettings.currency}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                >
                  <option value="NGN">Nigerian Naira (NGN)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Logo</label>
                <div className="flex items-center gap-3">
                  <img src={logoPreview} alt="Logo" className="h-12 w-auto" />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                      <FaUpload /> Upload Logo
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveGeneral}
                disabled={isUpdatingGeneral}
                className="px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdatingGeneral ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Store Settings */}
      {activeTab === 'store' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Shipping Days</label>
                <input
                  type="number"
                  name="defaultShippingDays"
                  value={storeSettings.defaultShippingDays}
                  onChange={handleStoreChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Quantity Per Order</label>
                <input
                  type="number"
                  name="maxQuantityPerOrder"
                  value={storeSettings.maxQuantityPerOrder}
                  onChange={handleStoreChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (₦)</label>
                <input
                  type="number"
                  name="freeShippingThreshold"
                  value={storeSettings.freeShippingThreshold}
                  onChange={handleStoreChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
                <p className="text-xs text-gray-400 mt-1">Orders above this amount get free shipping</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Standard Shipping Fee (₦)</label>
                <input
                  type="number"
                  name="shippingFee"
                  value={storeSettings.shippingFee}
                  onChange={handleStoreChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="enablePreorder"
                  checked={storeSettings.enablePreorder}
                  onChange={handleStoreChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Enable Pre-orders</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="enableBackorder"
                  checked={storeSettings.enableBackorder}
                  onChange={handleStoreChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Enable Back-orders</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="enableBulkPricing"
                  checked={storeSettings.enableBulkPricing}
                  onChange={handleStoreChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Enable Bulk Pricing Discounts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="enableDiscounts"
                  checked={storeSettings.enableDiscounts}
                  onChange={handleStoreChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Enable Product Discounts</span>
              </label>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveStore}
                disabled={isUpdatingStore}
                className="px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdatingStore ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h2>
          <div className="space-y-6">
            {/* Platform Fees */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-md font-medium text-gray-800 mb-3">Platform Fees</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee (%)</label>
                  <input
                    type="number"
                    name="platformFeePercentage"
                    value={paymentSettings.platformFeePercentage}
                    onChange={handlePaymentChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seller Payout (%)</label>
                  <input
                    type="number"
                    name="sellerPayoutPercentage"
                    value={paymentSettings.sellerPayoutPercentage}
                    onChange={handlePaymentChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Withdrawal (₦)</label>
                  <input
                    type="number"
                    name="minimumWithdrawal"
                    value={paymentSettings.minimumWithdrawal}
                    onChange={handlePaymentChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  />
                </div>
              </div>
            </div>
            
            {/* Payment Gateways */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-md font-medium text-gray-800 mb-3">Payment Gateways</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="paystackEnabled"
                    checked={paymentSettings.paystackEnabled}
                    onChange={handlePaymentChange}
                    className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                  />
                  <span className="text-sm text-gray-700">Enable Paystack</span>
                </label>
                {paymentSettings.paystackEnabled && (
                  <div className="ml-6 space-y-3">
                    <input
                      type="text"
                      name="paystackPublicKey"
                      value={paymentSettings.paystackPublicKey}
                      onChange={handlePaymentChange}
                      placeholder="Paystack Public Key"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                    />
                    <input
                      type="password"
                      name="paystackSecretKey"
                      value={paymentSettings.paystackSecretKey}
                      onChange={handlePaymentChange}
                      placeholder="Paystack Secret Key"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                    />
                  </div>
                )}
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="payOnDeliveryEnabled"
                    checked={paymentSettings.payOnDeliveryEnabled}
                    onChange={handlePaymentChange}
                    className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                  />
                  <span className="text-sm text-gray-700">Enable Pay on Delivery</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="payOnlineEnabled"
                    checked={paymentSettings.payOnlineEnabled}
                    onChange={handlePaymentChange}
                    className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                  />
                  <span className="text-sm text-gray-700">Enable Online Payments</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSavePayment}
                disabled={isUpdatingPayment}
                className="px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdatingPayment ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Email Settings */}
      {activeTab === 'email' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Resend API Key</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="resendApiKey"
                    value={emailSettings.resendApiKey}
                    onChange={handleEmailChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                    placeholder="re_xxxxxxxxxxxx"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Get your API key from <a href="https://resend.com" target="_blank" className="text-[#0043FC]">resend.com</a></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                <input
                  type="email"
                  name="fromEmail"
                  value={emailSettings.fromEmail}
                  onChange={handleEmailChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  placeholder="noreply@uduua.com"
                />
                <p className="text-xs text-gray-400 mt-1">Must be a verified domain in Resend</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                <input
                  type="text"
                  name="fromName"
                  value={emailSettings.fromName}
                  onChange={handleEmailChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  placeholder="Úduua Marketplace"
                />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-md font-medium text-gray-800 mb-2">Email Notifications</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="orderConfirmationEnabled"
                  checked={emailSettings.orderConfirmationEnabled}
                  onChange={handleEmailChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Order Confirmation Emails</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="orderStatusEnabled"
                  checked={emailSettings.orderStatusEnabled}
                  onChange={handleEmailChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Order Status Update Emails</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="welcomeEmailEnabled"
                  checked={emailSettings.welcomeEmailEnabled}
                  onChange={handleEmailChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Welcome Emails to New Users</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="promoEmailEnabled"
                  checked={emailSettings.promoEmailEnabled}
                  onChange={handleEmailChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Enable Promotional Emails</span>
              </label>
            </div>
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={handleTestEmail}
                disabled={isTestingEmail}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isTestingEmail ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
                Send Test Email
              </button>
              <button
                onClick={handleSaveEmail}
                disabled={isUpdatingEmail}
                className="px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdatingEmail ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={securitySettings.sessionTimeout}
                  onChange={handleSecurityChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
                <input
                  type="number"
                  name="maxLoginAttempts"
                  value={securitySettings.maxLoginAttempts}
                  onChange={handleSecurityChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Password Length</label>
                <input
                  type="number"
                  name="minPasswordLength"
                  value={securitySettings.minPasswordLength}
                  onChange={handleSecurityChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OTP Expiry (minutes)</label>
                <input
                  type="number"
                  name="otpExpiryMinutes"
                  value={securitySettings.otpExpiryMinutes}
                  onChange={handleSecurityChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reset Token Expiry (minutes)</label>
                <input
                  type="number"
                  name="resetTokenExpiry"
                  value={securitySettings.resetTokenExpiry}
                  onChange={handleSecurityChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Expiry (days)</label>
                <input
                  type="number"
                  name="passwordExpiryDays"
                  value={securitySettings.passwordExpiryDays}
                  onChange={handleSecurityChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="requireEmailVerification"
                  checked={securitySettings.requireEmailVerification}
                  onChange={handleSecurityChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Require Email Verification for New Users</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="enableCaptcha"
                  checked={securitySettings.enableCaptcha}
                  onChange={handleSecurityChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Enable CAPTCHA on Login/Registration</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="adminEmailNotifications"
                  checked={securitySettings.adminEmailNotifications}
                  onChange={handleSecurityChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Send Security Alerts to Admin Email</span>
              </label>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveSecurity}
                disabled={isUpdatingSecurity}
                className="px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdatingSecurity ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    value={appearanceSettings.primaryColor}
                    onChange={handleAppearanceChange}
                    className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={appearanceSettings.primaryColor}
                    onChange={handleAppearanceChange}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={appearanceSettings.secondaryColor}
                    onChange={handleAppearanceChange}
                    className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    name="secondaryColor"
                    value={appearanceSettings.secondaryColor}
                    onChange={handleAppearanceChange}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="accentColor"
                    value={appearanceSettings.accentColor}
                    onChange={handleAppearanceChange}
                    className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    name="accentColor"
                    value={appearanceSettings.accentColor}
                    onChange={handleAppearanceChange}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="showHeroSection"
                  checked={appearanceSettings.showHeroSection}
                  onChange={handleAppearanceChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Show Hero Section on Homepage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="darkModeEnabled"
                  checked={appearanceSettings.darkModeEnabled}
                  onChange={handleAppearanceChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Enable Dark Mode (Experimental)</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
              <input
                type="text"
                name="heroTitle"
                value={appearanceSettings.heroTitle}
                onChange={handleAppearanceChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
              <input
                type="text"
                name="heroSubtitle"
                value={appearanceSettings.heroSubtitle}
                onChange={handleAppearanceChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Button Text</label>
                <input
                  type="text"
                  name="heroButtonText"
                  value={appearanceSettings.heroButtonText}
                  onChange={handleAppearanceChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Button Link</label>
                <input
                  type="text"
                  name="heroButtonLink"
                  value={appearanceSettings.heroButtonLink}
                  onChange={handleAppearanceChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
              <input
                type="text"
                name="footerText"
                value={appearanceSettings.footerText}
                onChange={handleAppearanceChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              />
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveAppearance}
                disabled={isUpdatingAppearance}
                className="px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdatingAppearance ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* SEO Settings */}
      {activeTab === 'seo' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={seoSettings.metaTitle}
                onChange={handleSeoChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              />
              <p className="text-xs text-gray-400 mt-1">Appears in search engine results (50-60 characters recommended)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                name="metaDescription"
                value={seoSettings.metaDescription}
                onChange={handleSeoChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              />
              <p className="text-xs text-gray-400 mt-1">Appears below the title in search results (150-160 characters recommended)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
              <input
                type="text"
                name="metaKeywords"
                value={seoSettings.metaKeywords}
                onChange={handleSeoChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="text-xs text-gray-400 mt-1">Comma-separated keywords</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
                <input
                  type="text"
                  name="googleAnalyticsId"
                  value={seoSettings.googleAnalyticsId}
                  onChange={handleSeoChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Pixel ID</label>
                <input
                  type="text"
                  name="facebookPixelId"
                  value={seoSettings.facebookPixelId}
                  onChange={handleSeoChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  placeholder="XXXXXXXXXXXXXXXXX"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Robots.txt</label>
              <textarea
                name="robotsTxt"
                value={seoSettings.robotsTxt}
                onChange={handleSeoChange}
                rows="6"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="enableSitemap"
                  checked={seoSettings.enableSitemap}
                  onChange={handleSeoChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <span className="text-sm text-gray-700">Enable XML Sitemap Generation</span>
              </label>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={handleClearCache}
                disabled={isClearingCache}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <FaDatabase /> {isClearingCache ? <FaSpinner className="animate-spin" /> : 'Clear Cache'}
              </button>
              <button
                onClick={handleSaveSeo}
                disabled={isUpdatingSeo}
                className="px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdatingSeo ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Promo Email Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaBullhorn className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Send Promo Email</h2>
                  <p className="text-sm text-gray-500">Send promotional emails to all subscribers</p>
                </div>
              </div>
              <button
                onClick={() => setShowPromoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle className="text-xl" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSendPromoEmail(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={promoForm.subject}
                  onChange={(e) => setPromoForm({ ...promoForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  placeholder="Special Offer: 20% Off Everything!"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  value={promoForm.content}
                  onChange={(e) => setPromoForm({ ...promoForm, content: e.target.value })}
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  placeholder="Write your promotional message here..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Link</label>
                <input
                  type="url"
                  value={promoForm.offerLink}
                  onChange={(e) => setPromoForm({ ...promoForm, offerLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  placeholder="https://uduua.com/shop/sale"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={promoForm.buttonText}
                    onChange={(e) => setPromoForm({ ...promoForm, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={promoForm.imageUrl}
                    onChange={(e) => setPromoForm({ ...promoForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> This will send an email to all users who have subscribed to newsletters. 
                  The email will be sent immediately.
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingPromo}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSendingPromo ? <FaSpinner className="animate-spin" /> : <FaMailBulk />}
                  Send to Subscribers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Product Notification Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaTag className="text-green-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">New Product Alert</h2>
                  <p className="text-sm text-gray-500">Notify subscribers about a new product</p>
                </div>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle className="text-xl" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSendProductNotification(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product ID (Optional)</label>
                <input
                  type="text"
                  value={productForm.productId}
                  onChange={(e) => setProductForm({ ...productForm, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  placeholder="Enter product ID to auto-fetch details"
                />
                <p className="text-xs text-gray-400 mt-1">Or fill in the details manually below</p>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3">Product Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={productForm.productName}
                      onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                      placeholder="Product name"
                      required={!productForm.productId}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Price</label>
                    <input
                      type="number"
                      value={productForm.productPrice}
                      onChange={(e) => setProductForm({ ...productForm, productPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                      placeholder="₦0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Link *</label>
                    <input
                      type="url"
                      value={productForm.productLink}
                      onChange={(e) => setProductForm({ ...productForm, productLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                      placeholder="https://uduua.com/shop/product/..."
                      required={!productForm.productId}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image URL</label>
                    <input
                      type="url"
                      value={productForm.productImage}
                      onChange={(e) => setProductForm({ ...productForm, productImage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                      placeholder="https://example.com/product-image.jpg"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> This will notify all subscribers about this new product. 
                  The notification will be sent immediately.
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingProduct}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSendingProduct ? <FaSpinner className="animate-spin" /> : <FaTag />}
                  Notify Subscribers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;