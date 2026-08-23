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

function assertOwner(token: string): void {
  const expected = process.env["NEWSLETTER_ADMIN_TOKEN"];
  if (!expected || token !== expected) throw new Error("not_authorized");
}

/** Stored snapshot history: last processed time, indexed trend, error counts. */
export const indexingReportFn = createServerFn({ method: "POST" })
  .validator(tokenInput)
  .handler(async ({ data }) => {
    assertOwner(data.token);
    const { indexingReport } = await import("./indexing-monitor.server");
    return await indexingReport();
  });

/** Manual capture, for checking a change without waiting for the scheduled run. */
export const captureIndexingSnapshotFn = createServerFn({ method: "POST" })
  .validator(tokenInput)
  .handler(async ({ data }) => {
    assertOwner(data.token);
    const { captureIndexingSnapshot, indexingReport } = await import("./indexing-monitor.server");
    const capture = await captureIndexingSnapshot("manual");
    return { capture, report: await indexingReport() };
  });
