import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Alias for a URL that picked up real traffic but never existed: it 404'd in
 * production with tracked pageviews. It permanently redirects to the canonical
 * article and renders nothing, so there is no duplicate content and no second
 * set of metadata competing with the canonical page.
 */
export const Route = createFileRoute("/learn/duck-vs-turkey-for-thanksgiving")({
  beforeLoad: () => {
    throw redirect({
      to: "/learn/duck-vs-turkey-thanksgiving",
      statusCode: 301,
      replace: true,
    });
  },
});
