/**
 * Per-sketch regeneration options.
 *
 * The house style in `sketch-style.ts` is the default for every illustration.
 * These option sets let an editor nudge one drawing — palette temperature, line
 * weight, background grounding, shading intensity — without inventing a new
 * style: each option is a *substitution* for one clause of the canonical prompt,
 * so everything else (medium, composition, avoid-list) stays fixed.
 */

import { SKETCH_STYLE } from "./sketch-style";

export type SketchOptionSet<K extends string> = Record<
  K,
  { label: string; clause: string }
>;

export type PaletteOption = "house" | "warmer" | "cooler" | "muted" | "richer";
export type LineOption = "house" | "fine" | "bold" | "sketchy";
export type BackgroundOption = "house" | "bare" | "shadow" | "vignette";
export type ShadingOption = "house" | "whisper" | "soft" | "bold";

export const PALETTE_OPTIONS: SketchOptionSet<PaletteOption> = {
  house: { label: "House palette", clause: SKETCH_STYLE.palette },
  warmer: {
    label: "Warmer",
    clause:
      "warm palette leaning into terracotta, amber and toasted kraft tan, restrained and natural",
  },
  cooler: {
    label: "Cooler",
    clause:
      "cooler natural palette of slate, sage and cream with only a touch of terracotta",
  },
  muted: {
    label: "More muted",
    clause:
      "very muted, desaturated palette of cream, pale kraft and soft charcoal with faint terracotta accents",
  },
  richer: {
    label: "Richer",
    clause:
      "same natural palette of terracotta, cream, kraft tan and charcoal, but noticeably more saturated",
  },
};

export const LINE_OPTIONS: SketchOptionSet<LineOption> = {
  house: { label: "House line", clause: SKETCH_STYLE.line },
  fine: {
    label: "Finer line",
    clause:
      "very thin delicate ink outlines with light colored-pencil shading, visible hand-drawn stroke texture, no digital gradients",
  },
  bold: {
    label: "Bolder line",
    clause:
      "confident heavier dark pencil outlines with firm colored-pencil shading, visible hand-drawn stroke texture, no digital gradients",
  },
  sketchy: {
    label: "Looser / sketchy",
    clause:
      "loose searching pencil outlines with overlapping construction strokes and open corners, hand-drawn texture, no digital gradients",
  },
};

export const BACKGROUND_OPTIONS: SketchOptionSet<BackgroundOption> = {
  house: { label: "House grounding", clause: SKETCH_STYLE.grounding },
  bare: {
    label: "No grounding line",
    clause: "the subject floats on plain white with no ground line or shadow",
  },
  shadow: {
    label: "Soft cast shadow",
    clause:
      "one faint horizontal pencil line suggesting a table edge plus a soft pencil-hatched cast shadow under the subject",
  },
  vignette: {
    label: "Faint paper vignette",
    clause:
      "one faint horizontal pencil line suggesting a table edge and a barely-there pencil vignette at the outer corners, background still solid white",
  },
};

export const SHADING_OPTIONS: SketchOptionSet<ShadingOption> = {
  house: { label: "House texture", clause: SKETCH_STYLE.texture },
  whisper: { label: "Whisper", clause: "almost no hatching, mostly clean white paper" },
  soft: { label: "Soft", clause: "light paper-grain hatching in the shadows only" },
  bold: {
    label: "Bold",
    clause: "denser cross-hatched paper-grain texture through the shadow areas",
  },
};

export type SketchRegenOptions = {
  palette: PaletteOption;
  line: LineOption;
  background: BackgroundOption;
  shading: ShadingOption;
  /** Optional extra art direction for this one drawing. */
  note?: string;
};

export const DEFAULT_REGEN_OPTIONS: SketchRegenOptions = {
  palette: "house",
  line: "house",
  background: "house",
  shading: "house",
};

/** True when nothing has been changed from the house style. */
export function isHouseStyle(options: SketchRegenOptions): boolean {
  return (
    options.palette === "house" &&
    options.line === "house" &&
    options.background === "house" &&
    options.shading === "house" &&
    !options.note?.trim()
  );
}

/**
 * Build the generation prompt for one sketch: canonical clauses with the
 * selected substitutions swapped in, in the same order every time so results
 * stay comparable across regenerations.
 */
export function buildSketchPrompt(
  subject: string,
  options: Partial<SketchRegenOptions> = {},
): string {
  const opts = { ...DEFAULT_REGEN_OPTIONS, ...options };
  const cleaned = subject.trim().replace(/[.\s]+$/, "");
  const note = opts.note?.trim();

  const clauses = [
    SKETCH_STYLE.medium,
    SKETCH_STYLE.composition,
    LINE_OPTIONS[opts.line]?.clause ?? SKETCH_STYLE.line,
    PALETTE_OPTIONS[opts.palette]?.clause ?? SKETCH_STYLE.palette,
    BACKGROUND_OPTIONS[opts.background]?.clause ?? SKETCH_STYLE.grounding,
    SHADING_OPTIONS[opts.shading]?.clause ?? SKETCH_STYLE.texture,
    SKETCH_STYLE.avoid,
  ];
  if (note) clauses.push(note.replace(/[.\s]+$/, ""));

  return `${cleaned}. ${clauses.join(", ")}.`;
}
