// slices/notificationApiSlice.js
import { apiSlice } from './apiSlice';

const NOTIFICATIONS_URL = '/notifications';

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUSH NOTIFICATION PREFERENCES ====================

    // Get current notification preferences
    getNotificationPreferences: builder.query({
      query: () => ({
        url: `${NOTIFICATIONS_URL}/preferences`,
      }),
      providesTags: ['NotificationPreferences'],
    }),

    // Update preferences (and optionally add a device token)
    updateNotificationPreferences: builder.mutation({
      query: (data) => ({
        url: `${NOTIFICATIONS_URL}/preferences`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),

    // Register a device token (if you only want to send tokens without changing prefs)
    registerDevice: builder.mutation({
      query: (data) => ({
        url: `${NOTIFICATIONS_URL}/register`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),

    // ==================== IN-APP NOTIFICATIONS ====================

    // Get list of notifications
    getNotifications: builder.query({
      query: (params) => ({
        url: NOTIFICATIONS_URL,
        params: { page: params?.page, limit: params?.limit },
      }),
      providesTags: ['Notifications'],
    }),

    // Mark single notification as read
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `${NOTIFICATIONS_URL}/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Mark all notifications as read
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: `${NOTIFICATIONS_URL}/read-all`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useRegisterDeviceMutation,
  useGetNotificationsQuery,                // new
  useMarkNotificationReadMutation,         // new
  useMarkAllNotificationsReadMutation,     // new
} = notificationApiSlice;