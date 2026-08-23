import { createServerFn } from "@tanstack/react-start";

/**
 * Indexing monitor server functions.
 *
 * Thin wrappers only — runtime logic lives in `./indexing-monitor.server`,
 * imported inside the handlers so the server-only module (and the connector
 * credentials it reads) never reaches the client bundle.
 *
 * Both are token-gated with `NEWSLETTER_ADMIN_TOKEN`, the token the other
 * internal owner tools already use, so the internal page stays safe even
 * without an authentication boundary.
 */

function tokenInput(input: unknown): { token: string } {
  const token = (input as { token?: unknown } | null)?.token;
  return { token: typeof token === "string" ? token : "" };
}

function isOwner(token: string): boolean {
  const expected = process.env["NEWSLETTER_ADMIN_TOKEN"];
  return Boolean(expected) && token === expected;
}

/**
 * Authorization failures are returned, not thrown: a wrong token is an ordinary
 * outcome of a password field, and throwing surfaces it as an app runtime error.
 */
export const indexingReportFn = createServerFn({ method: "POST" })
  .validator(tokenInput)
  .handler(async ({ data }) => {
    if (!isOwner(data.token)) return { ok: false as const, reason: "not_authorized" as const };
    const { indexingReport } = await import("./indexing-monitor.server");
    return { ok: true as const, report: await indexingReport() };
  });

/** Manual capture, for checking a change without waiting for the scheduled run. */
export const captureIndexingSnapshotFn = createServerFn({ method: "POST" })
  .validator(tokenInput)
  .handler(async ({ data }) => {
    if (!isOwner(data.token)) return { ok: false as const, reason: "not_authorized" as const };
    const { captureIndexingSnapshot, indexingReport } = await import("./indexing-monitor.server");
    const capture = await captureIndexingSnapshot("manual");
    return { ok: true as const, capture, report: await indexingReport() };
  });
