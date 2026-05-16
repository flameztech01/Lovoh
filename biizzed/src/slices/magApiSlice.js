// slices/magApiSlice.js – aligned with refactored magRoutes (including user magazines and featured requests)
import { apiSlice } from "./apiSlice";

const MAGAZINE_URL = "/magazine";

export const magApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUBLIC ====================

    getMagazineStats: builder.query({
      query: () => ({
        url: `${MAGAZINE_URL}/stats`,
      }),
      providesTags: ["MagazineStats"],
    }),

    getMagazines: builder.query({
      query: (params) => ({
        url: MAGAZINE_URL,
        params: {
          category: params?.category,
          featured: params?.featured,
          search: params?.search,
          status: params?.status || "published",
          page: params?.page,
          limit: params?.limit,
        },
      }),
      providesTags: ["Magazine"],
    }),

    getMagazineBySlug: builder.query({
      query: (slug) => ({
        url: `${MAGAZINE_URL}/${slug}`,
      }),
      providesTags: (result, error, slug) => [{ type: "Magazine", id: slug }],
    }),

    // ==================== AUTHENTICATED (User specific) ====================

    // Get magazines created by the currently logged‑in user
    getMyMagazines: builder.query({
      query: (params) => ({
        url: `${MAGAZINE_URL}/my-magazines`,
        params: {
          page: params?.page,
          limit: params?.limit,
          status: params?.status, // ← ADD THIS LINE
        },
      }),
      providesTags: ["MyMagazines"],
    }),

    // Get magazines by a specific user ID (public)
    getUserMagazines: builder.query({
      query: ({ userId, page, limit }) => ({
        url: `${MAGAZINE_URL}/user/${userId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { userId }) => [
        { type: "UserMagazines", id: userId },
      ],
    }),

    // ==================== SOCIAL (Protected) ====================

    likeMagazine: builder.mutation({
      query: (id) => ({
        url: `${MAGAZINE_URL}/${id}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Magazine", id }],
    }),

    bookmarkMagazine: builder.mutation({
      query: (id) => ({
        url: `${MAGAZURE_URL}/${id}/bookmark`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Magazine", id }],
    }),

    addMagazineComment: builder.mutation({
      query: ({ id, text, parentCommentId }) => ({
        url: `${MAGAZINE_URL}/${id}/comment`,
        method: "POST",
        body: { text, parentCommentId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Magazine", id }],
    }),

    likeMagazineComment: builder.mutation({
      query: ({ id, commentId, replyId }) => ({
        url: `${MAGAZINE_URL}/${id}/comment/${commentId}/like`,
        method: "POST",
        body: { replyId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Magazine", id }],
    }),

    deleteMagazineComment: builder.mutation({
      query: ({ id, commentId, replyId }) => ({
        url: `${MAGAZINE_URL}/${id}/comment/${commentId}`,
        method: "DELETE",
        body: { replyId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Magazine", id }],
    }),

    getBookmarkedMagazines: builder.query({
      query: () => ({
        url: `${MAGAZINE_URL}/bookmarks/list`,
      }),
      providesTags: ["BookmarkedMagazine"],
    }),

    // ==================== FEATURED REQUESTS ====================

    // User requests their magazine to be featured
    requestFeaturedMagazine: builder.mutation({
      query: (id) => ({
        url: `${MAGAZINE_URL}/${id}/request-featured`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Magazine", id }],
    }),

    // Admin approves a featured request
    approveFeaturedMagazine: builder.mutation({
      query: (id) => ({
        url: `${MAGAZINE_URL}/${id}/approve-featured`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Magazine", id },
        "MagazineStats",
      ],
    }),

    // ==================== ADMIN / OWNER CRUD ====================

    getMagazineById: builder.query({
      query: (id) => ({
        url: `${MAGAZINE_URL}/id/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Magazine", id }],
    }),

    createMagazine: builder.mutation({
      query: (data) => ({
        url: MAGAZINE_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Magazine", "MagazineStats", "MyMagazines"],
    }),

    updateMagazine: builder.mutation({
      query: ({ id, data }) => ({
        url: `${MAGAZINE_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Magazine", id },
        "Magazine",
        "MagazineStats",
        "MyMagazines",
      ],
    }),

    deleteMagazine: builder.mutation({
      query: (id) => ({
        url: `${MAGAZINE_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "Magazine",
        "MagazineStats",
        "BookmarkedMagazine",
        "MyMagazines",
      ],
    }),

    toggleFeaturedMagazine: builder.mutation({
      query: (id) => ({
        url: `${MAGAZINE_URL}/${id}/featured`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Magazine", id },
        "Magazine",
        "MagazineStats",
      ],
    }),
  }),
});

export const {
  // Public
  useGetMagazineStatsQuery,
  useGetMagazinesQuery,
  useGetMagazineBySlugQuery,

  // User specific
  useGetMyMagazinesQuery,
  useGetUserMagazinesQuery,

  // Social
  useLikeMagazineMutation,
  useBookmarkMagazineMutation,
  useAddMagazineCommentMutation,
  useLikeMagazineCommentMutation,
  useDeleteMagazineCommentMutation,
  useGetBookmarkedMagazinesQuery,

  // Featured requests
  useRequestFeaturedMagazineMutation,
  useApproveFeaturedMagazineMutation,

  // CRUD
  useGetMagazineByIdQuery,
  useCreateMagazineMutation,
  useUpdateMagazineMutation,
  useDeleteMagazineMutation,
  useToggleFeaturedMagazineMutation,
} = magApiSlice;
