import { createServerFn } from "@tanstack/react-start";

/**
 * Indexing monitor server functions.
 *
 * Thin wrappers only — runtime logic lives in the server-only modules imported
 * inside each handler, so the connector credentials they read never reach the
 * client bundle.
 *
 * Authentication accepts EITHER owner secret — `NEWSLETTER_ADMIN_TOKEN` or the
 * scheduled job's token (`INDEXING_CRON_TOKEN`, or the rotating token held in
 * the database) — so no secret has to be duplicated to read this dashboard.
 *
 * Authorization failures are returned, not thrown: a wrong token is an ordinary
 * outcome of a password field, and throwing surfaces it as an app runtime error.
 */

function tokenInput(input: unknown): { token: string } {
  const token = (input as { token?: unknown } | null)?.token;
  return { token: typeof token === "string" ? token : "" };
}

const DENIED = { ok: false as const, reason: "not_authorized" as const };

export const indexingReportFn = createServerFn({ method: "POST" })
  .validator(tokenInput)
  .handler(async ({ data }) => {
    const { authorizeIndexingToken } = await import("./indexing-diagnostics.server");
    const audience = await authorizeIndexingToken(data.token);
    if (!audience) return DENIED;
    const { indexingReport } = await import("./indexing-monitor.server");
    return { ok: true as const, audience, report: await indexingReport() };
  });

/** Manual capture, for checking a change without waiting for the scheduled run. */
export const captureIndexingSnapshotFn = createServerFn({ method: "POST" })
  .validator(tokenInput)
  .handler(async ({ data }) => {
    const { authorizeIndexingToken } = await import("./indexing-diagnostics.server");
    if (!(await authorizeIndexingToken(data.token))) return DENIED;
    const { captureIndexingSnapshot, indexingReport } = await import("./indexing-monitor.server");
    const capture = await captureIndexingSnapshot("manual");
    return { ok: true as const, capture, report: await indexingReport() };
  });

/** Self-serve check: which token was used, and would the next scheduled run work. */
export const indexingDiagnosticsFn = createServerFn({ method: "POST" })
  .validator(tokenInput)
  .handler(async ({ data }) => {
    const { authorizeIndexingToken, indexingDiagnostics } = await import(
      "./indexing-diagnostics.server"
    );
    const audience = await authorizeIndexingToken(data.token);
    if (!audience) return DENIED;
    return { ok: true as const, diagnostics: await indexingDiagnostics(audience) };
  });

/**
 * Rolls the scheduled job's token. The schedule reads the same database row, so
 * the new value takes effect on the next run with no SQL edit and no copy-paste.
 */
export const rotateIndexingCronTokenFn = createServerFn({ method: "POST" })
  .validator(tokenInput)
  .handler(async ({ data }) => {
    const { authorizeIndexingToken, indexingDiagnostics } = await import(
      "./indexing-diagnostics.server"
    );
    const audience = await authorizeIndexingToken(data.token);
    if (!audience) return DENIED;
    const { rotateStoredCredential } = await import("./indexing-credential.server");
    const { rotatedAt } = await rotateStoredCredential();
    return { ok: true as const, rotatedAt, diagnostics: await indexingDiagnostics(audience) };
  });
