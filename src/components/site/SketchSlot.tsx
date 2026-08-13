import type { ReactNode } from "react";
import type { SketchArt } from "@/lib/sketch-art";
import {
  resolveSketchVariant,
  type SketchContext,
  type SketchVariantSpec,
} from "@/lib/sketch-variants";
import { SketchAside, SketchBackdrop, SketchBand, SketchFigure } from "./SketchFigure";

/**
 * One entry point for placing an illustration: name the layout context and the
 * right primitive, framing, crop and intensity are chosen for you. Every
 * context renders the same artwork in the same house style — only the framing
 * adapts. Override any single prop when a page genuinely needs it.
 */
export function SketchSlot({
  art,
  context = "articleBreak",
  caption,
  children,
  className = "",
  ...overrides
}: {
  art: SketchArt;
  context?: SketchContext;
  caption?: string;
  /** Content laid over the art (backdrop contexts only). */
  children?: ReactNode;
  className?: string;
} & Partial<SketchVariantSpec>) {
  const spec = resolveSketchVariant(context, overrides);

  if (spec.role === "figure") {
    return (
      <SketchFigure
        art={art}
        height={spec.height}
        focus={spec.focus}
        sizes={spec.sizes}
        eager={spec.eager}
        className={className}
      />
    );
  }

  if (spec.role === "aside") {
    return (
      <SketchAside
        art={art}
        side={spec.position === "left" ? "left" : "right"}
        className={className}
        {...(caption ? { caption } : {})}
      />
    );
  }

  if (spec.role === "backdrop") {
    return (
      <SketchBackdrop
        art={art}
        intensity={spec.intensity}
        position={spec.position}
        rounded={spec.rounded}
        className={className}
      >
        {children ?? <div className="h-40" />}
      </SketchBackdrop>
    );
  }

  return (
    <SketchBand
      art={art}
      variant={spec.frame}
      height={spec.height}
      focus={spec.focus}
      eager={spec.eager}
      className={className}
      {...(caption ? { caption } : {})}
    />
  );
}
