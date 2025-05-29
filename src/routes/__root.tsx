// src/routes/__root.tsx
import { EmbedUI } from "@/components/embed";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Outlet, Link, useRouterState } from "@tanstack/react-router";
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

    const router = useRouterState();
    // Updated activeTab logic to include 'settings'
    const activeTab = router.location.pathname.startsWith("/poster")
      ? "poster"
      : router.location.pathname.startsWith("/business-profile")
      ? "business-profile"
      : "settings"; // Default to 'settings' if no other matches

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
        <div className="px-4 pt-4">
          <Tabs value={activeTab}>
            <TabsList className="bg-gray-200 p-1.5 rounded-lg">
              <TabsTrigger
                value="poster"
                asChild
                className="px-3 py-1 text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white
                           hover:bg-gray-300 transition-colors duration-200 rounded-md
                           data-[state=active]:hover:bg-blue-600"
              >
                <Link to="/poster">Poster</Link>
              </TabsTrigger>
              <TabsTrigger
                value="business-profile"
                asChild
                className="px-3 py-1 text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white
                           hover:bg-gray-300 transition-colors duration-200 rounded-md
                           data-[state=active]:hover:bg-blue-600"
              >
                <Link to="/business-profile">E-Business Card</Link>
              </TabsTrigger>
              {/* Add the Settings tab here */}
              <TabsTrigger
                value="settings"
                asChild
                className="px-3 py-1 text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white
                           hover:bg-gray-300 transition-colors duration-200 rounded-md
                           data-[state=active]:hover:bg-blue-600"
              >
                <Link to="/settings">Settings</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

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