/**
 * Art-direction settings model for the internal illustration studio.
 *
 * Everything an editor can change at /internal/illustrations is expressed here
 * as a small, named, serializable option set. Each option maps to exactly one
 * clause of the canonical house prompt, so a given settings object always
 * produces the same prompt string (deterministic), and the house defaults
 * reproduce today's collection byte-for-byte in wording.
 *
 * This module is pure: no DOM, no fetch, no image decoding. That keeps the
 * prompt/serialization/validation rules unit-testable.
 */

import { SKETCH_STYLE, SKETCH_DIMENSIONS } from "./sketch-style";
import {
  BACKGROUND_OPTIONS,
  LINE_OPTIONS,
  PALETTE_OPTIONS,
  SHADING_OPTIONS,
  type BackgroundOption,
  type LineOption,
  type PaletteOption,
  type ShadingOption,
} from "./sketch-regen";

/* ------------------------------------------------------------------ output */

/** What the paper behind the drawing should be in the finished file. */
export type OutputMode = "white" | "transparent" | "cream" | "scene";

export const OUTPUT_MODES: Record<
  OutputMode,
  { label: string; hint: string; clause: string; alpha: boolean }
> = {
  white: {
    label: "Pure white (house default)",
    hint: "Solid #ffffff paper — the current collection standard.",
    clause: "on a plain solid pure white #ffffff background",
    alpha: false,
  },
  transparent: {
    label: "Transparent alpha",
    hint: "White paper is keyed out to genuine alpha after generation.",
    // The model still draws on white; alpha is produced by the keying pass.
    clause:
      "on a plain solid pure white #ffffff background with the subject fully separated from the paper, no background scenery",
    alpha: true,
  },
  cream: {
    label: "Cream-matched",
    hint: "Paper matched to the site cream surface (#f2e4cf).",
    clause: "on a flat warm cream #f2e4cf paper background with no other scenery",
    alpha: false,
  },
  scene: {
    label: "Full-bleed scene",
    hint: "Drawing fills the frame, light scene context allowed.",
    clause:
      "filling the whole frame edge to edge as a light hand-drawn scene, still on warm paper tones with no photographic background",
    alpha: false,
  },
};

/* -------------------------------------------------------------- composition */

export type AspectPreset = "7:4" | "4:3" | "1:1" | "3:4" | "16:9";

export const ASPECT_PRESETS: Record<
  AspectPreset,
  { label: string; w: number; h: number }
> = {
  "7:4": { label: "7:4 house band", w: 7, h: 4 },
  "4:3": { label: "4:3 card", w: 4, h: 3 },
  "1:1": { label: "1:1 square", w: 1, h: 1 },
  "3:4": { label: "3:4 portrait", w: 3, h: 4 },
  "16:9": { label: "16:9 wide", w: 16, h: 9 },
};

export type Placement = "left" | "center" | "right";
export type VerticalPlacement = "top" | "middle" | "bottom";
export type FocalDirection = "left" | "center" | "right";
export type NegativeSpace = "tight" | "balanced" | "airy";

export const NEGATIVE_SPACE: Record<NegativeSpace, { label: string; clause: string }> = {
  tight: { label: "Tight", clause: "only a small margin of empty paper around the subject" },
  balanced: {
    label: "Balanced (house)",
    clause: "generous but balanced empty paper around the subject",
  },
  airy: {
    label: "Airy",
    clause: "a lot of open empty paper around the subject, drawing kept small and calm",
  },
};

export const FOCAL_CLAUSES: Record<FocalDirection, string> = {
  left: "the subject angled so it faces and reads toward the left",
  center: "the subject facing the viewer straight on",
  right: "the subject angled so it faces and reads toward the right",
};

export const PLACEMENT_CLAUSES: Record<Placement, string> = {
  left: "subject sitting in the left third of the frame",
  center: "subject centered in the frame",
  right: "subject sitting in the right third of the frame",
};

export const VERTICAL_CLAUSES: Record<VerticalPlacement, string> = {
  top: "sitting high in the frame",
  middle: "sitting on the vertical centre line",
  bottom: "sitting low in the frame",
};

/* --------------------------------------------------------------- art dials */

export type Temperature = "cool" | "neutral" | "warm";
export type Saturation = "muted" | "house" | "rich";
export type Contrast = "soft" | "house" | "punchy";
export type PaperTexture = "none" | "light" | "grain" | "heavy";
export type DetailDensity = "loose" | "house" | "detailed";
export type SubjectFidelity = "loose" | "faithful" | "exact";

