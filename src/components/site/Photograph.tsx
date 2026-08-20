import { photoSrcSet, photoTone, PHOTO_RATIO } from "@/lib/photo-sources";
import { cn } from "@/lib/utils";

/**
 * The single way a photograph is rendered on the site.
 *
 * It carries the four things every photo needs and templates kept forgetting:
 * WebP srcset with an honest `sizes`, intrinsic width/height so nothing shifts
 * as it lands, one shared 4:3 crop, and the photo's own average tone painted
 * underneath while it loads. Only the first image of a page passes `priority`.
 */
export function Photograph({
  src,
  alt,
  sizes,
  priority = false,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  const srcSet = photoSrcSet(src);
  const tone = photoTone(src);

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
        width={PHOTO_RATIO.width}
        height={PHOTO_RATIO.height}
        className={cn("aspect-[4/3] w-full object-cover", imgClassName)}
      />
    </div>
  );
}
