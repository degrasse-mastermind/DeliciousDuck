import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { NEWSLETTER_INTERESTS } from "@/data/newsletter-contexts";
import { isPlausibleToken } from "./newsletter-links";

/**
 * Mailbox-token server functions. Thin wrappers only.
 *
 * Both are POST: the GET pages are read-only because email security scanners
 * follow every link in a message. Every outcome returns the same `{ ok: true }`,
 * so a valid, invalid, rotated or already-unsubscribed token are all
 * indistinguishable to the caller.
 */

const tokenSchema = z.object({
  token: z.string().trim().max(64).refine(isPlausibleToken, "invalid"),
});

const GENERIC = { ok: true } as const;

export const unsubscribeByTokenFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const parsed = tokenSchema.safeParse(input);
    // A malformed token is treated exactly like a wrong one: accepted, ignored.
    return { token: parsed.success ? parsed.data.token : null };
  })
  .handler(async ({ data }) => {
    if (!data.token) return GENERIC;
    const { unsubscribeByToken } = await import("./newsletter-preferences.server");
    return await unsubscribeByToken(data.token);
  });

export const setInterestByTokenFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const parsed = tokenSchema
      .extend({ interest: z.enum(NEWSLETTER_INTERESTS) })
      .safeParse(input);
    return parsed.success ? parsed.data : null;
  })
  .handler(async ({ data }) => {
    if (!data) return GENERIC;
    const { setInterestByToken } = await import("./newsletter-preferences.server");
    return await setInterestByToken(data.token, data.interest);
  });
