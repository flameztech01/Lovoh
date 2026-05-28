// slices/userApiSlice.js
import { apiSlice } from './apiSlice';

const USERS_URL = '/users';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== AUTH ====================

    // Google Auth (Login/Signup)
    googleAuth: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth/google`,
        method: 'POST',
        body: data,
      }),
    }),

    // Register (email/password)
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/register`,
        method: 'POST',
        body: data,
      }),
    }),

    // Verify email with OTP
    verifyEmail: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-email`,
        method: 'POST',
        body: data,
      }),
    }),

    // Resend OTP
    resendOTP: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/resend-otp`,
        method: 'POST',
        body: data,
      }),
    }),

    // Login (email/password)
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/login`,
        method: 'POST',
        body: data,
      }),
    }),

    // Forgot Password – send OTP
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/forgot-password`,
        method: 'POST',
        body: data,
      }),
    }),

    // Reset Password – verify OTP and set new password
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/reset-password`,
        method: 'POST',
        body: data,
      }),
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),

    // Delete Account
    deleteAccount: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/profile`,
        method: 'DELETE',
      }),
    }),

    // ==================== PROFILE ====================

    // Get current user's full profile
    getProfileInfo: builder.query({
      query: () => ({
        url: `${USERS_URL}/profile`,
      }),
      providesTags: ['UserProfile'],
    }),

    // Get user profile by ID (public)
    getProfileById: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/profile/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'UserProfile', id }],
    }),

    // Get user profile by username (public) - NEW
    getProfileByUsername: builder.query({
      query: (username) => ({
        url: `${USERS_URL}/profile/username/${username}`,
      }),
      providesTags: (result, error, username) => [{ type: 'UserProfile', username }],
    }),

    // Get user posts (articles, magazines, videos) - NEW
    getUserPosts: builder.query({
      query: ({ id, type, page = 1, limit = 20 }) => ({
        url: `${USERS_URL}/profile/${id}/posts`,
        params: { type, page, limit },
      }),
      providesTags: (result, error, { id, type }) => [
        { type: 'UserPosts', id: `${id}-${type}` },
      ],
    }),

    // Update Profile (name, username, phone, bio & picture)
    updateProfile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // ==================== SOCIAL / FOLLOW ====================

    // Follow a user
    followUser: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/follow/${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['UserProfile', 'UserSuggestions', 'UserFollowers', 'UserFollowing'],
    }),

    // Unfollow a user
    unfollowUser: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/unfollow/${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['UserProfile', 'UserSuggestions', 'UserFollowers', 'UserFollowing'],
    }),

    // Get user's followers
    getFollowers: builder.query({
      query: ({ id, page = 1, limit = 20 }) => ({
        url: `${USERS_URL}/followers/${id}`,
        params: { page, limit },
      }),
      providesTags: ['UserFollowers'],
    }),

    // Get user's following
    getFollowing: builder.query({
      query: ({ id, page = 1, limit = 20 }) => ({
        url: `${USERS_URL}/following/${id}`,
        params: { page, limit },
      }),
      providesTags: ['UserFollowing'],
    }),

    // Get user suggestions (who to follow)
    getUserSuggestions: builder.query({
      query: () => ({
        url: `${USERS_URL}/suggestions`,
      }),
      providesTags: ['UserSuggestions'],
    }),

    // ==================== CONTACT ====================

    // Contact Form
    submitContact: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/contact`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  // Auth
  useGoogleAuthMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendOTPMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useDeleteAccountMutation,

  // Profile
  useGetProfileInfoQuery,
  useGetProfileByIdQuery,
  useGetProfileByUsernameQuery,  // NEW
  useGetUserPostsQuery,           // NEW
  useUpdateProfileMutation,

  // Social/Follow
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetUserSuggestionsQuery,

  // Contact
  useSubmitContactMutation,
} = userApiSlice;