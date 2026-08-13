/**
 * Centralized Sketch style configuration.
 *
 * Single source of truth for how every DeliciousDuck illustration is
 * generated AND rendered. Any new illustration must be created with
 * `sketchPrompt()` so palette, line weight, background and grounding
 * stay identical to the existing collection (reference: buying-duck.jpg).
 */

/** Canonical palette of the collection (hex values kept for reference only). */
export const SKETCH_PALETTE = {
  paper: "#ffffff",
  line: "#3a332e",
  terracotta: "#b4653f",
  cream: "#f2e4cf",
  kraft: "#c69a6d",
  charcoal: "#5a544e",
} as const;

/** The written style contract, reused verbatim in every generation prompt. */
export const SKETCH_STYLE = {
  medium:
    "Loose colored-pencil and fine ink-line illustration on a plain solid white background",
  composition:
    "single subject centered with generous white space, nothing cropped at the edges",
  line: "thin dark pencil outlines with soft warm colored-pencil shading, visible hand-drawn stroke texture, no digital gradients",
  palette:
    "muted natural palette of warm terracotta, cream, kraft tan and soft charcoal",
  grounding: "one faint horizontal pencil line suggesting a table edge",
  texture: "light paper-grain hatching",
  avoid:
    "no photorealism, no photography, no 3D render, no text, no watermark, no border, no colored or textured background",
} as const;

/** Standard output size for all header/band artwork. */
export const SKETCH_DIMENSIONS = { width: 1400, height: 800 } as const;

/**
 * Canonical export contract. New art MUST follow this or it will show up as a
 * grey rectangle on the cream page surface:
 *
 * 1. 1400x800 JPEG, ground painted pure #ffffff — never a tinted near-white
 *    (#ededeb / #f5f5f5 both read as a visible box once multiplied).
 * 2. Subject trimmed to its ink bounding box, then scaled to at most 74% of the
 *    canvas width and 80% of its height and centered, so density matches the
 *    rest of the collection.
 * 3. Ship `<name>-700.webp` and `<name>-1400.webp` beside the JPEG; the
 *    responsive resolver in `sketch-sources.ts` keys off that exact naming.
 *
 * Surface caveat: the render pipeline knocks the paper out with
 * `mix-blend-multiply`, which only works on LIGHT surfaces. A sketch placed on
 * a dark background needs a genuine alpha (transparent PNG) export instead —
 * multiply on dark turns the drawing into a black rectangle.
 */
export const SKETCH_EXPORT = {
  width: 1400,
  height: 800,
  ground: "#ffffff",
  maxSubjectWidth: 0.74,
  maxSubjectHeight: 0.8,
  variants: [700, 1400],
  lightSurfacesOnly: true,
} as const;


/** The exact suffix appended to every illustration prompt. */
export const SKETCH_STYLE_SUFFIX = [
  SKETCH_STYLE.medium,
  SKETCH_STYLE.composition,
  SKETCH_STYLE.line,
  SKETCH_STYLE.palette,
  SKETCH_STYLE.grounding,
  SKETCH_STYLE.texture,
  SKETCH_STYLE.avoid,
].join(", ");

/**
 * Build a generation prompt for a new illustration.
 * Pass only the subject, e.g. "a duck leg confit crisping in a skillet".
 */
export function sketchPrompt(subject: string): string {
  const cleaned = subject.trim().replace(/[.\s]+$/, "");
  return `${cleaned}. ${SKETCH_STYLE_SUFFIX}.`;
}

/**
 * Shared render tokens so illustrations sit on the page consistently
 * (same paper tone behind transparent-ish whites, same edge softening).
 */
export const SKETCH_RENDER = {
  /** Paper surface every sketch sits on. */
  surface: "bg-cream",
  /** Lets the drawing's white paper drop out against that surface. */
  blend: "select-none mix-blend-multiply",
  /** Opacity levels used by SketchBackdrop intensities. */
  intensity: { whisper: "opacity-15", soft: "opacity-25", bold: "opacity-45" },
} as const;
