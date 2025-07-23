// /public/sw.js
const CACHE_NAME = 'mpesa-poster-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/styles.css',
  '/manifest.json',
  '/favicon.ico',
  '/icon-32.png',
  '/icon-16.png',
  '/apple-touch-icon.png',
  // Add other static assets here
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Force activate new SW immediately
  );
});

self.addEventListener('fetch', (event) => {
  // Handle dynamic imports differently
  if (event.request.url.includes('/assets/') && event.request.url.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the new version
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // If fetch fails, try cache but don't store the result
          return caches.match(event.request);
        })
    );
    return;
  }
  // Skip requests that are not HTTP or HTTPS (like chrome-extension:, data:, etc.)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Only cache valid responses (status 200, type basic)
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();

          // Skip caching for chrome-extension requests
          if (!event.request.url.startsWith('http')) {
            return response;
          }

          caches.open(CACHE_NAME)
            .then((cache) => {
              try {
                cache.put(event.request, responseToCache);
              } catch (error) {
                console.warn('Failed to cache:', event.request.url, error);
              }
            });

          return response;
        }).catch(() => {
          // Offline fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline - No network connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
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
          // Delete all caches that don't match the current version
          if (!cacheName.startsWith('mpesa-poster-v1-')) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients
  );
});