import { z } from "zod";
import { NEWSLETTER_INTERESTS } from "@/data/newsletter-contexts";
import {
  GAME_PLAN_CONCERNS,
  GAME_PLAN_CUTS,
  GAME_PLAN_METHODS,
  GAME_PLAN_PARTY_SIZES,
} from "@/data/duck-game-plan";
import { NEWSLETTER_CONSENT } from "./newsletter-consent";

/** The only acquisition sources this build recognises. */
export const ACQUISITION_SOURCES = ["duck_game_plan"] as const;
export type AcquisitionSource = (typeof ACQUISITION_SOURCES)[number];


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
  /**
   * Version of the consent text the visitor was actually shown. Must match the
   * version this build renders, so stored evidence can never drift from the UI.
   */
  consentVersion: z.literal(NEWSLETTER_CONSENT.version),
  /** Honeypot: must stay empty. Real users never see this field. */
  trap: z.string().max(0).optional(),
});

export type SubscribePayload = z.infer<typeof subscribeSchema>;

/*
 * The post-signup interest-choice schema was removed with the in-session
 * preference editor (see `newsletter.functions.ts`). A future emailed
 * preference link will need its own schema, keyed on the emailed token.
 */

