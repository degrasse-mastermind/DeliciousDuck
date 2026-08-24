/**
 * Double opt-in — server-only side effects.
 *
 * Every decision lives in `./newsletter-confirmation` (pure, unit-tested). This
 * module only supplies the real world: the row read, the confirmation-send
 * bookkeeping, the provider dispatch, and — on a successful confirmation — the
 * activation that finally makes the address a subscriber.
 *
 * Confirmation columns are additive, so all reads and writes here go through a
 * deliberately narrow untyped view: a deployment whose database predates the
 * migration degrades to "cannot confirm, sends nothing" instead of throwing.
 *
 * `RESEND_API_KEY` is read here only, and is never logged or returned.
 */

import {
  confirmationSkipResult,
  decideConfirmToken,
  decideConfirmationSend,
  dispatchConfirmationEmail,
  isPlausibleConfirmationToken,
  type ConfirmationSendResult,
} from "./newsletter-confirmation";
import { SITE } from "@/data/site";

const TABLE = "newsletter_subscribers";

/** Columns the confirmation flow needs. Never returned to a browser. */
const COLUMNS =
  "id, status, confirmation_status, confirmation_token, confirmation_sent_at, confirmation_sent_count, preference_token, acquisition_source, cut, method, concern, party_size_bucket";

interface Row {
  id: string;
  status: string;
  confirmation_status: string;
  confirmation_token: string | null;
  confirmation_sent_at: string | null;
  confirmation_sent_count: number | null;
  preference_token: string | null;
  acquisition_source: string | null;
  cut: string | null;
  method: string | null;
  concern: string | null;
  party_size_bucket: string | null;
}

interface LooseClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (
        column: string,
        value: string,
      ) => {
        maybeSingle: () => Promise<{
          data: Record<string, unknown> | null;
          error: { message: string } | null;
        }>;
      };
    };
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
  };
}

async function loose(): Promise<LooseClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as LooseClient;
}

async function readBy(column: "email_normalized" | "confirmation_token", value: string) {
  const client = await loose();
  const { data, error } = await client.from(TABLE).select(COLUMNS).eq(column, value).maybeSingle();
  if (error) {
    // Reason only: never the address, the token, or the stored status.
    console.warn("Confirmation state unavailable");
    return null;
  }
  return (data as unknown as Row | null) ?? null;
}

/**
 * Sends the single confirmation email for a pending address, if the gate allows.
 * Returns an internal classification only — the caller always answers the
 * browser with the one constant accepted response.
 */
export async function sendConfirmationEmail(email: string): Promise<ConfirmationSendResult> {
  const apiKey = process.env["RESEND_API_KEY"];
  const row = await readBy("email_normalized", email);
  if (!row) return "skipped_no_token";
  // Suppressed addresses are never mailed, not even a confirmation.
  if (row.status !== "subscribed") return "skipped_already_confirmed";

  const decision = decideConfirmationSend({
    confirmationStatus: row.confirmation_status,
    token: row.confirmation_token,
    apiKey,
    sentCount: row.confirmation_sent_count,
    lastSentAt: row.confirmation_sent_at,
    now: Date.now(),
  });
  if (!decision.send) {
    if (decision.reason === "no_api_key" || decision.reason === "no_token") {
      console.warn(`Confirmation email skipped: ${decision.reason}`);
    }
    return confirmationSkipResult(decision.reason);
  }
  if (!row.preference_token) return "skipped_no_token";

  const client = await loose();
  try {
    await dispatchConfirmationEmail(
      {
        email,
        baseUrl: SITE.baseUrl,
        token: decision.token,
        preferenceToken: row.preference_token,
      },
      apiKey as string,
      fetch as never,
    );
  } catch (cause) {
    console.error(
      `Confirmation email failed: ${cause instanceof Error ? cause.message : "unknown"}`,
    );
    return "error";
  }

  await client
    .from(TABLE)
    .update({
      confirmation_sent_at: new Date().toISOString(),
      confirmation_sent_count: (row.confirmation_sent_count ?? 0) + 1,
    })
    .eq("id", row.id);
  return "sent";
}

/** True when the stored row for this address has already confirmed. */
export async function isAddressConfirmed(email: string): Promise<boolean> {
  const row = await readBy("email_normalized", email);
  return row?.confirmation_status === "confirmed";
}

/**
 * Public result of presenting a confirmation link. The token is a mailbox-only
 * capability, so telling its holder whether it worked reveals nothing about any
 * address other than the one already in their own inbox.
 */
export type ConfirmResult = "confirmed" | "already" | "invalid";

/**
 * Confirms a subscription from an emailed token, then activates it: provider
 * contact, welcome email, and — for planner signups — the Duck Game Plan email.
 * Activation failures never undo the confirmation.
 */
export async function confirmSubscription(token: unknown): Promise<ConfirmResult> {
  if (!isPlausibleConfirmationToken(token)) return "invalid";
  const row = await readBy("confirmation_token", token);
  const decision = decideConfirmToken(
    row ? { status: row.status, confirmation_status: row.confirmation_status } : null,
  );
  if (decision.action === "ignore") return "invalid";
  if (decision.action === "already") return "already";

  const client = await loose();
  const now = new Date().toISOString();
  const { error } = await client
    .from(TABLE)
    .update({ confirmation_status: "confirmed", confirmed_at: now, updated_at: now })
    .eq("id", row!.id);
  if (error) {
    console.error("Confirmation write failed");
    return "invalid";
  }

  try {
    const { activateConfirmedSubscriber } = await import("./newsletter.server");
    await activateConfirmedSubscriber(row!.id);
  } catch (cause) {
    // The subscription stands regardless: delivery is retryable, consent is not.
    console.error(
      `Confirmation activation failed: ${cause instanceof Error ? cause.message : "unknown"}`,
    );
  }
  return "confirmed";
}
