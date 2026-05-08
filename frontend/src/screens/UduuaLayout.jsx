// pages/UduuaLayout.jsx
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import UduuaPwaPrompt from '../components/UduuaPwaPrompt';

const UduuaLayout = () => {
  const location = useLocation();

  // Update manifest and theme when on uduua routes
  useEffect(() => {
    const isUduuaRoute = location.pathname.startsWith('/uduua');
    
    if (isUduuaRoute) {
      // Update manifest link to uduua-specific manifest
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        manifestLink.href = '/manifest-uduua.json';
      }
      
      // Update theme color for uduua
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) {
        themeColor.content = '#0043FC';
      }
      
      // Update app name for uduua
      const appleMobileWebAppTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (appleMobileWebAppTitle) {
        appleMobileWebAppTitle.content = 'Uduua';
      }
      
      // Update status bar style for iOS
      const statusBarStyle = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (statusBarStyle) {
        statusBarStyle.content = 'black-translucent';
      }
      
      // Update document title based on current path
      const path = location.pathname;
      if (path === '/uduua/shop') {
        document.title = 'Shop | Uduua Marketplace';
      } else if (path === '/uduua/services') {
        document.title = 'Services | Uduua Marketplace';
      } else if (path === '/uduua') {
        document.title = 'Uduua Marketplace - Shop Quality Products';
      } else if (path.includes('/uduua/shop/product/')) {
        document.title = 'Product | Uduua Marketplace';
      } else if (path === '/uduua/shop/cart') {
        document.title = 'Cart | Uduua Marketplace';
      } else if (path === '/uduua/checkout') {
        document.title = 'Checkout | Uduua Marketplace';
      } else if (path === '/uduua/shop/orders') {
        document.title = 'My Orders | Uduua Marketplace';
      } else if (path === '/uduua/shop/help') {
        document.title = 'Help Center | Uduua Marketplace';
      } else {
        document.title = 'Uduua Marketplace - Where Products Meet the Market';
      }
      
      // Set body background for uduua
      document.body.style.backgroundColor = '#f5f7ff';
    }
    
    // Cleanup when leaving uduua routes
    return () => {
      if (!location.pathname.startsWith('/uduua')) {
        // Revert manifest to main app
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
          manifestLink.href = '/manifest.json';
        }
        
        // Revert theme color
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
          themeColor.content = '#1B3766';
        }
        
        // Reset document title
        document.title = 'Bizzzed';
        
        // Reset body background
        document.body.style.backgroundColor = '';
      }
    };
  }, [location]);

  // Register service worker for uduua offline support
  useEffect(() => {
    if ('serviceWorker' in navigator && location.pathname.startsWith('/uduua')) {
      navigator.serviceWorker.register('/sw-uduua.js').then((registration) => {
        console.log('Uduua Service Worker registered:', registration);
      }).catch((error) => {
        console.log('Uduua Service Worker registration failed:', error);
      });
    }
  }, [location]);

  return (
    <>
      <UduuaPwaPrompt />
      <Outlet />
    </>
  );
};

export default UduuaLayout;