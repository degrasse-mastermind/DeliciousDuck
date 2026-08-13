import { RESEND_AUDIENCE_ID, type SubscribePayload } from "./newsletter-schema";
import { FIELD_GUIDE_URL } from "@/data/starter-guide";

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
export type WelcomeEvent = "pending" | "sent" | "error" | "skipped";

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
 * Fires the Resend custom event that triggers the welcome email carrying the
 * Field Guide download link. Send-on-first-subscribe: callers skip this when the row
 * already has `welcome_event_status = "sent"`, so repeat signups don't spam.
 */
async function sendWelcomeEvent(
  email: string,
  apiKey: string,
  meta: { interest?: string | undefined; source_path?: string | undefined },
): Promise<void> {
  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${apiKey}`,
  };

  const dispatch = () =>
    fetch("https://api.resend.com/events/send", {
      method: "POST",
      headers,
      body: JSON.stringify({
        event: "newsletter.subscribed",
        email,
        // Segment-ready, non-PII metadata for the 6-part welcome series.
        data: {
          guide_url: FIELD_GUIDE_URL,
          interest: meta.interest ?? "general",
          source_path: meta.source_path ?? "",
        },
      }),
    });

  let response = await dispatch();

  // The event definition may not exist yet in Resend; register it once (409 =
  // already registered, which is fine) and retry the dispatch.
  if (response.status === 404 || response.status === 422) {
    await fetch("https://api.resend.com/events", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "newsletter.subscribed",
        schema: { guide_url: "string", interest: "string", source_path: "string" },
      }),
    });
    response = await dispatch();
  }

  if (!response.ok) {
    const detail = await response.text();
    // Status + provider detail only — never the key.
    throw new Error(`resend_event_${response.status}: ${detail.slice(0, 300)}`);
  }
}

/**
 * Durably stores the subscriber, then best-effort syncs to Resend.
 * Throws only when durable storage fails.
 *
 * Idempotent by `email_normalized`: a repeat signup from a different page never
 * creates a second row. It refreshes the latest source/placement/interest,
 * appends the interest to the accumulated `interests` array, and bumps
 * `signup_count`.
 */
export async function persistSubscriber(data: SubscribePayload): Promise<{
  subscribed: true;
  resendSync: ResendSync;
  welcomeEvent: WelcomeEvent;
}> {
  const emailNormalized = data.email.trim().toLowerCase();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Read the existing row (if any) so interest history accumulates instead of
  // being overwritten by whichever page the visitor signed up from last.
  const { data: existing } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("id, interests, signup_count")
    .eq("email_normalized", emailNormalized)
    .maybeSingle();

  const priorInterests: string[] = Array.isArray(existing?.interests) ? existing.interests : [];
  const mergedInterests = data.interest
    ? Array.from(new Set([...priorInterests, data.interest]))
    : priorInterests;
  const now = new Date().toISOString();

  const { data: row, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .upsert(
      {
        email: emailNormalized,
        email_normalized: emailNormalized,
        // Conservative: only overwrite attribution when we actually have it.
        ...(data.source ? { source: data.source } : {}),
        ...(data.placement ? { placement: data.placement } : {}),
        ...(data.interest ? { interest: data.interest } : {}),
        ...(data.sourcePath ? { source_path: data.sourcePath } : {}),
        interests: mergedInterests,
        signup_count: (existing?.signup_count ?? 0) + 1,
        last_signup_at: now,
        status: "subscribed",
        unsubscribed_at: null,
        updated_at: now,
      },
      { onConflict: "email_normalized" },
    )
    .select("id, welcome_event_status")
    .single();

  if (error || !row) {
    console.error(`Newsletter storage failed: ${error?.message ?? "no row returned"}`);
    throw new Error("newsletter_storage_error");
  }

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return { subscribed: true, resendSync: "pending", welcomeEvent: "pending" };

  let contactId: string | null = null;
  try {
    contactId = await pushToResend(emailNormalized, apiKey);
    await supabaseAdmin
      .from("newsletter_subscribers")
      .update({
        resend_sync_status: "synced",
        resend_contact_id: contactId,
        last_resend_sync_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  } catch (err) {
    console.error(`Resend sync failed: ${err instanceof Error ? err.message : "unknown"}`);
    await supabaseAdmin
      .from("newsletter_subscribers")
      .update({
        resend_sync_status: "error",
        last_resend_sync_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return { subscribed: true, resendSync: "error", welcomeEvent: "pending" };
  }

  // Already welcomed on a previous signup — durable success, no repeat event.
  if (row.welcome_event_status === "sent") {
    return { subscribed: true, resendSync: "synced", welcomeEvent: "skipped" };
  }

  try {
    await sendWelcomeEvent(emailNormalized, apiKey, {
      interest: data.interest,
      source_path: data.sourcePath,
    });
    await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ welcome_event_status: "sent", welcome_event_at: new Date().toISOString() })
      .eq("id", row.id);
    return { subscribed: true, resendSync: "synced", welcomeEvent: "sent" };
  } catch (err) {
    console.error(`Welcome event failed: ${err instanceof Error ? err.message : "unknown"}`);
    await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ welcome_event_status: "error", welcome_event_at: new Date().toISOString() })
      .eq("id", row.id);
    return { subscribed: true, resendSync: "synced", welcomeEvent: "error" };
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
