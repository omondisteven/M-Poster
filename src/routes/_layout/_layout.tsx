import Footer from "@/components/footer";
import Header from "@/components/header";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_layout")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-100 overflow-x-hidden relative">
        {/* Dotted background pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#3b82f6 0.5px, transparent 0.5px), radial-gradient(#3b82f6 0.5px, transparent 0.5px)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 10px 10px",
            opacity: 0.2,
          }}
        />
        <Header />

        <main className="flex flex-col">
          <Outlet />
        </main>

        <Footer />
      </div>
    </>
  );
}
