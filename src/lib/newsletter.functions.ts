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

/*
 * The in-session interest editor was removed deliberately. It required issuing a
 * preference token to the browser for first-time subscribers only, which made a
 * new signup distinguishable from a duplicate one — a list-state leak. Interest
 * is still recorded from the page cluster the visitor signed up on; explicit
 * preference editing belongs on a future emailed, token-linked preference page,
 * where the link itself proves mailbox ownership.
 */



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
