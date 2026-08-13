import { createFileRoute } from "@tanstack/react-router";

/**
 * Internal dev-only endpoint: overwrite a sketch asset on disk with a freshly
 * generated render from /internal/illustrations. The browser encodes the JPEG
 * and the 700w/1400w WebP variants (canvas), so this handler only writes bytes.
 *
 * Disabled outside development — published deployments have no writable source
 * tree, and this must never be reachable in production.
 */
export const Route = createFileRoute("/api/save-sketch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (process.env["NODE_ENV"] === "production") {
          return new Response("Disabled", { status: 403 });
        }

        const body = (await request.json()) as {
          name?: string;
          files?: { suffix?: string; base64?: string }[];
        };
        const name = body.name ?? "";
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
          return new Response("Invalid sketch name", { status: 400 });
        }
        const files = (body.files ?? []).filter(
          (f): f is { suffix: string; base64: string } =>
            typeof f.base64 === "string" &&
            typeof f.suffix === "string" &&
            /^(?:\.jpg|-700\.webp|-1400\.webp)$/.test(f.suffix),
        );
        if (files.length === 0) return new Response("No files", { status: 400 });

        const { writeFile } = await import("node:fs/promises");
        const { resolve } = await import("node:path");
        const dir = resolve(process.cwd(), "src/assets/sketch");

        const written: string[] = [];
        for (const file of files) {
          const target = resolve(dir, `${name}${file.suffix}`);
          if (!target.startsWith(dir)) {
            return new Response("Invalid path", { status: 400 });
          }
          await writeFile(target, Buffer.from(file.base64, "base64"));
          written.push(`${name}${file.suffix}`);
        }

        return new Response(JSON.stringify({ written }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
