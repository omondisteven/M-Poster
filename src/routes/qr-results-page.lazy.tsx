import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/QrResultsPage')({
  component:  () => import("./QrResultsPage").then((mod) => mod.default),
});
