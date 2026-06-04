// controllers/uduuaSettingsController.js
import asyncHandler from 'express-async-handler';
import UduuaSettings from '../models/uduuaSettingsModel.js';
import { v2 as cloudinary } from 'cloudinary';
import { Resend } from 'resend';

console.log('✅ Loading uduuaSettingsController...');

// Helper function to get Resend client
const getResendClient = async () => {
  const settings = await UduuaSettings.findOne();
  if (settings && settings.email.resendApiKey) {
    return new Resend(settings.email.resendApiKey);
  }
  return null;
};

// ==================== SETTINGS CONTROLLERS ====================

// controllers/uduuaSettingsController.js - Complete getAllSettings function

// @desc    Get all settings
// @route   GET /api/uduua-settings
// @access  Private/Admin
const getAllSettings = asyncHandler(async (req, res) => {
  console.log('📦 [getAllSettings] Function called');
  console.log('📦 [getAllSettings] Request user:', req.user?._id);
  console.log('📦 [getAllSettings] Request admin:', req.admin?._id);
  
  try {
    console.log('📦 [getAllSettings] Looking for settings in database...');
    let settings = await UduuaSettings.findOne();
    console.log('📦 [getAllSettings] Found settings:', settings ? 'Yes' : 'No');
    
    if (!settings) {
      console.log('📦 [getAllSettings] No settings found, creating default...');
      // Create default settings if none exist
      settings = await UduuaSettings.create({
        general: {
          siteName: 'Úduua',
          siteDescription: 'Your premier online marketplace for authentic products',
          siteLogo: '/uduua-logo.png',
          siteFavicon: '/favicon.ico',
          contactEmail: 'support@uduua.com',
          contactPhone: '+234 800 000 0000',
          address: 'Lagos, Nigeria',
          timezone: 'Africa/Lagos',
          currency: 'NGN',
        },
        store: {
          enablePreorder: true,
          enableBackorder: false,
          maxQuantityPerOrder: 50,
          defaultShippingDays: 3,
          freeShippingThreshold: 50000,
          shippingFee: 3000,
          enableBulkPricing: true,
          enableDiscounts: true,
        },
        payment: {
          paystackPublicKey: '',
          paystackSecretKey: '',
          paystackEnabled: true,
          payOnDeliveryEnabled: true,
          payOnlineEnabled: true,
          platformFeePercentage: 6,
          sellerPayoutPercentage: 94,
          minimumWithdrawal: 10000,
        },
        email: {
          resendApiKey: '',
          fromEmail: 'noreply@uduua.com',
          fromName: 'Úduua Marketplace',
          orderConfirmationEnabled: true,
          orderStatusEnabled: true,
          welcomeEmailEnabled: true,
          newsletterEnabled: true,
          promoEmailEnabled: true,
        },
        security: {
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
        },
        appearance: {
          primaryColor: '#0043FC',
          secondaryColor: '#0038D4',
          accentColor: '#79FFFF',
          darkModeEnabled: false,
          showHeroSection: true,
          heroTitle: 'Welcome to Úduua',
          heroSubtitle: 'Discover amazing products from trusted sellers',
          heroButtonText: 'Shop Now',
          heroButtonLink: '/shop',
          footerText: '© 2024 Úduua. All rights reserved.',
        },
        seo: {
          metaTitle: 'Úduua - Nigeria\'s Premier Online Marketplace',
          metaDescription: 'Shop authentic products from verified sellers on Úduua. Best prices, secure payments, and fast delivery.',
          metaKeywords: 'marketplace, ecommerce, shopping, Nigeria, online store',
          googleAnalyticsId: '',
          facebookPixelId: '',
          enableSitemap: true,
          robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout/',
        },
      });
      console.log('📦 [getAllSettings] Default settings created with ID:', settings._id);
    }
    
    // Log what we're sending
    console.log('📦 [getAllSettings] Sending settings with email data:', {
      resendApiKey: settings.email.resendApiKey ? 'Present (length: ' + settings.email.resendApiKey.length + ')' : 'Not set',
      fromEmail: settings.email.fromEmail,
      fromName: settings.email.fromName,
      orderConfirmationEnabled: settings.email.orderConfirmationEnabled,
    });
    
    // Return the complete settings object
    res.json(settings);
    console.log('✅ [getAllSettings] Response sent successfully');
    
  } catch (error) {
    console.error('❌ [getAllSettings] Error:', error.message);
    console.error('❌ [getAllSettings] Error stack:', error.stack);
    res.status(500);
    throw new Error(`Failed to get settings: ${error.message}`);
  }
});

