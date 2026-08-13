/**
 * Genuine alpha handling for studio renders.
 *
 * The image models the gateway exposes return opaque PNGs — there is no alpha
 * channel to ask for. So transparency here is produced by a real keying pass
 * over the decoded pixels: near-white paper becomes alpha 0, ink keeps its
 * colour, and the transition band gets partial alpha so pencil edges stay soft.
 * The result is written out as a PNG/WebP with a true alpha channel, never as a
 * CSS blend mode.
 *
 * Everything in this file operates on a plain RGBA byte array so it can be
 * unit-tested without a canvas, and reused from the browser (canvas
 * getImageData) unchanged.
 */

export type Rgba = { data: Uint8ClampedArray; width: number; height: number };

export type KeyOptions = {
  /** Luminance at/above which a pixel is treated as pure paper (0–255). */
  whiteCut: number;
  /** Luminance below which a pixel is fully kept. */
  inkCut: number;
  /** Max chroma spread for a pixel to count as neutral paper. */
  chromaTolerance: number;
};

export const DEFAULT_KEY_OPTIONS: KeyOptions = {
  whiteCut: 247,
  inkCut: 216,
  chromaTolerance: 14,
};

const luminance = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b;

/**
 * Key near-white paper out to alpha in place. Returns how many pixels became
 * fully transparent, which the validator uses as a sanity signal.
 */
export function keyWhiteToAlpha(
  image: Rgba,
  options: Partial<KeyOptions> = {},
): { cleared: number; partial: number } {
  const { whiteCut, inkCut, chromaTolerance } = { ...DEFAULT_KEY_OPTIONS, ...options };
  const span = Math.max(1, whiteCut - inkCut);
  let cleared = 0;
  let partial = 0;

  for (let i = 0; i < image.data.length; i += 4) {
    const r = image.data[i]!;
    const g = image.data[i + 1]!;
    const b = image.data[i + 2]!;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    if (chroma > chromaTolerance) continue; // coloured pencil: keep fully

    const lum = luminance(r, g, b);
    if (lum >= whiteCut) {
      image.data[i + 3] = 0;
      cleared += 1;
      continue;
    }
    if (lum > inkCut) {
      const alpha = Math.round(((whiteCut - lum) / span) * 255);
      image.data[i + 3] = Math.min(image.data[i + 3]!, alpha);
      partial += 1;
    }
  }

  return { cleared, partial };
}

export type AlphaReport = {
  /** Alpha value sampled at each corner patch. */
  corners: number[];
  /** Share of pixels that are fully transparent (0–1). */
  transparentRatio: number;
  /** True only when every corner is transparent and real content remains. */
  transparent: boolean;
  reason?: string;
};

/**
 * Validate that an image really is a cutout before the UI labels it as one.
 *
 * All four corner patches must be transparent, and there must still be opaque
 * subject pixels left (a fully-cleared frame means the key ate the drawing).
 */
export function validateAlpha(
  image: Rgba,
  opts: { patch?: number; cornerMaxAlpha?: number } = {},
): AlphaReport {
  const patch = Math.max(1, Math.min(opts.patch ?? 12, Math.floor(Math.min(image.width, image.height) / 4)));
  const cornerMaxAlpha = opts.cornerMaxAlpha ?? 8;

  const corners = [
    [0, 0],
    [image.width - patch, 0],
    [0, image.height - patch],
    [image.width - patch, image.height - patch],
  ].map(([x0, y0]) => {
    let max = 0;
    for (let y = y0!; y < y0! + patch; y += 1) {
      for (let x = x0!; x < x0! + patch; x += 1) {
        const alpha = image.data[(y * image.width + x) * 4 + 3] ?? 0;
        if (alpha > max) max = alpha;
      }
    }
    return max;
  });

  let opaque = 0;
  let clear = 0;
  const total = image.width * image.height;
  for (let i = 3; i < image.data.length; i += 4) {
    const a = image.data[i]!;
    if (a === 0) clear += 1;
    else if (a > 200) opaque += 1;
  }

  const transparentRatio = total === 0 ? 0 : clear / total;
  const cornersClear = corners.every((a) => a <= cornerMaxAlpha);
  const subjectRatio = total === 0 ? 0 : opaque / total;

  if (!cornersClear) {
    return {
      corners,
      transparentRatio,
      transparent: false,
      reason: "Corner pixels are still opaque — the paper was not keyed out.",
    };
  }
  if (subjectRatio < 0.005) {
    return {
      corners,
      transparentRatio,
      transparent: false,
      reason: "Almost nothing opaque survived the key — the drawing was erased.",
    };
  }
  if (transparentRatio < 0.02) {
    return {
      corners,
      transparentRatio,
      transparent: false,
      reason: "Too little of the frame is transparent to call this a cutout.",
    };
  }
  return { corners, transparentRatio, transparent: true };
}

/** Bounding box of non-paper content, used by cleanup/reframe passes. */
export function inkBounds(
  image: Rgba,
  options: Partial<KeyOptions> = {},
): { x: number; y: number; width: number; height: number } | null {
  const { whiteCut, chromaTolerance } = { ...DEFAULT_KEY_OPTIONS, ...options };
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const i = (y * image.width + x) * 4;
      const a = image.data[i + 3]!;
      if (a === 0) continue;
      const r = image.data[i]!;
      const g = image.data[i + 1]!;
      const b = image.data[i + 2]!;
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      const isPaper = chroma <= chromaTolerance && luminance(r, g, b) >= whiteCut;
      if (isPaper) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) return null;
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/**
 * Where to draw a trimmed subject inside the target frame, honouring subject
 * scale, placement and crop-safe padding. Pure maths so it can be tested.
 */
export function layoutSubject(args: {
  subject: { width: number; height: number };
  frame: { width: number; height: number };
  scale: number;
  padding: number;
  placement: "left" | "center" | "right";
  vertical: "top" | "middle" | "bottom";
}): { x: number; y: number; width: number; height: number } {
  const pad = (Math.min(args.padding, 15) / 100) * Math.min(args.frame.width, args.frame.height);
  const availW = Math.max(1, args.frame.width - pad * 2);
  const availH = Math.max(1, args.frame.height - pad * 2);
  const targetW = Math.min(availW, (Math.min(Math.max(args.scale, 40), 100) / 100) * args.frame.width);
  const ratio = args.subject.height / Math.max(1, args.subject.width);
  let width = targetW;
  let height = width * ratio;
  if (height > availH) {
    height = availH;
    width = height / Math.max(0.0001, ratio);
  }

  const slackX = args.frame.width - pad * 2 - width;
  const slackY = args.frame.height - pad * 2 - height;
  const x =
    pad + (args.placement === "left" ? 0 : args.placement === "right" ? slackX : slackX / 2);
  const y =
    pad + (args.vertical === "top" ? 0 : args.vertical === "bottom" ? slackY : slackY / 2);

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}
