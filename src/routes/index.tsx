//..src/route/index.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => null, // Empty component
  loader: () => {
    // Redirect to /poster if no path is specified
    if (window.location.pathname === "/") {
      throw redirect({
        to: "/poster",
        replace: true
      });
    }
  },
});