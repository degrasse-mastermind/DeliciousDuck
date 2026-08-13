import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  SKETCH,
  sketchForPath,
  sketchRotationForPath,
  type SketchArt,
  type SketchKey,
} from "@/lib/sketch-art";
import {
  SKETCH_DIMENSIONS,
  SKETCH_PALETTE,
  SKETCH_STYLE_SUFFIX,
} from "@/lib/sketch-style";
import { SKETCH_SIZES } from "@/lib/sketch-sources";
import {
  SketchBackdrop,
  SketchBand,
  SketchFigure,
  type SketchFocus,
  type SketchHeight,
} from "@/components/site/SketchFigure";

/**
 * Internal illustration gallery — owner review tool, not site content.
 *
 * noindex/nofollow, disallowed under /internal/ in robots.txt, excluded from
 * the sitemap and site search, and not linked from public navigation.
 */
export const Route = createFileRoute("/internal/illustrations")({
  head: () => ({
    meta: [
      { title: "Illustration Gallery (internal) | DeliciousDuck" },
      {
        name: "description",
        content:
          "Internal review gallery for every DeliciousDuck colored-pencil illustration. Not public content.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: IllustrationGallery,
});

type Variant = "plain" | "framed" | "bleed" | "backdrop";
type Intensity = "whisper" | "soft" | "bold";

const VARIANTS: { value: Variant; label: string; hint: string }[] = [
  { value: "plain", label: "Plain figure", hint: "Raw drawing, no container" },
  { value: "framed", label: "Framed band", hint: "Bordered card band" },
  { value: "bleed", label: "Bleed band", hint: "Edge-to-edge band" },
  { value: "backdrop", label: "Backdrop", hint: "Behind text at low opacity" },
];

const HEIGHTS: SketchHeight[] = ["auto", "short", "medium", "tall"];
const FOCUSES: SketchFocus[] = ["top", "center", "bottom"];
const INTENSITIES: Intensity[] = ["whisper", "soft", "bold"];

const KEYS = Object.keys(SKETCH) as SketchKey[];

function Control({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const selectClass =
  "h-10 w-full rounded-sm border border-input bg-card px-3 text-sm text-foreground";

function Preview({
  art,
  variant,
  height,
  focus,
  intensity,
}: {
  art: SketchArt;
  variant: Variant;
  height: SketchHeight;
  focus: SketchFocus;
  intensity: Intensity;
}) {
  if (variant === "backdrop") {
    return (
      <SketchBackdrop art={art} intensity={intensity} position="right">
        <div className="px-6 py-10">
          <p className="eyebrow text-primary">Backdrop check</p>
          <h3 className="mt-2 font-display text-xl text-foreground">
            Does body copy still read cleanly?
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Two lines of sample text at the same measure used on guide pages, so
            contrast problems show up here rather than in production.
          </p>
        </div>
      </SketchBackdrop>
    );
  }

  if (variant === "plain") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-cream">
        <SketchFigure art={art} height={height} focus={focus} sizes={SKETCH_SIZES.half} />
      </div>
    );
  }

  return <SketchBand art={art} height={height} focus={focus} variant={variant} />;
}

function IllustrationGallery() {
  const [variant, setVariant] = useState<Variant>("framed");
  const [height, setHeight] = useState<SketchHeight>("medium");
  const [focus, setFocus] = useState<SketchFocus>("center");
  const [intensity, setIntensity] = useState<Intensity>("soft");
  const [columns, setColumns] = useState<"1" | "2" | "3">("2");
  const [query, setQuery] = useState("");
  const [path, setPath] = useState("/cook/how-to-cook-duck-breast");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return KEYS;
    return KEYS.filter(
      (key) =>
        key.toLowerCase().includes(q) ||
        SKETCH[key].alt.toLowerCase().includes(q),
    );
  }, [query]);

  const resolved = sketchForPath(path);
  const rotation = sketchRotationForPath(path);

  const gridClass =
    columns === "1"
      ? "grid grid-cols-1 gap-8"
      : columns === "3"
        ? "grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
        : "grid grid-cols-1 gap-8 lg:grid-cols-2";

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
      <p className="eyebrow text-primary">Internal tool</p>
      <h1 className="mt-2 font-display text-3xl text-foreground lg:text-4xl">
        Illustration gallery
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Every sketch in the collection, rendered through the same components the
        site uses. Swap the variant, crop height and focus to see how each
        drawing behaves before you place it on a page.
      </p>

      <section className="mt-10 rounded-2xl border border-border bg-card p-5 lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Control label="Variant">
            <select
              className={selectClass}
              value={variant}
              onChange={(e) => setVariant(e.target.value as Variant)}
            >
              {VARIANTS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </Control>
          <Control label="Height">
            <select
              className={selectClass}
              value={height}
              onChange={(e) => setHeight(e.target.value as SketchHeight)}
              disabled={variant === "backdrop"}
            >
              {HEIGHTS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </Control>
          <Control label="Crop focus">
            <select
              className={selectClass}
              value={focus}
              onChange={(e) => setFocus(e.target.value as SketchFocus)}
              disabled={variant === "backdrop" || height === "auto"}
            >
              {FOCUSES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Control>
          <Control label="Backdrop intensity">
            <select
              className={selectClass}
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as Intensity)}
              disabled={variant !== "backdrop"}
            >
              {INTENSITIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </Control>
          <Control label="Columns">
            <select
              className={selectClass}
              value={columns}
              onChange={(e) => setColumns(e.target.value as "1" | "2" | "3")}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </Control>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Control label="Filter by name or description">
            <input
              type="search"
              value={query}
              placeholder="confit, thermometer, fat…"
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-sm border border-input bg-card px-3 text-sm text-foreground"
            />
          </Control>
          <Control label="Resolve a route path">
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="h-10 w-full rounded-sm border border-input bg-card px-3 text-sm text-foreground"
            />
          </Control>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{path}</span> resolves
          to{" "}
          <span className="font-semibold text-foreground">
            {resolved ? resolved.alt : "no illustration (opted out)"}
          </span>
          {rotation.length > 0 && (
            <>
              {" "}
              · rotation of {rotation.length} for auto-placed bands
            </>
          )}
        </p>

        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Style contract for new art ({SKETCH_DIMENSIONS.width}×
          {SKETCH_DIMENSIONS.height}, palette{" "}
          {Object.values(SKETCH_PALETTE).join(" ")}): {SKETCH_STYLE_SUFFIX}.
        </p>
      </section>

      <p className="mt-10 text-sm text-muted-foreground">
        Showing {filtered.length} of {KEYS.length} illustrations.
      </p>

      <div className={`mt-4 ${gridClass}`}>
        {filtered.map((key) => (
          <figure key={key} className="min-w-0">
            <Preview
              art={SKETCH[key]}
              variant={variant}
              height={height}
              focus={focus}
              intensity={intensity}
            />
            <figcaption className="mt-3">
              <code className="text-sm font-semibold text-foreground">
                SKETCH.{key}
              </code>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {SKETCH[key].alt}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No illustration matches that filter.
        </p>
      )}
    </div>
  );
}
