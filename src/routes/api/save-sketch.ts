import { createFileRoute } from "@tanstack/react-router";
import { MAX_IMAGE_BYTES, base64Bytes } from "@/lib/sketch-request";
import {
  backupFilename,
  buildVersionRecord,
  isConfirmed,
  isValidAssetName,
  nextVersionLabel,
  type PromoteMode,
} from "@/lib/sketch-promote";

/**
 * Internal dev-only endpoint: promote a studio render into the repository's
 * sketch assets. The browser encodes every variant (canvas), so this handler
 * only validates and writes bytes.
 *
 * Safety rules enforced here, not just in the UI:
 * - disabled entirely outside development;
 * - the caller must send the exact confirmation phrase for the target asset;
 * - every file that would be displaced is copied into `.versions/<asset>/`
 *   first, and a JSON version record is appended, so nothing is ever silently
 *   overwritten;
 * - filenames are pattern-checked and re-resolved inside the asset directory.
 */

const ALLOWED_SUFFIX = /^(?:\.jpg|\.png|-700\.webp|-1400\.webp)$/;

type IncomingFile = { suffix: string; base64: string };

export const Route = createFileRoute("/api/save-sketch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (process.env["NODE_ENV"] === "production") {
          return new Response("Disabled", { status: 403 });
        }

        const body = (await request.json().catch(() => null)) as {
          name?: string;
          mode?: PromoteMode;
          confirm?: string;
          prompt?: string;
          settings?: unknown;
          model?: string;
          alpha?: boolean;
          note?: string;
          files?: { suffix?: string; base64?: string }[];
        } | null;

        const name = body?.name ?? "";
        if (!isValidAssetName(name)) {
          return new Response("Invalid sketch name", { status: 400 });
        }
        const mode: PromoteMode = body?.mode === "add" ? "add" : "replace";
        const alpha = body?.alpha === true;

        if (!isConfirmed({ name, mode, alpha }, body?.confirm ?? "")) {
          return new Response("Promotion not confirmed", { status: 428 });
        }

        const files = (body?.files ?? []).filter(
          (f): f is IncomingFile =>
            typeof f.base64 === "string" &&
            typeof f.suffix === "string" &&
            ALLOWED_SUFFIX.test(f.suffix),
        );
        if (files.length === 0) return new Response("No files", { status: 400 });
        const total = files.reduce((sum, f) => sum + base64Bytes(f.base64), 0);
        if (total > MAX_IMAGE_BYTES * files.length) {
          return new Response("Payload too large", { status: 413 });
        }

        const { writeFile, mkdir, copyFile, readFile, access } = await import("node:fs/promises");
        const { resolve, join } = await import("node:path");
        const dir = resolve(process.cwd(), "src/assets/sketch");
        const versionsDir = join(dir, ".versions", name);
        const recordPath = join(dir, ".versions", "history.json");

        const exists = async (path: string) =>
          access(path).then(
            () => true,
            () => false,
          );

        // Existing version labels for this asset -> next label.
        const previous = (await readFile(recordPath, "utf8").catch(() => "")) || "";
        let history: { version: string; asset: string }[] = [];
        try {
          history = previous ? (JSON.parse(previous) as typeof history) : [];
        } catch {
          history = [];
        }
        const version = nextVersionLabel(
          history.filter((h) => h.asset === name).map((h) => h.version),
        );

        // 1. Back up whatever we are about to displace.
        const backups: string[] = [];
        const at = new Date();
        await mkdir(versionsDir, { recursive: true });
        for (const file of files) {
          const target = resolve(dir, `${name}${file.suffix}`);
          if (!target.startsWith(`${dir}/`)) {
            return new Response("Invalid path", { status: 400 });
          }
          if (await exists(target)) {
            const backup = backupFilename(`${name}${file.suffix}`, version, at);
            await copyFile(target, join(versionsDir, backup));
            backups.push(backup);
          }
        }

        // 2. Write the new bytes.
        const written: string[] = [];
        for (const file of files) {
          const target = resolve(dir, `${name}${file.suffix}`);
          await writeFile(target, Buffer.from(file.base64, "base64"));
          written.push(`${name}${file.suffix}`);
        }

        // 3. Append the version record.
        const record = buildVersionRecord({
          target: { name, mode, alpha },
          version,
          at,
          files: written,
          backups,
          prompt: typeof body?.prompt === "string" ? body.prompt : "",
          settings: body?.settings ?? null,
          model: typeof body?.model === "string" ? body.model : "",
          ...(typeof body?.note === "string" ? { note: body.note } : {}),
        });
        await writeFile(
          recordPath,
          JSON.stringify([...history, record], null, 2),
          "utf8",
        );

        return new Response(
          JSON.stringify({ written, backups, version, backupDir: `.versions/${name}` }),
          { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