export const TEMPERATURE: Record<Temperature, { label: string; clause?: string }> = {
  cool: { label: "Cooler", clause: "colour temperature pulled slightly cool" },
  neutral: { label: "Neutral (house)" },
  warm: { label: "Warmer", clause: "colour temperature pushed slightly warm" },
};

export const SATURATION: Record<Saturation, { label: string; clause?: string }> = {
  muted: { label: "Muted", clause: "noticeably desaturated colour" },
  house: { label: "House" },
  rich: { label: "Richer", clause: "slightly more saturated colour, still natural" },
};

export const CONTRAST: Record<Contrast, { label: string; clause?: string }> = {
  soft: { label: "Softer", clause: "gentle low-contrast tonal range" },
  house: { label: "House" },
  punchy: { label: "Punchier", clause: "stronger darks in the shadows for more contrast" },
};

export const PAPER_TEXTURE: Record<PaperTexture, { label: string; clause?: string }> = {
  none: { label: "None", clause: "clean paper with no visible tooth" },
  light: { label: "Light (house)" },
  grain: { label: "Grainy", clause: "visible cold-press paper tooth in the shading" },
  heavy: { label: "Heavy", clause: "strong visible paper tooth breaking up the pencil strokes" },
};

export const DETAIL_DENSITY: Record<DetailDensity, { label: string; clause?: string }> = {
  loose: { label: "Looser", clause: "fewer details, only the essential shapes described" },
  house: { label: "House" },
  detailed: { label: "More detail", clause: "more descriptive detail while staying a sketch" },
};

export const SUBJECT_FIDELITY: Record<SubjectFidelity, { label: string; clause?: string }> = {
  loose: { label: "Loose reference", clause: "reinterpret the subject freely" },
  faithful: {
    label: "Faithful (house)",
    clause: "keep the same subject, framing idea and props as the reference",
  },
  exact: {
    label: "Match reference closely",
    clause:
      "match the reference drawing closely — same subject, same pose, same props, same layout, change only what the instructions ask for",
  },
};

/* --------------------------------------------------------------- intent */

/** What this run is meant to do. Drives whether a model call happens at all. */
export type IntentMode =
  | "refine"
  | "variation"
  | "background-cleanup"
  | "reframe"
  | "cutout";

export const INTENT_MODES: Record<
  IntentMode,
  {
    label: string;
    hint: string;
    /** Does this intent call the image model? */
    generates: boolean;
    /** Does this intent send the current asset as an image reference? */
    needsReference: boolean;
    clause?: string;
  }
> = {
  refine: {
    label: "Refine current image",
    hint: "Sends the current asset to an image-edit model and nudges it.",
    generates: true,
    needsReference: true,
    clause:
      "Edit the attached reference illustration. Preserve its subject, composition and character",
  },
  variation: {
    label: "New variation",
    hint: "Fresh drawing of the same subject from the prompt only.",
    generates: true,
    needsReference: false,
  },
  "background-cleanup": {
    label: "Background cleanup only",
    hint: "Local pass: re-key the paper to clean #ffffff. No model call, no redraw.",
    generates: false,
    needsReference: true,
  },
  reframe: {
    label: "Reframe / crop only",
    hint: "Local pass: re-crop, rescale and reposition the existing pixels.",
    generates: false,
    needsReference: true,
  },
  cutout: {
    label: "Transparent cutout",
    hint: "Local pass: key the paper out to genuine alpha and validate the corners.",
    generates: false,
    needsReference: true,
  },
};

/* ------------------------------------------------------------------ models */

/** Only image-capable gateway models the studio is allowed to ask for. */
export const STUDIO_MODELS = {
  "google/gemini-2.5-flash-image": { label: "Gemini 2.5 Flash Image", edits: true },
  "google/gemini-3.1-flash-image": { label: "Gemini 3.1 Flash Image", edits: true },
  "google/gemini-3-pro-image": { label: "Gemini 3 Pro Image (slow)", edits: true },
} as const;

export type StudioModel = keyof typeof STUDIO_MODELS;
export const DEFAULT_MODEL: StudioModel = "google/gemini-2.5-flash-image";

export function isStudioModel(value: unknown): value is StudioModel {
  return typeof value === "string" && value in STUDIO_MODELS;
}

/* ---------------------------------------------------------------- settings */

