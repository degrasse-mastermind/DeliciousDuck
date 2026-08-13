/**
 * Browser-side finishing pass for studio renders.
 *
 * The image model returns an opaque drawing at whatever size it likes. This
 * module puts it into the requested frame: trim to the ink bounding box, place
 * it per subject scale / placement / crop-safe padding, paint the requested
 * ground (white, cream, transparent alpha, or full-bleed cover), then key the
 * paper out to genuine alpha when transparency was asked for and validate the
 * corners before anything is labelled "transparent".
 *
 * Canvas work only — the pixel maths lives in `sketch-alpha.ts` so it is
 * testable without a DOM.
 */

import {
  inkBounds,
  keyWhiteToAlpha,
  layoutSubject,
  validateAlpha,
  type AlphaReport,
  type Rgba,
} from "./sketch-alpha";
import {
  dimensionsFor,
  wantsAlpha,
  type ExportFormat,
  type StudioSettings,
} from "./sketch-studio";
import { SKETCH_PALETTE } from "./sketch-style";

export type ComposedRender = {
  /** Finished image as a PNG data URL (carries alpha when applicable). */
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
  alpha?: AlphaReport;
};

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "sync";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode the generated image"));
    img.src = src;
  });
}

function context(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is unavailable in this browser");
  return { canvas, ctx };
}

function groundColor(settings: StudioSettings): string | null {
  if (wantsAlpha(settings)) return null;
  if (settings.output === "cream") return SKETCH_PALETTE.cream;
  return "#ffffff";
}

/** Compose one generated frame into the requested output. */
export async function composeCandidate(
  src: string,
  settings: StudioSettings,
): Promise<ComposedRender> {
  const img = await loadImage(src);
  const frame = dimensionsFor(settings.aspect);
  const { canvas, ctx } = context(frame.width, frame.height);
  const ground = groundColor(settings);

  if (ground) {
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, frame.width, frame.height);
  } else {
    ctx.clearRect(0, 0, frame.width, frame.height);
  }

  if (settings.output === "scene") {
    // Full-bleed: cover the frame, centred, nothing trimmed.
    const scale = Math.max(frame.width / img.naturalWidth, frame.height / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (frame.width - w) / 2, (frame.height - h) / 2, w, h);
  } else {
    // Trim to the drawn subject, then place it per the composition controls.
    const probe = context(img.naturalWidth, img.naturalHeight);
    probe.ctx.drawImage(img, 0, 0);
    const raw = probe.ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
    const rgba: Rgba = {
      data: raw.data,
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
    const bounds = inkBounds(rgba) ?? {
      x: 0,
      y: 0,
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
    const box = layoutSubject({
      subject: { width: bounds.width, height: bounds.height },
      frame,
      scale: settings.scale,
      padding: settings.padding,
      placement: settings.placement,
      vertical: settings.vertical,
    });
    ctx.drawImage(
      img,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      box.x,
      box.y,
      box.width,
      box.height,
    );
  }

  let alpha: AlphaReport | undefined;
  if (wantsAlpha(settings)) {
    const raw = ctx.getImageData(0, 0, frame.width, frame.height);
    const rgba: Rgba = { data: raw.data, width: frame.width, height: frame.height };
    keyWhiteToAlpha(rgba);
    ctx.putImageData(raw, 0, 0);
    alpha = validateAlpha(rgba);
  }

  const dataUrl = canvas.toDataURL("image/png");
  const result: ComposedRender = {
    dataUrl,
    width: frame.width,
    height: frame.height,
    bytes: Math.floor(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4),
  };
  if (alpha) result.alpha = alpha;
  return result;
}

const MIME: Record<ExportFormat, string> = {
  png: "image/png",
  webp: "image/webp",
  jpeg: "image/jpeg",
};

export type EncodedFile = {
  format: ExportFormat;
  width: number;
  height: number;
  blob: Blob;
  bytes: number;
};

/** Re-encode a composed render at a given width and format. */
export async function encodeRender(
  src: string,
  format: ExportFormat,
  width: number,
  opts: { flattenTo?: string | null; quality?: number } = {},
): Promise<EncodedFile> {
  const img = await loadImage(src);
  const height = Math.max(
    1,
    Math.round((width / img.naturalWidth) * img.naturalHeight),
  );
  const { canvas, ctx } = context(width, height);
  const flatten = opts.flattenTo ?? (format === "jpeg" ? "#ffffff" : null);
  if (flatten) {
    ctx.fillStyle = flatten;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encoding failed"))),
      MIME[format],
      opts.quality ?? (format === "png" ? undefined : 0.9),
    );
  });
  return { format, width, height, blob, bytes: blob.size };
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
