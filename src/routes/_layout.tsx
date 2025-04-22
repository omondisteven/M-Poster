// src/routes/_layout.tsx
import { createFileRoute } from '@tanstack/react-router';
import { Outlet, Link, useRouterState } from '@tanstack/react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

function MainLayout() {
  const router = useRouterState();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Tabs value={router.location.pathname.split("/")[1] || "poster"}>
        <TabsList className="mb-6">
          <Link to="/poster">
            <TabsTrigger value="poster">Poster</TabsTrigger>
          </Link>
          <Link to="/business-profile">
            <TabsTrigger value="business-profile">Business Profile</TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>

      <Outlet />
    </div>
  );
}

// ✅ Export the Route properly
export const Route = createFileRoute('/_layout')({
  component: MainLayout,
});
