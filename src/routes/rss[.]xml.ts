import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { rssXml } from "@/lib/rss";

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(rssXml(), {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
