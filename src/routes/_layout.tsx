// src/routes/_layout.tsx
import { createFileRoute, useRouter, useRouterState } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

function MainLayout() {
  const router = useRouter();
  const currentPath = useRouterState().location.pathname;
  
  // Updated tab detection logic
  const currentTab = currentPath.startsWith('/poster') 
    ? 'poster' 
    : currentPath.startsWith('/business-profile') 
      ? 'business-profile' 
      : 'settings';

  const handleTabChange = (value: string) => {
    router.navigate({ to: `/${value}` });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg dark:bg-gray-800">
          <TabsTrigger 
            value="poster"
            className={`px-4 py-2 rounded-md transition-all ${
              currentTab === 'poster' 
                ? 'bg-white shadow-sm text-primary font-medium dark:bg-gray-700 dark:text-white' 
                : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Poster
          </TabsTrigger>
          <TabsTrigger 
            value="business-profile"
            className={`px-4 py-2 rounded-md transition-all ${
              currentTab === 'business-profile' 
                ? 'bg-white shadow-sm text-primary font-medium dark:bg-gray-700 dark:text-white' 
                : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            E-Business Card
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className={`px-4 py-2 rounded-md transition-all ${
              currentTab === 'settings' 
                ? 'bg-white shadow-sm text-primary font-medium dark:bg-gray-700 dark:text-white' 
                : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Settings
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/_layout")({
  component: MainLayout,
});