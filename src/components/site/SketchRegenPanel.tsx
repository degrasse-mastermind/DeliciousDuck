import { useState } from "react";
import type { SketchArt } from "@/lib/sketch-art";
import {
  BACKGROUND_OPTIONS,
  DEFAULT_REGEN_OPTIONS,
  LINE_OPTIONS,
  PALETTE_OPTIONS,
  SHADING_OPTIONS,
  buildSketchPrompt,
  isHouseStyle,
  type SketchRegenOptions,
} from "@/lib/sketch-regen";
import { streamImage } from "@/lib/streamImage";
import { sketchNameFromSrc } from "@/lib/sketch-sources";
import { replaceSketchAsset } from "@/lib/sketch-replace";

type Status = "idle" | "working" | "done" | "error";

const selectClass =
  "h-9 w-full rounded-sm border border-input bg-card px-2 text-sm text-foreground";

function OptionSelect<K extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: Record<K, { label: string; clause: string }>;
  value: K;
  onChange: (next: K) => void;
  disabled: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <select
        className={`mt-1 ${selectClass}`}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as K)}
      >
        {(Object.keys(options) as K[]).map((key) => (
          <option key={key} value={key}>
            {options[key].label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Per-sketch regeneration controls: adjust palette, line, background grounding
 * and shading intensity for one drawing, then "apply and preview" to render it
 * live. The preview is session-only — download the result and drop it into
 * src/assets/sketch/ to make it permanent.
 */
export function SketchRegenPanel({
  art,
  onPreview,
  onRevert,
  hasPreview,
}: {
  art: SketchArt;
  onPreview: (dataUrl: string, isFinal: boolean) => void;
  onRevert: () => void;
  hasPreview: boolean;
}) {
  const [options, setOptions] = useState<SketchRegenOptions>(DEFAULT_REGEN_OPTIONS);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const subject = art.alt.replace(/^Colored-pencil sketch of\s*/i, "");
  const prompt = buildSketchPrompt(subject, options);
  const busy = status === "working";
  const assetName = sketchNameFromSrc(art.src);

  const set = <K extends keyof SketchRegenOptions>(key: K, value: SketchRegenOptions[K]) =>
    setOptions((prev) => ({ ...prev, [key]: value }));

  async function applyAndPreview() {
    setStatus("working");
    setError(null);
    setFinalUrl(null);
    setSaveState("idle");
    try {
      await streamImage("/api/generate-sketch", prompt, (url, isFinal) => {
        if (isFinal) setFinalUrl(url);
        onPreview(url, isFinal);
      });
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setStatus("error");
    }
  }

  /** Overwrite the JPEG + WebP variants on disk with this render. */
  async function replaceOriginal() {
    if (!finalUrl || !assetName) return;
    setSaveState("saving");
    setError(null);
    try {
      await replaceSketchAsset(assetName, finalUrl);
      setSaveState("saved");
      onRevert(); // drop the session preview; the real asset now shows the new art
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the image");
      setSaveState("idle");
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-semibold uppercase tracking-wide text-primary"
        >
          {open ? "Hide controls" : "Regenerate"}
        </button>
        {!isHouseStyle(options) ? (
          <span className="text-[11px] text-muted-foreground">style adjusted</span>
        ) : null}
        {hasPreview ? (
          <button
            type="button"
            onClick={onRevert}
            className="ml-auto text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Revert
          </button>
        ) : null}
      </div>

      {open ? (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <OptionSelect
              label="Palette"
              options={PALETTE_OPTIONS}
              value={options.palette}
              onChange={(v) => set("palette", v)}
              disabled={busy}
            />
            <OptionSelect
              label="Line"
              options={LINE_OPTIONS}
              value={options.line}
              onChange={(v) => set("line", v)}
              disabled={busy}
            />
            <OptionSelect
              label="Background"
              options={BACKGROUND_OPTIONS}
              value={options.background}
              onChange={(v) => set("background", v)}
              disabled={busy}
            />
            <OptionSelect
              label="Shading intensity"
              options={SHADING_OPTIONS}
              value={options.shading}
              onChange={(v) => set("shading", v)}
              disabled={busy}
            />
          </div>

          <label className="mt-3 block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Extra art direction (optional)
            </span>
            <input
              type="text"
              value={options.note ?? ""}
              disabled={busy}
              placeholder="e.g. show the skin more crisp"
              onChange={(e) => set("note", e.target.value)}
              className={`mt-1 ${selectClass}`}
            />
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={applyAndPreview}
              disabled={busy}
              className="rounded-sm bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Generating…" : "Apply and preview"}
            </button>
            <button
              type="button"
              onClick={() => setOptions(DEFAULT_REGEN_OPTIONS)}
              disabled={busy}
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Reset to house style
            </button>
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(prompt)}
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Copy prompt
            </button>
            {finalUrl && assetName ? (
              <button
                type="button"
                onClick={replaceOriginal}
                disabled={saveState === "saving"}
                className="rounded-sm border border-primary px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary disabled:opacity-60"
              >
                {saveState === "saving"
                  ? "Replacing…"
                  : `Replace ${assetName}.jpg`}
              </button>
            ) : null}
          </div>

          {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
          {saveState === "saved" ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Saved — {assetName}.jpg plus its 700w/1400w WebP variants were overwritten.
            </p>
          ) : status === "done" ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Session preview. Hit “Replace {assetName}.jpg” to overwrite the real asset
              (JPEG + WebP variants) so the change sticks site-wide.
            </p>
          ) : null}

          <details className="mt-3">
            <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Prompt
            </summary>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{prompt}</p>
          </details>
        </>
      ) : null}
    </div>
  );
}
