// public/sw.js
const CACHE_NAME = 'bizzzed-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// ---------- Web‑push notification handler ----------
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const { title = 'New notification', body = '', data = {} } = payload || {};

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        data,
        icon: '/biizzed-logo.png',   // update with your actual icon path
        badge: '/biizzed-logo.png',
      })
    );
  } catch (error) {
    console.error('Push event error:', error);
  }
});