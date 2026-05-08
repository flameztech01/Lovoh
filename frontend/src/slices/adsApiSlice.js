// slices/adsApiSlice.js
import { apiSlice } from './apiSlice';

const ADS_URL = '/ads';

export const adsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUBLIC ENDPOINTS ====================
    
    // Get ads for a specific page and placement
    getAds: builder.query({
      query: (params) => ({
        url: ADS_URL,
        params: {
          page: params?.page,
          placement: params?.placement,
          limit: params?.limit || 10,
          supportsImage: params?.supportsImage !== false,
          supportsVideo: params?.supportsVideo || false,
        },
      }),
      providesTags: ['Ad'],
    }),

    // Track ad click
    trackAdClick: builder.mutation({
      query: (id) => ({
        url: `${ADS_URL}/${id}/click`,
        method: 'POST',
      }),
    }),

    // Track ad view
    trackAdView: builder.mutation({
      query: (id) => ({
        url: `${ADS_URL}/${id}/view`,
        method: 'POST',
      }),
    }),

    // ==================== ADMIN ENDPOINTS ====================
    
    // Get all ads (admin)
    getAllAds: builder.query({
      query: (params) => ({
        url: `${ADS_URL}/admin/all`,
        params: {
          pageName: params?.pageName,
          placement: params?.placement,
          status: params?.status,
          mediaType: params?.mediaType,
          search: params?.search,
          page: params?.page,
          limit: params?.limit,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      }),
      providesTags: ['Ad'],
    }),

    // Get ad statistics (admin)
    getAdStats: builder.query({
      query: () => ({
        url: `${ADS_URL}/stats`,
      }),
      providesTags: ['Ad'],
    }),

    // Get single ad by ID (admin)
    getAdById: builder.query({
      query: (id) => ({
        url: `${ADS_URL}/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Ad', id }],
    }),

    // Create new ad (admin)
    createAd: builder.mutation({
      query: (data) => ({
        url: ADS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Ad'],
    }),

    // Update ad (admin)
    updateAd: builder.mutation({
      query: ({ id, data }) => ({
        url: `${ADS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Ad', id },
        'Ad',
      ],
    }),

    // Delete ad (admin)
    deleteAd: builder.mutation({
      query: (id) => ({
        url: `${ADS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Ad'],
    }),

    // Update ad status (admin)
    updateAdStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `${ADS_URL}/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Ad', id },
        'Ad',
      ],
    }),

    // Bulk delete ads (admin)
    bulkDeleteAds: builder.mutation({
      query: (ids) => ({
        url: `${ADS_URL}/bulk-delete`,
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['Ad'],
    }),

    // Bulk update status (admin)
    bulkUpdateStatus: builder.mutation({
      query: ({ ids, status }) => ({
        url: `${ADS_URL}/bulk-status`,
        method: 'POST',
        body: { ids, status },
      }),
      invalidatesTags: ['Ad'],
    }),
  }),
});

export const {
  // Public
  useGetAdsQuery,
  useTrackAdClickMutation,
  useTrackAdViewMutation,
  // Admin
  useGetAllAdsQuery,
  useGetAdStatsQuery,
  useGetAdByIdQuery,
  useCreateAdMutation,
  useUpdateAdMutation,
  useDeleteAdMutation,
  useUpdateAdStatusMutation,
  useBulkDeleteAdsMutation,
  useBulkUpdateStatusMutation,
} = adsApiSlice;