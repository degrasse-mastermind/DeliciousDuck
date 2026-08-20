import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Pillar } from "@/data/site";
import { photoSrcSet, PHOTO_SIZES } from "@/lib/photo-sources";

export function CategoryTile({ pillar, featured = false }: { pillar: Pillar; featured?: boolean }) {
  // Tiles fill their frame rather than sitting at the shared 4:3, so they take
  // the responsive sources directly instead of going through <Photograph>.
  const srcSet = photoSrcSet(pillar.image);

  return (
    <Link
      to={pillar.to}
      className={`group relative isolate flex overflow-hidden rounded-sm bg-ink ${
        featured ? "min-h-[22rem] lg:min-h-[26rem]" : "min-h-[16rem]"
      }`}
    >
      <img
        src={pillar.image}
        {...(srcSet ? { srcSet, sizes: PHOTO_SIZES.tile } : {})}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width={900}
        height={1100}
        className="absolute inset-0 -z-10 size-full object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-[1.06]"
      />

      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-deep via-forest-deep/60 to-forest-deep/10"
      />
      <div className="mt-auto flex w-full flex-col gap-2 p-6">
        {/* Gold rule reveal on hover, matching the editorial grids. */}
        <span
          aria-hidden="true"
          className="mb-1 block h-[2px] w-10 origin-left scale-x-0 bg-gold transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
        <span className="eyebrow text-accent">{pillar.kicker}</span>

        <h3
          className={`font-display text-forest-foreground ${
            featured ? "text-4xl lg:text-5xl" : "text-3xl"
          }`}
        >
          {pillar.headline}
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-forest-foreground/80">
          {pillar.blurb}
        </p>
        <span className="mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Explore
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
