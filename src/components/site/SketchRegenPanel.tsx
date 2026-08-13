import type { SketchArt } from "@/lib/sketch-art";
import { SketchStudio } from "@/components/studio/SketchStudio";

/**
 * Compatibility shim for the gallery.
 *
 * The per-sketch regeneration controls grew into the full art-direction studio
 * (`@/components/studio/SketchStudio`); this keeps the gallery's call site and
 * preview/revert contract unchanged.
 */
export function SketchRegenPanel(props: {
  art: SketchArt;
  context?: string;
  onPreview: (dataUrl: string, isFinal: boolean) => void;
  onRevert: () => void;
  hasPreview: boolean;
}) {
  return <SketchStudio {...props} />;
}
