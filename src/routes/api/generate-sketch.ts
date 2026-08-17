import { createFileRoute } from "@tanstack/react-router";
import {
  MAX_REQUEST_BYTES,
  gatewayBody,
  parseGenerateRequest,
  takeToken,
  type RateState,
} from "@/lib/sketch-request";

/**
 * Internal illustration generation endpoint used by /internal/illustrations.
 *
 * Safety rules enforced here:
 * - disabled entirely outside development/preview (production callers get a
 *   generic 403 before any parsing or AI-gateway call);
 * - the LOVABLE_API_KEY is read inside the handler and never reaches the client;
 * - the request body is size-checked before it is parsed;
 * - only image-capable models on the studio allow-list are forwarded;
 * - a shared sliding-window limiter caps burst usage per instance;
 * - upstream errors are relayed as a short classification, never as the raw
 *   gateway body (which can echo request content);
 * - the client abort signal is forwarded so Cancel actually frees the request.
 */

const rate: RateState = { hits: [] };

export async function handleGenerateSketch({ request }: { request: Request }): Promise<Response> {
  if (process.env["NODE_ENV"] === "production") {
    return new Response("Disabled", { status: 403 });
  }

  const length = Number(request.headers.get("content-length") ?? 0);

  if (length > MAX_REQUEST_BYTES) {
    return new Response("Request too large", { status: 413 });
  }

  const gate = takeToken(rate, Date.now());
  if (!gate.allowed) {
    return new Response("Too many generation requests — wait a moment.", {
      status: 429,
      headers: { "Retry-After": String(gate.retryAfterSeconds) },
    });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return new Response("Malformed request body", { status: 400 });
  }

  const parsed = parseGenerateRequest(raw);
  if (!parsed.ok) {
    return new Response(parsed.error, { status: parsed.status });
  }

  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return new Response("Image generation is not configured", { status: 500 });

  let upstream: Response;
  try {
    upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gatewayBody(parsed.value)),
      // User-initiated cancel only; there is no timer-based deadline here.
      signal: request.signal,
    });
  } catch (err) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    throw err;
  }

  if (!upstream.ok || !upstream.body) {
    // Consume and discard the upstream body: it can contain the prompt.
    await upstream.text().catch(() => "");
    const status = upstream.status;
    const message =
      status === 429
        ? "The image service is rate-limiting this project — retry shortly."
        : status === 402
          ? "AI credits are exhausted for this workspace."
          : status >= 500
            ? "The image service failed. Retry."
            : "The image service rejected this request.";
    return new Response(message, { status });
  }

  if (!parsed.value.stream) {
    return new Response(upstream.body, {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

export const Route = createFileRoute("/api/generate-sketch")({
  server: {
    handlers: {
      POST: handleGenerateSketch,
    },
  },
});
