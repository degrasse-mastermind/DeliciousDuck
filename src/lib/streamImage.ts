/**
 * Minimal SSE reader for the image-generation endpoint.
 *
 * Calls `onFrame(dataUrl, isFinal)` for every image frame the model emits, so
 * callers can show a blurred partial preview and swap in the final render.
 * If the stream ends without producing a single frame, the request is replayed
 * once non-streaming (some runtimes swallow SSE frames).
 *
 * `options.reference` sends the current asset along as an image reference, which
 * is what makes "refine this drawing" an actual edit rather than a re-roll.
 * `options.signal` is wired to a user-facing Cancel button only — never a timer.
 */
export type StreamImageOptions = {
  model?: string;
  reference?: string;
  signal?: AbortSignal;
};

export async function streamImage(
  endpoint: string,
  prompt: string,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
  options: StreamImageOptions = {},
): Promise<void> {
  const payload = {
    prompt,
    ...(options.model ? { model: options.model } : {}),
    ...(options.reference ? { reference: options.reference } : {}),
  };
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    ...(options.signal ? { signal: options.signal } : {}),
  });
  if (!res.ok || !res.body) throw new Error((await res.text()) || "Generation failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let frames = 0;

  const handle = (payload: string) => {
    if (payload === "[DONE]") return;
    let json: unknown;
    try {
      json = JSON.parse(payload);
    } catch {
      return;
    }
    const url = extractImage(json);
    if (url) {
      frames += 1;
      onFrame(url, isFinalEvent(json));
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      for (const line of part.split("\n")) {
        if (line.startsWith("data:")) handle(line.slice(5).trim());
      }
    }
  }

  if (frames > 0) return;

  // Zero-frame stream: replay once without streaming.
  const fallback = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, stream: false }),
  });
  if (!fallback.ok) throw new Error((await fallback.text()) || "Generation failed");
  const url = extractImage(await fallback.json());
  if (!url) throw new Error("No image returned");
  onFrame(url, true);
}

function isFinalEvent(json: unknown): boolean {
  const obj = json as { type?: string; choices?: { finish_reason?: string }[] };
  if (obj?.type?.includes("completed")) return true;
  return Boolean(obj?.choices?.[0]?.finish_reason);
}

/** Pull a data URL or base64 payload out of any of the gateway's shapes. */
function extractImage(json: unknown): string | null {
  const seen = new Set<unknown>();
  const walk = (node: unknown, depth: number): string | null => {
    if (!node || depth > 6) return null;
    if (typeof node === "string") {
      if (node.startsWith("data:image/")) return node;
      if (node.length > 512 && /^[A-Za-z0-9+/=\s]+$/.test(node)) {
        return `data:image/png;base64,${node.replace(/\s+/g, "")}`;
      }
      return null;
    }
    if (typeof node !== "object") return null;
    if (seen.has(node)) return null;
    seen.add(node);
    for (const value of Object.values(node as Record<string, unknown>)) {
      const found = walk(value, depth + 1);
      if (found) return found;
    }
    return null;
  };
  return walk(json, 0);
}
