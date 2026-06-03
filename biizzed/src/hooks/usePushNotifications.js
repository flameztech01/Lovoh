// hooks/usePushNotifications.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Capacitor } from '@capacitor/core';
import OneSignal from 'onesignal-cordova-plugin';
import { useSubscribeToPushMutation } from '../slices/notificationApiSlice';

const usePushNotifications = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [subscribeToPush] = useSubscribeToPushMutation();

  // Check if running on Capacitor (iOS/Android)
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!userInfo) return;

    if (isNative) {
      // Native (iOS/Android) push setup with OneSignal
      initNativePush();
    } else {
      // Web push setup (your existing code)
      initWebPush();
    }
  }, [userInfo]);

  // ========== WEB PUSH (YOUR EXISTING CODE - UNCHANGED) ==========
  const initWebPush = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      await subscribeToPush({ subscription }).unwrap();
      console.log('✅ Web push subscribed');
    } catch (error) {
      console.error('Web push error:', error);
    }
  };

  // ========== NATIVE (CAPACITOR) PUSH WITH ONESIGNAL ==========
  const initNativePush = async () => {
    try {
      // Initialize OneSignal
      OneSignal.initialize(import.meta.env.VITE_ONESIGNAL_APP_ID);
      
      // Request permission (OneSignal handles this automatically)
      OneSignal.Notifications.requestPermission(true);
      
      // Set up listener for user ID (OneSignal player ID)
      OneSignal.User.addTag('userId', userInfo._id);
      OneSignal.User.addTag('email', userInfo.email);
      OneSignal.User.addTag('username', userInfo.username || userInfo.name);
      
      // Get the OneSignal player ID (device token equivalent)
      const playerId = await OneSignal.User.getOnesignalId();
      console.log('✅ OneSignal Player ID:', playerId);
      
      // Send to your backend
      if (playerId) {
        try {
          await subscribeToPush({
            token: playerId,
            platform: Capacitor.getPlatform(),
            isNative: true,
            service: 'onesignal'
          }).unwrap();
          console.log('✅ OneSignal token sent to backend');
        } catch (error) {
          console.error('Failed to send OneSignal token:', error);
        }
      }
      
      // Listen for when a notification is received while app is in foreground
      OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
        console.log('📱 Notification received in foreground:', event);
        
        // Prevent default display (we'll show it ourselves)
        event.preventDefault();
        
        // Get notification data
        const notification = event.getNotification();
        
        // Show custom notification handling if needed
        // For example, update a badge count or show an in-app alert
      });
      
      // Listen for when a notification is clicked/tapped
      OneSignal.Notifications.addEventListener('click', (event) => {
        console.log('📱 Notification clicked:', event);
        
        const notification = event.getNotification();
        const additionalData = notification.additionalData;
        
        // Handle navigation based on notification data
        if (additionalData?.screen) {
          // Navigate using your router
          // For example with React Router:
          // navigate(additionalData.screen);
          
          // Or use window.location for simple navigation
          if (additionalData.screen.startsWith('/')) {
            window.location.href = additionalData.screen;
          }
        }
      });
      
      // Set external user ID for targeting (optional but recommended)
      OneSignal.User.addAlias('externalId', userInfo._id);
      
      console.log('✅ OneSignal native push initialized');
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
    }
  };

  return null;
};

export default usePushNotifications;