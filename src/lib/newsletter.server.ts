import { RESEND_AUDIENCE_ID, type SubscribePayload } from "./newsletter-schema";
import { NEWSLETTER_CONSENT, privacyPolicyUrl } from "./newsletter-consent";
import { decideSignup } from "./newsletter-status";
import { SITE } from "@/data/site";
import { FIELD_GUIDE_URL } from "@/data/starter-guide";
import { DUCK_DROP } from "@/data/duck-drop";

/**
 * Server-only newsletter logic.
 *
 * The project database is the source of truth: a signup succeeds the moment the
 * subscriber row is durably stored. Resend is a downstream delivery sync layer,
 * tracked per row via `resend_sync_status` (pending | synced | error). A missing
 * or failing Resend key never costs us a subscriber.
 *
 * Segmentation lives here, not in Resend: the plan allows only three segments,
 * so our database holds `primary_interest` / `interests` / `lifecycle_stage` and
 * we mirror just the one interest segment the provider can hold.
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
 * Mirrors the one interest segment the Resend plan can hold (duck breast).
 * Best-effort by design: our database stays authoritative, and a provider that
 * rejects or lacks the segment endpoint must never break a signup.
 */
async function syncInterestSegment(
  email: string,
  apiKey: string,
  primaryInterest: string | null,
): Promise<void> {
  if (primaryInterest !== "duck-breast") return;
  try {
    const response = await fetch(
      `https://api.resend.com/segments/${DUCK_DROP.breastSegmentId}/contacts`,
      {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ email }),
      },
    );
    if (!response.ok && response.status !== 409) {
      // Status only — never the key, never the address.
      console.warn(`Interest segment sync skipped: status ${response.status}`);
    }
  } catch {
    console.warn("Interest segment sync skipped: request failed");
  }
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
 *
 * Segmentation fields:
 * - `primary_interest` is set from the signup page cluster on first subscribe and
 *   then left alone; only an explicit subscriber choice changes it.
 * - `first_content_path` records where the relationship began and never moves.
 * - `lifecycle_stage` starts at `welcome` and is advanced deliberately, never
 *   inferred from opens.
 *
 * Returns a `preferenceToken` ONLY for a brand-new subscriber, so the success
 * panel in that same session can let them adjust their interest without us
 * accepting an email address as proof of ownership.
 */
export async function persistSubscriber(data: SubscribePayload): Promise<{
  subscribed: true;
  resendSync: ResendSync;
  welcomeEvent: WelcomeEvent;
  primaryInterest: string | null;
  preferenceToken: string | null;
  /** Internal only: true when the address is in a suppressed state. Never surfaced. */
  suppressed: boolean;
}> {
  const emailNormalized = data.email.trim().toLowerCase();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Read the existing row (if any) so interest history accumulates instead of
  // being overwritten by whichever page the visitor signed up from last, and so
  // suppressed addresses can be detected before anything is written.
  const { data: existing } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select(
      "id, interests, signup_count, primary_interest, first_content_path, status, consent_record, welcome_event_status",
    )
    .eq("email_normalized", emailNormalized)
    .maybeSingle();

  const decision = decideSignup(
    existing
      ? {
          status: String(existing.status),
          consent_record: (existing as { consent_record?: string | null }).consent_record ?? null,
          welcome_event_status: existing.welcome_event_status ?? null,
        }
      : null,
  );

  // Suppression-safe: an unsubscribed / bounced / complained / suppressed address
  // is never reactivated, re-synced, or re-emailed by a form submission. We write
  // nothing at all and return the same generic shape a fresh signup returns, so
  // the response cannot be used to enumerate list membership or account state.
  if (decision.action === "blocked") {
    console.warn(`Newsletter signup ignored for suppressed address (status: ${decision.status})`);
    return {
      subscribed: true,
      resendSync: "pending",
      // No email is triggered, and the UI never claims one was.
      welcomeEvent: "pending",
      primaryInterest: null,
      preferenceToken: null,
      suppressed: true,
    };
  }

  const priorInterests: string[] = Array.isArray(existing?.interests) ? existing.interests : [];
  const mergedInterests = data.interest
    ? Array.from(new Set([...priorInterests, data.interest]))
    : priorInterests;
  const isNew = !existing;
  const primaryInterest = existing?.primary_interest ?? data.interest ?? null;
  const now = new Date().toISOString();

  /**
   * Durable consent evidence for this accepted submission. The timestamp is
   * generated server-side (never trusted from the client), and the version is
   * the one the schema validated against the text the form actually rendered.
   * No IP address is stored: abuse protection uses a per-instance in-memory
   * counter keyed on the request IP that is never persisted or logged.
   */
  const consentEvidence = {
    consented_at: now,
    consent_text_version: NEWSLETTER_CONSENT.version,
    consent_source_path: data.sourcePath ?? null,
    privacy_policy_version: NEWSLETTER_CONSENT.privacyPolicyVersion,
    privacy_policy_url: privacyPolicyUrl(SITE.baseUrl),
    consent_record: "explicit" as const,
  };

  const payload = {
    email: emailNormalized,
    email_normalized: emailNormalized,
    // Conservative: only overwrite attribution when we actually have it.
    ...(data.source ? { source: data.source } : {}),
    ...(data.placement ? { placement: data.placement } : {}),
    ...(data.interest ? { interest: data.interest } : {}),
    ...(data.sourcePath ? { source_path: data.sourcePath } : {}),
    // First-touch only: never rewritten by a later signup.
    ...(primaryInterest ? { primary_interest: primaryInterest } : {}),
    ...(existing?.first_content_path
      ? {}
      : data.sourcePath
        ? { first_content_path: data.sourcePath }
        : {}),
    interests: mergedInterests,
    signup_count: (existing?.signup_count ?? 0) + 1,
    last_signup_at: now,
    // Only ever written for a row that is absent or already "subscribed";
    // suppressed rows returned above and are never reached here.
    status: "subscribed" as const,
    unsubscribed_at: null,
    updated_at: now,
    ...consentEvidence,
  };

  const selection = "id, welcome_event_status, primary_interest, preference_token";
  const { data: row, error } =
    decision.action === "create"
      ? await supabaseAdmin
          .from("newsletter_subscribers")
          .insert(payload)
          .select(selection)
          .single()
      : await supabaseAdmin
          .from("newsletter_subscribers")
          .update(payload)
          .eq("id", existing!.id)
          // Defensive: refuse the write if the row changed state concurrently.
          .eq("status", "subscribed")
          .select(selection)
          .single();

  if (error || !row) {
    console.error(`Newsletter storage failed: ${error?.message ?? "no row returned"}`);
    throw new Error("newsletter_storage_error");
  }

  // In-session preference editing is offered to first-time subscribers only.
  const preferenceToken = isNew ? (row.preference_token as string | null) : null;
  const base = {
    subscribed: true as const,
    primaryInterest: (row.primary_interest as string | null) ?? null,
    preferenceToken,
    suppressed: false,
  };

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return { ...base, resendSync: "pending", welcomeEvent: "pending" };



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
    return { ...base, resendSync: "error", welcomeEvent: "pending" };
  }

  await syncInterestSegment(emailNormalized, apiKey, base.primaryInterest);

  // Already welcomed on a previous signup — durable success, no repeat event.
  if (row.welcome_event_status === "sent") {
    return { ...base, resendSync: "synced", welcomeEvent: "skipped" };
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
    return { ...base, resendSync: "synced", welcomeEvent: "sent" };
  } catch (err) {
    console.error(`Welcome event failed: ${err instanceof Error ? err.message : "unknown"}`);
    await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ welcome_event_status: "error", welcome_event_at: new Date().toISOString() })
      .eq("id", row.id);
    return { ...base, resendSync: "synced", welcomeEvent: "error" };
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

