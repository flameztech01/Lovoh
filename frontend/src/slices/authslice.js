// slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  adminInfo: localStorage.getItem('adminInfo') 
    ? JSON.parse(localStorage.getItem('adminInfo')) 
    : null,
  userInfo: localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Admin actions
    setAdminCredentials: (state, action) => {
      state.adminInfo = action.payload;
      localStorage.setItem('adminInfo', JSON.stringify(action.payload));
    },
    
    logoutAdmin: (state) => {
      state.adminInfo = null;
      localStorage.removeItem('adminInfo');
    },

    // User actions
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },

    // Update user profile
    updateUserProfile: (state, action) => {
      state.userInfo = { ...state.userInfo, ...action.payload };
      localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
    },

    // Clear ALL auth - use this for complete logout
    clearAllAuth: (state) => {
      state.adminInfo = null;
      state.userInfo = null;
      localStorage.removeItem('adminInfo');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('bizzzed-pwa-dismissed');
      sessionStorage.clear();
    },
  },
});

export const { 
  setAdminCredentials, 
  logoutAdmin,
  setCredentials, 
  logout,
  updateUserProfile,
  clearAllAuth,
} = authSlice.actions;

export default authSlice.reducer;