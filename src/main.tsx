// src/main.tsx
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { AppProvider } from './context/AppContext'
import './styles.css'
import reportWebVitals from './reportWebVitals.ts'
import { Toaster } from "react-hot-toast";

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Check for saved dark mode preference before rendering
const savedDarkMode = localStorage.getItem('darkMode') === 'true';
if (savedDarkMode) {
  document.documentElement.classList.add('dark');
}

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {}, // You can add your context types here if needed
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Service Worker Registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Add version query parameter to force update
      const registration = await navigator.serviceWorker.register('/sw.js?v=' + Date.now());
      
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content available - prompt user to refresh
                console.log('New content is available; please refresh.');
                // Consider adding a UI prompt here
                window.location.reload();
              } else {
                console.log('Content is cached for offline use.');
              }
            }
          });
        }
      });

      // Check for updates more frequently in development
      const updateInterval = process.env.NODE_ENV === 'development' ? 
        5 * 60 * 1000 : // 5 minutes in development
        60 * 60 * 1000; // 1 hour in production
        
      setInterval(() => {
        registration.update().catch(err => 
          console.log('Service worker update check failed:', err)
        );
      }, updateInterval);
      
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
      return null;
    }
  }
  return null;
};

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </StrictMode>,
  );

  // Register service worker after render
  if (process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      registerServiceWorker().then(registration => {
        if (registration) {
          // Periodically check for updates
          setInterval(() => {
            registration.update().catch(err => 
              console.log('Service worker update check failed:', err)
            );
          }, 60 * 60 * 1000); // Check every hour
        }
      });
    });
  }
}

reportWebVitals();