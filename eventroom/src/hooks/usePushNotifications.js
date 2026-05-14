import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSubscribeToPushMutation } from '../slices/notificationApiSlice';

const usePushNotifications = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [subscribeToPush] = useSubscribeToPushMutation();

  useEffect(() => {
    if (!userInfo || !('serviceWorker' in navigator)) return;

    const register = async () => {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      await subscribeToPush({ subscription }).unwrap();
      console.log('Web-push subscribed');
    };

    register();
  }, [userInfo, subscribeToPush]);

  return null;
};

export default usePushNotifications;