export type StudioSettings = {
  intent: IntentMode;
  output: OutputMode;
  aspect: AspectPreset;
  /** Subject size as a percentage of frame width (40–100). */
  scale: number;
  placement: Placement;
  vertical: VerticalPlacement;
  /** Crop-safe padding as a percentage of the shorter edge (0–15). */
  padding: number;
  focal: FocalDirection;
  grounding: BackgroundOption;
  negativeSpace: NegativeSpace;
  palette: PaletteOption;
  line: LineOption;
  shading: ShadingOption;
  temperature: Temperature;
  saturation: Saturation;
  contrast: Contrast;
  paperTexture: PaperTexture;
  detail: DetailDensity;
  fidelity: SubjectFidelity;
  model: StudioModel;
  /** 1–4 candidates per job. */
  candidates: number;
  /** Optional deterministic seed echoed into the prompt + history. */
  seed?: number;
  note?: string;
};

export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  intent: "variation",
  output: "white",
  aspect: "7:4",
  scale: 74,
  placement: "center",
  vertical: "middle",
  padding: 6,
  focal: "center",
  grounding: "house",
  negativeSpace: "balanced",
  palette: "house",
  line: "house",
  shading: "house",
  temperature: "neutral",
  saturation: "house",
  contrast: "house",
  paperTexture: "light",
  detail: "house",
  fidelity: "faithful",
  model: DEFAULT_MODEL,
  candidates: 2,
};

/** Per-context sensible defaults for composition. */
export const CONTEXT_DEFAULTS: Record<string, Partial<StudioSettings>> = {
  pageHeader: { aspect: "7:4", scale: 70, negativeSpace: "airy", placement: "center" },
  articleBreak: { aspect: "7:4", scale: 74, negativeSpace: "balanced" },
  sectionBreak: { aspect: "16:9", scale: 68, negativeSpace: "airy" },
  ctaStrip: { aspect: "16:9", scale: 60, negativeSpace: "airy", placement: "right" },
  pullQuote: { aspect: "1:1", scale: 66, negativeSpace: "airy" },
  heroPanel: { aspect: "7:4", scale: 80, negativeSpace: "tight" },
  marginNote: { aspect: "3:4", scale: 78, negativeSpace: "tight" },
  toolPanel: { aspect: "4:3", scale: 72, negativeSpace: "balanced" },
  trailingGap: { aspect: "16:9", scale: 64, negativeSpace: "airy" },
};

export function settingsForContext(context: string): StudioSettings {
  return { ...DEFAULT_STUDIO_SETTINGS, ...(CONTEXT_DEFAULTS[context] ?? {}) };
}

export function clampSettings(settings: StudioSettings): StudioSettings {
  return {
    ...settings,
    scale: Math.min(100, Math.max(40, Math.round(settings.scale))),
    padding: Math.min(15, Math.max(0, Math.round(settings.padding))),
    candidates: Math.min(4, Math.max(1, Math.round(settings.candidates))),
  };
}

/* ------------------------------------------------------------ dimensions */

export type Dimensions = { width: number; height: number };

/** Target pixel box for an aspect preset, normalised to the 1400px house width. */
export function dimensionsFor(aspect: AspectPreset): Dimensions {
  const preset = ASPECT_PRESETS[aspect];
  if (aspect === "7:4") return { ...SKETCH_DIMENSIONS };
  const long = 1400;
  if (preset.w >= preset.h) {
    return { width: long, height: Math.round((long * preset.h) / preset.w) };
  }
  return { width: Math.round((long * preset.w) / preset.h), height: long };
}

/** True when the aspect matches the ratio the registry renders bands at. */
export function isHouseAspect(aspect: AspectPreset): boolean {
  return aspect === "7:4";
}

/* --------------------------------------------------------------- validation */

export type ExportFormat = "png" | "webp" | "jpeg";

export type ValidationIssue = { field: string; message: string };

export function wantsAlpha(settings: StudioSettings): boolean {
  return OUTPUT_MODES[settings.output].alpha || settings.intent === "cutout";
}

/** JPEG cannot carry alpha; everything else is fine. */
export function isFormatAllowed(
  format: ExportFormat,
  settings: StudioSettings,
): boolean {
  if (format === "jpeg") return !wantsAlpha(settings);
  return true;
}

export function allowedFormats(settings: StudioSettings): ExportFormat[] {
  return (["png", "webp", "jpeg"] as ExportFormat[]).filter((f) =>
    isFormatAllowed(f, settings),
  );
}

/**
 * Settings-level validation. Returns every problem so the UI can disable the
 * offending control rather than failing at request time.
 */
