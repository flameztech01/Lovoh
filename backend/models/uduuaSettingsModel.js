// models/uduuaSettingsModel.js
import mongoose from 'mongoose';

const uduuaSettingsSchema = mongoose.Schema(
  {
    general: {
      siteName: { type: String, default: 'Úduua' },
      siteDescription: { type: String, default: 'Your premier online marketplace for authentic products' },
      siteLogo: { type: String, default: '/uduua-logo.png' },
      siteFavicon: { type: String, default: '/favicon.ico' },
      contactEmail: { type: String, default: 'support@uduua.com' },
      contactPhone: { type: String, default: '+234 800 000 0000' },
      address: { type: String, default: 'Lagos, Nigeria' },
      timezone: { type: String, default: 'Africa/Lagos' },
      currency: { type: String, default: 'NGN' },
    },
    store: {
      enablePreorder: { type: Boolean, default: true },
      enableBackorder: { type: Boolean, default: false },
      maxQuantityPerOrder: { type: Number, default: 50 },
      defaultShippingDays: { type: Number, default: 3 },
      freeShippingThreshold: { type: Number, default: 50000 },
      shippingFee: { type: Number, default: 3000 },
      enableBulkPricing: { type: Boolean, default: true },
      enableDiscounts: { type: Boolean, default: true },
    },
    payment: {
      paystackPublicKey: { type: String, default: '' },
      paystackSecretKey: { type: String, default: '' },
      paystackEnabled: { type: Boolean, default: true },
      payOnDeliveryEnabled: { type: Boolean, default: true },
      payOnlineEnabled: { type: Boolean, default: true },
      platformFeePercentage: { type: Number, default: 6 },
      sellerPayoutPercentage: { type: Number, default: 94 },
      minimumWithdrawal: { type: Number, default: 10000 },
    },
    email: {
      // Resend API (new)
      resendApiKey: { type: String, default: '' },
      fromEmail: { type: String, default: 'noreply@uduua.com' },
      fromName: { type: String, default: 'Úduua Marketplace' },
      orderConfirmationEnabled: { type: Boolean, default: true },
      orderStatusEnabled: { type: Boolean, default: true },
      welcomeEmailEnabled: { type: Boolean, default: true },
      newsletterEnabled: { type: Boolean, default: true },
      promoEmailEnabled: { type: Boolean, default: true },
      // Legacy SMTP fields (keep for backward compatibility, but not used)
      smtpHost: { type: String, default: '' },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: '' },
      smtpPassword: { type: String, default: '' },
      smtpSecure: { type: Boolean, default: true },
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 60 }, // minutes
      maxLoginAttempts: { type: Number, default: 5 },
      lockoutMinutes: { type: Number, default: 30 },
      minPasswordLength: { type: Number, default: 6 },
      otpExpiryMinutes: { type: Number, default: 10 },
      resetTokenExpiry: { type: Number, default: 10 }, // minutes
      passwordExpiryDays: { type: Number, default: 90 },
      requireEmailVerification: { type: Boolean, default: true },
      requirePhoneVerification: { type: Boolean, default: false },
      enableCaptcha: { type: Boolean, default: true },
      adminEmailNotifications: { type: Boolean, default: true },
    },
    appearance: {
      primaryColor: { type: String, default: '#0043FC' },
      secondaryColor: { type: String, default: '#0038D4' },
      accentColor: { type: String, default: '#79FFFF' },
      darkModeEnabled: { type: Boolean, default: false },
      showHeroSection: { type: Boolean, default: true },
      heroTitle: { type: String, default: 'Welcome to Úduua' },
      heroSubtitle: { type: String, default: 'Discover amazing products from trusted sellers' },
      heroButtonText: { type: String, default: 'Shop Now' },
      heroButtonLink: { type: String, default: '/shop' },
      footerText: { type: String, default: '© 2024 Úduua. All rights reserved.' },
    },
    seo: {
      metaTitle: { type: String, default: 'Úduua - Nigeria\'s Premier Online Marketplace' },
      metaDescription: { type: String, default: 'Shop authentic products from verified sellers on Úduua. Best prices, secure payments, and fast delivery.' },
      metaKeywords: { type: String, default: 'marketplace, ecommerce, shopping, Nigeria, online store' },
      googleAnalyticsId: { type: String, default: '' },
      facebookPixelId: { type: String, default: '' },
      enableSitemap: { type: Boolean, default: true },
      robotsTxt: { type: String, default: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout/' },
    },
  },
  {
    timestamps: true,
  }
);

const UduuaSettings = mongoose.model('UduuaSettings', uduuaSettingsSchema);
export default UduuaSettings;