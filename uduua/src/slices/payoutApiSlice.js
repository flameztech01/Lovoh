// slices/payoutApiSlice.js
import { apiSlice } from './apiSlice.js';

const PAYOUTS_URL = '/payouts';

export const payoutApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== ADMIN PAYOUT QUERIES ====================
    
    // Get pending payouts
    getPendingPayouts: builder.query({
      query: ({ page = 1, limit = 20, sellerId }) => ({
        url: `${PAYOUTS_URL}/admin/pending`,
        params: { page, limit, sellerId },
      }),
      providesTags: ['Payouts'],
    }),

    // Get completed payouts
    getCompletedPayouts: builder.query({
      query: ({ page = 1, limit = 20, sellerId, startDate, endDate }) => ({
        url: `${PAYOUTS_URL}/admin/completed`,
        params: { page, limit, sellerId, startDate, endDate },
      }),
      providesTags: ['Payouts'],
    }),

    // Get all payouts with filters
    getAllPayouts: builder.query({
      query: ({ status, page = 1, limit = 20, sellerId, search }) => ({
        url: `${PAYOUTS_URL}/admin/all`,
        params: { status, page, limit, sellerId, search },
      }),
      providesTags: ['Payouts'],
    }),

    // Get payout summary statistics
    getPayoutSummary: builder.query({
      query: () => ({
        url: `${PAYOUTS_URL}/admin/summary`,
      }),
      providesTags: ['Payouts'],
    }),

    // Export payouts to CSV
    exportPayouts: builder.query({
      query: ({ status, startDate, endDate, sellerId }) => ({
        url: `${PAYOUTS_URL}/admin/export`,
        params: { status, startDate, endDate, sellerId },
        responseHandler: (response) => response.text(),
      }),
    }),

    // ==================== ADMIN PAYOUT MUTATIONS ====================
    
    // Process single payout
    processSinglePayout: builder.mutation({
      query: ({ orderId, amount, notes }) => ({
        url: `${PAYOUTS_URL}/admin/process/${orderId}`,
        method: 'POST',
        body: { amount, notes },
      }),
      invalidatesTags: ['Payouts', 'Order'],
    }),

    // Process bulk payouts
    processBulkPayout: builder.mutation({
      query: ({ orderIds, notes }) => ({
        url: `${PAYOUTS_URL}/admin/process-bulk`,
        method: 'POST',
        body: { orderIds, notes },
      }),
      invalidatesTags: ['Payouts', 'Order'],
    }),

    // ==================== SELLER PAYOUT QUERIES ====================
    
    // Get seller's payout history
    getSellerPayoutHistory: builder.query({
      query: ({ page = 1, limit = 20 }) => ({
        url: `${PAYOUTS_URL}/seller/history`,
        params: { page, limit },
      }),
      providesTags: ['SellerPayouts'],
    }),
  }),
});

export const {
  // Admin queries
  useGetPendingPayoutsQuery,
  useGetCompletedPayoutsQuery,
  useGetAllPayoutsQuery,
  useGetPayoutSummaryQuery,
  useExportPayoutsQuery,
  
  // Admin mutations
  useProcessSinglePayoutMutation,
  useProcessBulkPayoutMutation,
  
  // Seller queries
  useGetSellerPayoutHistoryQuery,
} = payoutApiSlice;