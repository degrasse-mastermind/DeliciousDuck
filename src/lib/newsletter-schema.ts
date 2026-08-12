import { z } from "zod";

/** Client-safe validation + shared constants for the newsletter flow. */

export const RESEND_AUDIENCE_ID = "0a4c8912-f401-400b-b230-2a993f0ec516";

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().min(5).max(255).email(),
  source: z.string().trim().max(64).optional(),
  placement: z.string().trim().max(64).optional(),
  /** Honeypot: must stay empty. Real users never see this field. */
  trap: z.string().max(0).optional(),
});

export type SubscribePayload = z.infer<typeof subscribeSchema>;
