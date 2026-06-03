// slices/notificationApiSlice.js (updated for OneSignal)
import { apiSlice } from './apiSlice';

const NOTIFICATIONS_URL = '/notifications';

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PREFERENCES ====================
    getNotificationPreferences: builder.query({
      query: () => ({
        url: `${NOTIFICATIONS_URL}/preferences`,
      }),
      providesTags: ['NotificationPreferences'],
    }),

    updateNotificationPreferences: builder.mutation({
      query: (data) => ({
        url: `${NOTIFICATIONS_URL}/preferences`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),

    // ==================== PUSH SUBSCRIPTION (Web + OneSignal) ====================
    subscribeToPush: builder.mutation({
      query: (data) => {
        let requestBody = {};
        
        if (data.subscription) {
          // Web push subscription object
          requestBody = {
            type: 'web',
            subscription: data.subscription,
          };
        } else if (data.token) {
          // OneSignal (or native) push token
          requestBody = {
            type: 'onesignal', // or 'native'
            token: data.token,
            platform: data.platform || 'unknown',
            service: data.service || 'onesignal',
          };
        } else {
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

    // Unsubscribe from push notifications
    unsubscribeFromPush: builder.mutation({
      query: (data) => ({
        url: `${NOTIFICATIONS_URL}/unsubscribe`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),

    // ==================== IN‑APP NOTIFICATIONS ====================
    getNotifications: builder.query({
      query: (params) => ({
        url: NOTIFICATIONS_URL,
        params: { page: params?.page, limit: params?.limit },
      }),
      providesTags: ['Notifications'],
    }),

    getUnreadCount: builder.query({
      query: () => ({
        url: `${NOTIFICATIONS_URL}/unread-count`,
      }),
      providesTags: ['Notifications'],
    }),

    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `${NOTIFICATIONS_URL}/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),

    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: `${NOTIFICATIONS_URL}/read-all`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),

    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `${NOTIFICATIONS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),

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