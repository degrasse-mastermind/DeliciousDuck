/**
 * Pure builders for the `newsletter.subscribed` welcome event.
 *
 * Kept out of the `.server` module so the exact URL, method, event name, data
 * keys, and schema are unit-testable with no network, credentials, or database.
 *
 * The welcome email must carry working mailbox links, so the payload includes
 * absolute `unsubscribe_url` / `preferences_url` built from the subscriber's
 * opaque `preference_token`. No email address goes in those URLs.
 */

import { isPlausibleToken, mailboxLinks } from "./newsletter-links";

export const WELCOME_EVENT_NAME = "newsletter.subscribed";
export const WELCOME_EVENT_SEND_URL = "https://api.resend.com/events/send";
export const WELCOME_EVENT_DEFINE_URL = "https://api.resend.com/events";

export interface WelcomeEventInput {
  readonly email: string;
  readonly guideUrl: string;
  readonly baseUrl: string;
  /** Opaque mailbox token from the subscriber row. */
  readonly token: string;
  readonly interest?: string | undefined;
  readonly sourcePath?: string | undefined;
}

export interface WelcomeEventData {
  readonly guide_url: string;
  readonly interest: string;
  readonly source_path: string;
  readonly unsubscribe_url: string;
  readonly preferences_url: string;
}

/** The `data` block the welcome template renders from. */
export function buildWelcomeEventData(input: WelcomeEventInput): WelcomeEventData {
  const links = mailboxLinks(input.baseUrl, input.token);
  return {
    guide_url: input.guideUrl,
    interest: input.interest ?? "general",
    source_path: input.sourcePath ?? "",
    unsubscribe_url: links.unsubscribe,
    preferences_url: links.preferences,
  };
}

export interface ProviderJsonRequest {
  readonly url: string;
  readonly method: "POST";
  readonly headers: Readonly<Record<string, string>>;
  readonly body: string;
}

function headers(apiKey: string): Record<string, string> {
  return { "content-type": "application/json", authorization: `Bearer ${apiKey}` };
}

/** The dispatch request that triggers the welcome automation. */
export function buildWelcomeEventRequest(
  input: WelcomeEventInput,
  apiKey: string,
): ProviderJsonRequest {
  return {
    url: WELCOME_EVENT_SEND_URL,
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      event: WELCOME_EVENT_NAME,
      email: input.email,
      // Resend Automations reference custom event fields as `event.<field>`,
      // which are sent under `payload` (not `data`).
      payload: buildWelcomeEventData(input),
    }),
  };
}

/**
 * Field types for the event definition. Registering these is what lets the
 * provider accept the two link fields instead of dropping them silently.
 */
export const WELCOME_EVENT_SCHEMA = {
  guide_url: "string",
  interest: "string",
  source_path: "string",
  unsubscribe_url: "string",
  preferences_url: "string",
} as const;

/** The one-time event-definition registration request. */
export function buildWelcomeEventDefinitionRequest(apiKey: string): ProviderJsonRequest {
  return {
    url: WELCOME_EVENT_DEFINE_URL,
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({ name: WELCOME_EVENT_NAME, schema: WELCOME_EVENT_SCHEMA }),
  };
}

/**
 * Status-only failure classification. The provider's error body can echo the
 * submitted address, so it never reaches a log or a thrown error.
 */
export function welcomeEventFailureReason(httpStatus: number): string {
  if (httpStatus === 401 || httpStatus === 403) return "welcome_event_unauthorized";
  if (httpStatus === 404) return "welcome_event_not_registered";
  if (httpStatus === 422) return "welcome_event_rejected_request";
  if (httpStatus === 429) return "welcome_event_rate_limited";
  if (httpStatus >= 500) return "welcome_event_provider_unavailable";
  return `welcome_event_status_${httpStatus}`;
}

export type WelcomeDispatchDecision =
  | { readonly dispatch: true; readonly token: string }
  | { readonly dispatch: false; readonly reason: "not_new_row" | "already_sent" | "no_token" };

/**
 * Pure gate in front of every provider request. A row without a usable mailbox
 * token would produce a welcome email with dead unsubscribe/preferences links,
 * so we make zero provider calls and let the caller leave the row pending.
 */
export function decideWelcomeDispatch(input: {
  readonly sendWelcome: boolean;
  readonly welcomeEventStatus: string | null | undefined;
  readonly token: unknown;
}): WelcomeDispatchDecision {
  if (!input.sendWelcome) return { dispatch: false, reason: "not_new_row" };
  if (input.welcomeEventStatus === "sent") return { dispatch: false, reason: "already_sent" };
  if (!isPlausibleToken(input.token)) return { dispatch: false, reason: "no_token" };
  return { dispatch: true, token: input.token };
}

/** Minimal fetch seam so tests never touch the network. */
export type JsonFetch = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; status: number }>;

/**
 * Dispatches the welcome event. Throws a status classification on failure —
 * never the address, key, token, full URL, or provider body.
 *
 * The definition (re)registration retry exists because an event definition may
 * predate the two link fields; it is attempted at most once per send.
 */
export async function dispatchWelcomeEvent(
  input: WelcomeEventInput,
  apiKey: string,
  fetchImpl: JsonFetch,
): Promise<void> {
  const send = () => {
    const request = buildWelcomeEventRequest(input, apiKey);
    return fetchImpl(request.url, {
      method: request.method,
      headers: { ...request.headers },
      body: request.body,
    });
  };

  let response = await send();

  if (response.status === 404 || response.status === 422) {
    const definition = buildWelcomeEventDefinitionRequest(apiKey);
    await fetchImpl(definition.url, {
      method: definition.method,
      headers: { ...definition.headers },
      body: definition.body,
    });
    response = await send();
  }

  if (!response.ok) throw new Error(welcomeEventFailureReason(response.status));
}