export function validateSettings(
  settings: StudioSettings,
  ctx: { hasReference: boolean },
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const intent = INTENT_MODES[settings.intent];
  if (!intent) {
    issues.push({ field: "intent", message: "Unknown regeneration intent." });
    return issues;
  }
  if (intent.needsReference && !ctx.hasReference) {
    issues.push({
      field: "intent",
      message: `“${intent.label}” needs the current asset as a reference and none is loaded.`,
    });
  }
  if (settings.candidates < 1 || settings.candidates > 4) {
    issues.push({ field: "candidates", message: "Between 1 and 4 candidates per job." });
  }
  if (!intent.generates && settings.candidates !== 1) {
    issues.push({
      field: "candidates",
      message: "Local-only passes produce exactly one result.",
    });
  }
  if (settings.scale < 40 || settings.scale > 100) {
    issues.push({ field: "scale", message: "Subject scale must be 40–100%." });
  }
  if (settings.padding < 0 || settings.padding > 15) {
    issues.push({ field: "padding", message: "Crop-safe padding must be 0–15%." });
  }
  if (settings.output === "scene" && wantsAlpha({ ...settings, output: "transparent" })) {
    // no-op guard for readability; scene never carries alpha
  }
  if (settings.intent === "cutout" && settings.output === "scene") {
    issues.push({
      field: "output",
      message: "A full-bleed scene has no paper to key out — pick another output mode.",
    });
  }
  if (settings.output === "transparent" && settings.intent === "reframe") {
    issues.push({
      field: "output",
      message: "Reframe reuses the existing pixels; run a transparent cutout instead.",
    });
  }
  if (!isStudioModel(settings.model)) {
    issues.push({ field: "model", message: "Unsupported model." });
  }
  return issues;
}

export function isValid(settings: StudioSettings, ctx: { hasReference: boolean }): boolean {
  return validateSettings(settings, ctx).length === 0;
}

/* ------------------------------------------------------------- prompt build */

/**
 * Deterministic prompt for a studio job.
 *
 * Clause order is fixed: instruction → subject → medium → composition →
 * placement → line → palette → colour dials → grounding → texture → output
 * ground → avoid-list → fidelity → note → seed. Same settings in, same string
 * out, every time.
 */
export function buildStudioPrompt(subject: string, input: StudioSettings): string {
  const settings = clampSettings(input);
  const cleaned = subject.trim().replace(/[.\s]+$/, "");
  const intent = INTENT_MODES[settings.intent];
  const dims = dimensionsFor(settings.aspect);

  const clauses: string[] = [
    SKETCH_STYLE.medium,
    `${settings.aspect} landscape-safe framing at about ${dims.width}x${dims.height}`,
    PLACEMENT_CLAUSES[settings.placement],
    VERTICAL_CLAUSES[settings.vertical],
    `subject occupying about ${settings.scale}% of the frame width`,
    `at least ${settings.padding}% clear padding on every edge so nothing crops`,
    FOCAL_CLAUSES[settings.focal],
    NEGATIVE_SPACE[settings.negativeSpace].clause,
    LINE_OPTIONS[settings.line]?.clause ?? SKETCH_STYLE.line,
    PALETTE_OPTIONS[settings.palette]?.clause ?? SKETCH_STYLE.palette,
    TEMPERATURE[settings.temperature].clause,
    SATURATION[settings.saturation].clause,
    CONTRAST[settings.contrast].clause,
    BACKGROUND_OPTIONS[settings.grounding]?.clause ?? SKETCH_STYLE.grounding,
    SHADING_OPTIONS[settings.shading]?.clause ?? SKETCH_STYLE.texture,
    PAPER_TEXTURE[settings.paperTexture].clause,
    DETAIL_DENSITY[settings.detail].clause,
    OUTPUT_MODES[settings.output].clause,
    SKETCH_STYLE.avoid,
  ].filter((c): c is string => Boolean(c));

  if (intent.needsReference) {
    const fidelity = SUBJECT_FIDELITY[settings.fidelity].clause;
    if (fidelity) clauses.push(fidelity);
  }

  const note = settings.note?.trim();
  if (note) clauses.push(note.replace(/[.\s]+$/, ""));
  if (typeof settings.seed === "number" && Number.isFinite(settings.seed)) {
    clauses.push(`variation seed ${Math.trunc(settings.seed)}`);
  }

  const head = intent.clause ? `${intent.clause}. ${cleaned}` : cleaned;
  return `${head}. ${clauses.join(", ")}.`;
}

/* ----------------------------------------------------------- serialization */

export type StudioSnapshot = {
  version: 1;
  asset: string;
  subject: string;
  settings: StudioSettings;
  prompt: string;
};

