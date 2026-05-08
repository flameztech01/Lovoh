import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { messaging, getToken } from '../firebase';
import { useRegisterDeviceMutation } from '../slices/notificationApiSlice';

const usePushNotifications = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [registerDevice] = useRegisterDeviceMutation();

  useEffect(() => {
    if (!userInfo || !('Notification' in window)) return;

    // Request permission and get FCM token
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: 'BGRlhXRPQnXWDw3cTP5KmCriauV2PRTjdAuKW7p1KotzlrxD-zDqZYrbhSpy-mA_soqPtLtlmNpKOsIc5YhTKfE',   // get from Firebase Console → Cloud Messaging → Web configuration
          });
          if (token) {
            await registerDevice({ token }).unwrap();
            console.log('Device token registered');
          }
        }
      } catch (error) {
        console.error('Push notification permission error:', error);
      }
    };

    requestPermission();
  }, [userInfo, registerDevice]);

  return null; // Hook only runs side effects
};

export default usePushNotifications;