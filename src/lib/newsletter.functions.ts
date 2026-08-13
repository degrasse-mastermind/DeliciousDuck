import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { subscribeSchema } from "./newsletter-schema";
import { publicSubscribeResponse } from "./newsletter-response";

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
    // One constant shape for every accepted-looking outcome. Welcome/email state,
    // stored interest, membership and suppression state stay on the server: each
    // would let a caller probe whether an arbitrary address is on the list.
    return publicSubscribeResponse(result.outcome);
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

/**
 * Applies an explicit interest choice, authorised by the opaque token issued to
 * the browser that just completed a signup. No email address is accepted here.
 */
export const setNewsletterInterestFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => interestChoiceSchema.parse(input))
  .handler(async ({ data }) => {
    const { rateLimited, applyInterestChoice } = await import("./newsletter.server");

    const ip =
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (rateLimited(`interest:${ip}`)) throw new Error("newsletter_rate_limited");

    const result = await applyInterestChoice(data.token, data.interest);
    // Boolean only: an invalid token reveals nothing about who exists.
    return { updated: result.updated };
  });

/**
 * Internal, token-gated list health. Aggregate counts only, never addresses.
 */
export const newsletterStatsFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const token = (input as { token?: unknown } | null)?.token;
    return { token: typeof token === "string" ? token : "" };
  })
  .handler(async ({ data }) => {
    const expected = process.env["NEWSLETTER_ADMIN_TOKEN"];
    if (!expected || data.token !== expected) throw new Error("not_authorized");
    const { newsletterAggregates } = await import("./newsletter.server");
    return await newsletterAggregates();
  });
