/**
 * Which routes actually show a given illustration.
 *
 * Art is resolved per route by `sketchForPath` / `sketchRotationForPath`, so the
 * only truthful way to answer "what does replacing confit.jpg affect?" is to run
 * the resolver across the site's route inventory. Used by the promotion flow to
 * report affected routes before an asset is overwritten.
 */

import { SKETCH, sketchForPath, sketchRotationForPath, type SketchKey } from "./sketch-art";
import { GUIDES } from "@/data/guides";
import { INGREDIENTS } from "@/data/ingredients";
import { RECIPES } from "@/data/recipes";
import { TOOLS } from "@/data/tools";
import { STARTER_GUIDE } from "@/data/starter-guide";

const STATIC_PATHS = [
  "/",
  "/cook",
  "/learn",
  "/buy",
  "/gear",
  "/ingredients",
  "/tools",
  "/recipes",
  "/search",
  "/about",
  "/editorial-standards",
  "/affiliate-disclosure",
];

/** Every public route path the site publishes, deduplicated and sorted. */
export function routeInventory(): string[] {
  const paths = new Set<string>(STATIC_PATHS);
  paths.add(STARTER_GUIDE.path);
  for (const g of GUIDES) paths.add(g.path);
  for (const i of INGREDIENTS) paths.add(i.path);
  for (const r of RECIPES) paths.add(`/recipes/${r.slug}`);
  for (const t of TOOLS) if (t.status === "live" && t.to) paths.add(t.to);
  return [...paths].sort();
}

export type UsageReport = {
  key: SketchKey;
  /** Routes whose primary header art is this drawing. */
  primary: string[];
  /** Routes that can place this drawing in an auto-placed band. */
  rotation: string[];
  total: number;
};

export function usageForKey(key: SketchKey, paths = routeInventory()): UsageReport {
  const art = SKETCH[key];
  const primary: string[] = [];
  const rotation: string[] = [];

  for (const path of paths) {
    if (sketchForPath(path) === art) {
      primary.push(path);
      continue;
    }
    if (sketchRotationForPath(path).includes(art)) rotation.push(path);
  }

  return { key, primary, rotation, total: primary.length + rotation.length };
}

/** Registry key for an asset basename, e.g. "wild-vs-farmed" -> "wildVsFarmed". */
export function keyForAssetName(name: string): SketchKey | null {
  const camel = name
    .split("-")
    .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("");
  const keys = Object.keys(SKETCH) as SketchKey[];
  return keys.find((k) => k === camel) ?? keys.find((k) => k.toLowerCase() === camel.toLowerCase()) ?? null;
}