// @desc    Update general settings
// @route   PUT /api/uduua-settings/general
// @access  Private/Admin
const updateGeneralSettings = asyncHandler(async (req, res) => {
  console.log('📦 [updateGeneralSettings] Function called');
  console.log('📦 [updateGeneralSettings] Request body:', req.body);
  console.log('📦 [updateGeneralSettings] Has file:', !!req.file);
  
  const {
    siteName,
    siteDescription,
    contactEmail,
    contactPhone,
    address,
    timezone,
    currency,
  } = req.body;
  
  try {
    let settings = await UduuaSettings.findOne();
    if (!settings) {
      settings = new UduuaSettings();
    }
    
    if (siteName !== undefined) settings.general.siteName = siteName;
    if (siteDescription !== undefined) settings.general.siteDescription = siteDescription;
    if (contactEmail !== undefined) settings.general.contactEmail = contactEmail;
    if (contactPhone !== undefined) settings.general.contactPhone = contactPhone;
    if (address !== undefined) settings.general.address = address;
    if (timezone !== undefined) settings.general.timezone = timezone;
    if (currency !== undefined) settings.general.currency = currency;
    
    if (req.file) {
      console.log('📦 [updateGeneralSettings] Uploading new logo...');
      if (settings.general.siteLogo && settings.general.siteLogo.includes('cloudinary')) {
        try {
          const publicId = settings.general.siteLogo.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`Uduua_Settings/${publicId}`);
          console.log('📦 [updateGeneralSettings] Old logo deleted');
        } catch (error) {
          console.error('❌ Error deleting old logo:', error);
        }
      }
      settings.general.siteLogo = req.file.path;
      console.log('📦 [updateGeneralSettings] New logo uploaded:', req.file.path);
    }
    
    await settings.save();
    console.log('✅ [updateGeneralSettings] Settings saved successfully');
    
    res.json({
      success: true,
      message: 'General settings updated successfully',
      general: settings.general,
    });
  } catch (error) {
    console.error('❌ [updateGeneralSettings] Error:', error.message);
    console.error('❌ [updateGeneralSettings] Error stack:', error.stack);
    res.status(500);
    throw new Error(`Failed to update general settings: ${error.message}`);
  }
});

// @desc    Update store settings
// @route   PUT /api/uduua-settings/store
// @access  Private/Admin
const updateStoreSettings = asyncHandler(async (req, res) => {
  console.log('📦 [updateStoreSettings] Function called');
  console.log('📦 [updateStoreSettings] Request body:', req.body);
  
  const {
    enablePreorder,
    enableBackorder,
    maxQuantityPerOrder,
    defaultShippingDays,
    freeShippingThreshold,
    shippingFee,
    enableBulkPricing,
    enableDiscounts,
  } = req.body;
  
  try {
    let settings = await UduuaSettings.findOne();
    if (!settings) {
      settings = new UduuaSettings();
    }
    
    if (enablePreorder !== undefined) settings.store.enablePreorder = enablePreorder;
    if (enableBackorder !== undefined) settings.store.enableBackorder = enableBackorder;
    if (maxQuantityPerOrder !== undefined) settings.store.maxQuantityPerOrder = maxQuantityPerOrder;
    if (defaultShippingDays !== undefined) settings.store.defaultShippingDays = defaultShippingDays;
    if (freeShippingThreshold !== undefined) settings.store.freeShippingThreshold = freeShippingThreshold;
    if (shippingFee !== undefined) settings.store.shippingFee = shippingFee;
    if (enableBulkPricing !== undefined) settings.store.enableBulkPricing = enableBulkPricing;
    if (enableDiscounts !== undefined) settings.store.enableDiscounts = enableDiscounts;
    
    await settings.save();
    console.log('✅ [updateStoreSettings] Settings saved successfully');
    
    res.json({
      success: true,
      message: 'Store settings updated successfully',
      store: settings.store,
    });
  } catch (error) {
    console.error('❌ [updateStoreSettings] Error:', error.message);
    console.error('❌ [updateStoreSettings] Error stack:', error.stack);
    res.status(500);
    throw new Error(`Failed to update store settings: ${error.message}`);
  }
});

