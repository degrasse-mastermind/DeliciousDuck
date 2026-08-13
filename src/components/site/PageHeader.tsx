import { preload } from "react-dom";
import { useRouterState } from "@tanstack/react-router";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { SKETCH_SIZES } from "@/lib/sketch-sources";
import { SketchFigure } from "./SketchFigure";
import { sketchForPath, type SketchArt } from "@/lib/sketch-art";
import { sketchPreloadHref, sketchSrcSet } from "@/lib/sketch-sources";

/** Header art is ~38% of the content column on desktop, full width on mobile. */
const HEADER_SIZES = SKETCH_SIZES.header;

export function PageHeader({
  eyebrow,
  title,
  intro,
  trail,
  art,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  trail: Crumb[];
  /** Override the automatic illustration, or pass null to omit it. */
  art?: SketchArt | null;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const illustration = art === undefined ? sketchForPath(pathname) : art;

  // The header illustration is the above-the-fold LCP candidate: ask the
  // browser for it during head parsing instead of after hydration.
  if (illustration) {
    const srcSet = sketchSrcSet(illustration.src);
    preload(sketchPreloadHref(illustration.src), {
      as: "image",
      fetchPriority: "high",
      ...(srcSet ? { imageSrcSet: srcSet, imageSizes: HEADER_SIZES } : {}),
    });
  }

  return (
    <header className="border-b border-border bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
        <Breadcrumbs trail={trail} />
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,38%)] lg:gap-14">
          <div>
            <span className="eyebrow mt-8 block text-primary">{eyebrow}</span>
            <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] text-foreground lg:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg">
              {intro}
            </p>
          </div>

          {illustration ? (
            <div aria-hidden={false} className="order-first lg:order-none">
              <SketchFigure art={illustration} eager sizes={HEADER_SIZES} />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
