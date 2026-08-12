import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Newsletter subscription server function.
 *
 * The Resend API token is read from `process.env.RESEND_API_KEY` INSIDE the
 * handler and is never returned, logged, or exposed to the client. Resend
 * internals are not forwarded either — the client only learns success/failure.
 */

const AUDIENCE_ID = "0a4c8912-f401-400b-b230-2a993f0ec516";

const subscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5)
    .max(255)
    .email(),
  source: z.string().trim().max(64).optional(),
  placement: z.string().trim().max(64).optional(),
  /** Honeypot: must stay empty. Real users never see this field. */
  trap: z.string().max(0).optional(),
});

/**
 * Best-effort in-memory rate limit. The worker runtime gives no shared store,
 * so this stops trivial floods per instance without pretending to be durable.
 */
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (HITS.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(key, recent);
  if (HITS.size > 500) {
    for (const [k, v] of HITS) if (v.every((t) => now - t >= WINDOW_MS)) HITS.delete(k);
  }
  return recent.length > MAX_PER_WINDOW;
}

export const subscribeToNewsletterFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => subscribeSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) {
      // Fail closed: no key, no success state, nothing collected.
      throw new Error("newsletter_not_configured");
    }

    const ip =
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (rateLimited(ip)) throw new Error("newsletter_rate_limited");

    const response = await fetch(`https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email: data.email, unsubscribed: false }),
    });

    // Resend returns 201 for a new contact and 200/409 for one that already
    // exists in this audience — both mean "on the list", so treat as success.
    if (response.ok || response.status === 409) return { subscribed: true } as const;

    const detail = await response.text();
    // Log status/detail only — never the key.
    console.error(`Resend contact create failed [${response.status}]: ${detail}`);
    throw new Error("newsletter_provider_error");
  });