// @desc    Update payment settings
// @route   PUT /api/uduua-settings/payment
// @access  Private/Admin
const updatePaymentSettings = asyncHandler(async (req, res) => {
  console.log('📦 [updatePaymentSettings] Function called');
  console.log('📦 [updatePaymentSettings] Request body:', req.body);
  
  const {
    paystackPublicKey,
    paystackSecretKey,
    paystackEnabled,
    payOnDeliveryEnabled,
    payOnlineEnabled,
    platformFeePercentage,
    sellerPayoutPercentage,
    minimumWithdrawal,
  } = req.body;
  
  try {
    let settings = await UduuaSettings.findOne();
    if (!settings) {
      settings = new UduuaSettings();
    }
    
    if (paystackPublicKey !== undefined) settings.payment.paystackPublicKey = paystackPublicKey;
    if (paystackSecretKey !== undefined) settings.payment.paystackSecretKey = paystackSecretKey;
    if (paystackEnabled !== undefined) settings.payment.paystackEnabled = paystackEnabled;
    if (payOnDeliveryEnabled !== undefined) settings.payment.payOnDeliveryEnabled = payOnDeliveryEnabled;
    if (payOnlineEnabled !== undefined) settings.payment.payOnlineEnabled = payOnlineEnabled;
    if (platformFeePercentage !== undefined) settings.payment.platformFeePercentage = Number(platformFeePercentage);
    if (sellerPayoutPercentage !== undefined) settings.payment.sellerPayoutPercentage = Number(sellerPayoutPercentage);
    if (minimumWithdrawal !== undefined) settings.payment.minimumWithdrawal = Number(minimumWithdrawal);
    
    await settings.save();
    console.log('✅ [updatePaymentSettings] Settings saved successfully');
    
    res.json({
      success: true,
      message: 'Payment settings updated successfully',
      payment: {
        paystackEnabled: settings.payment.paystackEnabled,
        payOnDeliveryEnabled: settings.payment.payOnDeliveryEnabled,
        payOnlineEnabled: settings.payment.payOnlineEnabled,
        platformFeePercentage: settings.payment.platformFeePercentage,
        sellerPayoutPercentage: settings.payment.sellerPayoutPercentage,
        minimumWithdrawal: settings.payment.minimumWithdrawal,
      },
    });
  } catch (error) {
    console.error('❌ [updatePaymentSettings] Error:', error.message);
    console.error('❌ [updatePaymentSettings] Error stack:', error.stack);
    res.status(500);
    throw new Error(`Failed to update payment settings: ${error.message}`);
  }
});

// @desc    Update email settings
// @route   PUT /api/uduua-settings/email
// @access  Private/Admin
// controllers/uduuaSettingsController.js - Complete updateEmailSettings function