export function serializeSettings(
  asset: string,
  subject: string,
  settings: StudioSettings,
): StudioSnapshot {
  return {
    version: 1,
    asset,
    subject,
    settings: clampSettings(settings),
    prompt: buildStudioPrompt(subject, settings),
  };
}

export function settingsToJson(
  asset: string,
  subject: string,
  settings: StudioSettings,
): string {
  return JSON.stringify(serializeSettings(asset, subject, settings), null, 2);
}

/** Tolerant reader: unknown/invalid fields fall back to the house default. */
export function parseSettings(raw: unknown): StudioSettings {
  const source = (
    raw && typeof raw === "object" && "settings" in (raw as object)
      ? (raw as { settings: unknown }).settings
      : raw
  ) as Record<string, unknown> | null;
  if (!source || typeof source !== "object") return { ...DEFAULT_STUDIO_SETTINGS };

  const pick = <T extends string>(key: keyof StudioSettings, table: Record<string, unknown>, fallback: T): T => {
    const value = source[key as string];
    return typeof value === "string" && value in table ? (value as T) : fallback;
  };
  const num = (key: keyof StudioSettings, fallback: number): number => {
    const value = source[key as string];
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  };

  const d = DEFAULT_STUDIO_SETTINGS;
  const settings: StudioSettings = {
    intent: pick("intent", INTENT_MODES, d.intent),
    output: pick("output", OUTPUT_MODES, d.output),
    aspect: pick("aspect", ASPECT_PRESETS, d.aspect),
    scale: num("scale", d.scale),
    placement: pick("placement", PLACEMENT_CLAUSES, d.placement),
    vertical: pick("vertical", VERTICAL_CLAUSES, d.vertical),
    padding: num("padding", d.padding),
    focal: pick("focal", FOCAL_CLAUSES, d.focal),
    grounding: pick("grounding", BACKGROUND_OPTIONS, d.grounding),
    negativeSpace: pick("negativeSpace", NEGATIVE_SPACE, d.negativeSpace),
    palette: pick("palette", PALETTE_OPTIONS, d.palette),
    line: pick("line", LINE_OPTIONS, d.line),
    shading: pick("shading", SHADING_OPTIONS, d.shading),
    temperature: pick("temperature", TEMPERATURE, d.temperature),
    saturation: pick("saturation", SATURATION, d.saturation),
    contrast: pick("contrast", CONTRAST, d.contrast),
    paperTexture: pick("paperTexture", PAPER_TEXTURE, d.paperTexture),
    detail: pick("detail", DETAIL_DENSITY, d.detail),
    fidelity: pick("fidelity", SUBJECT_FIDELITY, d.fidelity),
    model: isStudioModel(source["model"]) ? source["model"] : d.model,
    candidates: num("candidates", d.candidates),
  };
  const seed = source["seed"];
  if (typeof seed === "number" && Number.isFinite(seed)) settings.seed = Math.trunc(seed);
  const note = source["note"];
  if (typeof note === "string" && note.trim()) settings.note = note;
  return clampSettings(settings);
}

/** Short stable hash of the settings, used in candidate filenames. */
export function settingsFingerprint(
  subject: string,
  settings: StudioSettings,
): string {
  const input = buildStudioPrompt(subject, settings);
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < input.length; i += 1) {
    const c = input.charCodeAt(i);
    h1 = (h1 ^ c) * 0x01000193;
    h2 = (h2 + c * (i + 1)) >>> 0;
  }
  const hex = ((h1 >>> 0).toString(16) + (h2 >>> 0).toString(16)).padStart(12, "0");
  return hex.slice(0, 8);
}

/**
 * Deterministic download filename.
 * e.g. `confit--refine-7x4-transparent-1a2b3c4d-c2.png`
 */
export function candidateFilename(
  asset: string,
  subject: string,
  settings: StudioSettings,
  format: ExportFormat,
  candidateIndex: number,
  width?: number,
): string {
  const safeAsset = asset.replace(/[^a-z0-9-]/gi, "-").toLowerCase() || "sketch";
  const parts = [
    safeAsset,
    "-",
    settings.intent,
    "-",
    settings.aspect.replace(":", "x"),
    "-",
    settings.output,
    "-",
    settingsFingerprint(subject, settings),
    `-c${Math.max(1, Math.round(candidateIndex))}`,
  ];
  const suffix = width ? `-${width}w` : "";
  const ext = format === "jpeg" ? "jpg" : format;
  return `${parts.join("")}${suffix}.${ext}`;
}
