// slices/productApiSlice.js
import { apiSlice } from './apiSlice';

const PRODUCTS_URL = '/products';

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUBLIC QUERIES ====================
    
    // Get all products
    getProducts: builder.query({
      query: (params) => ({
        url: PRODUCTS_URL,
        params: {
          category: params?.category,
          search: params?.search,
          available: params?.available,
          status: params?.status,
          brand: params?.brand,
          sellerId: params?.sellerId,
          minPrice: params?.minPrice,
          maxPrice: params?.maxPrice,
          sort: params?.sort,
        },
      }),
      providesTags: ['Product'],
    }),

    // Get single product by ID
    getProductById: builder.query({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Get product categories
    getCategories: builder.query({
      query: () => ({
        url: `${PRODUCTS_URL}/categories`,
      }),
      providesTags: ['Category'],
    }),

    // Get product brands
    getBrands: builder.query({
      query: () => ({
        url: `${PRODUCTS_URL}/brands`,
      }),
      providesTags: ['Brand'],
    }),

    // Get product reviews
    getProductReviews: builder.query({
      query: ({ id, page = 1, limit = 10, sort = 'newest', rating }) => ({
        url: `${PRODUCTS_URL}/${id}/reviews`,
        params: { page, limit, sort, rating },
      }),
      providesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Review', id },
      ],
    }),

    // ==================== SELLER QUERIES ====================

    // Get seller's products
    getSellerProducts: builder.query({
      query: ({ page = 1, limit = 20, status }) => ({
        url: `${PRODUCTS_URL}/seller/my-products`,
        params: { page, limit, status },
      }),
      providesTags: ['Product'],
    }),

    // ==================== SELLER MUTATIONS ====================

    // Create product (seller only)
    createProduct: builder.mutation({
      query: (data) => ({
        url: PRODUCTS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product', 'Category', 'Brand'],
    }),

    // Update product (seller only)
    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        'Product',
        'Category',
        'Brand',
      ],
    }),

    // Delete product (seller only)
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product', 'Category', 'Brand'],
    }),

    // ==================== REVIEW MUTATIONS ====================

    // Check if user can review product
    checkCanReview: builder.query({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}/can-review`,
      }),
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Create product review
    createProductReview: builder.mutation({
      query: ({ id, data }) => ({
        url: `${PRODUCTS_URL}/${id}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Review', id },
      ],
    }),

    // Update product review
    updateProductReview: builder.mutation({
      query: ({ productId, reviewId, data }) => ({
        url: `${PRODUCTS_URL}/${productId}/reviews/${reviewId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'Review', id: productId },
      ],
    }),

    // Delete product review
    deleteProductReview: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `${PRODUCTS_URL}/${productId}/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'Review', id: productId },
      ],
    }),

    // Mark review as helpful
    markReviewHelpful: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `${PRODUCTS_URL}/${productId}/reviews/${reviewId}/helpful`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'Review', id: productId },
      ],
    }),

    // Mark review as not helpful
    markReviewNotHelpful: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `${PRODUCTS_URL}/${productId}/reviews/${reviewId}/not-helpful`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'Review', id: productId },
      ],
    }),

    // ==================== ADMIN QUERIES ====================

    // Get pending products (admin)
    getPendingProducts: builder.query({
      query: ({ page = 1, limit = 20 }) => ({
        url: `${PRODUCTS_URL}/admin/pending`,
        params: { page, limit },
      }),
      providesTags: ['Product'],
    }),

    // Get all products (admin view)
    getAllProductsAdmin: builder.query({
      query: ({ page = 1, limit = 20, isApproved, sellerId }) => ({
        url: `${PRODUCTS_URL}/admin/all`,
        params: { page, limit, isApproved, sellerId },
      }),
      providesTags: ['Product'],
    }),

    // ==================== ADMIN MUTATIONS ====================

    // Approve product (admin)
    approveProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTS_URL}/admin/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        'Product',
      ],
    }),

    // Reject product (admin)
    rejectProduct: builder.mutation({
      query: ({ id, reason }) => ({
        url: `${PRODUCTS_URL}/admin/${id}/reject`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        'Product',
      ],
    }),
  }),
});

export const {
  // Public queries
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetProductReviewsQuery,
  
  // Seller queries
  useGetSellerProductsQuery,
  
  // Seller mutations
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  
  // Review mutations
  useCheckCanReviewQuery,
  useCreateProductReviewMutation,
  useUpdateProductReviewMutation,
  useDeleteProductReviewMutation,
  useMarkReviewHelpfulMutation,
  useMarkReviewNotHelpfulMutation,
  
  // Admin queries
  useGetPendingProductsQuery,
  useGetAllProductsAdminQuery,
  
  // Admin mutations
  useApproveProductMutation,
  useRejectProductMutation,
} = productApiSlice;