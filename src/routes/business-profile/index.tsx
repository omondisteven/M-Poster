//..src/route/businessprofile/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import BusinessProfile from "@/components/BusinessProfile";

export const Route = createFileRoute("/business-profile/")({
  component: BusinessProfile,
});