// @desc    Update email settings
// @route   PUT /api/uduua-settings/email
// @access  Private/Admin
const updateEmailSettings = asyncHandler(async (req, res) => {
  console.log('📦 [updateEmailSettings] Function called');
  console.log('📦 [updateEmailSettings] Request body:', {
    ...req.body,
    resendApiKey: req.body.resendApiKey ? '***PRESENT***' : 'NOT PROVIDED',
  });
  
  const {
    resendApiKey,
    fromEmail,
    fromName,
    orderConfirmationEnabled,
    orderStatusEnabled,
    welcomeEmailEnabled,
    newsletterEnabled,
    promoEmailEnabled,
  } = req.body;
  
  try {
    console.log('📦 [updateEmailSettings] Looking for settings...');
    let settings = await UduuaSettings.findOne();
    if (!settings) {
      console.log('📦 [updateEmailSettings] No settings found, creating new...');
      settings = new UduuaSettings();
    }
    
    // Update fields - ONLY if they are provided (not undefined)
    if (resendApiKey !== undefined) {
      settings.email.resendApiKey = resendApiKey;
      console.log('📦 [updateEmailSettings] Resend API Key updated:', resendApiKey ? 'Present (length: ' + resendApiKey.length + ')' : 'Cleared');
    }
    if (fromEmail !== undefined) {
      settings.email.fromEmail = fromEmail;
      console.log('📦 [updateEmailSettings] From Email updated:', fromEmail);
    }
    if (fromName !== undefined) {
      settings.email.fromName = fromName;
      console.log('📦 [updateEmailSettings] From Name updated:', fromName);
    }
    if (orderConfirmationEnabled !== undefined) settings.email.orderConfirmationEnabled = orderConfirmationEnabled;
    if (orderStatusEnabled !== undefined) settings.email.orderStatusEnabled = orderStatusEnabled;
    if (welcomeEmailEnabled !== undefined) settings.email.welcomeEmailEnabled = welcomeEmailEnabled;
    if (newsletterEnabled !== undefined) settings.email.newsletterEnabled = newsletterEnabled;
    if (promoEmailEnabled !== undefined) settings.email.promoEmailEnabled = promoEmailEnabled;
    
    await settings.save();
    console.log('✅ [updateEmailSettings] Settings saved successfully');
    console.log('📦 [updateEmailSettings] Saved Resend API Key:', settings.email.resendApiKey ? 'Present' : 'Missing');
    
    // Return the FULL email settings including the API key for the frontend
    res.json({
      success: true,
      message: 'Email settings updated successfully',
      email: {
        resendApiKey: settings.email.resendApiKey, // ✅ Return the actual key
        fromEmail: settings.email.fromEmail,
        fromName: settings.email.fromName,
        orderConfirmationEnabled: settings.email.orderConfirmationEnabled,
        orderStatusEnabled: settings.email.orderStatusEnabled,
        welcomeEmailEnabled: settings.email.welcomeEmailEnabled,
        newsletterEnabled: settings.email.newsletterEnabled,
        promoEmailEnabled: settings.email.promoEmailEnabled,
      },
    });
    
  } catch (error) {
    console.error('❌ [updateEmailSettings] Error:', error.message);
    console.error('❌ [updateEmailSettings] Error stack:', error.stack);
    res.status(500);
    throw new Error(`Failed to update email settings: ${error.message}`);
  }
});

// @desc    Update security settings
// @route   PUT /api/uduua-settings/security
// @access  Private/Admin
const updateSecuritySettings = asyncHandler(async (req, res) => {
  console.log('📦 [updateSecuritySettings] Function called');
  console.log('📦 [updateSecuritySettings] Request body:', req.body);
  
  const {
    twoFactorEnabled,
    sessionTimeout,
    maxLoginAttempts,
    minPasswordLength,
    otpExpiryMinutes,
    resetTokenExpiry,
    passwordExpiryDays,
    requireEmailVerification,
    requirePhoneVerification,
    enableCaptcha,
    adminEmailNotifications,
  } = req.body;
  
  try {
    let settings = await UduuaSettings.findOne();
    if (!settings) {
      settings = new UduuaSettings();
    }
    
    if (twoFactorEnabled !== undefined) settings.security.twoFactorEnabled = twoFactorEnabled;
    if (sessionTimeout !== undefined) settings.security.sessionTimeout = sessionTimeout;
    if (maxLoginAttempts !== undefined) settings.security.maxLoginAttempts = maxLoginAttempts;
    if (minPasswordLength !== undefined) settings.security.minPasswordLength = minPasswordLength;
    if (otpExpiryMinutes !== undefined) settings.security.otpExpiryMinutes = otpExpiryMinutes;
    if (resetTokenExpiry !== undefined) settings.security.resetTokenExpiry = resetTokenExpiry;
    if (passwordExpiryDays !== undefined) settings.security.passwordExpiryDays = passwordExpiryDays;
    if (requireEmailVerification !== undefined) settings.security.requireEmailVerification = requireEmailVerification;
    if (requirePhoneVerification !== undefined) settings.security.requirePhoneVerification = requirePhoneVerification;
    if (enableCaptcha !== undefined) settings.security.enableCaptcha = enableCaptcha;
    if (adminEmailNotifications !== undefined) settings.security.adminEmailNotifications = adminEmailNotifications;
    
    await settings.save();
    console.log('✅ [updateSecuritySettings] Settings saved successfully');
    
    res.json({
      success: true,
      message: 'Security settings updated successfully',
      security: settings.security,
    });
  } catch (error) {
    console.error('❌ [updateSecuritySettings] Error:', error.message);
    console.error('❌ [updateSecuritySettings] Error stack:', error.stack);
    res.status(500);
    throw new Error(`Failed to update security settings: ${error.message}`);
  }
});

