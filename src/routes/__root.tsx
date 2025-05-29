// src/routes/__root.tsx
import { EmbedUI } from "@/components/embed";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Outlet, Link, useRouterState } from "@tanstack/react-router";
import { createRootRoute } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect, useState } from "react";

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
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount and resize
    useEffect(() => {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
      };

      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
      return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    // Updated activeTab logic to include 'settings'
    const activeTab = router.location.pathname.startsWith("/poster")
      ? "poster"
      : router.location.pathname.startsWith("/business-profile")
      ? "business-profile"
      : "settings";

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

        <div className="sticky top-0 z-50 bg-white shadow">
          <Header />
        </div>
        {/* Desktop Tabs navigation (top) */}
        {!isMobile && (
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
        )}

        {/* Tab content */}
        <main className={`flex flex-col px-4 ${isMobile ? 'pb-20' : 'pb-10'}`}>
          <Outlet />
          {import.meta.env.DEV && <TanStackRouterDevtools />}
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <Tabs value={activeTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 p-0 h-16">
                <TabsTrigger
                  value="poster"
                  asChild
                  className="flex flex-col items-center justify-center h-full rounded-none
                             data-[state=active]:text-blue-500 data-[state=active]:bg-blue-50
                             hover:bg-gray-100 transition-colors duration-200"
                >
                  <Link to="/poster" className="flex flex-col items-center justify-center h-full w-full">
                    <span className="text-xs">Poster</span>
                  </Link>
                </TabsTrigger>
                <TabsTrigger
                  value="business-profile"
                  asChild
                  className="flex flex-col items-center justify-center h-full rounded-none
                             data-[state=active]:text-blue-500 data-[state=active]:bg-blue-50
                             hover:bg-gray-100 transition-colors duration-200"
                >
                  <Link to="/business-profile" className="flex flex-col items-center justify-center h-full w-full">
                    <span className="text-xs">E-Card</span>
                  </Link>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  asChild
                  className="flex flex-col items-center justify-center h-full rounded-none
                             data-[state=active]:text-blue-500 data-[state=active]:bg-blue-50
                             hover:bg-gray-100 transition-colors duration-200"
                >
                  <Link to="/settings" className="flex flex-col items-center justify-center h-full w-full">
                    <span className="text-xs">Settings</span>
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        <Footer />
      </div>
    );
  },
});