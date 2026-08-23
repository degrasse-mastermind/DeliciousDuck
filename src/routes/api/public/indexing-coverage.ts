import { createFileRoute } from "@tanstack/react-router";

/**
 * Scheduled coverage check.
 *
 * Called by the same scheduler as /api/public/indexing-snapshot, with
 * `Authorization: Bearer <indexing job token>`. Reads Google's indexed version
 * of a bounded, rotating batch of site URLs via URL Inspection and stores the
 * result. It never requests indexing, a re-crawl, or a live test, and it never
 * resubmits the sitemap.
 *
 * Responses carry counts and Google's own coverage wording only — no
 * credentials, no property list, no PII.
 */
export const Route = createFileRoute("/api/public/indexing-coverage")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { bearerToken } = await import("@/lib/indexing-monitor");
        const { authorizeIndexingToken } = await import("@/lib/indexing-diagnostics.server");
        if (!(await authorizeIndexingToken(bearerToken(request.headers.get("authorization"))))) {
          return new Response("Unauthorized", {
            status: 401,
            headers: { "cache-control": "private, no-store" },
          });
        }

        const { captureCoverageSnapshot } = await import("@/lib/indexing-coverage.server");
        try {
          const result = await captureCoverageSnapshot("cron");
          return Response.json(result, {
            status: result.status === "ok" ? 200 : 409,
            headers: { "cache-control": "private, no-store" },
          });
        } catch (error) {
          const reason = error instanceof Error ? error.message : "unknown_error";
          console.error(`[indexing] scheduled coverage capture failed: ${reason}`);
          return Response.json(
            { status: "error", reason },
            { status: 502, headers: { "cache-control": "private, no-store" } },
          );
        }
      },
    },
  },
});
