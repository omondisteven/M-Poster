// src/routes/__root.tsx
import { EmbedUI } from "@/components/embed";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import React from 'react'; // Import React.

// Import your page components as default exports
import Home from "./index";
import QrResultsPage from "./QrResultsPage";

// Type your components properly
const HomeComponent: React.FC = Home; // Use React.FC
const QrResultsComponent: React.FC = QrResultsPage; // Use React.FC

const isEmbedDomain = () => {
  if (typeof window === "undefined") return false;
  return window.location.hostname.startsWith("embed.");
};

// Create the root route
export const Route = createRootRoute({
  component: () => {
    if (isEmbedDomain()) {
      return <EmbedUI />;
    }

    return (
      <>
        <div className="min-h-screen flex flex-col bg-gray-100 overflow-x-hidden relative">
          {/* Dotted background pattern */}
          <div
            className="absolute h-full w-full inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#3b82f6 0.5px, transparent 0.5px), radial-gradient(#3b82f6 0.5px, transparent 0.5px)",
              backgroundSize: "10px 10px",
              backgroundPosition: "0 0, 10px 10px",
              opacity: 0.2,
            }}
          />
          <Header />

          <main className="flex flex-col">
            <Outlet />
            {import.meta.env.DEV && <TanStackRouterDevtools />}
          </main>

          <Footer />
        </div>
      </>
    );
  },
});

// Define child routes
export const HomeRoute = createRoute({
  getParentRoute: () => Route,
  path: "/",
  component: HomeComponent,
});

export const QrResultsRoute = createRoute({
  getParentRoute: () => Route,
  path: "/QrResultsPage",
  component: QrResultsComponent,
});

// Declare all routes
export const routeTree = Route.addChildren([
  HomeRoute,
  QrResultsRoute,
]);

// Type declarations
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof routeTree;
  }
}