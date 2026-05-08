// components/UserPrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import React from 'react';

const UserPrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return userInfo ? <Outlet /> : <Navigate to="/events/login" replace />;
};

export default UserPrivateRoute;