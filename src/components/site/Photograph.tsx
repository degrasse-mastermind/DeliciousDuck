import { photoSrcSet, photoTone, PHOTO_RATIO } from "@/lib/photo-sources";
import { cn } from "@/lib/utils";

/** Crops a photo can render at. Files are stored 4:3; wider ratios trim height. */
const RATIOS = {
  "4/3": { className: "aspect-[4/3]", width: PHOTO_RATIO.width, height: PHOTO_RATIO.height },
  "3/2": { className: "aspect-[3/2]", width: PHOTO_RATIO.width, height: 683 },
  "16/9": { className: "aspect-[16/9]", width: PHOTO_RATIO.width, height: 576 },
} as const;

export type PhotoRatio = keyof typeof RATIOS;

/**
 * The single way a photograph is rendered on the site.
 *
 * It carries the four things every photo needs and templates kept forgetting:
 * WebP srcset with an honest `sizes`, intrinsic width/height so nothing shifts
 * as it lands, a shared crop, and the photo's own average tone painted
 * underneath while it loads. Only the first image of a page passes `priority`.
 *
 * Cards stay 4:3; article heroes use the shorter 3:2 crop so the recipe method
 * starts higher on the screen.
 */
export function Photograph({
  src,
  alt,
  sizes,
  ratio = "4/3",
  priority = false,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  sizes: string;
  ratio?: PhotoRatio;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  const srcSet = photoSrcSet(src);
  const tone = photoTone(src);
  const crop = RATIOS[ratio];

  return (
    <div
      className={cn("overflow-hidden rounded-sm", className)}
      // A warm plate-toned field, not empty paper, until the pixels arrive.
      style={tone ? { backgroundColor: tone } : undefined}
    >
      <img
        src={src}
        {...(srcSet ? { srcSet, sizes } : {})}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        width={crop.width}
        height={crop.height}
        className={cn(crop.className, "w-full object-cover", imgClassName)}
      />
    </div>
  );
}
