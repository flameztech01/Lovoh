// slices/formApiSlice.js (Frontend RTK Query)
import { apiSlice } from './apiSlice';

const FORMS_URL = '/forms';

export const formApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Submit any form (public)
    submitForm: builder.mutation({
      query: (data) => ({
        url: `${FORMS_URL}/submit`,
        method: 'POST',
        body: data,
      }),
    }),

    // Admin endpoints
    getAllFormSubmissions: builder.query({
      query: (params) => ({
        url: FORMS_URL,
        params: {
          formType: params?.formType,
          status: params?.status,
          read: params?.read,
          search: params?.search,
          page: params?.page,
          limit: params?.limit,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      }),
      providesTags: ['FormSubmission'],
    }),

    getFormStats: builder.query({
      query: () => ({
        url: `${FORMS_URL}/stats`,
      }),
      providesTags: ['FormSubmission'],
    }),

    getFormSubmissionById: builder.query({
      query: (id) => ({
        url: `${FORMS_URL}/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'FormSubmission', id }],
    }),

    updateFormStatus: builder.mutation({
      query: ({ id, status, adminNotes }) => ({
        url: `${FORMS_URL}/${id}/status`,
        method: 'PUT',
        body: { status, adminNotes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'FormSubmission', id },
        'FormSubmission',
      ],
    }),

    markAsRead: builder.mutation({
      query: ({ id, read }) => ({
        url: `${FORMS_URL}/${id}/read`,
        method: 'PUT',
        body: { read },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'FormSubmission', id },
        'FormSubmission',
      ],
    }),

    deleteFormSubmission: builder.mutation({
      query: (id) => ({
        url: `${FORMS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FormSubmission'],
    }),

    bulkDeleteFormSubmissions: builder.mutation({
      query: (ids) => ({
        url: `${FORMS_URL}/bulk-delete`,
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['FormSubmission'],
    }),

    bulkUpdateStatus: builder.mutation({
      query: ({ ids, status }) => ({
        url: `${FORMS_URL}/bulk-status`,
        method: 'POST',
        body: { ids, status },
      }),
      invalidatesTags: ['FormSubmission'],
    }),
  }),
});

export const {
  useSubmitFormMutation,
  useGetAllFormSubmissionsQuery,
  useGetFormStatsQuery,
  useGetFormSubmissionByIdQuery,
  useUpdateFormStatusMutation,
  useMarkAsReadMutation,
  useDeleteFormSubmissionMutation,
  useBulkDeleteFormSubmissionsMutation,
  useBulkUpdateStatusMutation,
} = formApiSlice;