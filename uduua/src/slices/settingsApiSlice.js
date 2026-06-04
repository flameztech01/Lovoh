// slices/settingsApiSlice.js
import { apiSlice } from './apiSlice.js';

const SETTINGS_URL = '/uduua-settings';

export const settingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all settings
    getSettings: builder.query({
      query: () => ({
        url: SETTINGS_URL,
        method: 'GET',
      }),
      providesTags: ['Settings'],
    }),
    
    // Get public settings
    getPublicSettings: builder.query({
      query: () => ({
        url: `${SETTINGS_URL}/public`,
        method: 'GET',
      }),
      providesTags: ['Settings'],
    }),
    
    // Update general settings
    updateGeneralSettings: builder.mutation({
      query: (data) => ({
        url: `${SETTINGS_URL}/general`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    // Update store settings
    updateStoreSettings: builder.mutation({
      query: (data) => ({
        url: `${SETTINGS_URL}/store`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    // Update payment settings
    updatePaymentSettings: builder.mutation({
      query: (data) => ({
        url: `${SETTINGS_URL}/payment`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    // Update email settings
    updateEmailSettings: builder.mutation({
      query: (data) => ({
        url: `${SETTINGS_URL}/email`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    // Update security settings
    updateSecuritySettings: builder.mutation({
      query: (data) => ({
        url: `${SETTINGS_URL}/security`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    // Update appearance settings
    updateAppearanceSettings: builder.mutation({
      query: (data) => ({
        url: `${SETTINGS_URL}/appearance`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    // Update SEO settings
    updateSeoSettings: builder.mutation({
      query: (data) => ({
        url: `${SETTINGS_URL}/seo`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    // Test email configuration
    testEmailConfig: builder.mutation({
      query: (data) => ({
        url: `${SETTINGS_URL}/test-email`,
        method: 'POST',
        body: data,
      }),
    }),
    
    // ==================== OPTIONAL: NEW EMAIL ENDPOINTS ====================
    
    // Send promo email to all subscribers
    sendPromoEmail: builder.mutation({
      query: (data) => ({
        url: `${SETTINGS_URL}/send-promo-email`,
        method: 'POST',
        body: data,
      }),
    }),
    
    // Send product notification to all subscribers
    sendProductNotification: builder.mutation({
      query: (data) => ({
        url: `${SETTINGS_URL}/send-product-notification`,
        method: 'POST',
        body: data,
      }),
    }),
    
    // Clear cache
    clearCache: builder.mutation({
      query: () => ({
        url: `${SETTINGS_URL}/clear-cache`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useGetPublicSettingsQuery,
  useUpdateGeneralSettingsMutation,
  useUpdateStoreSettingsMutation,
  useUpdatePaymentSettingsMutation,
  useUpdateEmailSettingsMutation,
  useUpdateSecuritySettingsMutation,
  useUpdateAppearanceSettingsMutation,
  useUpdateSeoSettingsMutation,
  useTestEmailConfigMutation,
  useSendPromoEmailMutation,        // Optional: new
  useSendProductNotificationMutation, // Optional: new
  useClearCacheMutation,
} = settingsApiSlice;