// src/routes/__root.tsx
import { EmbedUI } from "@/components/embed";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Outlet, Link } from "@tanstack/react-router";
import { createRootRoute } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const isEmbedDomain = () => {
  if (typeof window === "undefined") return false;
  return window.location.hostname.startsWith("embed.");
};

export const Route = createRootRoute({
  component: () => {
    if (isEmbedDomain()) {
      return <EmbedUI />;
    }

    const pathname = window.location.pathname;
    const activeTab =
      pathname.startsWith("/business-profile") ? "business-profile" : "poster";

    return (
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

        {/* Tabs navigation */}
        <Tabs value={activeTab} className="px-4 pt-4">
          <TabsList>
            <Link to="/poster">
              <TabsTrigger value="poster">Poster</TabsTrigger>
            </Link>
            <Link to="/business-profile">
              <TabsTrigger value="business-profile">Business Profile</TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>

        {/* Tab content */}
        <main className="flex flex-col px-4 pb-10">
          <Outlet />
          {import.meta.env.DEV && <TanStackRouterDevtools />}
        </main>

        <Footer />
      </div>
    );
  },
});
