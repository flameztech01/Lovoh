// slices/subscribeApiSlice.js
import { apiSlice } from "./apiSlice";

const SUBSCRIBE_URL = "/subscribe";

export const subscribeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== Public endpoints ====================
    
    // Subscribe (or update preferences)
    subscribe: builder.mutation({
      query: (data) => ({
        url: SUBSCRIBE_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscriber"],
    }),

    // Unsubscribe
    unsubscribe: builder.mutation({
      query: (data) => ({
        url: `${SUBSCRIBE_URL}/unsubscribe`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscriber"],
    }),

    // Get subscription status by email
    getSubscriptionStatus: builder.query({
      query: (email) => ({
        url: `${SUBSCRIBE_URL}/status`,
        params: { email },
      }),
      providesTags: ["Subscriber"],
    }),

    // ==================== Admin endpoints ====================
    
    // Legacy: get only active subscribers
    getSubscribers: builder.query({
      query: (params) => ({
        url: `${SUBSCRIBE_URL}/subscribers`,
        params: {
          page: params?.page,
          limit: params?.limit,
        },
      }),
      providesTags: ["Subscriber"],
    }),

    // NEW: get ALL subscribers (active + inactive) with pagination, search & status filter
    getAllSubscribers: builder.query({
      query: (params) => ({
        url: `${SUBSCRIBE_URL}/admin/all`,
        params: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
          status: params?.status, // 'active', 'inactive', or 'all'
        },
      }),
      providesTags: ["Subscriber"],
    }),

    // NEW: Admin force unsubscribe (soft delete)
    adminUnsubscribe: builder.mutation({
      query: (data) => ({
        url: `${SUBSCRIBE_URL}/admin/unsubscribe`,
        method: "POST",
        body: data, // { email: "user@example.com" }
      }),
      invalidatesTags: ["Subscriber"],
    }),

    // Send weekly digest manually
    sendWeeklyDigest: builder.mutation({
      query: (data) => ({
        url: `${SUBSCRIBE_URL}/send-digest`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  // Public
  useSubscribeMutation,
  useUnsubscribeMutation,
  useGetSubscriptionStatusQuery,

  // Admin
  useGetSubscribersQuery,         // active only (legacy)
  useGetAllSubscribersQuery,      // all with filters
  useAdminUnsubscribeMutation,
  useSendWeeklyDigestMutation,
} = subscribeApiSlice;