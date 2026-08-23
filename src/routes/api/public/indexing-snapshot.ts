import { createFileRoute } from "@tanstack/react-router";

/**
 * Scheduled indexing check.
 *
 * Called by an external scheduler (pg_cron, GitHub Actions, any cron service)
 * with `Authorization: Bearer $INDEXING_CRON_TOKEN`. Read-only against Search
 * Console: it reads the sitemap's status and appends one snapshot row. It never
 * resubmits the sitemap and never inspects individual URLs on a schedule.
 *
 * Responses carry counts only — no credentials, no property list, no PII.
 */
export const Route = createFileRoute("/api/public/indexing-snapshot")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { authorizeCronRequest } = await import("@/lib/indexing-monitor");
        if (
          !authorizeCronRequest(
            request.headers.get("authorization"),
            process.env["INDEXING_CRON_TOKEN"],
          )
        ) {
          return new Response("Unauthorized", {
            status: 401,
            headers: { "cache-control": "private, no-store" },
          });
        }

        const { captureIndexingSnapshot } = await import("@/lib/indexing-monitor.server");
        try {
          const result = await captureIndexingSnapshot("cron");
          const body =
            result.status === "ok"
              ? {
                  status: "ok",
                  processing: result.processing,
                  submitted: result.snapshot.submittedCount,
                  indexed: result.snapshot.indexedCount,
                  errors: result.snapshot.errorCount,
                  warnings: result.snapshot.warningCount,
                }
              : result;
          return Response.json(body, {
            status: result.status === "ok" ? 200 : 409,
            headers: { "cache-control": "private, no-store" },
          });
        } catch (error) {
          const reason = error instanceof Error ? error.message : "unknown_error";
          console.error(`[indexing] scheduled capture failed: ${reason}`);
          return Response.json(
            { status: "error", reason },
            { status: 502, headers: { "cache-control": "private, no-store" } },
          );
        }
      },
    },
  },
});
