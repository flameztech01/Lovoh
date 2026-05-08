// slices/orderApiSlice.js
import { apiSlice } from "./apiSlice";

const ORDERS_URL = "/orders";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== CART ENDPOINTS ====================

    // Get user's cart
    getCart: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/cart`,
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    // Add item to cart
    addToCart: builder.mutation({
      query: (data) => ({
        url: `${ORDERS_URL}/cart/add`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),

    // Update cart item quantity
    updateCartItem: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: `${ORDERS_URL}/cart/${productId}`,
        method: "PUT",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    // Remove item from cart
    removeFromCart: builder.mutation({
      query: (productId) => ({
        url: `${ORDERS_URL}/cart/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // Clear entire cart
    clearCart: builder.mutation({
      query: () => ({
        url: `${ORDERS_URL}/cart`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // Get cart summary (count and total)
    getCartSummary: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/cart/summary`,
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    // ==================== PAYSTACK HELPERS ====================

    // Get list of banks from Paystack
    getBankList: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/banks`,
        method: "GET",
      }),
      providesTags: ["Banks"],
    }),

    // Resolve bank account number
    resolveBankAccount: builder.mutation({
      query: ({ accountNumber, bankCode }) => ({
        url: `${ORDERS_URL}/resolve-account`,
        method: "POST",
        body: { accountNumber, bankCode },
      }),
    }),

    // ==================== ORDER ENDPOINTS ====================

    // Checkout - create order from cart
    checkoutCart: builder.mutation({
      query: (data) => ({
        url: `${ORDERS_URL}/checkout`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "Product", "Cart"],
    }),

    // Create new order (direct purchase)
    createOrder: builder.mutation({
      query: (data) => ({
        url: ORDERS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "Product"],
    }),

    // Get user's orders
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/myorders`,
      }),
      providesTags: ["Order"],
    }),

    // Get single order by ID
    getOrderById: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    // Update delivery status (seller only)
    updateDeliveryStatus: builder.mutation({
      query: ({
        id,
        status,
        riderName,
        riderPhone,
        trackingNumber,
        message,
      }) => ({
        url: `${ORDERS_URL}/${id}/delivery-status`,
        method: "PUT",
        body: { status, riderName, riderPhone, trackingNumber, message },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id },
        "Order",
      ],
    }),

    // Cancel order (user)
    cancelOrder: builder.mutation({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Order", id }, "Order"],
    }),

    // Confirm delivery received (user)
    confirmDelivery: builder.mutation({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}/confirm-delivery`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Order", id }, "Order"],
    }),

    // ==================== PAYSTACK PAYMENT ====================

    // Verify Paystack payment (callback)
    verifyPayment: builder.query({
      query: (reference) => ({
        url: `${ORDERS_URL}/verify-payment/${reference}`,
        method: "GET",
      }),
    }),

    // ==================== SELLER WITHDRAWAL ====================

    // Initiate withdrawal (seller only)
    initiateWithdrawal: builder.mutation({
      query: (data) => ({
        url: `${ORDERS_URL}/withdraw`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "SellerBalance"],
    }),

    // Get seller balance (seller only)
    getSellerBalance: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/seller-balance`,
        method: "GET",
      }),
      providesTags: ["SellerBalance"],
    }),

    // ==================== ADMIN ENDPOINTS ====================

    // Get all orders (admin)
    getAllOrders: builder.query({
      query: (params) => ({
        url: `${ORDERS_URL}/admin/all`,
        params: {
          status: params?.status,
          deliveryStatus: params?.deliveryStatus,
          paymentStatus: params?.paymentStatus,
          page: params?.page,
          limit: params?.limit,
        },
      }),
      providesTags: ["Order"],
    }),

    // Get seller orders (admin view)
    // getSellerOrders: builder.query({
    //   query: ({ sellerId, page = 1, limit = 20 }) => ({
    //     url: `${ORDERS_URL}/admin/seller/${sellerId}`,
    //     params: { page, limit },
    //   }),
    //   providesTags: ['Order'],
    // }),

    // Confirm payment (admin)
    confirmPayment: builder.mutation({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}/confirm-payment`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Order", id },
        "Order",
        "Product",
        "Cart",
      ],
    }),

    // Reject payment (admin)
    rejectPayment: builder.mutation({
      query: ({ id, reason }) => ({
        url: `${ORDERS_URL}/${id}/reject-payment`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: (result, error, id) => [{ type: "Order", id }, "Order"],
    }),

    // Process seller payout (admin)
    processSellerPayout: builder.mutation({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}/process-payout`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Order", id }, "Order"],
    }),
    // To (seller own orders endpoint):
    getSellerOrders: builder.query({
      query: ({ page = 1, limit = 20, status }) => ({
        url: `${ORDERS_URL}/seller/orders`,
        params: { page, limit, status },
      }),
      providesTags: ["Order"],
    }),
    // Add this to your orderApiSlice.js endpoints

    // Reinitialize payment for an existing order
    reinitializePayment: builder.mutation({
      query: ({ orderId, paymentMethod }) => ({
        url: `${ORDERS_URL}/reinitialize-payment`,
        method: "POST",
        body: { orderId, paymentMethod },
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  // Cart hooks
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useGetCartSummaryQuery,

  // Paystack helpers
  useGetBankListQuery,
  useResolveBankAccountMutation,

  // Order hooks
  useCheckoutCartMutation,
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetSellerOrdersQuery, // Seller's own orders
  useGetOrderByIdQuery,
  useUpdateDeliveryStatusMutation,
  useCancelOrderMutation,
  useConfirmDeliveryMutation,

  // Paystack payment
  useVerifyPaymentQuery,
  useReinitializePaymentMutation,

  // Seller withdrawal
  useInitiateWithdrawalMutation,
  useGetSellerBalanceQuery,

  // Admin hooks
  useGetAllOrdersQuery,
  useConfirmPaymentMutation,
  useRejectPaymentMutation,
  useProcessSellerPayoutMutation,
} = orderApiSlice;
