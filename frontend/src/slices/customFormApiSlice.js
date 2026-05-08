// slices/customFormApiSlice.js - All renamed to avoid conflicts
import { apiSlice } from './apiSlice';

const FORMS_URL = '/custom-forms';

export const customFormApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUBLIC ====================

    getPublicCustomForm: builder.query({
      query: (slug) => ({
        url: `${FORMS_URL}/public/${slug}`,
      }),
      providesTags: (result, error, slug) => [{ type: 'CustomForm', id: slug }],
    }),

    submitCustomForm: builder.mutation({
      query: ({ slug, data }) => ({
        url: `${FORMS_URL}/public/${slug}/submit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CustomFormSubmission', 'CustomFormAnalytics'],
    }),

    // ==================== USER FORMS CRUD ====================

    getMyCustomForms: builder.query({
      query: (params) => ({
        url: FORMS_URL,
        params: {
          type: params?.type,
          status: params?.status,
          search: params?.search,
          category: params?.category,
          tags: params?.tags,
          page: params?.page,
          limit: params?.limit,
          sort: params?.sort,
        },
      }),
      providesTags: ['CustomForm'],
    }),

    getCustomFormById: builder.query({
      query: (id) => ({
        url: `${FORMS_URL}/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'CustomForm', id }],
    }),

    createCustomForm: builder.mutation({
      query: (data) => ({
        url: FORMS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CustomForm'],
    }),

    updateCustomForm: builder.mutation({
      query: ({ id, data }) => ({
        url: `${FORMS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CustomForm', id },
        'CustomForm',
        'PublicCustomForm',
      ],
    }),

    deleteCustomForm: builder.mutation({
      query: (id) => ({
        url: `${FORMS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CustomForm', 'CustomFormSubmission', 'CustomFormAnalytics'],
    }),

    duplicateCustomForm: builder.mutation({
      query: (id) => ({
        url: `${FORMS_URL}/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['CustomForm'],
    }),

    // ==================== SUBMISSIONS ====================

    getCustomFormSubmissions: builder.query({
      query: ({ id, params }) => ({
        url: `${FORMS_URL}/${id}/submissions`,
        params: {
          page: params?.page,
          limit: params?.limit,
          sort: params?.sort,
          status: params?.status,
          search: params?.search,
        },
      }),
      providesTags: (result, error, { id }) => [{ type: 'CustomFormSubmission', id }],
    }),

    getCustomSubmissionById: builder.query({
      query: ({ id, submissionId }) => ({
        url: `${FORMS_URL}/${id}/submissions/${submissionId}`,
      }),
      providesTags: (result, error, { submissionId }) => [
        { type: 'CustomSubmission', id: submissionId },
      ],
    }),

    deleteCustomSubmission: builder.mutation({
      query: ({ id, submissionId }) => ({
        url: `${FORMS_URL}/${id}/submissions/${submissionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CustomFormSubmission', 'CustomFormAnalytics'],
    }),

    exportCustomSubmissions: builder.query({
      query: (id) => ({
        url: `${FORMS_URL}/${id}/submissions/export`,
        responseHandler: (response) => response.text(),
        cache: 'no-cache',
      }),
      providesTags: (result, error, id) => [{ type: 'CustomFormExport', id }],
    }),

    // ==================== FORM MANAGERS ====================

    addCustomFormManager: builder.mutation({
      query: ({ id, email }) => ({
        url: `${FORMS_URL}/${id}/managers`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'CustomForm', id }],
    }),

    removeCustomFormManager: builder.mutation({
      query: ({ id, userId }) => ({
        url: `${FORMS_URL}/${id}/managers/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'CustomForm', id }],
    }),

    // ==================== ANALYTICS ====================

    getCustomFormAnalytics: builder.query({
      query: (id) => ({
        url: `${FORMS_URL}/${id}/analytics`,
      }),
      providesTags: (result, error, id) => [{ type: 'CustomFormAnalytics', id }],
    }),

    // ==================== ADMIN ====================

    adminGetAllCustomForms: builder.query({
      query: (params) => ({
        url: `${FORMS_URL}/admin/all`,
        params: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
          type: params?.type,
          status: params?.status,
        },
      }),
      providesTags: ['AdminCustomForms'],
    }),
  }),
});

export const {
  // Public
  useGetPublicCustomFormQuery,
  useSubmitCustomFormMutation,

  // Form CRUD
  useGetMyCustomFormsQuery,
  useGetCustomFormByIdQuery,
  useCreateCustomFormMutation,
  useUpdateCustomFormMutation,
  useDeleteCustomFormMutation,
  useDuplicateCustomFormMutation,

  // Submissions
  useGetCustomFormSubmissionsQuery,
  useGetCustomSubmissionByIdQuery,
  useDeleteCustomSubmissionMutation,
  useExportCustomSubmissionsQuery,

  // Managers
  useAddCustomFormManagerMutation,
  useRemoveCustomFormManagerMutation,

  // Analytics
  useGetCustomFormAnalyticsQuery,

  // Admin
  useAdminGetAllCustomFormsQuery,
} = customFormApiSlice;