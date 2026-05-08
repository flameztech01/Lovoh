// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC2UuiE37lFDFMy1aQh7du_XZNizRxVAB0",
  authDomain: "lovohcreate-40c50.firebaseapp.com",
  projectId: "lovohcreate-40c50",
  storageBucket: "lovohcreate-40c50.firebasestorage.app",
  messagingSenderId: "110452187221",
  appId: "1:110452187221:web:2a8986300e145c7a49b4dc",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    data: payload.data,
  });
});