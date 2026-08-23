/**
 * Server-only diagnostics for the indexing pipeline.
 *
 * Answers two owner questions without ever revealing a secret value:
 * which token a caller just used, and whether the next scheduled run would
 * succeed. Everything returned is presence/recency information only.
 */

import { readStoredCredential } from "./indexing-credential.server";
import { lastSnapshotAt } from "./indexing-monitor.server";
import {
  scheduledRunVerdict,
  type ScheduledRunVerdict,
  type TokenAudience,
} from "./indexing-monitor";

export interface IndexingDiagnostics {
  /** Which secret the caller's token matched. */
  authenticatedAs: TokenAudience;
  tokens: {
    adminSecretConfigured: boolean;
    cronSecretConfigured: boolean;
    rotatingTokenConfigured: boolean;
    rotatingTokenRotatedAt: string | null;
  };
  searchConsoleConfigured: boolean;
  lastScheduledSnapshotAt: string | null;
  scheduledRun: ScheduledRunVerdict;
}

export async function indexingDiagnostics(
  authenticatedAs: TokenAudience,
): Promise<IndexingDiagnostics> {
  const stored = await readStoredCredential();
  const lastScheduledSnapshotAt = await lastSnapshotAt("cron");
  const searchConsoleConfigured = Boolean(
    process.env["LOVABLE_API_KEY"] && process.env["GOOGLE_SEARCH_CONSOLE_API_KEY"],
  );
  const envTokenConfigured = Boolean(process.env["INDEXING_CRON_TOKEN"]);

  return {
    authenticatedAs,
    tokens: {
      adminSecretConfigured: Boolean(process.env["NEWSLETTER_ADMIN_TOKEN"]),
      cronSecretConfigured: envTokenConfigured,
      rotatingTokenConfigured: stored !== null,
      rotatingTokenRotatedAt: stored?.rotatedAt ?? null,
    },
    searchConsoleConfigured,
    lastScheduledSnapshotAt,
    scheduledRun: scheduledRunVerdict({
      envTokenConfigured,
      rotatingTokenConfigured: stored !== null,
      searchConsoleConfigured,
      lastCronSnapshotAt: lastScheduledSnapshotAt,
      now: new Date(),
    }),
  };
}

/** Shared authorization for the internal indexing surfaces. */
export async function authorizeIndexingToken(token: string): Promise<TokenAudience | null> {
  const { resolveTokenAudience } = await import("./indexing-monitor");
  const stored = await readStoredCredential();
  return resolveTokenAudience(token, {
    admin: process.env["NEWSLETTER_ADMIN_TOKEN"],
    cron: process.env["INDEXING_CRON_TOKEN"],
    rotating: stored?.token,
  });
}
