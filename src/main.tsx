// src/main.tsx
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { AppProvider } from './context/AppContext'
import './styles.css'
import reportWebVitals from './reportWebVitals.ts'
import { Toaster, toast } from "react-hot-toast";

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

// Track if we've shown the update toast
let updateToastShown = false;
const UPDATE_TOAST_ID = 'sw-update-toast';

// Service Worker Registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none' // Important for fresh updates
      });

      // Track the registration for updates
      trackUpdates(registration);
      
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
      return null;
    }
  }
  return null;
};

// Function to handle update tracking
const trackUpdates = (registration: ServiceWorkerRegistration) => {
  // Handle updates found during registration
  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;
    if (installingWorker) {
      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed') {
          handleWorkerUpdate();
        }
      });
    }
  });

  // Also check periodically for updates
  const updateInterval = process.env.NODE_ENV === 'development' ? 
    5 * 60 * 1000 : // 5 minutes in development
    5 * 60 * 1000; // 5 minutes in production

  const updateCheck = () => {
    registration.update().catch(err => {
      console.log('Service worker update check failed:', err);
    });
  };

  // Initial check after 30 seconds (give time for initial load)
  setTimeout(updateCheck, 30000);
  
  // Then check periodically
  setInterval(updateCheck, updateInterval);
};

// Handle worker update notification
const handleWorkerUpdate = () => {
  if (!navigator.serviceWorker.controller) {
    // Initial installation, not an update
    console.log('Content is cached for offline use.');
    return;
  }

  // Only show the toast once
  if (updateToastShown) return;
  updateToastShown = true;

  console.log('New content is available; please refresh.');

  // Show toast with refresh action
  toast(
    (t) => (
      <div className="flex flex-col gap-2">
        <span>A new version is available, refresh your browser!</span>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              window.location.reload();
            }}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Refresh
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-600 text-white rounded"
          >
            Later
          </button>
        </div>
      </div>
    ),
    {
      id: UPDATE_TOAST_ID,
      duration: Infinity, // Stay until dismissed
      position: 'top-center',
      style: {
        background: '#363636',
        color: '#fff',
      },
    }
  );
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
        if (registration && process.env.NODE_ENV === 'development') {
          console.log('ServiceWorker registration successful with scope:', registration.scope);
        }
      });
    });
  }
}

reportWebVitals();