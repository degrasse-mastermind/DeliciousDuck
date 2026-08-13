import { useMemo, useState } from "react";
import {
  RISK_CONTEXTS,
  SURFACES,
  evaluateRisks,
  worstLevel,
  type Risk,
  type Surface,
} from "@/lib/sketch-risks";
import { SKETCH_CONTEXTS, type SketchContext } from "@/lib/sketch-variants";
import type { AlphaReport } from "@/lib/sketch-alpha";
import type { AspectPreset, OutputMode } from "@/lib/sketch-studio";
import { CHECKER_STYLE } from "./CandidateBoard";

const LEVEL_CLASS: Record<Risk["level"], string> = {
  info: "text-muted-foreground",
  warn: "text-accent-foreground",
  block: "text-destructive",
};

const INTENSITY_OPACITY = { whisper: 0.14, soft: 0.3, bold: 0.6 } as const;

function ContextPreview({
  context,
  surface,
  src,
  width,
  risks,
}: {
  context: SketchContext;
  surface: (typeof SURFACES)[number];
  src: string;
  width: number;
  risks: Risk[];
}) {
  const spec = SKETCH_CONTEXTS[context];
  const backdrop = spec.role === "backdrop";
  const level = worstLevel(risks);

  return (
    <div className="rounded-md border border-border bg-card p-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {context}
        </p>
        {level ? (
          <span className={`text-[10px] font-semibold uppercase ${LEVEL_CLASS[level]}`}>
            {level}
          </span>
        ) : (
          <span className="text-[10px] uppercase text-muted-foreground">clear</span>
        )}
      </div>

      <div
        className={`relative mt-2 overflow-hidden ${surface.className} ${
          spec.rounded ? "rounded-md" : ""
        }`}
        style={{ maxWidth: width, height: spec.height === "short" ? 96 : 132 }}
      >
        <img
          src={src}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full ${
            spec.position === "cover" ? "object-cover" : "object-contain"
          }`}
          style={
            backdrop
              ? {
                  opacity: INTENSITY_OPACITY[spec.intensity],
                  objectPosition: spec.position === "cover" ? "center" : `${spec.position} center`,
                }
              : {}
          }
        />
        {backdrop ? (
          <p
            className={`relative z-10 p-3 font-display text-sm ${
              surface.dark ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            Duck fat is the point. Render it low and slow.
          </p>
        ) : null}
      </div>

      {risks.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {risks.map((risk) => (
            <li key={risk.code} className={`text-[11px] ${LEVEL_CLASS[risk.level]}`}>
              {risk.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Places the selected candidate in every named layout context, on white, cream
 * and forest-green, at desktop and mobile widths, and reports what the risk
 * rules flag for each combination.
 */
export function PlacementPreviews({
  src,
  output,
  aspect,
  alpha,
  dimensions,
}: {
  src: string;
  output: OutputMode;
  aspect: AspectPreset;
  alpha?: AlphaReport | undefined;
  dimensions?: { width: number; height: number } | undefined;
}) {
  const [surface, setSurface] = useState<Surface>("white");
  const [width, setWidth] = useState<number>(640);
  const active = SURFACES.find((s) => s.value === surface)!;

  const risksByContext = useMemo(
    () =>
      RISK_CONTEXTS.map((context) => ({
        context,
        risks: evaluateRisks({ context, surface, output, aspect, alpha, dimensions }),
      })),
    [surface, output, aspect, alpha, dimensions],
  );

  const blocking = risksByContext.filter((r) => worstLevel(r.risks) === "block").length;

  return (
    <section className="mt-4 rounded-md border border-border bg-background/50 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Placement previews
        </p>
        <div className="flex gap-1">
          {SURFACES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSurface(option.value)}
              aria-pressed={surface === option.value}
              className={`rounded-sm border px-2 py-1 text-xs ${
                surface === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {[
            { value: 390, label: "Mobile 390" },
            { value: 640, label: "Desktop 640" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setWidth(option.value)}
              aria-pressed={width === option.value}
              className={`rounded-sm border px-2 py-1 text-xs ${
                width === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground">
          {blocking > 0
            ? `${blocking} context${blocking === 1 ? "" : "s"} blocked on this surface`
            : "No blocking issues on this surface"}
        </span>
      </div>

      {alpha?.transparent ? (
        <div
          className="mt-3 h-16 rounded-sm"
          style={CHECKER_STYLE}
          aria-label="Transparency check background"
        >
          <img src={src} alt="" aria-hidden className="h-full w-full object-contain" />
        </div>
      ) : null}

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {risksByContext.map(({ context, risks }) => (
          <ContextPreview
            key={context}
            context={context}
            surface={active}
            src={src}
            width={width}
            risks={risks}
          />
        ))}
      </div>
    </section>
  );
}
