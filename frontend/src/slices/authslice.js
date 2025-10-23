import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    adminInfo: localStorage.getItem('adminInfo') ? JSON.parse(localStorage.getItem('adminInfo')) : null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        //for Admins
        setAdminCredentials: (state, action) => {
            state.adminInfo = action.payload;
            localStorage.setItem('adminInfo', JSON.stringify(action.payload));
        },
        //for Logout
        logout: (state) => {
            state.adminInfo = null;
            localStorage.removeItem('adminInfo');
        }
    }
})

export const { setAdminCredentials, logout } = authSlice.actions;

export default authSlice.reducer;