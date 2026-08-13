/**
 * Sketch layout variants.
 *
 * The artistic style is fixed by `sketch-style.ts` — palette, line weight and
 * paper grounding never change. What DOES change is how a drawing is framed for
 * the space it sits in: a framed card inside a narrow article column, a
 * full-bleed band across a wide section, or a whisper/soft/bold backdrop behind
 * text. This module names those layout contexts once, so callers ask for a
 * context ("article break", "cta strip") instead of hand-tuning six props.
 */

import { SKETCH_SIZES } from "./sketch-sources";

/** How present a backdrop drawing is behind text. */
export type SketchIntensity = "whisper" | "soft" | "bold";

/** Which primitive renders the art. */
export type SketchRole = "figure" | "band" | "backdrop" | "aside";

export type SketchVariantSpec = {
  role: SketchRole;
  /** Band framing: bordered card vs. edge-to-edge. */
  frame: "framed" | "bleed";
  height: "short" | "medium" | "tall" | "auto";
  focus: "top" | "center" | "bottom";
  intensity: SketchIntensity;
  position: "left" | "right" | "center" | "cover";
  /** Responsive width hint passed to the `sizes` attribute. */
  sizes: string;
  rounded: boolean;
  eager: boolean;
};

/** Named layout contexts. Add a context here rather than inlining props. */
export type SketchContext =
  | "pageHeader"
  | "articleBreak"
  | "sectionBreak"
  | "ctaStrip"
  | "pullQuote"
  | "heroPanel"
  | "marginNote"
  | "toolPanel"
  | "trailingGap";

const BASE: SketchVariantSpec = {
  role: "band",
  frame: "framed",
  height: "medium",
  focus: "center",
  intensity: "soft",
  position: "right",
  sizes: SKETCH_SIZES.band,
  rounded: true,
  eager: false,
};

export const SKETCH_CONTEXTS: Record<SketchContext, SketchVariantSpec> = {
  /** Route header art: uncropped, preloaded, sits beside the H1. */
  pageHeader: { ...BASE, role: "figure", height: "auto", sizes: SKETCH_SIZES.header, eager: true },
  /** Break inside a narrow reading column: framed so it reads as a plate. */
  articleBreak: { ...BASE, role: "band", frame: "framed", height: "short" },
  /** Divider between wide sections: full-bleed so the drawing melts into the page. */
  sectionBreak: { ...BASE, role: "band", frame: "bleed", height: "tall" },
  /** Conversion strip: art anchored right, text stays readable. */
  ctaStrip: { ...BASE, role: "backdrop", intensity: "soft", position: "right" },
  /** Quiet quote or callout: barely-there drawing centered behind the words. */
  pullQuote: { ...BASE, role: "backdrop", intensity: "whisper", position: "center" },
  /** Landing panel: the drawing carries the block, so let it come forward. */
  heroPanel: { ...BASE, role: "backdrop", intensity: "bold", position: "cover", height: "tall" },
  /** Floating margin illustration next to body copy. */
  marginNote: { ...BASE, role: "aside", height: "auto", sizes: SKETCH_SIZES.aside },
  /** Behind a calculator or form: whisper only, never competing with inputs. */
  toolPanel: { ...BASE, role: "backdrop", intensity: "whisper", position: "right" },
  /** Gap above the footer: soft, square-edged, full width. */
  trailingGap: { ...BASE, role: "backdrop", intensity: "soft", position: "right", rounded: false },
};

/** Resolve a context to a full spec, with per-call overrides on top. */
export function resolveSketchVariant(
  context: SketchContext = "articleBreak",
  overrides: Partial<SketchVariantSpec> = {},
): SketchVariantSpec {
  const preset = SKETCH_CONTEXTS[context] ?? SKETCH_CONTEXTS.articleBreak;
  return { ...preset, ...overrides };
}

/**
 * Alternate framing across repeated placements so a long page doesn't look
 * like a stack of identical cards. Keeps the same context otherwise.
 */
export function alternateFrame(index: number): "framed" | "bleed" {
  return index % 2 === 0 ? "framed" : "bleed";
}

/**
 * Step a backdrop's intensity down as placements accumulate — the first one
 * can carry weight, later ones should recede.
 */
export function steppedIntensity(index: number): SketchIntensity {
  const ladder: SketchIntensity[] = ["soft", "whisper", "whisper"];
  return ladder[Math.min(index, ladder.length - 1)] as SketchIntensity;
}
