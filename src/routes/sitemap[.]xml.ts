import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { sitemapXml } from "@/lib/sitemap";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(sitemapXml(), {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
