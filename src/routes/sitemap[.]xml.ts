import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { GUIDES } from "@/data/guides";
import { RECIPES } from "@/data/recipes";
import { TOOLS } from "@/data/tools";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/cook", changefreq: "weekly", priority: "0.9" },
          { path: "/recipes", changefreq: "weekly", priority: "0.9" },
          ...RECIPES.map((r) => ({
            path: `/recipes/${r.slug}`,
            changefreq: "monthly" as const,
            priority: "0.9",
          })),
          { path: "/learn", changefreq: "weekly", priority: "0.9" },
          { path: "/buy", changefreq: "monthly", priority: "0.8" },
          { path: "/gear", changefreq: "monthly", priority: "0.8" },
          { path: "/ingredients", changefreq: "monthly", priority: "0.7" },
          { path: "/tools", changefreq: "monthly", priority: "0.8" },
          ...GUIDES.map((g) => ({
            path: g.path,
            changefreq: "monthly" as const,
            priority: g.kind === "money" ? "0.8" : "0.9",
          })),
          ...TOOLS.filter((t) => t.status === "live" && t.to).map((t) => ({
            path: t.to!,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          { path: "/about", changefreq: "yearly", priority: "0.5" },
          { path: "/affiliate-disclosure", changefreq: "yearly", priority: "0.3" },
          { path: "/editorial-standards", changefreq: "yearly", priority: "0.3" },
          { path: "/privacy", changefreq: "yearly", priority: "0.2" },
          { path: "/terms", changefreq: "yearly", priority: "0.2" },
        ];

        const seen = new Set<string>();
        const urls = entries
          .filter((e) => (seen.has(e.path) ? false : (seen.add(e.path), true)))
          .map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
              e.priority ? `    <priority>${e.priority}</priority>` : null,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
