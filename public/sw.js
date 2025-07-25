// /public/sw.js
const CACHE_NAME = 'mpesa-poster-static-v2';
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache all static assets
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('Service worker installed and assets cached');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-http requests and chrome-extension requests
  if (!event.request.url.startsWith('http') || event.request.url.startsWith('chrome-extension')) {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then((cachedResponse) => {
          // Always return the cached HTML if available
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to network if not in cache (shouldn't happen after install)
          return fetch(event.request);
        })
    );
    return;
  }

  // Handle API requests with network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Only cache successful API responses
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(event.request);
        })
    );
    return;
  }

  // For all other static assets (JS, CSS, images)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Only cache successful responses
            if (response && response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return response;
          })
          .catch(() => {
            // Return empty response or placeholder for failed requests
            return new Response('', { status: 503, statusText: 'Offline' });
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service worker activated and old caches cleared');
      return self.clients.claim();
    })
  );
});

// Listen for messages from the page to check for updates
self.addEventListener('message', (event) => {
  if (event.data === 'checkForUpdates') {
    self.registration.update()
      .then(() => {
        event.source.postMessage('updateChecked');
      })
      .catch(err => {
        console.log('Update check failed:', err);
        event.source.postMessage('updateFailed');
      });
  }
});