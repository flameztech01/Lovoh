// slices/reportApiSlice.js
import { apiSlice } from './apiSlice.js';

const REPORTS_URL = '/reports';

export const reportApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== USER REPORT MUTATIONS ====================
    
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
    
    // Get all reports with pagination and filters (admin only)
    getAllReports: builder.query({
      query: ({ status, page = 1, limit = 20 }) => ({
        url: `${REPORTS_URL}/admin`,
        params: { status, page, limit },
      }),
      providesTags: ['Reports'],
    }),

    // Get report statistics for dashboard (admin only)
    getReportStats: builder.query({
      query: () => ({
        url: `${REPORTS_URL}/admin/stats`,
        method: 'GET',
      }),
      providesTags: ['Reports'],
    }),

    // Get single report by ID (admin only)
    getReportById: builder.query({
      query: (reportId) => ({
        url: `${REPORTS_URL}/admin/${reportId}`,
        method: 'GET',
      }),
      providesTags: (result, error, reportId) => [{ type: 'Reports', id: reportId }],
    }),

    // ==================== ADMIN REPORT MUTATIONS ====================
    
    // Update report status (investigating, resolved, dismissed)
    updateReportStatus: builder.mutation({
      query: ({ reportId, status, adminNotes, refundAmount }) => ({
        url: `${REPORTS_URL}/admin/${reportId}/status`,
        method: 'PUT',
        body: { status, adminNotes, refundAmount },
      }),
      invalidatesTags: ['Reports'],
    }),

    // Delete a report (admin only)
    deleteReport: builder.mutation({
      query: (reportId) => ({
        url: `${REPORTS_URL}/admin/${reportId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reports'],
    }),

    // Bulk update report status (admin only)
    bulkUpdateReportStatus: builder.mutation({
      query: ({ reportIds, status, adminNotes }) => ({
        url: `${REPORTS_URL}/admin/bulk-update`,
        method: 'PUT',
        body: { reportIds, status, adminNotes },
      }),
      invalidatesTags: ['Reports'],
    }),
  }),
});

export const {
  // User mutations
  useReportProductMutation,
  
  // Seller queries
  useGetSellerReportsQuery,
  
  // Admin queries
  useGetAllReportsQuery,
  useGetReportStatsQuery,
  useGetReportByIdQuery,
  
  // Admin mutations
  useUpdateReportStatusMutation,
  useDeleteReportMutation,
  useBulkUpdateReportStatusMutation,
} = reportApiSlice;