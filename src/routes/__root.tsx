// src/routes/__root.tsx
import { EmbedUI } from "@/components/embed";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Outlet, Link, useRouterState } from "@tanstack/react-router";
import { createRootRoute } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect, useState } from "react";
import { ImageIcon, ContactIcon, SettingsIcon } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

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
    const { darkMode } = useAppContext();

    useEffect(() => {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
      return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    const activeTab = router.location.pathname.startsWith("/poster")
      ? "poster"
      : router.location.pathname.startsWith("/business-profile")
      ? "business-profile"
      : "settings";

    return (
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-[#0a0a23] relative overflow-x-auto overflow-y-auto">
        {/* Dotted background pattern - now with dark mode variant */}
        <div
          className="absolute h-full w-full inset-0 pointer-events-none"
          style={{
            backgroundImage: darkMode
              ? "radial-gradient(#3b82f6 0.5px, transparent 0.5px), radial-gradient(#3b82f6 0.5px, transparent 0.5px)"
              : "radial-gradient(#94a3b8 0.5px, transparent 0.5px), radial-gradient(#94a3b8 0.5px, transparent 0.5px)",
            backgroundSize: "10px 10px",
            backgroundPosition: "0 0, 10px 10px",
            opacity: darkMode ? 0.2 : 0.1,
          }}
        />

        <Header />
        
        {/* Desktop Tabs navigation (top) */}
        {!isMobile && (
          <div className="px-4 pt-4">
            <Tabs value={activeTab}>
              <TabsList className="bg-gray-200 dark:bg-gray-800 p-1.5 rounded-lg">
                <TabsTrigger
                  value="poster"
                  asChild
                  className="px-3 py-1 text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white
                             hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 rounded-md
                             data-[state=active]:hover:bg-blue-600"
                >
                  <Link to="/poster">Poster</Link>
                </TabsTrigger>
                <TabsTrigger
                  value="business-profile"
                  asChild
                  className="px-3 py-1 text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white
                             hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 rounded-md
                             data-[state=active]:hover:bg-blue-600"
                >
                  <Link to="/business-profile">E-Business Card</Link>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  asChild
                  className="px-3 py-1 text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white
                             hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 rounded-md
                             data-[state=active]:hover:bg-blue-600"
                >
                  <Link to="/settings">Settings</Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Tab content */}
        <main
            className={`flex flex-col px-4 ${
              isMobile ? 'pt-[110px] pb-20' : 'pt-[90px] pb-10'
            } overflow-auto max-h-screen`}
          >
          <Outlet />
          {import.meta.env.DEV && <TanStackRouterDevtools />}
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-200 dark:bg-[#0a0a23] border-t border-gray-300 dark:border-gray-700 shadow-lg z-50">
            <Tabs value={activeTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 p-0 h-16">
                <TabsTrigger
                  value="poster"
                  asChild
                  className="flex flex-col items-center justify-center h-full border border-gray-300 rounded-none
                            data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-gray-700 
                            data-[state=active]:text-blue-600 dark:data-[state=active]:text-green-400
                            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 
                            hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <Link to="/poster" className="flex flex-col items-center justify-center h-full w-full rounded-none">
                    <ImageIcon className="w-5 h-5 mb-1" />
                    <span className="text-xs">Poster</span>
                  </Link>
                </TabsTrigger>

                <TabsTrigger
                  value="business-profile"
                  asChild
                  className="flex flex-col items-center justify-center h-full border border-gray-300 rounded-none
                            data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-gray-700 
                            data-[state=active]:text-blue-600 dark:data-[state=active]:text-green-400
                            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 
                            hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <Link to="/business-profile" className="flex flex-col items-center justify-center h-full w-full rounded-none">
                    <ContactIcon className="w-5 h-5 mb-1" />
                    <span className="text-xs">E-Card</span>
                  </Link>
                </TabsTrigger>

                <TabsTrigger
                  value="settings"
                  asChild
                  className="flex flex-col items-center justify-center h-full border border-gray-300 rounded-none
                            data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-gray-700 
                            data-[state=active]:text-blue-600 dark:data-[state=active]:text-green-400
                            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 
                            hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <Link to="/settings" className="flex flex-col items-center justify-center h-full w-full rounded-none">
                    <SettingsIcon className="w-5 h-5 mb-1" />
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