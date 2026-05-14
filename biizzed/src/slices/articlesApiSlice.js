// slices/articlesApiSlice.js – unchanged (already aligned with current routes)
import { apiSlice } from './apiSlice';

const ARTICLES_URL = '/articles';

export const articlesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUBLIC ====================
    
    // Get all articles
    getArticles: builder.query({
      query: (params) => ({
        url: ARTICLES_URL,
        params: {
          category: params?.category,
          featured: params?.featured,
          editorsPick: params?.editorsPick,
          search: params?.search,
          status: params?.status || 'published',
          page: params?.page,
          limit: params?.limit,
          sort: params?.sort,
        },
      }),
      providesTags: ['Article'],
    }),

    // Get single article by slug
    getArticleBySlug: builder.query({
      query: (slug) => ({
        url: `${ARTICLES_URL}/slug/${slug}`,  // matches /slug/:slug route
      }),
      providesTags: (result, error, slug) => [{ type: 'Article', id: slug }],
    }),

    // Get article categories
    getArticleCategories: builder.query({
      query: () => ({
        url: `${ARTICLES_URL}/categories`,
      }),
      providesTags: ['ArticleCategories'],
    }),

    // ==================== CRUD (Protected) ====================

    // Create article
    createArticle: builder.mutation({
      query: (data) => ({
        url: ARTICLES_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Article', 'ArticleCategories'],
    }),

    // Get article by ID
    getArticleById: builder.query({
      query: (id) => ({
        url: `${ARTICLES_URL}/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Article', id }],
    }),

    // Update article
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
      ],
    }),

    // Delete article
    deleteArticle: builder.mutation({
      query: (id) => ({
        url: `${ARTICLES_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Article', 'ArticleCategories', 'BookmarkedArticle'],
    }),

    // ==================== SOCIAL (Protected) ====================

    // Like/Unlike article
    likeArticle: builder.mutation({
      query: (id) => ({
        url: `${ARTICLES_URL}/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }],
    }),

    // Bookmark/Unbookmark article
    bookmarkArticle: builder.mutation({
      query: (id) => ({
        url: `${ARTICLES_URL}/${id}/bookmark`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }],
    }),

    // Add comment or reply (thread)
    addArticleComment: builder.mutation({
      query: ({ id, text, parentCommentId }) => ({
        url: `${ARTICLES_URL}/${id}/comment`,
        method: 'POST',
        body: { text, parentCommentId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Article', id }],
    }),

    // Like/Unlike comment or reply
    likeArticleComment: builder.mutation({
      query: ({ id, commentId, replyId }) => ({
        url: `${ARTICLES_URL}/${id}/comment/${commentId}/like`,
        method: 'POST',
        body: { replyId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Article', id }],
    }),

    // Delete comment or reply
    deleteArticleComment: builder.mutation({
      query: ({ id, commentId, replyId }) => ({
        url: `${ARTICLES_URL}/${id}/comment/${commentId}`,
        method: 'DELETE',
        body: { replyId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Article', id }],
    }),

    // Get user's bookmarked articles
    getBookmarkedArticles: builder.query({
      query: () => ({
        url: `${ARTICLES_URL}/bookmarks/my`,
      }),
      providesTags: ['BookmarkedArticle'],
    }),

    // ==================== ADMIN ACTIONS ====================

    // Toggle featured
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

    // Toggle editor's pick
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
  useGetArticlesQuery,
  useGetArticleBySlugQuery,
  useGetArticleCategoriesQuery,
  useCreateArticleMutation,
  useGetArticleByIdQuery,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useLikeArticleMutation,
  useBookmarkArticleMutation,
  useAddArticleCommentMutation,
  useLikeArticleCommentMutation,
  useDeleteArticleCommentMutation,
  useGetBookmarkedArticlesQuery,
  useToggleArticleFeaturedMutation,
  useToggleEditorsPickMutation,
} = articlesApiSlice;