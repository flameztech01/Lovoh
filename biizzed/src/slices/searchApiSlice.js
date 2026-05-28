// slices/searchApiSlice.js
import { apiSlice } from './apiSlice';

const SEARCH_URL = '/search';

export const searchApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Main search across all content
    searchAll: builder.query({
      query: ({ q, type, page = 1, limit = 20 }) => ({
        url: `${SEARCH_URL}`,
        params: { q, type, page, limit },
      }),
      keepUnusedDataFor: 300, // Keep search results for 5 minutes
    }),

    // Quick suggestions for autocomplete
    quickSearch: builder.query({
      query: ({ q, limit = 5 }) => ({
        url: `${SEARCH_URL}/suggest`,
        params: { q, limit },
      }),
      keepUnusedDataFor: 60, // Keep suggestions for 1 minute
    }),
  }),
});

export const {
  useSearchAllQuery,
  useLazySearchAllQuery,
  useQuickSearchQuery,
  useLazyQuickSearchQuery,
} = searchApiSlice;