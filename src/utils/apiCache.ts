// src/utils/apiCache.ts
const API_CACHE_NAME = 'api-cache-v1';

export async function cachedFetch(url: string, options: RequestInit = {}) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(url);

  if (cachedResponse) {
    return cachedResponse.json();
  }

  try {
    const response = await fetch(url, options);
    
    if (response.ok) {
      // Clone the response to store in cache and use
      const responseClone = response.clone();
      cache.put(url, responseClone);
    }
    
    return response.json();
  } catch (error) {
    // If offline and no cache, return a fallback
    if (!navigator.onLine) {
      return { error: "Offline - No cached data available" };
    }
    throw error;
  }
}