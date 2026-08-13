/**
 * Server-only mailbox-token opt-out and preference logic.
 *
 * The opaque `preference_token` is the only proof of mailbox ownership: it was
 * delivered to the address itself, so possessing it stands in for a login. No
 * response ever reveals whether a token matched, whether an address is on the
 * list, or what state it is in.
 *
 * Local first, provider second: the local write is the durable opt-out. Any
 * Resend call is best-effort and happens only after that write succeeds, so a
 * provider failure can never undo the suppression the reader asked for.
 */

import { DUCK_DROP } from "@/data/duck-drop";
import type { NewsletterInterest } from "@/data/newsletter-contexts";
import { sendProviderOptOut } from "./newsletter-provider-optout";

/** One constant response shape for every token outcome. */
export interface GenericTokenResult {
  readonly ok: true;
}

export const GENERIC_TOKEN_RESULT: GenericTokenResult = { ok: true };

type Row = {
  id: string;
  email_normalized: string;
  status: string;
  resend_contact_id: string | null;
};

async function loadByToken(token: string): Promise<Row | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("id, email_normalized, status, resend_contact_id")
    .eq("preference_token", token)
    .maybeSingle();
  return data ? (data as Row) : null;
}


/**
 * Token-gated unsubscribe.
 *
 * - Unknown/expired/rotated token: nothing happens, same response.
 * - Already suppressed: no status downgrade, no second provider call, same response.
 * - Subscribed: local status becomes `unsubscribed` with suppression evidence,
 *   the token is rotated so the link cannot be replayed, and only then do we
 *   attempt the provider update.
 */
export async function unsubscribeByToken(token: string): Promise<GenericTokenResult> {
  const row = await loadByToken(token);
  if (!row) return GENERIC_TOKEN_RESULT;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date().toISOString();

  if (row.status !== "subscribed") {
    // Monotonic: a stronger state (bounced/complained/suppressed) or an existing
    // unsubscribe is never rewritten by this flow.
    return GENERIC_TOKEN_RESULT;
  }

  const { error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: now,
      suppressed_at: now,
      suppression_reason: "mailbox_token_unsubscribe",
      provider_last_event: "local.unsubscribe",
      provider_last_event_at: now,
      updated_at: now,
      // Rotate the mailbox proof: the emailed link is single-use.
      preference_token: crypto.randomUUID(),
    } as never)
    .eq("id", row.id)
    .eq("status", "subscribed");

  if (error) {
    console.error("Unsubscribe write failed");
    throw new Error("newsletter_storage_error");
  }

  const sync = await markUnsubscribedAtProvider(row.email_normalized);
  if (sync !== "synced") {
    // Internal evidence only; local suppression already stands.
    await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ resend_sync_status: sync === "error" ? "error" : "pending" } as never)
      .eq("id", row.id);
  }

  return GENERIC_TOKEN_RESULT;
}

/**
 * Token-gated interest update. Allowed only while the row is still subscribed,
 * so a preference write can never resurrect a suppressed address.
 */
export async function setInterestByToken(
  token: string,
  interest: NewsletterInterest,
): Promise<GenericTokenResult> {
  const row = await loadByToken(token);
  if (!row || row.status !== "subscribed") return GENERIC_TOKEN_RESULT;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date().toISOString();

  const { data: current } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("interests")
    .eq("id", row.id)
    .maybeSingle();
  const priorInterests = Array.isArray(current?.interests) ? current.interests : [];

  const { error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .update({
      primary_interest: interest,
      interest,
      interests: Array.from(new Set([...priorInterests, interest])),
      updated_at: now,
    } as never)
    .eq("id", row.id)
    .eq("status", "subscribed");

  if (error) {
    console.error("Preference write failed");
    throw new Error("newsletter_storage_error");
  }

  // The plan supports exactly one provider segment; everything else stays local.
  if (interest === "duck-breast") {
    const apiKey = process.env["RESEND_API_KEY"];
    if (apiKey) {
      try {
        const response = await fetch(
          `https://api.resend.com/segments/${DUCK_DROP.breastSegmentId}/contacts`,
          {
            method: "POST",
            headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({ email: row.email_normalized }),
          },
        );
        if (!response.ok && response.status !== 409) {
          console.warn(`Segment sync skipped: status ${response.status}`);
        }
      } catch {
        console.warn("Segment sync skipped: request failed");
      }
    }
  }

  return GENERIC_TOKEN_RESULT;
}
