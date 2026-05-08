// pages/BizzzedLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BizzzedPwaPrompt from '../components/BizzzedPwaPrompt';

const BizzzedLayout = () => {
  return (
    <>
      <BizzzedPwaPrompt />
      <Outlet />
    </>
  );
};

export default BizzzedLayout;