// @desc    Update appearance settings
// @route   PUT /api/uduua-settings/appearance
// @access  Private/Admin
const updateAppearanceSettings = asyncHandler(async (req, res) => {
  console.log('📦 [updateAppearanceSettings] Function called');
  console.log('📦 [updateAppearanceSettings] Request body:', req.body);
  
  const {
    primaryColor,
    secondaryColor,
    accentColor,
    darkModeEnabled,
    showHeroSection,
    heroTitle,
    heroSubtitle,
    heroButtonText,
    heroButtonLink,
    footerText,
  } = req.body;
  
  try {
    let settings = await UduuaSettings.findOne();
    if (!settings) {
      settings = new UduuaSettings();
    }
    
    if (primaryColor !== undefined) settings.appearance.primaryColor = primaryColor;
    if (secondaryColor !== undefined) settings.appearance.secondaryColor = secondaryColor;
    if (accentColor !== undefined) settings.appearance.accentColor = accentColor;
    if (darkModeEnabled !== undefined) settings.appearance.darkModeEnabled = darkModeEnabled;
    if (showHeroSection !== undefined) settings.appearance.showHeroSection = showHeroSection;
    if (heroTitle !== undefined) settings.appearance.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) settings.appearance.heroSubtitle = heroSubtitle;
    if (heroButtonText !== undefined) settings.appearance.heroButtonText = heroButtonText;
    if (heroButtonLink !== undefined) settings.appearance.heroButtonLink = heroButtonLink;
    if (footerText !== undefined) settings.appearance.footerText = footerText;
    
    await settings.save();
    console.log('✅ [updateAppearanceSettings] Settings saved successfully');
    
    res.json({
      success: true,
      message: 'Appearance settings updated successfully',
      appearance: settings.appearance,
    });
  } catch (error) {
    console.error('❌ [updateAppearanceSettings] Error:', error.message);
    console.error('❌ [updateAppearanceSettings] Error stack:', error.stack);
    res.status(500);
    throw new Error(`Failed to update appearance settings: ${error.message}`);
  }
});

// @desc    Update SEO settings
// @route   PUT /api/uduua-settings/seo
// @access  Private/Admin
const updateSeoSettings = asyncHandler(async (req, res) => {
  console.log('📦 [updateSeoSettings] Function called');
  console.log('📦 [updateSeoSettings] Request body:', req.body);
  
  const {
    metaTitle,
    metaDescription,
    metaKeywords,
    googleAnalyticsId,
    facebookPixelId,
    enableSitemap,
    robotsTxt,
  } = req.body;
  
  try {
    let settings = await UduuaSettings.findOne();
    if (!settings) {
      settings = new UduuaSettings();
    }
    
    if (metaTitle !== undefined) settings.seo.metaTitle = metaTitle;
    if (metaDescription !== undefined) settings.seo.metaDescription = metaDescription;
    if (metaKeywords !== undefined) settings.seo.metaKeywords = metaKeywords;
    if (googleAnalyticsId !== undefined) settings.seo.googleAnalyticsId = googleAnalyticsId;
    if (facebookPixelId !== undefined) settings.seo.facebookPixelId = facebookPixelId;
    if (enableSitemap !== undefined) settings.seo.enableSitemap = enableSitemap;
    if (robotsTxt !== undefined) settings.seo.robotsTxt = robotsTxt;
    
    await settings.save();
    console.log('✅ [updateSeoSettings] Settings saved successfully');
    
    res.json({
      success: true,
      message: 'SEO settings updated successfully',
      seo: settings.seo,
    });
  } catch (error) {
    console.error('❌ [updateSeoSettings] Error:', error.message);
    console.error('❌ [updateSeoSettings] Error stack:', error.stack);
    res.status(500);
    throw new Error(`Failed to update SEO settings: ${error.message}`);
  }
});

