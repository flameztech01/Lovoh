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

    // ==================== WEB‑PUSH SUBSCRIPTION ====================

    // Subscribe to web‑push
    subscribeToPush: builder.mutation({
      query: (data) => ({
        url: `${NOTIFICATIONS_URL}/subscribe`,
        method: 'POST',
        body: data,   // expects { subscription }
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),

    // Unsubscribe from web‑push
    unsubscribeFromPush: builder.mutation({
      query: () => ({
        url: `${NOTIFICATIONS_URL}/unsubscribe`,
        method: 'POST',
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
  useSubscribeToPushMutation,          // new – subscribe
  useUnsubscribeFromPushMutation,      // new – unsubscribe
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApiSlice;