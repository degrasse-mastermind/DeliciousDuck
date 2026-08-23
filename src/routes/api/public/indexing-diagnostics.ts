import { createFileRoute } from "@tanstack/react-router";

/**
 * Self-serve diagnostics for the indexing pipeline.
 *
 * Call with `Authorization: Bearer <NEWSLETTER_ADMIN_TOKEN or the indexing
 * token>`. It verifies the supplied token, reports which secret it matched, and
 * says whether the next scheduled run would succeed.
 *
 * Read-only and credential-free: it returns presence flags, a verdict, and
 * timestamps — never a token value, property list, or PII.
 */
export const Route = createFileRoute("/api/public/indexing-diagnostics")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "cache-control": "private, no-store" };
        const { bearerToken } = await import("@/lib/indexing-monitor");
        const { authorizeIndexingToken, indexingDiagnostics } = await import(
          "@/lib/indexing-diagnostics.server"
        );
        const audience = await authorizeIndexingToken(
          bearerToken(request.headers.get("authorization")),
        );
        if (!audience) {
          return Response.json(
            {
              status: "unauthorized",
              accepts: ["NEWSLETTER_ADMIN_TOKEN", "INDEXING_CRON_TOKEN"],
            },
            { status: 401, headers },
          );
        }
        try {
          return Response.json(
            { status: "ok", diagnostics: await indexingDiagnostics(audience) },
            { headers },
          );
        } catch (error) {
          const reason = error instanceof Error ? error.message : "unknown_error";
          console.error(`[indexing] diagnostics failed: ${reason}`);
          return Response.json({ status: "error", reason }, { status: 502, headers });
        }
      },
    },
  },
});