/**
 * Applies an explicit interest choice made by the subscriber in the same session
 * they signed up in, authorised by the opaque row token issued at that moment.
 *
 * Deliberately token-based, not email-based: accepting `{ email, interest }` from
 * the browser would let anyone rewrite a stranger's preferences by guessing an
 * address. Tokens are single-purpose, carry no PII, and only ever reach the
 * browser that just completed the signup.
 */
export async function applyInterestChoice(
  token: string,
  interest: string,
): Promise<{ updated: boolean }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date().toISOString();

  const { data: row, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("id, interests")
    .eq("preference_token", token)
    .eq("status", "subscribed")
    .maybeSingle();

  if (error) throw new Error("newsletter_storage_error");
  if (!row) return { updated: false };

  const priorInterests: string[] = Array.isArray(row.interests) ? row.interests : [];
  const { error: updateError } = await supabaseAdmin
    .from("newsletter_subscribers")
    .update({
      primary_interest: interest,
      interest,
      interests: Array.from(new Set([...priorInterests, interest])),
      last_engagement_at: now,
      updated_at: now,
    })
    .eq("id", row.id);

  if (updateError) throw new Error("newsletter_storage_error");

  const apiKey = process.env["RESEND_API_KEY"];
  if (apiKey) {
    const { data: fresh } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email_normalized")
      .eq("id", row.id)
      .maybeSingle();
    if (fresh?.email_normalized) {
      await syncInterestSegment(fresh.email_normalized, apiKey, interest);
    }
  }

  return { updated: true };
}

/**
 * Aggregate-only list health for the internal dashboard.
 * Counts and bucket labels exclusively — never an address, name, or row ID.
 */
export async function newsletterAggregates(): Promise<{
  total: number;
  newLast7Days: number;
  newLast30Days: number;
  interestMix: { key: string; count: number }[];
  sourceMix: { key: string; count: number }[];
  lifecycleMix: { key: string; count: number }[];
  syncPending: number;
  welcomePending: number;
  repeatSignups: number;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: rows, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select(
      "primary_interest, placement, source, lifecycle_stage, subscribed_at, resend_sync_status, welcome_event_status, signup_count, status",
    )
    .eq("status", "subscribed")
    .limit(5000);

  if (error) throw new Error("newsletter_storage_error");

  const list = rows ?? [];
  const since = (days: number) => Date.now() - days * 24 * 60 * 60 * 1000;
  const tally = (values: (string | null | undefined)[]) => {
    const counts = new Map<string, number>();
    for (const raw of values) {
      const key = raw && raw.trim() ? raw : "unknown";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);
  };

  return {
    total: list.length,
    newLast7Days: list.filter((r) => new Date(r.subscribed_at).getTime() >= since(7)).length,
    newLast30Days: list.filter((r) => new Date(r.subscribed_at).getTime() >= since(30)).length,
    interestMix: tally(list.map((r) => r.primary_interest)),
    sourceMix: tally(list.map((r) => r.placement ?? r.source)),
    lifecycleMix: tally(list.map((r) => r.lifecycle_stage)),
    syncPending: list.filter((r) => r.resend_sync_status !== "synced").length,
    welcomePending: list.filter((r) => r.welcome_event_status !== "sent").length,
    repeatSignups: list.filter((r) => (r.signup_count ?? 1) > 1).length,
  };
}
