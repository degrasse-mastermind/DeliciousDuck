import { type ReactNode } from "react";
import {
  ASPECT_PRESETS,
  CONTRAST,
  DETAIL_DENSITY,
  INTENT_MODES,
  NEGATIVE_SPACE,
  OUTPUT_MODES,
  PAPER_TEXTURE,
  SATURATION,
  STUDIO_MODELS,
  SUBJECT_FIDELITY,
  TEMPERATURE,
  type StudioSettings,
} from "@/lib/sketch-studio";
import {
  BACKGROUND_OPTIONS,
  LINE_OPTIONS,
  PALETTE_OPTIONS,
  SHADING_OPTIONS,
} from "@/lib/sketch-regen";

export const fieldClass =
  "h-9 w-full rounded-sm border border-input bg-card px-2 text-sm text-foreground disabled:opacity-50";

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <div className="block">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Select<K extends string>({
  id,
  label,
  hint,
  options,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  hint?: string;
  options: Record<string, { label: string }>;
  value: K;
  onChange: (next: K) => void;
  disabled?: boolean;
}) {
  return (
    <Field label={label} htmlFor={id} {...(hint ? { hint } : {})}>
      <select
        id={id}
        className={fieldClass}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as K)}
      >
        {Object.entries(options).map(([key, option]) => (
          <option key={key} value={key}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <Field label={`${label} — ${value}${suffix ?? ""}`} htmlFor={id}>
      <input
        id={id}
        type="range"
        className="w-full accent-primary"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={`${value}${suffix ?? ""}`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}

const PLACEMENTS = {
  left: { label: "Left third" },
  center: { label: "Centered" },
  right: { label: "Right third" },
};
const VERTICALS = {
  top: { label: "High" },
  middle: { label: "Middle" },
  bottom: { label: "Low" },
};
const FOCALS = {
  left: { label: "Faces left" },
  center: { label: "Faces viewer" },
  right: { label: "Faces right" },
};

const asOptions = <T extends Record<string, { label: string }>>(table: T) => table;

/**
 * The full art-direction form. The basic row stays visible; everything else
 * lives behind collapsed <details> so the quick path stays one click.
 */
export function StudioControls({
  idPrefix,
  settings,
  onChange,
  disabled,
  issues,
}: {
  idPrefix: string;
  settings: StudioSettings;
  onChange: <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => void;
  disabled: boolean;
  issues: { field: string; message: string }[];
}) {
  const id = (name: string) => `${idPrefix}-${name}`;
  const issueFor = (field: string) => issues.find((i) => i.field === field)?.message;
  const local = !INTENT_MODES[settings.intent].generates;

  return (
    <div className="mt-3 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          id={id("intent")}
          label="Intent"
          hint={INTENT_MODES[settings.intent].hint}
          options={asOptions(INTENT_MODES)}
          value={settings.intent}
          onChange={(v) => onChange("intent", v)}
          disabled={disabled}
        />
        <Select
          id={id("output")}
          label="Output / background"
          hint={OUTPUT_MODES[settings.output].hint}
          options={asOptions(OUTPUT_MODES)}
          value={settings.output}
          onChange={(v) => onChange("output", v)}
          disabled={disabled}
        />
        <Select
          id={id("aspect")}
          label="Aspect"
          options={asOptions(ASPECT_PRESETS)}
          value={settings.aspect}
          onChange={(v) => onChange("aspect", v)}
          disabled={disabled}
        />
        <Slider
          id={id("candidates")}
          label="Candidates"
          value={local ? 1 : settings.candidates}
          min={1}
          max={4}
          onChange={(v) => onChange("candidates", v)}
          disabled={disabled || local}
        />
      </div>

      {issueFor("intent") ? (
        <p role="alert" className="text-xs text-destructive">
          {issueFor("intent")}
        </p>
      ) : null}
      {issueFor("output") ? (
        <p role="alert" className="text-xs text-destructive">
          {issueFor("output")}
        </p>
      ) : null}

      <details className="rounded-md border border-border bg-background/50 p-3">
        <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Composition
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Slider
            id={id("scale")}
            label="Subject scale"
            value={settings.scale}
            min={40}
            max={100}
            suffix="%"
            onChange={(v) => onChange("scale", v)}
            disabled={disabled}
          />
          <Slider
            id={id("padding")}
            label="Crop-safe padding"
            value={settings.padding}
            min={0}
            max={15}
            suffix="%"
            onChange={(v) => onChange("padding", v)}
            disabled={disabled}
          />
          <Select
            id={id("placement")}
            label="Horizontal placement"
            options={PLACEMENTS}
            value={settings.placement}
            onChange={(v) => onChange("placement", v)}
            disabled={disabled}
          />
          <Select
            id={id("vertical")}
            label="Vertical placement"
            options={VERTICALS}
            value={settings.vertical}
            onChange={(v) => onChange("vertical", v)}
            disabled={disabled}
          />
          <Select
            id={id("focal")}
            label="Focal direction"
            options={FOCALS}
            value={settings.focal}
            onChange={(v) => onChange("focal", v)}
            disabled={disabled}
          />
          <Select
            id={id("negative")}
            label="Negative space"
            options={asOptions(NEGATIVE_SPACE)}
            value={settings.negativeSpace}
            onChange={(v) => onChange("negativeSpace", v)}
            disabled={disabled}
          />
          <Select
            id={id("grounding")}
            label="Grounding style"
            options={asOptions(BACKGROUND_OPTIONS)}
            value={settings.grounding}
            onChange={(v) => onChange("grounding", v)}
            disabled={disabled}
          />
        </div>
      </details>

      <details className="rounded-md border border-border bg-background/50 p-3">
        <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Art direction
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select
            id={id("palette")}
            label="Palette"
            options={asOptions(PALETTE_OPTIONS)}
            value={settings.palette}
            onChange={(v) => onChange("palette", v)}
            disabled={disabled}
          />
          <Select
            id={id("line")}
            label="Line"
            options={asOptions(LINE_OPTIONS)}
            value={settings.line}
            onChange={(v) => onChange("line", v)}
            disabled={disabled}
          />
          <Select
            id={id("shading")}
            label="Shading"
            options={asOptions(SHADING_OPTIONS)}
            value={settings.shading}
            onChange={(v) => onChange("shading", v)}
            disabled={disabled}
          />
          <Select
            id={id("temperature")}
            label="Colour temperature"
            options={asOptions(TEMPERATURE)}
            value={settings.temperature}
            onChange={(v) => onChange("temperature", v)}
            disabled={disabled}
          />
          <Select
            id={id("saturation")}
            label="Saturation"
            options={asOptions(SATURATION)}
            value={settings.saturation}
            onChange={(v) => onChange("saturation", v)}
            disabled={disabled}
          />
          <Select
            id={id("contrast")}
            label="Contrast"
            options={asOptions(CONTRAST)}
            value={settings.contrast}
            onChange={(v) => onChange("contrast", v)}
            disabled={disabled}
          />
          <Select
            id={id("paper")}
            label="Paper texture"
            options={asOptions(PAPER_TEXTURE)}
            value={settings.paperTexture}
            onChange={(v) => onChange("paperTexture", v)}
            disabled={disabled}
          />
          <Select
            id={id("detail")}
            label="Detail density"
            options={asOptions(DETAIL_DENSITY)}
            value={settings.detail}
            onChange={(v) => onChange("detail", v)}
            disabled={disabled}
          />
          <Select
            id={id("fidelity")}
            label="Subject fidelity"
            hint="Applies when the current asset is sent as a reference."
            options={asOptions(SUBJECT_FIDELITY)}
            value={settings.fidelity}
            onChange={(v) => onChange("fidelity", v)}
            disabled={disabled}
          />
          <Select
            id={id("model")}
            label="Model"
            options={asOptions(STUDIO_MODELS)}
            value={settings.model}
            onChange={(v) => onChange("model", v)}
            disabled={disabled || local}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Extra art direction (optional)" htmlFor={id("note")}>
            <input
              id={id("note")}
              type="text"
              className={fieldClass}
              value={settings.note ?? ""}
              disabled={disabled}
              placeholder="e.g. crisper skin, fewer props"
              onChange={(e) => onChange("note", e.target.value)}
            />
          </Field>
          <Field label="Seed (optional)" htmlFor={id("seed")} hint="Blank = a new seed per run.">
            <input
              id={id("seed")}
              type="number"
              className={fieldClass}
              value={settings.seed ?? ""}
              disabled={disabled}
              onChange={(e) =>
                onChange(
                  "seed",
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
            />
          </Field>
        </div>
      </details>
    </div>
  );
}
