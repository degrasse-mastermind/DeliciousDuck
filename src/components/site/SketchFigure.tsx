import type { ReactNode } from "react";
import { SKETCH, sketchForPath, type SketchArt } from "@/lib/sketch-art";
import { SKETCH_DIMENSIONS, SKETCH_RENDER } from "@/lib/sketch-style";
import { SKETCH_SIZES, sketchSrcSet } from "@/lib/sketch-sources";

/** How tall a band crops its illustration. */
export type SketchHeight = "short" | "medium" | "tall" | "auto";

const HEIGHT_CLASS: Record<Exclude<SketchHeight, "auto">, string> = {
  short: "h-40 lg:h-48",
  medium: "h-56 lg:h-72",
  tall: "h-72 lg:h-[26rem]",
};

/** Where the crop keeps its focus when the band is shorter than the drawing. */
export type SketchFocus = "top" | "center" | "bottom";

const FOCUS_CLASS: Record<SketchFocus, string> = {
  top: "object-top",
  center: "object-center",
  bottom: "object-bottom",
};

/**
 * Decorative colored-pencil illustration. Blend mode lets the drawing's paper
 * background disappear into whatever surface it sits on.
 */
export function SketchFigure({
  art,
  className = "",
  eager = false,
  height = "auto",
  focus = "center",
  sizes = SKETCH_SIZES.band,
}: {
  art: SketchArt;
  className?: string;
  eager?: boolean;
  height?: SketchHeight;
  focus?: SketchFocus;
  /** Layout width hint so the browser picks the smallest crisp variant. */
  sizes?: string;
}) {
  const sizing =
    height === "auto"
      ? "h-auto w-full"
      : `w-full object-cover ${HEIGHT_CLASS[height]} ${FOCUS_CLASS[focus]}`;

  const srcSet = sketchSrcSet(art.src);

  return (
    <img
      src={art.src}
      {...(srcSet ? { srcSet, sizes } : {})}
      alt={art.alt}
      width={SKETCH_DIMENSIONS.width}
      height={SKETCH_DIMENSIONS.height}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "low"}
      decoding="async"
      className={`${SKETCH_RENDER.blend} ${sizing} ${className}`}
    />
  );
}

/**
 * Full-width illustration band for breaking up long, text-heavy pages.
 * `variant="bleed"` drops the frame so the drawing melts into the page.
 */
export function SketchBand({
  art,
  caption,
  className = "",
  height = "auto",
  focus = "center",
  variant = "framed",
}: {
  art: SketchArt;
  caption?: string;
  className?: string;
  height?: SketchHeight;
  focus?: SketchFocus;
  variant?: "framed" | "bleed";
}) {
  const frame =
    variant === "framed"
      ? `overflow-hidden rounded-2xl border border-border ${SKETCH_RENDER.surface}`
      : `overflow-hidden ${SKETCH_RENDER.surface}`;

  return (
    <figure className={`${frame} ${className}`}>
      <SketchFigure art={art} height={height} focus={focus} />
      {caption ? (
        <figcaption
          className={`px-5 py-3 text-sm text-muted-foreground ${
            variant === "framed" ? "border-t border-border" : ""
          }`}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * Editorial background band: the sketch sits behind the content at low
 * opacity so a wide, otherwise-empty stretch of page reads as designed.
 * Use for CTA strips, section breaks and pull-quotes.
 */
export function SketchBackdrop({
  art,
  children,
  className = "",
  intensity = "soft",
  position = "right",
  rounded = true,
}: {
  art: SketchArt;
  children: ReactNode;
  className?: string;
  /** How present the drawing is behind the text. */
  intensity?: "whisper" | "soft" | "bold";
  /** Where the drawing anchors within the band. */
  position?: "left" | "right" | "center" | "cover";
  rounded?: boolean;
}) {
  const opacity = SKETCH_RENDER.intensity[intensity];

  const layer =
    position === "cover"
      ? "inset-0 w-full object-cover"
      : position === "center"
        ? "inset-0 mx-auto h-full w-auto max-w-none object-contain"
        : position === "left"
          ? "inset-y-0 left-0 h-full w-auto max-w-[70%] object-contain object-left"
          : "inset-y-0 right-0 h-full w-auto max-w-[70%] object-contain object-right";

  return (
    <section
      className={`relative isolate overflow-hidden border border-border ${SKETCH_RENDER.surface} ${
        rounded ? "rounded-2xl" : ""
      } ${className}`}
    >
      <img
        src={art.src}
        {...(backdropSrcSet
          ? { srcSet: backdropSrcSet, sizes: SKETCH_SIZES.band }
          : {})}
        alt=""
        aria-hidden="true"
        loading="lazy"
        fetchPriority="low"
        decoding="async"
        className={`pointer-events-none absolute ${SKETCH_RENDER.blend} ${opacity} ${layer}`}
      />
      <div className="relative">{children}</div>
    </section>
  );
}

/**
 * Ready-made section break: a headline and blurb sitting on a sketch
 * backdrop. Drop it between long content blocks to fill dead space.
 */
export function SketchInterlude({
  art,
  eyebrow,
  title,
  children,
  className = "",
  intensity = "soft",
  position = "right",
}: {
  art: SketchArt;
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  className?: string;
  intensity?: "whisper" | "soft" | "bold";
  position?: "left" | "right" | "center" | "cover";
}) {
  return (
    <SketchBackdrop art={art} intensity={intensity} position={position} className={className}>
      <div className="max-w-2xl px-6 py-12 lg:px-10 lg:py-16">
        {eyebrow ? <span className="eyebrow block text-primary">{eyebrow}</span> : null}
        <h2 className="mt-3 font-display text-2xl leading-tight text-foreground lg:text-4xl">
          {title}
        </h2>
        {children ? (
          <div className="mt-4 text-base leading-relaxed text-muted-foreground">{children}</div>
        ) : null}
      </div>
    </SketchBackdrop>
  );
}

/**
 * Narrow inline illustration for margins and short sections — floats beside
 * body copy on desktop, stacks above it on mobile.
 */
export function SketchAside({
  art,
  caption,
  side = "right",
  className = "",
}: {
  art: SketchArt;
  caption?: string;
  side?: "left" | "right";
  className?: string;
}) {
  const float = side === "left" ? "lg:float-left lg:mr-8" : "lg:float-right lg:ml-8";
  return (
    <figure className={`my-6 w-full lg:w-[42%] ${float} ${className}`}>
      <SketchFigure art={art} />
      {caption ? (
        <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/** Pick a sketch by registry key, with a route-aware fallback. */
export function useSketch(key?: keyof typeof SKETCH, pathname?: string): SketchArt | null {
  if (key && SKETCH[key]) return SKETCH[key];
  return pathname ? sketchForPath(pathname) : null;
}
