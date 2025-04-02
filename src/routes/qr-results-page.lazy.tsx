import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/qr-results-page')({
  component:  () => import("./QrResultsPage").then((mod) => mod.default),
});
