// slices/eventApiSlice.js
import { apiSlice } from "./apiSlice";

const EVENTS_URL = "/events";

export const eventApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUBLIC ====================

    // Get all events with filters
    getEvents: builder.query({
      query: (params) => ({
        url: EVENTS_URL,
        params,
      }),
      providesTags: ["Event"],
    }),

    // Get single event (now works with slug or ID)
    getEventById: builder.query({
      query: (id) => `${EVENTS_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    // Register for event (free or paid)
    registerForEvent: builder.mutation({
      query: ({ id, data }) => ({
        url: `${EVENTS_URL}/${id}/register`,
        method: "POST",
        body: data,
      }),
    }),

    // Report an event
    reportEvent: builder.mutation({
      query: (id) => ({
        url: `${EVENTS_URL}/${id}/report`,
        method: "POST",
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

    // Get custom form for an event
    getEventCustomForm: builder.query({
      query: (id) => `${EVENTS_URL}/${id}/custom-form`,
    }),

    // ==================== PROTECTED - USER ====================

    // Get my created events
    getMyEvents: builder.query({
      query: () => `${EVENTS_URL}/my-events/list`,
      providesTags: ["MyEvent"],
    }),

    // Create event
    createEvent: builder.mutation({
      query: (formData) => ({
        url: EVENTS_URL,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Event", "MyEvent"],
    }),

    // Update event
    updateEvent: builder.mutation({
      query: ({ id, formData }) => ({
        url: `${EVENTS_URL}/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Event", "MyEvent"],
    }),

    // Delete event
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `${EVENTS_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Event", "MyEvent"],
    }),

    // Get event registrations (creator)
    getEventRegistrations: builder.query({
      query: ({ id, params }) => ({
        url: `${EVENTS_URL}/${id}/registrations`,
        params,
      }),
      providesTags: ["EventRegistration"],
    }),

    // Get my registrations (attendee) - with tickets
    getMyRegistrations: builder.query({
      query: () => `${EVENTS_URL}/my-registrations/list`,
      providesTags: ["MyRegistration"],
    }),

    // Check-in attendee by ticket ID
    checkInAttendee: builder.mutation({
      query: (ticketId) => ({
        url: `${EVENTS_URL}/check-in/${ticketId}`,
        method: "PUT",
      }),
      invalidatesTags: ["EventRegistration"],
    }),

    // Update custom form for an event (protected)
    updateEventCustomForm: builder.mutation({
      query: ({ id, data }) => ({
        url: `${EVENTS_URL}/${id}/custom-form`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Event"],
    }),

    // ==================== REMINDERS ====================

    // Send reminder for specific event (creator or admin)
    sendReminder: builder.mutation({
      query: (id) => ({
        url: `${EVENTS_URL}/${id}/send-reminder`,
        method: "POST",
      }),
      invalidatesTags: ["Event"],
    }),

    // ==================== WALLET ====================

    // Set up payment wallet
    setupWallet: builder.mutation({
      query: (data) => ({
        url: `${EVENTS_URL}/wallet/setup`,
        method: "POST",
        body: data,
      }),
    }),

    // Get wallet info
    getWalletInfo: builder.query({
      query: () => `${EVENTS_URL}/wallet/info`,
      providesTags: ["Wallet"],
    }),

    // Withdraw from wallet
    withdrawFromWallet: builder.mutation({
      query: (data) => ({
        url: `${EVENTS_URL}/wallet/withdraw`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Wallet"],
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
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Event"],
    }),

    // ==================== TEAM MANAGEMENT ====================

    // Get events where current user is a team member or creator
    getMyTeamEvents: builder.query({
      query: () => `${EVENTS_URL}/team/my-events`,
      providesTags: ["Event"],
    }),

    // Get all team members of an event
    getEventTeam: builder.query({
      query: (id) => `${EVENTS_URL}/${id}/team`,
      providesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    // Add a team member to an event
    addTeamMember: builder.mutation({
      query: ({ id, data }) => ({
        url: `${EVENTS_URL}/${id}/team`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Event"],
    }),

    // Remove a team member from an event
    removeTeamMember: builder.mutation({
      query: ({ id, userId }) => ({
        url: `${EVENTS_URL}/${id}/team/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Event"],
    }),

    // Get registrations for an event (team member access)
    getEventRegistrationsTeam: builder.query({
      query: ({ id, params }) => ({
        url: `${EVENTS_URL}/${id}/team/registrations`,
        params,
      }),
      providesTags: ["EventRegistration"],
    }),

    // Verify ticket validity without checking in (team)
    verifyTicketValidityTeam: builder.query({
      query: ({ id, ticketId }) =>
        `${EVENTS_URL}/${id}/team/verify/${ticketId}`,
    }),

    // Check-in attendee (team member with checker/manager role)
    verifyTicketTeam: builder.mutation({
      query: ({ id, ticketId }) => ({
        url: `${EVENTS_URL}/${id}/team/checkin/${ticketId}`,
        method: "POST",
      }),
      invalidatesTags: ["EventRegistration"],
    }),

    // ==================== POSTER GENERATION ====================

    // Get poster status (generated or not, image URL)
    getPosterStatus: builder.query({
      query: ({ id, registrationId }) =>
        `${EVENTS_URL}/${id}/registrations/${registrationId}/poster`,
      providesTags: (result, error, { id, registrationId }) => [
        { type: "Poster", id: registrationId },
      ],
    }),

    // Generate poster for a registration (upload photo, optional name)
    generatePoster: builder.mutation({
      query: ({ id, registrationId, formData }) => ({
        url: `${EVENTS_URL}/${id}/registrations/${registrationId}/generate-poster`,
        method: "POST",
        body: formData,
        // headers set automatically for FormData by fetchBaseQuery
      }),
      invalidatesTags: (result, error, { registrationId }) => [
        { type: "Poster", id: registrationId },
        { type: "EventRegistration" },
      ],
    }),
    // Get public registration info (no auth)
    getPublicRegistration: builder.query({
      query: (registrationId) => `/registrations/${registrationId}/public`,
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
  useGetEventCustomFormQuery,
  useGetMyEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetEventRegistrationsQuery,
  useGetMyRegistrationsQuery,
  useCheckInAttendeeMutation,
  useUpdateEventCustomFormMutation,
  useSendReminderMutation,
  useSetupWalletMutation,
  useGetWalletInfoQuery,
  useWithdrawFromWalletMutation,
  useGetBanksQuery,
  useGetAdminDashboardQuery,
  useToggleEventStatusMutation,

  // Team hooks
  useGetMyTeamEventsQuery,
  useGetEventTeamQuery,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useGetEventRegistrationsTeamQuery,
  useVerifyTicketValidityTeamQuery,
  useVerifyTicketTeamMutation,

  // Poster hooks
  useGetPosterStatusQuery,
  useGeneratePosterMutation,

  useGetPublicRegistrationQuery,
} = eventApiSlice;
