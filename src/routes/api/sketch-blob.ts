import { createFileRoute } from "@tanstack/react-router";
import { MAX_IMAGE_BYTES, base64Bytes } from "@/lib/sketch-request";
import { RETENTION_MS } from "@/lib/sketch-history";

/**
 * Dev-only temporary store for studio renders.
 *
 * Studio history persists settings, not pixels — image bytes are stashed here
 * under a random id so a reloaded tab can restore a preview without pushing
 * multi-megabyte data URLs into sessionStorage. Files live in the OS temp
 * directory, are pruned on every write once they pass the retention window, and
 * are never part of the deployed bundle.
 */

const DIR_NAME = "dd-sketch-studio";

async function tmpDir() {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { mkdir } = await import("node:fs/promises");
  const dir = join(tmpdir(), DIR_NAME);
  await mkdir(dir, { recursive: true });
  return dir;
}

async function prune(dir: string) {
  const { readdir, stat, unlink } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const now = Date.now();
  for (const file of await readdir(dir).catch(() => [] as string[])) {
    const full = join(dir, file);
    const info = await stat(full).catch(() => null);
    if (info && now - info.mtimeMs > RETENTION_MS) await unlink(full).catch(() => {});
  }
}

const ID = /^[a-z0-9]{8,40}$/;
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
  "image/jpeg": "jpg",
};

export const Route = createFileRoute("/api/sketch-blob")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (process.env["NODE_ENV"] === "production") {
          return new Response("Disabled", { status: 403 });
        }
        const body = (await request.json().catch(() => null)) as
          | { base64?: string; mime?: string }
          | null;
        const base64 = body?.base64 ?? "";
        const mime = body?.mime ?? "image/png";
        if (!base64 || !(mime in EXT)) {
          return new Response("Invalid blob", { status: 400 });
        }
        if (base64Bytes(base64) > MAX_IMAGE_BYTES) {
          return new Response("Blob too large", { status: 413 });
        }

        const dir = await tmpDir();
        await prune(dir);
        const { writeFile } = await import("node:fs/promises");
        const { join } = await import("node:path");
        const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
        const file = `${id}.${EXT[mime]}`;
        await writeFile(join(dir, file), Buffer.from(base64.replace(/^data:[^,]+,/, ""), "base64"));
        return new Response(JSON.stringify({ id: file, expiresInMs: RETENTION_MS }), {
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
      GET: async ({ request }) => {
        if (process.env["NODE_ENV"] === "production") {
          return new Response("Disabled", { status: 403 });
        }
        const id = new URL(request.url).searchParams.get("id") ?? "";
        const [name, ext] = id.split(".");
        if (!name || !ID.test(name) || !ext || !Object.values(EXT).includes(ext)) {
          return new Response("Invalid id", { status: 400 });
        }
        const dir = await tmpDir();
        const { readFile } = await import("node:fs/promises");
        const { join } = await import("node:path");
        const bytes = await readFile(join(dir, `${name}.${ext}`)).catch(() => null);
        if (!bytes) return new Response("Expired", { status: 404 });
        const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
        return new Response(new Uint8Array(bytes), {
          headers: { "Content-Type": mime, "Cache-Control": "no-store" },
        });
      },
    },
  },
});
