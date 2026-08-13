import { createFileRoute } from "@tanstack/react-router";

/**
 * Signed Resend webhook receiver.
 *
 * POST only, and nothing mutates before the raw body is verified. GET (which
 * link scanners and browsers perform) is not implemented, so it cannot mutate.
 * Responses are generic: a caller learns nothing about our list.
 *
 * After verification the subscriber transition runs before the event log, so a
 * crash can never leave an event recorded as handled while its suppression was
 * never applied. See `@/lib/newsletter-webhook` for the ordering rationale.
 */

export const Route = createFileRoute("/api/webhooks/resend")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Read the body untouched: verification must run on the exact bytes
        // Resend signed, before any JSON parsing.
        const raw = await request.text();

        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
          headers[key.toLowerCase()] = value;
        });

        const { handleResendWebhook } = await import("@/lib/newsletter-webhook");
        const { hasWebhookSecret, verifyResendWebhook, createWebhookStore } = await import(
          "@/lib/newsletter-webhook.server"
        );

        const outcome = await handleResendWebhook({
          raw,
          headers,
          hasSecret: hasWebhookSecret(),
          verify: verifyResendWebhook,
          store: createWebhookStore(),
        });

        // Internal classification only: no address, no stored status, no payload.
        if (outcome.internal === "no_secret" || outcome.internal === "storage_error") {
          console.error(`Resend webhook not processed: ${outcome.internal}`);
        }

        return new Response(outcome.body, {
          status: outcome.status,
          headers: { "content-type": "text/plain", "cache-control": "no-store" },
        });
      },
    },
  },
});
