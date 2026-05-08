// slices/sellerApiSlice.js
import { apiSlice } from './apiSlice';

const SELLER_URL = '/seller';

export const sellerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== SELLER APPLICATION ====================
    
    // Apply to become a seller
    applyForSeller: builder.mutation({
      query: (data) => ({
        url: `${SELLER_URL}/apply`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SellerApplication'],
    }),

    // Get seller application status for logged-in user
    getSellerApplicationStatus: builder.query({
      query: () => ({
        url: `${SELLER_URL}/application-status`,
      }),
      providesTags: ['SellerApplication'],
    }),

    // Get seller dashboard stats
    getSellerDashboard: builder.query({
      query: () => ({
        url: `${SELLER_URL}/dashboard`,
      }),
      providesTags: ['SellerDashboard', 'Order', 'Product'],
    }),

    // Update seller bank account
    updateBankAccount: builder.mutation({
      query: (data) => ({
        url: `${SELLER_URL}/bank-account`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SellerApplication'],
    }),

    // ==================== ADMIN SELLER MANAGEMENT ====================
    
    // Get all seller applications (admin only)
    getSellerApplications: builder.query({
      query: ({ status, page = 1, limit = 20 }) => ({
        url: `${SELLER_URL}/applications`,
        params: { status, page, limit },
      }),
      providesTags: ['SellerApplication'],
    }),

    // Get seller application by ID (admin only)
    getSellerApplicationById: builder.query({
      query: (userId) => ({
        url: `${SELLER_URL}/application/${userId}`,
      }),
      providesTags: (result, error, userId) => [{ type: 'SellerApplication', id: userId }],
    }),

    // Approve seller application (admin only)
    approveSeller: builder.mutation({
      query: (userId) => ({
        url: `${SELLER_URL}/approve/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['SellerApplication', 'User'],
    }),

    // Reject seller application (admin only)
    rejectSeller: builder.mutation({
      query: ({ userId, reason }) => ({
        url: `${SELLER_URL}/reject/${userId}`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['SellerApplication', 'User'],
    }),
  }),
});

export const {
  // Seller application
  useApplyForSellerMutation,
  useGetSellerApplicationStatusQuery,
  useGetSellerDashboardQuery,
  useUpdateBankAccountMutation,
  
  // Admin seller management
  useGetSellerApplicationsQuery,
  useGetSellerApplicationByIdQuery,
  useApproveSellerMutation,
  useRejectSellerMutation,
} = sellerApiSlice;