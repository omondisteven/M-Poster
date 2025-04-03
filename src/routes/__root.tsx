// src/routes/__root.tsx
import { EmbedUI } from "@/components/embed";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
// import QrResultsPage from "../pages/QrResultsPage"

const isEmbedDomain = () => {
  if (typeof window === "undefined") return false;
  return window.location.hostname.startsWith("embed.");
};

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
