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

    // Update Profile (name & picture)
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
  useLogoutMutation,
  useDeleteAccountMutation,
  
  // Profile
  useGetProfileInfoQuery,
  useGetProfileByIdQuery,
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