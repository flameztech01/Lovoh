import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL || ''}/api`,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    // Get the admin info from Redux state
    const { adminInfo } = getState().auth;
    
    // If we have adminInfo with token, add it to headers
    if (adminInfo?.token) {
      headers.set('authorization', `Bearer ${adminInfo.token}`);
    }
    
    return headers;
  }
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['user', 'admin'],
  endpoints: (builder) => ({})
});