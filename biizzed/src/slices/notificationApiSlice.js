// slices/notificationApiSlice.js
import { apiSlice } from './apiSlice';

const NOTIFICATIONS_URL = '/notifications';

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PREFERENCES ====================

    // Get current notification preferences
    getNotificationPreferences: builder.query({
      query: () => ({
        url: `${NOTIFICATIONS_URL}/preferences`,
      }),
      providesTags: ['NotificationPreferences'],
    }),

    // Update preferences (and optionally store a push subscription)
    updateNotificationPreferences: builder.mutation({
      query: (data) => ({
        url: `${NOTIFICATIONS_URL}/preferences`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),

    // ==================== PUSH SUBSCRIPTION (Web + Capacitor) ====================

    // Subscribe to push notifications (handles both web and native)
    subscribeToPush: builder.mutation({
      query: (data) => {
        // For web push: data = { subscription }
        // For native push: data = { token, platform, deviceId }
        
        let requestBody = {};
        
        if (data.subscription) {
          // Web push subscription object
          requestBody = {
            type: 'web',
            subscription: data.subscription,
          };
        } else if (data.token) {
          // Native (Capacitor) push token
          requestBody = {
            type: 'native',
            token: data.token,
            platform: data.platform || 'unknown',
            deviceId: data.deviceId,
          };
        } else {
          // Legacy support
          requestBody = data;
        }
        
        return {
          url: `${NOTIFICATIONS_URL}/subscribe`,
          method: 'POST',
          body: requestBody,
        };
      },
      invalidatesTags: ['NotificationPreferences'],
    }),

    // Unsubscribe from push notifications (handles both web and native)
    unsubscribeFromPush: builder.mutation({
      query: (data) => ({
        url: `${NOTIFICATIONS_URL}/unsubscribe`,
        method: 'POST',
        body: data, // Optional: { type, token } to specify which subscription to remove
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),

    // ==================== IN‑APP NOTIFICATIONS ====================

    // Get list of notifications
    getNotifications: builder.query({
      query: (params) => ({
        url: NOTIFICATIONS_URL,
        params: { page: params?.page, limit: params?.limit },
      }),
      providesTags: ['Notifications'],
    }),

    // Get unread count
    getUnreadCount: builder.query({
      query: () => ({
        url: `${NOTIFICATIONS_URL}/unread-count`,
      }),
      providesTags: ['Notifications'],
    }),

    // Mark single notification as read
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `${NOTIFICATIONS_URL}/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),

    // Mark all notifications as read
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: `${NOTIFICATIONS_URL}/read-all`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),

    // Delete notification
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `${NOTIFICATIONS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),

    // Clear all notifications
    clearAllNotifications: builder.mutation({
      query: () => ({
        url: `${NOTIFICATIONS_URL}/clear-all`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),
  }),
});

export const {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useSubscribeToPushMutation,
  useUnsubscribeFromPushMutation,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
} = notificationApiSlice;