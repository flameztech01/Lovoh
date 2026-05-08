// slices/subscribeApiSlice.js
import { apiSlice } from "./apiSlice";

const SUBSCRIBE_URL = "/subscribe";

export const subscribeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Subscribe (or update preferences) - public
    subscribe: builder.mutation({
      query: (data) => ({
        url: SUBSCRIBE_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscriber"],
    }),

    // Unsubscribe - public
    unsubscribe: builder.mutation({
      query: (data) => ({
        url: `${SUBSCRIBE_URL}/unsubscribe`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscriber"],
    }),

    // Get all subscribers (Admin only)
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

    // Send weekly digest manually (Admin only)
    sendWeeklyDigest: builder.mutation({
      query: (data) => ({
        url: `${SUBSCRIBE_URL}/send-digest`,
        method: "POST",
        body: data,
      }),
    }),
    getSubscriptionStatus: builder.query({
      query: (email) => ({
        url: `${SUBSCRIBE_URL}/status`,
        params: { email },
      }),
      providesTags: ["Subscriber"],
    }),
  }),
});

export const {
  useSubscribeMutation,
  useUnsubscribeMutation,
  useGetSubscribersQuery,
  useSendWeeklyDigestMutation,
  useGetSubscriptionStatusQuery,
} = subscribeApiSlice;
