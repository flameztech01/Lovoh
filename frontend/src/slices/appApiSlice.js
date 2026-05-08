import { apiSlice } from "./apiSlice";

const APP_URL = '/app';

export const appApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        userMessage: builder.mutation({
            query: (body) => ({
                url: `${APP_URL}/message`,
                method: 'POST',
                body: body,
            })
        }),
    })
}); 

export const {useUserMessageMutation} = appApiSlice;