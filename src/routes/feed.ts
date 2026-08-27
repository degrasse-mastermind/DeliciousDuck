import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { RSS_PATH } from "@/lib/rss";

/** Conventional alias: `/feed` permanently redirects to the canonical feed. */
export const Route = createFileRoute("/feed")({
  server: {
    handlers: {
      GET: async () =>
        new Response(null, {
          status: 301,
          headers: { Location: RSS_PATH, "Cache-Control": "public, max-age=3600" },
        }),
    },
  },
});
