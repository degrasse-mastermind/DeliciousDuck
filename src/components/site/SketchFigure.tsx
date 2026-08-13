import type { SketchArt } from "@/lib/sketch-art";

/**
 * Decorative colored-pencil illustration. Blend mode lets the drawing's paper
 * background disappear into whatever surface it sits on.
 */
export function SketchFigure({
  art,
  className = "",
  eager = false,
}: {
  art: SketchArt;
  className?: string;
  eager?: boolean;
}) {
  return (
    <img
      src={art.src}
      alt={art.alt}
      width={1400}
      height={800}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`h-auto w-full select-none mix-blend-multiply ${className}`}
    />
  );
}

/** Full-width illustration band for breaking up long, text-heavy pages. */
export function SketchBand({
  art,
  caption,
  className = "",
}: {
  art: SketchArt;
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={`overflow-hidden rounded-2xl border border-border bg-cream ${className}`}>
      <SketchFigure art={art} />
      {caption ? (
        <figcaption className="border-t border-border px-5 py-3 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
