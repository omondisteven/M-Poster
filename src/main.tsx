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
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

let updateToastShown = false;
const UPDATE_TOAST_ID = 'sw-update-toast';

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none'
      });

      // Track updates
      trackUpdates(registration);
      
      // Check if page is loaded when offline
      if (!navigator.onLine) {
        console.log('App loaded in offline mode');
      }
      
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
      return null;
    }
  }
  return null;
};

const trackUpdates = (registration: ServiceWorkerRegistration) => {
  // Handle updates found during registration
  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;
    if (installingWorker) {
      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          handleWorkerUpdate();
        }
      });
    }
  });

  // Check for updates every 5 minutes
  setInterval(() => {
    registration.update().catch(err => {
      console.log('Service worker update check failed:', err);
    });
  }, 5 * 60 * 1000);
};

const handleWorkerUpdate = () => {
  if (updateToastShown) return;
  updateToastShown = true;

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
      duration: Infinity,
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
  window.addEventListener('load', () => {
    registerServiceWorker().then(registration => {
      if (registration && process.env.NODE_ENV === 'development') {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
      }
    });
  });
}

reportWebVitals();