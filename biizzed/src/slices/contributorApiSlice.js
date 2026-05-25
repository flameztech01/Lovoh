// slices/contributorApiSlice.js
import { apiSlice } from './apiSlice';

const CONTRIBUTOR_URL = '/contributor';

export const contributorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Submit contributor application
    applyContributor: builder.mutation({
      query: (formData) => ({
        url: `${CONTRIBUTOR_URL}/apply`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['ContributorStatus'],
    }),

    // Get own contributor application status
    getContributorStatus: builder.query({
      query: () => ({
        url: `${CONTRIBUTOR_URL}/status`,
      }),
      providesTags: ['ContributorStatus'],
    }),

    // Admin: Get all contributor applications
    getContributorApplications: builder.query({
      query: ({ status } = {}) => ({
        url: `${CONTRIBUTOR_URL}/applications`,
        params: status ? { status } : undefined,
      }),
      providesTags: ['ContributorApplications'],
    }),

    // Admin: Approve application
    approveContributor: builder.mutation({
      query: ({ userId, adminNotes }) => ({
        url: `${CONTRIBUTOR_URL}/approve/${userId}`,
        method: 'PUT',
        body: { adminNotes },
      }),
      invalidatesTags: ['ContributorApplications', 'ContributorStatus'],
    }),

    // Admin: Reject application
    rejectContributor: builder.mutation({
      query: ({ userId, adminNotes }) => ({
        url: `${CONTRIBUTOR_URL}/reject/${userId}`,
        method: 'PUT',
        body: { adminNotes },
      }),
      invalidatesTags: ['ContributorApplications', 'ContributorStatus'],
    }),
  }),
});

export const {
  useApplyContributorMutation,
  useGetContributorStatusQuery,
  useGetContributorApplicationsQuery,
  useApproveContributorMutation,
  useRejectContributorMutation,
} = contributorApiSlice;