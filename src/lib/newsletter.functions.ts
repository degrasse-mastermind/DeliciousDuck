import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { subscribeSchema } from "./newsletter-schema";

/**
 * Newsletter server functions.
 *
 * Thin wrappers only: all runtime logic lives in `./newsletter.server`, which is
 * loaded inside the handlers so the server-only module never reaches the client
 * bundle. The client learns nothing beyond success/failure.
 */

export const subscribeToNewsletterFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => subscribeSchema.parse(input))
  .handler(async ({ data }) => {
    const { rateLimited, persistSubscriber } = await import("./newsletter.server");

    const ip =
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (rateLimited(ip)) throw new Error("newsletter_rate_limited");

    // Honeypot already enforced by the schema (must be empty).
    const result = await persistSubscriber(data);
    // Durable storage succeeded. Resend status is internal only.
    // `welcomeTriggered` tells the UI whether an email was actually kicked off;
    // provider internals stay on the server.
    return {
      subscribed: true as const,
      welcomeTriggered: result.welcomeEvent === "sent" || result.welcomeEvent === "skipped",
    };
  });

/**
 * Internal, token-gated resync of subscribers that never reached Resend.
 * Not linked in any navigation. Returns counts only, never emails.
 */
export const resyncNewsletterFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const token = (input as { token?: unknown } | null)?.token;
    return { token: typeof token === "string" ? token : "" };
  })
  .handler(async ({ data }) => {
    const expected = process.env["NEWSLETTER_ADMIN_TOKEN"];
    if (!expected || data.token !== expected) throw new Error("not_authorized");
    const { resyncPendingSubscribers } = await import("./newsletter.server");
    return await resyncPendingSubscribers();
  });
