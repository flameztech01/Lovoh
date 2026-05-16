// slices/articlesApiSlice.js – With user articles and featured requests
import { apiSlice } from './apiSlice';

const ARTICLES_URL = '/articles';

export const articlesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUBLIC ====================
    
    getArticles: builder.query({
      query: (params) => ({
        url: ARTICLES_URL,
        params: {
          category: params?.category,
          featured: params?.featured,
          editorsPick: params?.editorsPick,
          search: params?.search,
          status: params?.status || 'published,coming_soon',
          page: params?.page,
          limit: params?.limit,
          sort: params?.sort,
        },
      }),
      providesTags: ['Article'],
    }),

    getArticleBySlug: builder.query({
      query: (slug) => ({
        url: `${ARTICLES_URL}/slug/${slug}`,
      }),
      providesTags: (result, error, slug) => [{ type: 'Article', id: slug }],
    }),

    getArticleCategories: builder.query({
      query: () => ({
        url: `${ARTICLES_URL}/categories`,
      }),
      providesTags: ['ArticleCategories'],
    }),

    // ==================== AUTHENTICATED (User specific) ====================

   getMyArticles: builder.query({
  query: (params) => ({
    url: `${ARTICLES_URL}/my-articles`,
    params: {
      page: params?.page,
      limit: params?.limit,
      status: params?.status, // ← ADD THIS
    },
  }),
  providesTags: ['MyArticles'],
}),

    getUserArticles: builder.query({
      query: ({ userId, page, limit }) => ({
        url: `${ARTICLES_URL}/user/${userId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { userId }) => [{ type: 'UserArticles', id: userId }],
    }),

    // ==================== CRUD (Protected) ====================

    createArticle: builder.mutation({
      query: (data) => ({
        url: ARTICLES_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Article', 'ArticleCategories', 'MyArticles'],
    }),

    getArticleById: builder.query({
      query: (id) => ({
        url: `${ARTICLES_URL}/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Article', id }],
    }),

    updateArticle: builder.mutation({
      query: ({ id, data }) => ({
        url: `${ARTICLES_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Article', id },
        'Article',
        'ArticleCategories',
        'MyArticles',
      ],
    }),

    deleteArticle: builder.mutation({
      query: (id) => ({
        url: `${ARTICLES_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Article', 'ArticleCategories', 'BookmarkedArticle', 'MyArticles'],
    }),

    // ==================== SOCIAL (Protected) ====================

    likeArticle: builder.mutation({
      query: (id) => ({
        url: `${ARTICLES_URL}/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }],
    }),

    bookmarkArticle: builder.mutation({
      query: (id) => ({
        url: `${ARTICLES_URL}/${id}/bookmark`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }],
    }),

    addArticleComment: builder.mutation({
      query: ({ id, text, parentCommentId }) => ({
        url: `${ARTICLES_URL}/${id}/comment`,
        method: 'POST',
        body: { text, parentCommentId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Article', id }],
    }),

    likeArticleComment: builder.mutation({
      query: ({ id, commentId, replyId }) => ({
        url: `${ARTICLES_URL}/${id}/comment/${commentId}/like`,
        method: 'POST',
        body: { replyId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Article', id }],
    }),

    deleteArticleComment: builder.mutation({
      query: ({ id, commentId, replyId }) => ({
        url: `${ARTICLES_URL}/${id}/comment/${commentId}`,
        method: 'DELETE',
        body: { replyId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Article', id }],
    }),

    getBookmarkedArticles: builder.query({
      query: () => ({
        url: `${ARTICLES_URL}/bookmarks/my`,
      }),
      providesTags: ['BookmarkedArticle'],
    }),

    // ==================== FEATURED REQUESTS ====================

    requestFeaturedArticle: builder.mutation({
      query: (id) => ({
        url: `${ARTICLES_URL}/${id}/request-featured`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }],
    }),

    approveFeaturedArticle: builder.mutation({
      query: (id) => ({
        url: `${ARTICLES_URL}/${id}/approve-featured`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }, 'Article'],
    }),

    // ==================== ADMIN ACTIONS (direct toggle) ====================

    toggleArticleFeatured: builder.mutation({
      query: (id) => ({
        url: `${ARTICLES_URL}/${id}/featured`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Article', id },
        'Article',
      ],
    }),

    toggleEditorsPick: builder.mutation({
      query: (id) => ({
        url: `${ARTICLES_URL}/${id}/editors-pick`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Article', id },
        'Article',
      ],
    }),
  }),
});

export const {
  // Public
  useGetArticlesQuery,
  useGetArticleBySlugQuery,
  useGetArticleCategoriesQuery,

  // User specific
  useGetMyArticlesQuery,
  useGetUserArticlesQuery,

  // CRUD
  useCreateArticleMutation,
  useGetArticleByIdQuery,
  useUpdateArticleMutation,
  useDeleteArticleMutation,

  // Social
  useLikeArticleMutation,
  useBookmarkArticleMutation,
  useAddArticleCommentMutation,
  useLikeArticleCommentMutation,
  useDeleteArticleCommentMutation,
  useGetBookmarkedArticlesQuery,

  // Featured requests
  useRequestFeaturedArticleMutation,
  useApproveFeaturedArticleMutation,

  // Admin
  useToggleArticleFeaturedMutation,
  useToggleEditorsPickMutation,
} = articlesApiSlice;