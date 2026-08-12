import { RESEND_AUDIENCE_ID, type SubscribePayload } from "./newsletter-schema";

/**
 * Server-only newsletter logic.
 *
 * The project database is the source of truth: a signup succeeds the moment the
 * subscriber row is durably stored. Resend is a downstream delivery sync layer,
 * tracked per row via `resend_sync_status` (pending | synced | error). A missing
 * or failing Resend key never costs us a subscriber.
 *
 * `RESEND_API_KEY` is read inside these functions only and is never returned,
 * logged, or exposed to the client.
 */

export type ResendSync = "pending" | "synced" | "error";

/**
 * Best-effort in-memory rate limit. The worker runtime gives no shared store,
 * so this stops trivial floods per instance without pretending to be durable.
 */
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

export function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (HITS.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(key, recent);
  if (HITS.size > 500) {
    for (const [k, v] of HITS) if (v.every((t) => now - t >= WINDOW_MS)) HITS.delete(k);
  }
  return recent.length > MAX_PER_WINDOW;
}

/**
 * Creates/ensures the contact in the Resend audience.
 * 201 = new, 200/409 = already a member — all idempotent successes.
 */
async function pushToResend(email: string, apiKey: string): Promise<string | null> {
  const response = await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ email, unsubscribed: false }),
  });

  if (response.ok || response.status === 409) {
    try {
      const body = (await response.json()) as { id?: string; data?: { id?: string } };
      return body.id ?? body.data?.id ?? null;
    } catch {
      return null;
    }
  }

  const detail = await response.text();
  // Status + provider detail only — never the key.
  throw new Error(`resend_${response.status}: ${detail.slice(0, 300)}`);
}

/**
 * Durably stores the subscriber, then best-effort syncs to Resend.
 * Throws only when durable storage fails.
 */
export async function persistSubscriber(data: SubscribePayload): Promise<{
  subscribed: true;
  resendSync: ResendSync;
}> {
  const emailNormalized = data.email.trim().toLowerCase();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: row, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .upsert(
      {
        email: emailNormalized,
        email_normalized: emailNormalized,
        // Conservative: only overwrite attribution when we actually have it.
        ...(data.source ? { source: data.source } : {}),
        ...(data.placement ? { placement: data.placement } : {}),
        status: "subscribed",
        unsubscribed_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email_normalized" },
    )
    .select("id")
    .single();

  if (error || !row) {
    console.error(`Newsletter storage failed: ${error?.message ?? "no row returned"}`);
    throw new Error("newsletter_storage_error");
  }

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return { subscribed: true, resendSync: "pending" };

  try {
    const contactId = await pushToResend(emailNormalized, apiKey);
    await supabaseAdmin
      .from("newsletter_subscribers")
      .update({
        resend_sync_status: "synced",
        resend_contact_id: contactId,
        last_resend_sync_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return { subscribed: true, resendSync: "synced" };
  } catch (err) {
    console.error(`Resend sync failed: ${err instanceof Error ? err.message : "unknown"}`);
    await supabaseAdmin
      .from("newsletter_subscribers")
      .update({
        resend_sync_status: "error",
        last_resend_sync_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return { subscribed: true, resendSync: "error" };
  }
}

/**
 * Internal retry utility for rows that never reached Resend.
 * Returns counts only — never subscriber emails.
 */
export async function resyncPendingSubscribers(limit = 200): Promise<{
  attempted: number;
  synced: number;
  failed: number;
  skipped: "no_api_key" | null;
}> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return { attempted: 0, synced: 0, failed: 0, skipped: "no_api_key" };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: rows, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("id, email_normalized")
    .eq("status", "subscribed")
    .in("resend_sync_status", ["pending", "error"])
    .limit(Math.min(Math.max(limit, 1), 500));

  if (error) throw new Error("newsletter_storage_error");

  let synced = 0;
  let failed = 0;
  for (const row of rows ?? []) {
    try {
      const contactId = await pushToResend(row.email_normalized, apiKey);
      await supabaseAdmin
        .from("newsletter_subscribers")
        .update({
          resend_sync_status: "synced",
          resend_contact_id: contactId,
          last_resend_sync_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      synced += 1;
    } catch {
      failed += 1;
      await supabaseAdmin
        .from("newsletter_subscribers")
        .update({
          resend_sync_status: "error",
          last_resend_sync_at: new Date().toISOString(),
        })
        .eq("id", row.id);
    }
  }

  return { attempted: (rows ?? []).length, synced, failed, skipped: null };
}
