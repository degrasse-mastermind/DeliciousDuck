/**
 * Client half of the promotion flow.
 *
 * Encodes a composed studio render into the file set every sketch ships as
 * (1400x800-class JPEG plus 700w/1400w WebP, and a PNG when the render carries
 * genuine alpha) and posts them to /api/save-sketch together with the
 * confirmation phrase, prompt and settings. The server refuses the write unless
 * the phrase matches, and backs up whatever it displaces.
 */

import { blobToBase64, encodeRender } from "./sketch-compose";
import { confirmationPhrase, type PromoteMode } from "./sketch-promote";
import type { StudioSettings } from "./sketch-studio";

export type PromoteResult = {
  written: string[];
  backups: string[];
  version: string;
  backupDir: string;
};

export type PromoteArgs = {
  name: string;
  mode: PromoteMode;
  alpha: boolean;
  dataUrl: string;
  prompt: string;
  settings: StudioSettings;
  note?: string;
  /** What the editor typed in the confirmation field. */
  confirm: string;
};

export async function promoteSketchAsset(args: PromoteArgs): Promise<PromoteResult> {
  if (args.confirm.trim().toLowerCase() !== confirmationPhrase(args)) {
    throw new Error(`Type “${confirmationPhrase(args)}” to confirm this promotion.`);
  }

  const jpeg = await encodeRender(args.dataUrl, "jpeg", 1400, { flattenTo: "#ffffff", quality: 0.9 });
  const webp1400 = await encodeRender(args.dataUrl, "webp", 1400, { quality: 0.85 });
  const webp700 = await encodeRender(args.dataUrl, "webp", 700, { quality: 0.85 });

  const files: { suffix: string; base64: string }[] = [
    { suffix: ".jpg", base64: await blobToBase64(jpeg.blob) },
    { suffix: "-1400.webp", base64: await blobToBase64(webp1400.blob) },
    { suffix: "-700.webp", base64: await blobToBase64(webp700.blob) },
  ];

  if (args.alpha) {
    const png = await encodeRender(args.dataUrl, "png", 1400, { flattenTo: null });
    files.push({ suffix: ".png", base64: await blobToBase64(png.blob) });
  }

  const res = await fetch("/api/save-sketch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: args.name,
      mode: args.mode,
      alpha: args.alpha,
      confirm: args.confirm.trim().toLowerCase(),
      prompt: args.prompt,
      settings: args.settings,
      model: args.settings.model,
      ...(args.note ? { note: args.note } : {}),
      files,
    }),
  });
  if (!res.ok) throw new Error((await res.text()) || "Could not promote this render");
  return (await res.json()) as PromoteResult;
}

/** Stash a render in the dev temp store so history can restore it after reload. */
export async function stashRender(dataUrl: string): Promise<string | null> {
  try {
    const res = await fetch("/api/sketch-blob", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64: dataUrl, mime: "image/png" }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { id?: string };
    return json.id ?? null;
  } catch {
    return null;
  }
}

export function stashedUrl(blobId: string): string {
  return `/api/sketch-blob?id=${encodeURIComponent(blobId)}`;
}

/** Load an existing asset URL as a data URL for reference-based intents. */
export async function loadAssetAsDataUrl(src: string): Promise<string> {
  const res = await fetch(src);
  if (!res.ok) throw new Error("Could not read the current asset");
  const blob = await res.blob();
  const base64 = await blobToBase64(blob);
  const mime = blob.type || "image/jpeg";
  return `data:${mime};base64,${base64}`;
}
