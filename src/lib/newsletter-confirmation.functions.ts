import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { isPlausibleConfirmationToken } from "./newsletter-confirmation";

/**
 * Double opt-in server functions. Thin wrappers only.
 *
 * `confirmSubscriptionFn` is POST because the confirmation page is read-only on
 * GET: email security scanners and link previewers fetch every URL in a message,
 * so a GET that confirmed would opt people in without them pressing anything —
 * which would defeat the entire point of double opt-in.
 *
 * The result is intentionally coarse: `confirmed`, `already`, or `invalid`. The
 * token is a mailbox-only capability, so its holder already controls the address
 * it belongs to; telling them whether their own link worked reveals nothing
 * about any other address, and the response never contains an email, a stored
 * status, or list state.
 */

export const confirmSubscriptionFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const token = (input as { token?: unknown } | null)?.token;
    // A malformed token is treated exactly like a wrong one.
    return { token: isPlausibleConfirmationToken(token) ? token : null };
  })
  .handler(async ({ data }) => {
    if (!data.token) return { result: "invalid" as const };

    // Same best-effort per-instance limit the signup path uses, so a token
    // guessing loop is throttled rather than free.
    const { rateLimited } = await import("./newsletter.server");
    const ip =
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (rateLimited(`confirm:${ip}`)) return { result: "invalid" as const };

    const { confirmSubscription } = await import("./newsletter-confirmation.server");
    return { result: await confirmSubscription(data.token) };
  });

/**
 * Re-sends the confirmation email for an address the reader typed again.
 *
 * Returns the one constant accepted response regardless of outcome — an already
 * confirmed address, a suppressed one, a cooldown hit and an unknown address are
 * all indistinguishable, so this cannot be used to test list membership. The
 * per-address cooldown and lifetime cap live in the confirmation gate.
 */
export const resendConfirmationFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = (input as { email?: unknown } | null)?.email;
    const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    const valid = email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    return { email: valid ? email : null };
  })
  .handler(async ({ data }) => {
    const { rateLimited } = await import("./newsletter.server");
    const ip =
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (rateLimited(`resend:${ip}`)) return { ok: true as const };
    if (!data.email) return { ok: true as const };

    const { sendConfirmationEmail } = await import("./newsletter-confirmation.server");
    // Outcome stays server-side on purpose.
    await sendConfirmationEmail(data.email);
    return { ok: true as const };
  });
