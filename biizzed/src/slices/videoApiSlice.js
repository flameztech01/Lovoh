// slices/videoApiSlice.js – With user's own videos endpoint
import { apiSlice } from "./apiSlice";

const VIDEOS_URL = "/videos";

export const videoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUBLIC ====================

    // Get all videos
    getVideos: builder.query({
      query: (params) => ({
        url: VIDEOS_URL,
        params: {
          category: params?.category,
          search: params?.search,
          isEducational: params?.isEducational,
          videoType: params?.videoType,
          userId: params?.userId,
          authorType: params?.authorType,
          page: params?.page,
          limit: params?.limit,
          sort: params?.sort,
        },
      }),
      providesTags: ["Video"],
    }),

    // Get single video
    getVideoById: builder.query({
      query: (id) => ({
        url: `${VIDEOS_URL}/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Video", id }],
    }),

    // Get videos by specific user ID (public)
    getUserVideos: builder.query({
      query: ({ userId, ...params }) => ({
        url: `${VIDEOS_URL}/user/${userId}`,
        params: {
          page: params?.page,
          limit: params?.limit,
          videoType: params?.videoType,
        },
      }),
      providesTags: ["UserVideo"],
    }),

    // ==================== PROTECTED (Authenticated) ====================

    // Get logged‑in user's own videos
    getMyVideos: builder.query({
      query: (params) => ({
        url: `${VIDEOS_URL}/my-videos`,
        params: {
          page: params?.page,
          limit: params?.limit,
        },
      }),
      providesTags: ["MyVideos"],
    }),

    // Get feed (following + educational)
    getVideoFeed: builder.query({
      query: (params) => ({
        url: `${VIDEOS_URL}/feed`,
        params: {
          page: params?.page,
          limit: params?.limit,
        },
      }),
      providesTags: ["VideoFeed"],
    }),

    // Upload regular video
    uploadVideo: builder.mutation({
      query: (data) => ({
        url: VIDEOS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Video", "VideoFeed", "UserVideo", "MyVideos"],
    }),

    // Post YouTube video link
    postYoutubeVideo: builder.mutation({
      query: (data) => ({
        url: `${VIDEOS_URL}/youtube`,
        method: "POST",
        body: {
          youtubeUrl: data.youtubeUrl,
          category: data.category,
          tags: data.tags,
          isEducational: data.isEducational,
          description: data.description,
        },
      }),
      invalidatesTags: ["Video", "VideoFeed", "UserVideo", "MyVideos"],
    }),

    // Delete video (owner or admin)
    deleteVideo: builder.mutation({
      query: (id) => ({
        url: `${VIDEOS_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Video", "VideoFeed", "UserVideo", "MyVideos"],
    }),

    // Like/Unlike video
    likeVideo: builder.mutation({
      query: (id) => ({
        url: `${VIDEOS_URL}/${id}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Video", id }],
    }),

    // Add comment
    addVideoComment: builder.mutation({
      query: ({ id, text }) => ({
        url: `${VIDEOS_URL}/${id}/comment`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Video", id }],
    }),

    // Like/Unlike comment
    likeVideoComment: builder.mutation({
      query: ({ id, commentId }) => ({
        url: `${VIDEOS_URL}/${id}/comment/${commentId}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Video", id }],
    }),

    // Delete comment
    deleteVideoComment: builder.mutation({
      query: ({ id, commentId }) => ({
        url: `${VIDEOS_URL}/${id}/comment/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Video", id }],
    }),

    // Update video (owner or admin)
    updateVideo: builder.mutation({
      query: ({ id, data }) => ({
        url: `${VIDEOS_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Video", id },
        "Video",
        "VideoFeed",
        "UserVideo",
        "MyVideos",
      ],
    }),
  }),
});

export const {
  // Public
  useGetVideosQuery,
  useGetVideoByIdQuery,
  useGetUserVideosQuery,

  // Protected
  useGetMyVideosQuery,
  useGetVideoFeedQuery,
  useUploadVideoMutation,
  usePostYoutubeVideoMutation,
  useDeleteVideoMutation,
  useLikeVideoMutation,
  useAddVideoCommentMutation,
  useLikeVideoCommentMutation,
  useDeleteVideoCommentMutation,
  useUpdateVideoMutation,
} = videoApiSlice;