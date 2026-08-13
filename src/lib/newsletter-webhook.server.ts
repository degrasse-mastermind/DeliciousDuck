/**
 * Server-only wiring for the Resend webhook: signature verification (Svix, the
 * scheme Resend signs with) and the database store.
 *
 * All rules live in `./newsletter-webhook`; this file only supplies the two
 * seams that need secrets and I/O.
 */

import { Webhook } from "svix";
import type { ProviderStatus, WebhookStore, WebhookVerifier } from "./newsletter-webhook";

/** Whether a webhook secret is configured at all. Never returns the value. */
export function hasWebhookSecret(): boolean {
  return Boolean(process.env["RESEND_WEBHOOK_SECRET"]);
}

/**
 * Verifies the untouched raw body against the Svix headers.
 * Throws on any missing/invalid signature or timestamp outside tolerance.
 */
export const verifyResendWebhook: WebhookVerifier = async (raw, headers) => {
  const secret = process.env["RESEND_WEBHOOK_SECRET"];
  if (!secret) throw new Error("webhook_secret_missing");
  const wh = new Webhook(secret);
  return wh.verify(raw, {
    "svix-id": headers["svix-id"] ?? "",
    "svix-timestamp": headers["svix-timestamp"] ?? "",
    "svix-signature": headers["svix-signature"] ?? "",
  });
};

/** Real store: service-role Supabase, minimal columns, no raw payload retained. */
export function createWebhookStore(): WebhookStore {
  return {
    async findSubscriber(email) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin
        .from("newsletter_subscribers")
        .select("id, status")
        .eq("email_normalized", email)
        .maybeSingle();
      return data ? { id: data.id, status: String(data.status) } : null;
    },

    async insertEvent(event) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("newsletter_provider_events").insert({
        provider: "resend",
        provider_event_id: event.providerEventId,
        event_type: event.eventType,
        email_normalized: event.email,
        subscriber_id: event.subscriberId,
        occurred_at: event.occurredAt,
        received_at: event.receivedAt,
        verified: true,
        // Short classification only — never the raw payload, never headers.
        detail: event.detail,
      });
      if (!error) return "inserted";
      // 23505 = unique violation on (provider, provider_event_id): a replay.
      if (error.code === "23505") return "duplicate";
      throw new Error("provider_event_storage_error");
    },

    async applySuppression({ id, status, eventName, at }) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const patch: Record<string, unknown> = {
        status,
        suppressed_at: at,
        suppression_reason: `provider:${eventName}`.slice(0, 120),
        provider_last_event: eventName.slice(0, 120),
        provider_last_event_at: at,
        updated_at: at,
      };
      if (status === "unsubscribed") patch["unsubscribed_at"] = at;

      const { error } = await supabaseAdmin
        .from("newsletter_subscribers")
        .update(patch as never)
        .eq("id", id);
      if (error) throw new Error("subscriber_suppression_error");
    },
  };
}

export type { ProviderStatus };
