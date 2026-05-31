// hooks/usePushNotifications.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useSubscribeToPushMutation } from '../slices/notificationApiSlice';

const usePushNotifications = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [subscribeToPush] = useSubscribeToPushMutation();

  // Check if running on Capacitor (iOS/Android)
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!userInfo) return;

    if (isNative) {
      // Native (iOS/Android) push setup
      initNativePush();
    } else {
      // Web push setup (your existing code)
      initWebPush();
    }
  }, [userInfo]);

  // ========== WEB PUSH (YOUR EXISTING CODE) ==========
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

  // ========== NATIVE (CAPACITOR) PUSH ==========
  const initNativePush = async () => {
    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive !== 'granted') {
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if (permStatus.receive !== 'granted') {
        console.log('Push permission denied');
        return;
      }

      // Register with Apple/Google
      await PushNotifications.register();

      // Listen for registration success
      PushNotifications.addListener('registration', async (token) => {
        console.log('✅ Native push registered, token:', token.value);
        
        // Send token to backend (same endpoint as web push)
        try {
          await subscribeToPush({ 
            token: token.value,
            platform: Capacitor.getPlatform(),
            isNative: true 
          }).unwrap();
          console.log('✅ Native token sent to backend');
        } catch (error) {
          console.error('Failed to send native token:', error);
        }
      });

      // Listen for registration error
      PushNotifications.addListener('registrationError', (err) => {
        console.error('Native push registration error:', err);
      });

      // Listen for push notification received while app is in foreground
      PushNotifications.addListener('pushNotificationReceived', async (notification) => {
        console.log('📱 Push received:', notification);
        
        // Show local notification when app is in foreground
        if (notification.data) {
          await LocalNotifications.schedule({
            notifications: [{
              title: notification.title,
              body: notification.body,
              id: Date.now(),
              schedule: { at: new Date() },
              extra: notification.data,
            }]
          });
        }
      });

      // Listen for when user taps on notification
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('📱 Push tapped:', notification);
        
        // Handle navigation based on notification data
        const data = notification.notification.data;
        if (data?.screen) {
          // Use your router to navigate
          // For React Router:
          // navigate(data.screen);
        }
      });

      console.log('✅ Native push initialized');
    } catch (error) {
      console.error('Error initializing native push:', error);
    }
  };

  return null;
};

export default usePushNotifications;