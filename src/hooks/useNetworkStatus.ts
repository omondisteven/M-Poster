// src/hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialize with current status, but default to true if navigator.onLine is not available
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Additional check for cases where the event might not fire
    const checkOnlineStatus = async () => {
      try {
        const response = await fetch('https://httpbin.org/get', { 
          method: 'HEAD',
          cache: 'no-store' 
        });
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };

    // Check periodically (every 2 minutes)
    const intervalId = setInterval(checkOnlineStatus, 120000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return isOnline;
}