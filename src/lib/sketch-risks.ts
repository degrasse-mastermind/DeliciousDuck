/**
 * Automatic risk flags for a candidate placed in a layout context.
 *
 * The studio previews a candidate on white, cream and forest-green surfaces in
 * every named layout context, and each preview asks this module "what could go
 * wrong here?". Rules are deliberately conservative and pure so they can be
 * tested; they warn rather than block.
 */

import type { AlphaReport } from "./sketch-alpha";
import { SKETCH_CONTEXTS, type SketchContext } from "./sketch-variants";
import { ASPECT_PRESETS, type AspectPreset, type OutputMode } from "./sketch-studio";

export type Surface = "white" | "cream" | "forest";

export type RiskLevel = "info" | "warn" | "block";

export type Risk = {
  code:
    | "alpha-required"
    | "alpha-unverified"
    | "seam"
    | "contrast"
    | "clipping"
    | "legibility"
    | "aspect";
  level: RiskLevel;
  message: string;
};

export type RiskInput = {
  context: SketchContext;
  surface: Surface;
  output: OutputMode;
  aspect: AspectPreset;
  alpha?: AlphaReport | undefined;
  /** Rendered pixel box of the candidate. */
  dimensions?: { width: number; height: number } | undefined;
};

const DARK_SURFACES: Surface[] = ["forest"];

export function evaluateRisks(input: RiskInput): Risk[] {
  const risks: Risk[] = [];
  const spec = SKETCH_CONTEXTS[input.context];
  const hasAlpha = input.alpha?.transparent === true;

  // Multiply-based paper knockout only works on light surfaces.
  if (DARK_SURFACES.includes(input.surface) && !hasAlpha) {
    risks.push({
      code: "alpha-required",
      level: "block",
      message:
        "Opaque paper on a dark surface renders as a solid rectangle — promote a transparent cutout for this placement.",
    });
  }

  if (input.output === "transparent" && !hasAlpha) {
    risks.push({
      code: "alpha-unverified",
      level: "warn",
      message:
        input.alpha?.reason ??
        "Transparent output requested but the alpha channel has not been verified yet.",
    });
  }

  if (input.output === "cream" && input.surface === "white") {
    risks.push({
      code: "seam",
      level: "warn",
      message: "Cream paper on a white surface shows a visible rectangular seam.",
    });
  }
  if (input.output === "white" && input.surface === "cream") {
    risks.push({
      code: "seam",
      level: "info",
      message: "White paper is knocked out by multiply on cream; check the corners for banding.",
    });
  }
  if (input.output === "scene" && spec.role === "backdrop") {
    risks.push({
      code: "legibility",
      level: "warn",
      message: "Full-bleed scenes behind copy reduce text legibility — lower the intensity or reframe.",
    });
  }

  if (spec.role === "backdrop" && input.surface === "forest") {
    risks.push({
      code: "contrast",
      level: "warn",
      message: "Backdrop art on forest green leaves too little contrast for body copy.",
    });
  }

  // Cropping: any context with a fixed height crops a non-house aspect.
  if (spec.height !== "auto" && input.aspect !== "7:4") {
    risks.push({
      code: "clipping",
      level: "warn",
      message: `${input.context} crops to a fixed height — ${input.aspect} art will lose edges. Check the subject padding.`,
    });
  }

  if (input.dimensions) {
    const ratio = input.dimensions.width / Math.max(1, input.dimensions.height);
    const preset = ASPECT_PRESETS[input.aspect];
    const expected = preset.w / preset.h;
    if (Math.abs(ratio - expected) > 0.06) {
      risks.push({
        code: "aspect",
        level: "info",
        message: `Render is ${ratio.toFixed(2)}:1 but ${input.aspect} was requested; it will be letterboxed on export.`,
      });
    }
  }

  return risks;
}

export const SURFACES: { value: Surface; label: string; className: string; dark: boolean }[] = [
  { value: "white", label: "White", className: "bg-white", dark: false },
  { value: "cream", label: "Cream", className: "bg-cream", dark: false },
  { value: "forest", label: "Forest green", className: "bg-primary", dark: true },
];

export const RISK_CONTEXTS = Object.keys(SKETCH_CONTEXTS) as SketchContext[];

/** Highest severity across a set of risks. */
export function worstLevel(risks: readonly Risk[]): RiskLevel | null {
  if (risks.some((r) => r.level === "block")) return "block";
  if (risks.some((r) => r.level === "warn")) return "warn";
  if (risks.length > 0) return "info";
  return null;
}
