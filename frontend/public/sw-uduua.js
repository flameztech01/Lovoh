// public/sw-uduua.js
const CACHE_NAME = 'uduua-v1';
const urlsToCache = [
  '/uduua',
  '/uduua/shop',
  '/uduua/services',
  '/manifest-uduua.json',
  '/uduua-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/uduua')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});