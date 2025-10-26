import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL || ''}/api`,
  prepareHeaders: (headers, { getState }) => {
    const adminInfo = getState().auth.adminInfo;

    if (adminInfo?.token) {
      headers.set('Authorization', `Bearer ${adminInfo.token}`);
    }

    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['user', 'admin'],
  endpoints: (builder) => ({}),
});
