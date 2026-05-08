// slices/reportApiSlice.js
import { apiSlice } from './apiSlice';

const REPORTS_URL = '/reports';

export const reportApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== REPORT MUTATIONS ====================
    
    // Report a product (verified buyer only)
    reportProduct: builder.mutation({
      query: (data) => ({
        url: `${REPORTS_URL}/product`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Report'],
    }),

    // ==================== SELLER REPORT QUERIES ====================
    
    // Get reports for seller (seller only)
    getSellerReports: builder.query({
      query: ({ status, page = 1, limit = 20 }) => ({
        url: `${REPORTS_URL}/seller`,
        params: { status, page, limit },
      }),
      providesTags: ['Report'],
    }),

    // ==================== ADMIN REPORT QUERIES ====================
    
    // Get all reports (admin only)
    getAllReports: builder.query({
      query: ({ status, page = 1, limit = 20 }) => ({
        url: `${REPORTS_URL}/admin`,
        params: { status, page, limit },
      }),
      providesTags: ['Report'],
    }),

    // Get single report by ID (admin only)
    getReportById: builder.query({
      query: (reportId) => ({
        url: `${REPORTS_URL}/${reportId}`,
      }),
      providesTags: (result, error, reportId) => [{ type: 'Report', id: reportId }],
    }),

    // ==================== ADMIN REPORT MUTATIONS ====================
    
    // Update report status (admin only)
    updateReportStatus: builder.mutation({
      query: ({ reportId, status, adminNotes, refundAmount }) => ({
        url: `${REPORTS_URL}/${reportId}/status`,
        method: 'PUT',
        body: { status, adminNotes, refundAmount },
      }),
      invalidatesTags: (result, error, { reportId }) => [
        { type: 'Report', id: reportId },
        'Report',
      ],
    }),
  }),
});

export const {
  // Report mutations
  useReportProductMutation,
  
  // Seller queries
  useGetSellerReportsQuery,
  
  // Admin queries
  useGetAllReportsQuery,
  useGetReportByIdQuery,
  
  // Admin mutations
  useUpdateReportStatusMutation,
} = reportApiSlice;