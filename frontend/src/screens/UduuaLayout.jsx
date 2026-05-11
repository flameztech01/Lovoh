// pages/UduuaLayout.jsx
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import UduuaPwaPrompt from '../components/UduuaPwaPrompt';

const UduuaLayout = () => {
  const location = useLocation();

  // Only update document title dynamically
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/shop') {
      document.title = 'Shop | Uduua Marketplace';
    } else if (path === '/services') {
      document.title = 'Services | Uduua Marketplace';
    } else if (path === '/') {
      document.title = 'Uduua Marketplace - Shop Quality Products';
    } else if (path.includes('/shop/product/')) {
      document.title = 'Product | Uduua Marketplace';
    } else if (path === '/shop/cart') {
      document.title = 'Cart | Uduua Marketplace';
    } else if (path === '/checkout') {
      document.title = 'Checkout | Uduua Marketplace';
    } else if (path === '/shop/orders') {
      document.title = 'My Orders | Uduua Marketplace';
    } else if (path === '/shop/help') {
      document.title = 'Help Center | Uduua Marketplace';
    } else {
      document.title = 'Uduua Marketplace - Where Products Meet the Market';
    }
    
    document.body.style.backgroundColor = '#f5f7ff';
    
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [location]);

  // Register service worker for uduua offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-uduua.js').then((registration) => {
        console.log('Uduua Service Worker registered:', registration);
      }).catch((error) => {
        console.log('Uduua Service Worker registration failed:', error);
      });
    }
  }, []);

  return (
    <>
      <UduuaPwaPrompt />
      <Outlet />
    </>
  );
};

export default UduuaLayout;