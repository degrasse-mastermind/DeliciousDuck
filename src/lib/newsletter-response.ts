/**
 * The single public shape of a successful-looking signup.
 *
 * Every outcome that is not a hard failure — brand-new subscriber, active
 * duplicate, legacy active duplicate, and locally suppressed/blocked — maps to
 * one identical, constant response. The client learns only "your submission was
 * accepted".
 *
 * Nothing here carries welcome/email state, stored interest, suppression state,
 * membership state, or a preference token, because each of those is a signal a
 * caller could use to probe whether an arbitrary address is on the list or has
 * unsubscribed. That is a list-state leak regardless of how it is worded.
 *
 * Pure and dependency-free so the actual mapping the server wrapper uses can be
 * unit-tested directly, instead of a test re-declaring what it hopes is true.
 */

/** Internal outcomes `persistSubscriber` can report. Never sent to the client. */
export type SignupOutcome =
  | "created"
  | "active_duplicate"
  | "legacy_active_duplicate"
  | "blocked_suppressed";

export const SIGNUP_OUTCOMES = [
  "created",
  "active_duplicate",
  "legacy_active_duplicate",
  "blocked_suppressed",
] as const satisfies readonly SignupOutcome[];

/** Exactly the keys the client may ever receive from a signup. */
export interface PublicSubscribeResponse {
  readonly subscribed: true;
}

/**
 * Maps any accepted-looking internal outcome to the one public response.
 * Deliberately ignores its argument: the outcome must not be observable. The
 * parameter exists so call sites stay explicit about what happened internally
 * and so tests can assert indistinguishability across all outcomes.
 */
export function publicSubscribeResponse(_outcome: SignupOutcome): PublicSubscribeResponse {
  return { subscribed: true };
}
