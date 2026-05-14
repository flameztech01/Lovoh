// slices/magApiSlice.js – aligned with refactored magRoutes (no subscription endpoints)
import { apiSlice } from './apiSlice';

const MAGAZINE_URL = '/magazine';

export const magApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUBLIC ====================

    // Get magazine stats
    getMagazineStats: builder.query({
      query: () => ({
        url: `${MAGAZINE_URL}/stats`,
      }),
      providesTags: ['MagazineStats'],
    }),

    // Get all magazines
    getMagazines: builder.query({
      query: (params) => ({
        url: MAGAZINE_URL,
        params: {
          category: params?.category,
          featured: params?.featured,
          search: params?.search,
          status: params?.status || 'published',
          page: params?.page,
          limit: params?.limit,
        },
      }),
      providesTags: ['Magazine'],
    }),

    // Get single magazine by slug
    getMagazineBySlug: builder.query({
      query: (slug) => ({
        url: `${MAGAZINE_URL}/${slug}`,
      }),
      providesTags: (result, error, slug) => [{ type: 'Magazine', id: slug }],
    }),

    // ==================== SOCIAL (Protected) ====================

    // Like/Unlike magazine
    likeMagazine: builder.mutation({
      query: (id) => ({
        url: `${MAGAZINE_URL}/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Magazine', id }],
    }),

    // Bookmark/Unbookmark magazine
    bookmarkMagazine: builder.mutation({
      query: (id) => ({
        url: `${MAGAZINE_URL}/${id}/bookmark`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Magazine', id }],
    }),

    // Add comment or reply
    addMagazineComment: builder.mutation({
      query: ({ id, text, parentCommentId }) => ({
        url: `${MAGAZINE_URL}/${id}/comment`,
        method: 'POST',
        body: { text, parentCommentId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Magazine', id }],
    }),

    // Like/Unlike comment or reply
    likeMagazineComment: builder.mutation({
      query: ({ id, commentId, replyId }) => ({
        url: `${MAGAZINE_URL}/${id}/comment/${commentId}/like`,
        method: 'POST',
        body: { replyId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Magazine', id }],
    }),

    // Delete comment or reply
    deleteMagazineComment: builder.mutation({
      query: ({ id, commentId, replyId }) => ({
        url: `${MAGAZINE_URL}/${id}/comment/${commentId}`,
        method: 'DELETE',
        body: { replyId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Magazine', id }],
    }),

    // Get user's bookmarked magazines
    getBookmarkedMagazines: builder.query({
      query: () => ({
        url: `${MAGAZINE_URL}/bookmarks/list`,
      }),
      providesTags: ['BookmarkedMagazine'],
    }),

    // ==================== ADMIN ====================

    // Get magazine by ID
    getMagazineById: builder.query({
      query: (id) => ({
        url: `${MAGAZINE_URL}/id/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Magazine', id }],
    }),

    // Create magazine
    createMagazine: builder.mutation({
      query: (data) => ({
        url: MAGAZINE_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Magazine', 'MagazineStats'],
    }),

    // Update magazine
    updateMagazine: builder.mutation({
      query: ({ id, data }) => ({
        url: `${MAGAZINE_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Magazine', id },
        'Magazine',
        'MagazineStats',
      ],
    }),

    // Delete magazine
    deleteMagazine: builder.mutation({
      query: (id) => ({
        url: `${MAGAZINE_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Magazine', 'MagazineStats', 'BookmarkedMagazine'],
    }),

    // Toggle featured
    toggleFeaturedMagazine: builder.mutation({
      query: (id) => ({
        url: `${MAGAZINE_URL}/${id}/featured`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Magazine', id },
        'Magazine',
        'MagazineStats',
      ],
    }),
  }),
});

export const {
  useGetMagazineStatsQuery,
  useGetMagazinesQuery,
  useGetMagazineBySlugQuery,
  useLikeMagazineMutation,
  useBookmarkMagazineMutation,
  useAddMagazineCommentMutation,
  useLikeMagazineCommentMutation,
  useDeleteMagazineCommentMutation,
  useGetBookmarkedMagazinesQuery,
  useGetMagazineByIdQuery,
  useCreateMagazineMutation,
  useUpdateMagazineMutation,
  useDeleteMagazineMutation,
  useToggleFeaturedMagazineMutation,
} = magApiSlice;