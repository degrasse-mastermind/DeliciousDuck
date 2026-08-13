import { z } from "zod";
import { NEWSLETTER_INTERESTS } from "@/data/newsletter-contexts";

/** Client-safe validation + shared constants for the newsletter flow. */

export const RESEND_AUDIENCE_ID = "0a4c8912-f401-400b-b230-2a993f0ec516";

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().min(5).max(255).email(),
  source: z.string().trim().max(64).optional(),
  placement: z.string().trim().max(64).optional(),
  /** Controlled enum only — never free text, never PII. */
  interest: z.enum(NEWSLETTER_INTERESTS).optional(),
  /** Same-origin path the signup happened on. Query strings are stripped. */
  sourcePath: z
    .string()
    .trim()
    .max(255)
    .regex(/^\/[A-Za-z0-9\-/_.]*$/)
    .optional(),
  /** Honeypot: must stay empty. Real users never see this field. */
  trap: z.string().max(0).optional(),
});

export type SubscribePayload = z.infer<typeof subscribeSchema>;

/**
 * Post-signup interest choice. Authorised by the opaque row token issued to the
 * browser that just subscribed — never by an email address, which anyone could
 * type on someone else's behalf.
 */
export const interestChoiceSchema = z.object({
  token: z.string().trim().uuid(),
  interest: z.enum(NEWSLETTER_INTERESTS),
});

export type InterestChoicePayload = z.infer<typeof interestChoiceSchema>;
