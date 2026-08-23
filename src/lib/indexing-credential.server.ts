/**
 * Server-only access to the rotating scheduled-job credential.
 *
 * The scheduled job reads its bearer token from
 * `public.indexing_cron_credential` (a single private row the scheduler itself
 * can read), so rotating the token never requires pasting a new value into the
 * schedule's SQL. The `INDEXING_CRON_TOKEN` secret stays accepted as a fallback
 * for any caller still configured with it.
 *
 * Token values are never returned to the browser and never logged.
 */

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TABLE = "indexing_cron_credential";
const ROW_ID = 1;

export interface StoredCredential {
  token: string;
  rotatedAt: string;
}

/** Current rotating token, or null when rotation has never been run. */
export async function readStoredCredential(): Promise<StoredCredential | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("token, rotated_at")
    .eq("id", ROW_ID)
    .maybeSingle();
  if (error) {
    console.error(`[indexing] credential read failed: ${error.message}`);
    return null;
  }
  if (!data?.token) return null;
  return { token: data.token as string, rotatedAt: data.rotated_at as string };
}

/** Cryptographically random URL-safe token. */
function mintToken(bytes = 32): string {
  const raw = new Uint8Array(bytes);
  crypto.getRandomValues(raw);
  return Array.from(raw, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Rotates the scheduled job's token in place.
 *
 * Because both the endpoint and the schedule read this same row, the new token
 * takes effect on the next run with no other change anywhere.
 */
export async function rotateStoredCredential(): Promise<{ rotatedAt: string }> {
  const rotatedAt = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from(TABLE)
    .upsert({ id: ROW_ID, token: mintToken(), rotated_at: rotatedAt }, { onConflict: "id" });
  if (error) {
    console.error(`[indexing] credential rotation failed: ${error.message}`);
    throw new Error("credential_rotation_failed");
  }
  return { rotatedAt };
}