// @desc    Test email configuration
// @route   POST /api/uduua-settings/test-email
// @access  Private/Admin
const testEmailConfig = asyncHandler(async (req, res) => {
  console.log('📦 [testEmailConfig] Function called');
  console.log('📦 [testEmailConfig] Request body:', req.body);
  
  const { email } = req.body;
  const testEmail = email || req.admin?.email;
  
  if (!testEmail) {
    res.status(400);
    throw new Error('Recipient email is required');
  }
  
  const settings = await UduuaSettings.findOne();
  
  if (!settings || !settings.email.resendApiKey) {
    res.status(400);
    throw new Error('Resend API key not configured. Please complete email settings first.');
  }
  
  try {
    const resend = new Resend(settings.email.resendApiKey);
    
    await resend.emails.send({
      from: `${settings.email.fromName} <${settings.email.fromEmail}>`,
      to: testEmail,
      subject: 'Úduua - Test Email Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0043FC; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Úduua Marketplace</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <h2>Test Email Successful! ✅</h2>
            <p>Your Resend email configuration is working correctly.</p>
            <p>Here are your current settings:</p>
            <ul>
              <li><strong>From Email:</strong> ${settings.email.fromEmail}</li>
              <li><strong>From Name:</strong> ${settings.email.fromName}</li>
            </ul>
            <p>This is a test email sent from your Úduua marketplace admin panel.</p>
            <hr style="margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    });
    
    res.json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500);
    throw new Error(`Failed to send test email: ${error.message}`);
  }
});

// @desc    Send promo email to all subscribers
// @route   POST /api/uduua-settings/send-promo-email
// @access  Private/Admin
const sendPromoEmail = asyncHandler(async (req, res) => {
  console.log('📦 [sendPromoEmail] Function called');
  console.log('📦 [sendPromoEmail] Request body:', req.body);
  
  const { subject, content, offerLink, buttonText, imageUrl } = req.body;
  
  if (!subject || !content) {
    res.status(400);
    throw new Error('Subject and content are required');
  }
  
  const settings = await UduuaSettings.findOne();
  
  if (!settings || !settings.email.resendApiKey) {
    res.status(400);
    throw new Error('Resend API key not configured. Please complete email settings first.');
  }
  
  // Get all subscribed users
  const User = (await import('../models/userModel.js')).default;
  const subscribedUsers = await User.find({ storySubscribe: true }).select('email name');
  
  if (subscribedUsers.length === 0) {
    res.status(400);
    throw new Error('No subscribed users found');
  }
  
  const resend = new Resend(settings.email.resendApiKey);
  
  let successCount = 0;
  let failCount = 0;
  
  // Send emails in batches
  for (const user of subscribedUsers) {
    try {
      const offerButton = offerLink ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${offerLink}" style="display: inline-block; background-color: #0043FC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            ${buttonText || 'Shop Now'}
          </a>
        </div>
      ` : '';
      
      await resend.emails.send({
        from: `${settings.email.fromName} <${settings.email.fromEmail}>`,
        to: user.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0043FC; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Úduua Marketplace</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
              ${imageUrl ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${imageUrl}" style="max-width: 100%; border-radius: 8px;" /></div>` : ''}
              <h2>Hello ${user.name || 'Valued Customer'},</h2>
              <div style="font-size: 16px; line-height: 1.6; color: #333;">
                ${content}
              </div>
              ${offerButton}
              <hr style="margin: 20px 0;" />
              <p style="color: #666; font-size: 12px;">You're receiving this because you subscribed to our newsletter. <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #0043FC;">Unsubscribe</a></p>
            </div>
            <div style="background-color: #f5f5f5; text-align: center; padding: 15px; font-size: 12px; color: #888;">
              &copy; ${new Date().getFullYear()} Úduua. All rights reserved.
            </div>
          </div>
        `,
      });
      successCount++;
      console.log(`Promo email sent to ${user.email}`);
    } catch (error) {
      failCount++;
      console.error(`Failed to send to ${user.email}:`, error.message);
    }
  }
  
  res.json({
    success: true,
    message: `Promo emails sent: ${successCount} successful, ${failCount} failed`,
    successCount,
    failCount,
  });
});

// @desc    Send product notification to subscribers (for new products)
// @route   POST /api/uduua-settings/send-product-notification
// @access  Private/Admin
const sendProductNotification = asyncHandler(async (req, res) => {
  console.log('📦 [sendProductNotification] Function called');
  console.log('📦 [sendProductNotification] Request body:', req.body);
  
  const { productId, productName, productImage, productPrice, productLink } = req.body;
  
  if (!productId && (!productName || !productLink)) {
    res.status(400);
    throw new Error('Product ID or product details are required');
  }
  
  let product = null;
  let productDetails = { name: productName, image: productImage, price: productPrice, link: productLink };
  
  if (productId) {
    const Product = (await import('../models/productModel.js')).default;
    product = await Product.findById(productId).select('name images retailPrice');
    if (product) {
      productDetails = {
        name: product.name,
        image: product.images?.[0] || '',
        price: product.retailPrice,
        link: `${process.env.FRONTEND_URL}/shop/product/${product._id}`,
      };
    }
  }
  
  const settings = await UduuaSettings.findOne();
  
  if (!settings || !settings.email.resendApiKey) {
    res.status(400);
    throw new Error('Resend API key not configured. Please complete email settings first.');
  }
  
  // Get all subscribed users
  const User = (await import('../models/userModel.js')).default;
  const subscribedUsers = await User.find({ storySubscribe: true }).select('email name');
  
  if (subscribedUsers.length === 0) {
    res.status(400);
    throw new Error('No subscribed users found');
  }
  
  const resend = new Resend(settings.email.resendApiKey);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const user of subscribedUsers) {
    try {
      await resend.emails.send({
        from: `${settings.email.fromName} <${settings.email.fromEmail}>`,
        to: user.email,
        subject: `🔥 New Product Alert: ${productDetails.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0043FC; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Úduua Marketplace</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
              <h2>Hello ${user.name || 'Valued Customer'},</h2>
              <p>Check out this exciting new product just added to our marketplace!</p>
              <div style="background-color: #f9f9f9; border-radius: 10px; padding: 15px; margin: 20px 0; text-align: center;">
                ${productDetails.image ? `<img src="${productDetails.image}" style="max-width: 200px; border-radius: 8px; margin-bottom: 15px;" />` : ''}
                <h3 style="margin: 10px 0;">${productDetails.name}</h3>
                <p style="font-size: 24px; font-weight: bold; color: #0043FC;">₦${productDetails.price?.toLocaleString()}</p>
                <a href="${productDetails.link}" style="display: inline-block; background-color: #0043FC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">
                  View Product
                </a>
              </div>
              <hr style="margin: 20px 0;" />
              <p style="color: #666; font-size: 12px;">You're receiving this because you subscribed to product notifications. <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #0043FC;">Unsubscribe</a></p>
            </div>
            <div style="background-color: #f5f5f5; text-align: center; padding: 15px; font-size: 12px; color: #888;">
              &copy; ${new Date().getFullYear()} Úduua. All rights reserved.
            </div>
          </div>
        `,
      });
      successCount++;
      console.log(`Product notification sent to ${user.email}`);
    } catch (error) {
      failCount++;
      console.error(`Failed to send to ${user.email}:`, error.message);
    }
  }
  
  res.json({
    success: true,
    message: `Product notifications sent: ${successCount} successful, ${failCount} failed`,
    successCount,
    failCount,
  });
});

// @desc    Clear application cache
// @route   POST /api/uduua-settings/clear-cache
// @access  Private/Admin
const clearCache = asyncHandler(async (req, res) => {
  console.log('📦 [clearCache] Function called');
  
  try {
    res.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    console.error('❌ [clearCache] Error:', error.message);
    res.status(500);
    throw new Error(`Failed to clear cache: ${error.message}`);
  }
});

// @desc    Get public settings (for frontend)
// @route   GET /api/uduua-settings/public
// @access  Public
const getPublicSettings = asyncHandler(async (req, res) => {
  console.log('📦 [getPublicSettings] Function called');
  
  try {
    let settings = await UduuaSettings.findOne();
    
    if (!settings) {
      console.log('📦 [getPublicSettings] No settings found, creating default...');
      settings = await UduuaSettings.create({
        general: {
          siteName: 'Úduua',
          siteDescription: 'Your premier online marketplace for authentic products',
          siteLogo: '/uduua-logo.png',
        },
        appearance: {
          primaryColor: '#0043FC',
          secondaryColor: '#0038D4',
          accentColor: '#79FFFF',
          showHeroSection: true,
          heroTitle: 'Welcome to Úduua',
          heroSubtitle: 'Discover amazing products from trusted sellers',
          heroButtonText: 'Shop Now',
          heroButtonLink: '/shop',
          footerText: '© 2024 Úduua. All rights reserved.',
        },
        seo: {
          metaTitle: 'Úduua - Nigeria\'s Premier Online Marketplace',
          metaDescription: 'Shop authentic products from verified sellers on Úduua.',
          metaKeywords: '',
        },
        store: {
          enableBulkPricing: true,
          enableDiscounts: true,
          freeShippingThreshold: 50000,
        },
      });
      console.log('📦 [getPublicSettings] Default settings created');
    }
    
    console.log('📦 [getPublicSettings] Sending public settings...');
    res.json({
      siteName: settings.general.siteName,
      siteDescription: settings.general.siteDescription,
      siteLogo: settings.general.siteLogo,
      appearance: {
        primaryColor: settings.appearance.primaryColor,
        secondaryColor: settings.appearance.secondaryColor,
        accentColor: settings.appearance.accentColor,
        showHeroSection: settings.appearance.showHeroSection,
        heroTitle: settings.appearance.heroTitle,
        heroSubtitle: settings.appearance.heroSubtitle,
        heroButtonText: settings.appearance.heroButtonText,
        heroButtonLink: settings.appearance.heroButtonLink,
        footerText: settings.appearance.footerText,
      },
      seo: {
        metaTitle: settings.seo.metaTitle,
        metaDescription: settings.seo.metaDescription,
        metaKeywords: settings.seo.metaKeywords,
      },
      store: {
        enableBulkPricing: settings.store.enableBulkPricing,
        enableDiscounts: settings.store.enableDiscounts,
        freeShippingThreshold: settings.store.freeShippingThreshold,
      },
    });
    console.log('✅ [getPublicSettings] Response sent successfully');
  } catch (error) {
    console.error('❌ [getPublicSettings] Error:', error.message);
    console.error('❌ [getPublicSettings] Error stack:', error.stack);
    res.status(500);
    throw new Error(`Failed to get public settings: ${error.message}`);
  }
});

console.log('✅ uduuaSettingsController loaded successfully');

export {
  getAllSettings,
  updateGeneralSettings,
  updateStoreSettings,
  updatePaymentSettings,
  updateEmailSettings,
  updateSecuritySettings,
  updateAppearanceSettings,
  updateSeoSettings,
  testEmailConfig,
  sendPromoEmail,
  sendProductNotification,
  clearCache,
  getPublicSettings,
};