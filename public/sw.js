// /public/sw.js
const CACHE_NAME = 'mpesa-poster-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-32.png',
  '/icon-16.png',
  '/apple-touch-icon.png',
  // Add other static assets here
];

const OFFLINE_FALLBACK = '/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-http requests
  if (!event.request.url.startsWith('http')) return;

  // Network-first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the API response
          const clone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(event.request);
        })
    );
    return;
  }
  // For navigation requests, serve from cache first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Always return the cached version if available
          if (cachedResponse) return cachedResponse;
          
          // Fallback to network if not in cache
          return fetch(event.request);
        })
    );
    return;
  }

  // Cache-first strategy for all other requests
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) return cachedResponse;

        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache responses that aren't ok or aren't basic (like opaque responses)
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache the successful response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));

            return response;
          })
          .catch(() => {
            // If both cache and network fail, return offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_FALLBACK);
            }
            return new Response('Offline - No network connection', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});