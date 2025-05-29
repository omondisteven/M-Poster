// src/main.tsx
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { AppProvider } from './context/AppContext'
import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

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

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </StrictMode>,
  )
}

reportWebVitals()