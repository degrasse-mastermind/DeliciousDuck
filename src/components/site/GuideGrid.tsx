import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { GuideEntry } from "@/data/guides";

const KIND_LABEL: Record<GuideEntry["kind"], string> = {
  technique: "Technique",
  reference: "Reference",
  diagnostic: "Troubleshooting",
  pairing: "Pairing",
  money: "Buying guide",
};

export function GuideCard({ guide }: { guide: GuideEntry }) {
  return (
    <li className="group border-t border-border pt-5">
      {/* Gold rule reveal: the grid answers the cursor without shouting. */}
      <span
        aria-hidden="true"
        className="mb-3 block h-[2px] w-8 origin-left scale-x-0 bg-gold transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-within:scale-x-100"
      />
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
        {KIND_LABEL[guide.kind]}
      </span>
      <h3 className="mt-2 font-display text-xl leading-snug text-foreground">
        <Link to={guide.path} className="inline-flex items-start gap-1.5 hover:text-primary">
          {guide.title}
          <ArrowUpRight
            aria-hidden="true"
            className="mt-1 size-3.5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{guide.teaser}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground/70">
        {guide.minutes} min read
      </p>
    </li>
  );
}


export function GuideGrid({ guides }: { guides: GuideEntry[] }) {
  return (
    <ul className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
      {guides.map((g) => (
        <GuideCard key={g.path} guide={g} />
      ))}
    </ul>
  );
}

/** Hub section: a cluster heading plus its guides. */
export function GuideCluster({
  id,
  heading,
  intro,
  guides,
}: {
  id: string;
  heading: string;
  intro: string;
  guides: GuideEntry[];
}) {
  if (guides.length === 0) return null;
  return (
    <section aria-labelledby={id} className="mt-16 first:mt-0">
      <h2 id={id} className="font-display text-3xl text-foreground">
        {heading}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{intro}</p>
      <GuideGrid guides={guides} />
    </section>
  );
}
