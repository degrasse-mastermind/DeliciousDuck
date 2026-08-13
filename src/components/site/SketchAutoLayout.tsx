import { Children, isValidElement, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { type SketchHeight } from "./SketchFigure";
import { SketchSlot } from "./SketchSlot";
import { alternateFrame, steppedIntensity } from "@/lib/sketch-variants";
import { sketchRotationForPath, type SketchArt } from "@/lib/sketch-art";

/** How much room the content column has — drives crop height and framing. */
export type SketchColumn = "narrow" | "wide" | "full";

const HEIGHT_BY_COLUMN: Record<SketchColumn, SketchHeight> = {
  narrow: "short",
  wide: "medium",
  full: "tall",
};

/**
 * Decide where art belongs inside a stack of sections.
 *
 * Rules, in order:
 * - short pages (fewer than `minSections` blocks) get nothing — there is no
 *   blank space to fill;
 * - otherwise one placement per `every` blocks, never before the first block
 *   and never after the last (the footer CTA already closes the page);
 * - capped at `max` placements so a very long page doesn't turn into a gallery.
 */
export function sketchPlacements({
  sections,
  every = 4,
  max = 3,
  minSections = 6,
}: {
  sections: number;
  every?: number;
  max?: number;
  minSections?: number;
}): number[] {
  if (sections < minSections) return [];

  const slots: number[] = [];
  for (let index = every; index < sections && slots.length < max; index += every) {
    slots.push(index);
  }
  return slots;
}

/**
 * Page-level wrapper that drops illustrations into the long, unbroken stretches
 * of a content page. It counts the top-level blocks it is given, picks
 * placements with `sketchPlacements`, and pulls route-appropriate art from the
 * sketch registry — so a new route gets sensible bands with no per-page work.
 *
 * Pass `art` to override the rotation, or `disabled` to opt a page out.
 */
export function SketchAutoLayout({
  children,
  column = "wide",
  every,
  max,
  minSections,
  art,
  captions,
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  column?: SketchColumn;
  every?: number;
  max?: number;
  minSections?: number;
  /** Explicit art rotation; defaults to the route's rotation. */
  art?: SketchArt[];
  /** Optional captions matched to placement order. */
  captions?: string[];
  disabled?: boolean;
  className?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const rotation = art ?? sketchRotationForPath(pathname);

  const blocks = Children.toArray(children).filter((child) => child !== "");

  const slots =
    disabled || rotation.length === 0
      ? []
      : sketchPlacements({
          sections: blocks.length,
          ...(every === undefined ? {} : { every }),
          ...(max === undefined ? {} : { max }),
          ...(minSections === undefined ? {} : { minSections }),
        });

  if (slots.length === 0) return <div className={className}>{blocks}</div>;

  // The route's own drawing already sits in the page header, so start the
  // in-body rotation one step in and wrap around if the page is long.
  const pool = rotation.length > 1 ? rotation.slice(1) : rotation;

  const out: ReactNode[] = [];
  blocks.forEach((child, index) => {
    const slot = slots.indexOf(index);
    if (slot !== -1) {
      const chosen = pool[slot % pool.length];
      if (chosen) {
        out.push(
          <SketchSlot
            key={`sketch-${index}`}
            art={chosen}
            context={slot % 2 === 0 ? "articleBreak" : "sectionBreak"}
            height={HEIGHT_BY_COLUMN[column]}
            frame={alternateFrame(slot)}
            {...(captions?.[slot] ? { caption: captions[slot] as string } : {})}
            className="my-12"
          />,
        );
      }
    }
    out.push(
      isValidElement(child) && child.key == null ? (
        <div key={`block-${index}`}>{child}</div>
      ) : (
        child
      ),
    );
  });

  return <div className={className}>{out}</div>;
}

/**
 * Trailing gap filler: a wide backdrop band for the empty stretch above a
 * page's closing CTA. Renders nothing when the route has no art.
 */
export function SketchTrailingBand({
  children,
  className = "",
  intensity = "soft",
}: {
  children?: ReactNode;
  className?: string;
  intensity?: "whisper" | "soft" | "bold";
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const rotation = sketchRotationForPath(pathname);
  const art = rotation[rotation.length - 1];
  if (!art) return null;

  return (
    <SketchSlot art={art} context="trailingGap" intensity={intensity} className={className}>
      {children ? <div className="px-6 py-12 lg:px-10 lg:py-16">{children}</div> : <div className="h-40" />}
    </SketchSlot>
  );
}
