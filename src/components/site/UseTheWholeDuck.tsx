import { Link } from "@tanstack/react-router";
import { Recycle } from "lucide-react";

/**
 * Use the Whole Duck — contextual links for the parts a recipe leaves behind.
 */
export interface WholeDuckUse {
  part: string;
  use: string;
  to?: string;
  linkLabel?: string;
}

export function UseTheWholeDuck({
  items,
  intro = "Nothing here needs to go in the bin. Each of these is worth more than the packaging suggests.",
}: {
  items: WholeDuckUse[];
  intro?: string;
}) {
  return (
    <section
      aria-labelledby="use-whole-duck"
      className="mt-16 rounded-sm bg-forest px-6 py-8 text-forest-foreground lg:px-8"
    >
      <div className="flex items-center gap-2.5">
        <Recycle aria-hidden="true" className="size-4 text-accent" />
        <h2 id="use-whole-duck" className="eyebrow text-accent">
          Use the Whole Duck
        </h2>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forest-foreground/80">{intro}</p>
      <ul className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.part} className="border-t border-forest-foreground/20 pt-4">
            <h3 className="font-display text-lg text-forest-foreground">{item.part}</h3>
            <p className="mt-1 text-sm leading-relaxed text-forest-foreground/80">{item.use}</p>
            {item.to && (
              <Link
                to={item.to}
                className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-accent underline-offset-4 hover:underline"
              >
                {item.linkLabel ?? "Read the guide"}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
