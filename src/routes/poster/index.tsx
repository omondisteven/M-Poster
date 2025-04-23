//..src/route/poster/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import PosterPage from "@/components/PosterPage";

export const Route = createFileRoute("/poster/")({
  component: PosterPage,
});
