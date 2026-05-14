// pages/BiizzedLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BiizzedPwaPrompt from '../components/BiizzedPwaPrompt';

const BiizzedLayout = () => {
  return (
    <>
      <BiizzedPwaPrompt />
      <Outlet />
    </>
  );
};

export default BiizzedLayout;