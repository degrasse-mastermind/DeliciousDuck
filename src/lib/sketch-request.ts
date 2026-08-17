/**
 * Shared request contract + guards for the studio's server endpoints.
 *
 * Pure so the rules (payload limits, model allow-list, rate-limit window) can be
 * unit-tested without spinning up a request. The endpoints import these instead
 * of re-implementing validation inline.
 */

import { isStudioModel, type StudioModel } from "./sketch-studio";

/** Hard cap on a generate request body (prompt + one reference image). */
export const MAX_REQUEST_BYTES = 8 * 1024 * 1024;
/** Hard cap on a single stored/written image. */
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const MIN_PROMPT_LENGTH = 10;
export const MAX_PROMPT_LENGTH = 4000;

export type GenerateRequest = {
  prompt: string;
  model: StudioModel;
  stream: boolean;
  /** Optional reference image for edit/refine intents: a data: URL. */
  reference?: string;
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; error: string };

const DATA_URL = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

export function parseGenerateRequest(raw: unknown): ParseResult<GenerateRequest> {
  if (!raw || typeof raw !== "object") {
    return { ok: false, status: 400, error: "Malformed request body" };
  }
  const body = raw as Record<string, unknown>;
  const prompt = typeof body["prompt"] === "string" ? body["prompt"].trim() : "";
  if (prompt.length < MIN_PROMPT_LENGTH) {
    return { ok: false, status: 400, error: "Prompt is too short" };
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { ok: false, status: 413, error: "Prompt is too long" };
  }

  const model = body["model"];
  if (model !== undefined && !isStudioModel(model)) {
    return { ok: false, status: 400, error: "Unsupported model" };
  }

  const reference = body["reference"];
  if (reference !== undefined) {
    if (typeof reference !== "string" || !DATA_URL.test(reference)) {
      return { ok: false, status: 400, error: "Reference image must be a base64 data URL" };
    }
    if (reference.length > MAX_REQUEST_BYTES) {
      return { ok: false, status: 413, error: "Reference image is too large" };
    }
  }

  const value: GenerateRequest = {
    prompt,
    model: (model as StudioModel | undefined) ?? "google/gemini-2.5-flash-image",
    stream: body["stream"] !== false,
  };
  if (typeof reference === "string") value.reference = reference;
  return { ok: true, value };
}

/**
 * Gateway body for a studio request. Gemini image models take the
 * chat-completions image shape; a reference image rides along as an
 * `image_url` content block so refine actually edits the current asset.
 */
export function gatewayBody(req: GenerateRequest): Record<string, unknown> {
  const content: unknown[] = [{ type: "text", text: req.prompt }];
  if (req.reference) {
    content.push({ type: "image_url", image_url: { url: req.reference } });
  }
  return {
    model: req.model,
    messages: [
      {
        role: "user",
        content: req.reference ? content : req.prompt,
      },
    ],
    modalities: ["image", "text"],
    ...(req.stream ? { stream: true } : {}),
  };
}

/* ------------------------------------------------------------- rate limiting */

export type RateState = { hits: number[]; };

export type RateLimit = { allowed: boolean; retryAfterSeconds: number; remaining: number };

/**
 * Fixed-window-free sliding limiter over a timestamp list. Kept pure: the route
 * owns the (module-scope) state object.
 */
export function takeToken(
  state: RateState,
  now: number,
  limit = 12,
  windowMs = 60_000,
): RateLimit {
  state.hits = state.hits.filter((t) => now - t < windowMs);
  if (state.hits.length >= limit) {
    const oldest = state.hits[0]!;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
      remaining: 0,
    };
  }
  state.hits.push(now);
  return { allowed: true, retryAfterSeconds: 0, remaining: limit - state.hits.length };
}

/** Base64 payload size in bytes, without decoding it. */
export function base64Bytes(base64: string): number {
  const clean = base64.replace(/^data:[^,]+,/, "").replace(/\s+/g, "");
  const padding = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((clean.length * 3) / 4) - padding);
}

/**
 * Access gate for the illustration studio endpoints.
 *
 * The studio is an internal tool that spends AI credits, so the endpoint must
 * not be freely callable on the published site. Rules:
 * - if STUDIO_ACCESS_TOKEN is configured, callers must present it in the
 *   `x-studio-token` header (constant-length compare, no echoing of values);
 * - with no token configured, the endpoint is available outside production only.
 */
export function studioAccessDenied(
  headerToken: string | null,
  env: { token?: string | undefined; production: boolean },
): Response | null {
  if (env.token) {
    return headerToken && safeEqual(headerToken, env.token)
      ? null
      : new Response("Not authorised", { status: 401 });
  }
  if (env.production) {
    return new Response("Not found", { status: 404 });
  }
  return null;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
