/**
 * Responsive sources for the colored-pencil illustration collection.
 *
 * Every sketch ships as a 700w and 1400w WebP alongside its JPEG original.
 * The WebP variants are ~60-80% smaller, so browsers download the smallest
 * file that still stays crisp at the rendered width — including at 2x/3x DPR,
 * where a 700 CSS-px band pulls the 1400w file.
 */

const webp = import.meta.glob<string>("../assets/sketch/*-{700,1400}.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

/** basename ("confit") -> { 700: url, 1400: url } */
const BY_NAME: Record<string, Record<number, string>> = {};

for (const [path, url] of Object.entries(webp)) {
  const match = /\/([^/]+)-(700|1400)\.webp$/.exec(path);
  if (!match) continue;
  const [, name, width] = match;
  (BY_NAME[name!] ??= {})[Number(width)] = url;
}

/** Extract the illustration basename from any built asset URL. */
export function sketchNameFromSrc(src: string): string | null {
  const match = /\/?([^/]+?)(?:-\d+)?(?:-[A-Za-z0-9_]{6,})?\.(?:jpg|jpeg|webp)$/.exec(src);
  return match ? match[1]!.replace(/-(?:700|1400)$/, "") : null;
}

/**
 * srcset for a sketch, or null when no WebP variants exist for it.
 * Falls back silently so a new illustration still renders from its JPEG.
 */
export function sketchSrcSet(src: string): string | null {
  const name = sketchNameFromSrc(src);
  const variants = name ? BY_NAME[name] : undefined;
  if (!variants) return null;
  const parts = [700, 1400]
    .filter((w) => variants[w])
    .map((w) => `${variants[w]} ${w}w`);
  return parts.length > 0 ? parts.join(", ") : null;
}

/** Best single URL for preloading a sketch at hero size. */
export function sketchPreloadHref(src: string): string {
  const name = sketchNameFromSrc(src);
  return (name && BY_NAME[name]?.[1400]) || src;
}

/**
 * Default `sizes` hints. Sketch art is always full-width inside its
 * container, and the site's content column caps at ~1100px.
 */
export const SKETCH_SIZES = {
  /** Page header / full-width band. */
  band: "(min-width: 1024px) 1100px, 100vw",
  /** Half-width gallery or two-up grid. */
  half: "(min-width: 1024px) 550px, 100vw",
  /** Small margin aside. */
  aside: "(min-width: 1024px) 320px, 40vw",
} as const;
