/**
 * Server-only wiring for Duck Game Plan email delivery.
 *
 * The decisions live in `./game-plan-delivery`; this module supplies the real
 * side effects: the existing subscriber write, the mailbox-token read, the
 * cooldown record, and the provider dispatch. `RESEND_API_KEY` is read here only
 * and never returned, logged, or exposed to the client.
 *
 * Why a distinct action from the welcome email: the welcome is a one-time
 * lifecycle message and stays send-once, so an existing subscriber who fills in
 * the planner previously received nothing at all. A plan request is
 * transactional and must be delivered every time it is made — subject to
 * suppression rules and a per-address cooldown.
 */

import type { GamePlanRequestPayload } from "./newsletter-schema";
import type { GamePlanSelection } from "@/data/duck-game-plan";
import {
  GAME_PLAN_COOLDOWN_MS,
  dispatchGamePlanEvent,
  runGamePlanDelivery,
  type GamePlanDeliveryResult,
} from "./game-plan-delivery";
import { persistSubscriber } from "./newsletter.server";
import type { SignupOutcome } from "./newsletter-response";
import { SITE } from "@/data/site";

/** Durable cooldown column. Absent databases fall back to the memory window. */
const COOLDOWN_COLUMN = "game_plan_email_at";

/**
 * Per-instance cooldown fallback, keyed on the normalized address. The worker
 * runtime gives no shared store, so this is best-effort in the same way the
 * existing signup rate limit is; the durable column below is authoritative when
 * it exists.
 */
const RECENT = new Map<string, number>();

function rememberRecent(email: string, at: number): void {
  RECENT.set(email, at);
  if (RECENT.size > 500) {
    const cutoff = at - GAME_PLAN_COOLDOWN_MS;
    for (const [key, value] of RECENT) if (value < cutoff) RECENT.delete(key);
  }
}

function missingCooldownColumn(message: string | null | undefined): boolean {
  if (!message) return false;
  const text = message.toLowerCase();
  return text.includes(COOLDOWN_COLUMN);
}

/**
 * Stores/refreshes the subscriber, then requests the plan email unless the
 * address is suppressed, inside the cooldown window, or missing a mailbox token.
 * Returns internal detail only — the caller sends one constant public response.
 */
export async function requestGamePlanEmail(data: GamePlanRequestPayload): Promise<{
  outcome: SignupOutcome;
  delivery: GamePlanDeliveryResult;
}> {
  const email = data.email.trim().toLowerCase();
  const selection: GamePlanSelection = {
    cut: data.cut,
    method: data.method,
    concern: data.concern,
    partySize: data.partySizeBucket,
  };
  const apiKey = process.env["RESEND_API_KEY"];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  return await runGamePlanDelivery({
    email,
    selection,
    baseUrl: SITE.baseUrl,
    apiKey,
    persist: () => persistSubscriber(data),
    loadDeliveryState: async () => {
      const memory = RECENT.get(email) ?? null;
      const { data: row } = await supabaseAdmin
        .from("newsletter_subscribers")
        .select("id, preference_token")
        .eq("email_normalized", email)
        .maybeSingle();

      // The durable cooldown column is optional: read it through an untyped
      // view so a database without it degrades to the in-memory window instead
      // of failing the request.
      const durableAt = await readDurableCooldown(supabaseAdmin, email);
      const last =
        durableAt === null ? memory : Math.max(durableAt, memory ?? 0);
      return { token: row?.preference_token ?? null, lastRequestedAt: last };
    },
    dispatch: (input) => dispatchGamePlanEvent(input, apiKey as string, fetch as never),
    recordDelivery: async (at) => {
      rememberRecent(email, Date.parse(at));
      await writeDurableCooldown(supabaseAdmin, email, at);
    },

  });
}
