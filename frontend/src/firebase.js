import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyC2UuiE37lFDFMy1aQh7du_XZNizRxVAB0",
  authDomain: "lovohcreate-40c50.firebaseapp.com",
  projectId: "lovohcreate-40c50",
  storageBucket: "lovohcreate-40c50.firebasestorage.app",
  messagingSenderId: "110452187221",
  appId: "1:110452187221:web:2a8986300e145c7a49b4dc",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };