// slices/eventApiSlice.js
import { apiSlice } from './apiSlice';

const EVENTS_URL = '/events';

export const eventApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUBLIC ====================

    // Get all events with filters
    getEvents: builder.query({
      query: (params) => ({
        url: EVENTS_URL,
        params,
      }),
      providesTags: ['Event'],
    }),

    // Get single event (now works with slug or ID)
    getEventById: builder.query({
      query: (id) => `${EVENTS_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: 'Event', id }],
    }),

    // Register for event (free or paid)
    registerForEvent: builder.mutation({
      query: ({ id, data }) => ({
        url: `${EVENTS_URL}/${id}/register`,
        method: 'POST',
        body: data,
      }),
    }),

    // Report an event
    reportEvent: builder.mutation({
      query: (id) => ({
        url: `${EVENTS_URL}/${id}/report`,
        method: 'POST',
      }),
    }),

    // Verify Paystack payment
    verifyPayment: builder.query({
      query: (reference) => `${EVENTS_URL}/registrations/verify/${reference}`,
    }),

    // Verify ticket (public - for scanning)
    verifyTicket: builder.query({
      query: (ticketId) => `${EVENTS_URL}/verify-ticket/${ticketId}`,
    }),

    // Get event filters (categories & types)
    getEventFilters: builder.query({
      query: () => `${EVENTS_URL}/filters`,
    }),

    // NEW: Get custom form for an event
    getEventCustomForm: builder.query({
      query: (id) => `${EVENTS_URL}/${id}/custom-form`,
    }),

    // ==================== PROTECTED - USER ====================

    // Get my created events
    getMyEvents: builder.query({
      query: () => `${EVENTS_URL}/my-events/list`,
      providesTags: ['MyEvent'],
    }),

    // Create event
    createEvent: builder.mutation({
      query: (formData) => ({
        url: EVENTS_URL,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Event', 'MyEvent'],
    }),

    // Update event
    updateEvent: builder.mutation({
      query: ({ id, formData }) => ({
        url: `${EVENTS_URL}/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Event', 'MyEvent'],
    }),

    // Delete event
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `${EVENTS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Event', 'MyEvent'],
    }),

    // Get event registrations (creator)
    getEventRegistrations: builder.query({
      query: ({ id, params }) => ({
        url: `${EVENTS_URL}/${id}/registrations`,
        params,
      }),
      providesTags: ['EventRegistration'],
    }),

    // Get my registrations (attendee) - with tickets
    getMyRegistrations: builder.query({
      query: () => `${EVENTS_URL}/my-registrations/list`,
      providesTags: ['MyRegistration'],
    }),

    // Check-in attendee by ticket ID
    checkInAttendee: builder.mutation({
      query: (ticketId) => ({
        url: `${EVENTS_URL}/check-in/${ticketId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['EventRegistration'],
    }),

    // NEW: Update custom form for an event (protected)
    updateEventCustomForm: builder.mutation({
      query: ({ id, data }) => ({
        url: `${EVENTS_URL}/${id}/custom-form`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Event'],
    }),

    // ==================== WALLET ====================

    // Set up payment wallet
    setupWallet: builder.mutation({
      query: (data) => ({
        url: `${EVENTS_URL}/wallet/setup`,
        method: 'POST',
        body: data,
      }),
    }),

    // Get wallet info
    getWalletInfo: builder.query({
      query: () => `${EVENTS_URL}/wallet/info`,
      providesTags: ['Wallet'],
    }),

    // Withdraw from wallet
    withdrawFromWallet: builder.mutation({
      query: (data) => ({
        url: `${EVENTS_URL}/wallet/withdraw`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet'],
    }),

    // Get bank list
    getBanks: builder.query({
      query: () => `${EVENTS_URL}/banks`,
    }),

    // ==================== ADMIN ====================

    // Admin dashboard
    getAdminDashboard: builder.query({
      query: () => `${EVENTS_URL}/admin/dashboard`,
    }),

    // Toggle event status (disable/enable)
    toggleEventStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `${EVENTS_URL}/admin/${id}/toggle-status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Event'],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useRegisterForEventMutation,
  useReportEventMutation,
  useVerifyPaymentQuery,
  useVerifyTicketQuery,
  useGetEventFiltersQuery,
  useGetEventCustomFormQuery,           // new
  useGetMyEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetEventRegistrationsQuery,
  useGetMyRegistrationsQuery,
  useCheckInAttendeeMutation,
  useUpdateEventCustomFormMutation,     // new
  useSetupWalletMutation,
  useGetWalletInfoQuery,
  useWithdrawFromWalletMutation,
  useGetBanksQuery,
  useGetAdminDashboardQuery,
  useToggleEventStatusMutation,
} = eventApiSlice;