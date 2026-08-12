import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCalculatorComplete } from "@/hooks/use-calculator-complete";

/**
 * Duck Pairing Finder — a fully deterministic lookup, not a model.
 *
 * Every recommendation below is a fixed table entry keyed on the reader's
 * answers, so the same answers always produce the same plate and the reasoning
 * can be shown in plain language.
 */

type Cut = "breast" | "roast" | "confit" | "smoked" | "wild";
type Direction = "bright" | "savoury" | "spiced" | "smoky" | "classic";
type Occasion = "weeknight" | "party" | "holiday";
type Richness = "lighter" | "balanced" | "indulgent";

const CUTS: { value: Cut; label: string; note: string }[] = [
  { value: "breast", label: "Duck breast", note: "Pan-seared, skin scored" },
  { value: "roast", label: "Whole roast duck", note: "One bird, oven-roasted" },
  { value: "confit", label: "Confit or duck legs", note: "Slow-cooked in fat" },
  { value: "smoked", label: "Smoked duck", note: "Hot- or cold-smoked" },
  { value: "wild", label: "Wild duck", note: "Leaner, more mineral" },
];

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: "bright", label: "Bright / fruity" },
  { value: "savoury", label: "Savoury / herbal" },
  { value: "spiced", label: "Warm / spiced" },
  { value: "smoky", label: "Smoky" },
  { value: "classic", label: "Classic / simple" },
];

const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: "weeknight", label: "Weeknight" },
  { value: "party", label: "Dinner party" },
  { value: "holiday", label: "Holiday / special" },
];

const RICHNESS: { value: Richness; label: string }[] = [
  { value: "lighter", label: "Lighter" },
  { value: "balanced", label: "Balanced" },
  { value: "indulgent", label: "Indulgent" },
];

interface DirectionProfile {
  headline: string;
  sauce: string;
  acid: string;
  seasoning: string[];
  links: string[];
}

const DIRECTION_TABLE: Record<Direction, DirectionProfile> = {
  bright: {
    headline: "Fruit and acid forward",
    sauce: "Fruit reduction built on pan fond — orange, cherry, plum or pomegranate",
    acid: "Citrus juice and zest, or a splash of red-wine or sherry vinegar to sharpen the fruit",
    seasoning: ["Thyme with orange zest", "Cracked black pepper and a pinch of flaky finishing salt"],
    links: [
      "/ingredients/orange-with-duck",
      "/ingredients/cherry-plum-with-duck",
      "/cook/best-sauces-for-duck-breast",
    ],
  },
  savoury: {
    headline: "Savoury, herbal and stock-driven",
    sauce: "Reduced stock or mushroom sauce, finished with a little butter or rendered duck fat",
    acid: "Sherry vinegar or a mustard-sharpened pan sauce, added off the heat",
    seasoning: ["Rosemary, thyme and bay", "Garlic and coarse black pepper"],
    links: [
      "/ingredients/best-herbs-spices-for-duck",
      "/ingredients/best-acid-for-duck",
      "/cook/best-sauces-for-duck-breast",
    ],
  },
  spiced: {
    headline: "Warm spice and aromatic",
    sauce: "Spiced pan sauce — star anise, five-spice or juniper bloomed in fat, then deglazed",
    acid: "Rice vinegar or orange juice to keep the spice from turning heavy",
    seasoning: ["Five-spice or star anise in the rub", "Juniper and black pepper for game character"],
    links: [
      "/ingredients/best-herbs-spices-for-duck",
      "/ingredients/duck-seasoning-guide",
      "/cook/best-sauces-for-duck-breast",
    ],
  },
  smoky: {
    headline: "Smoke, char and dark fruit",
    sauce: "Dark fruit sauce with vinegar backbone — plum, cherry or blackberry",
    acid: "Cider or red-wine vinegar; pickled onion or cherry on the plate",
    seasoning: ["Smoked paprika with thyme", "Coarse salt and cracked pepper only"],
    links: [
      "/ingredients/cherry-plum-with-duck",
      "/ingredients/best-acid-for-duck",
      "/recipes/smoked-duck-with-plum-sauce",
    ],
  },
  classic: {
    headline: "Salt, fat and restraint",
    sauce: "Pan jus: deglaze the fond with stock or wine, reduce, season, done",
    acid: "A squeeze of lemon at the table, or a sharply dressed green salad alongside",
    seasoning: ["Salt ahead of time, pepper after cooking", "Thyme in the pan for the last minute"],
    links: [
      "/ingredients/duck-seasoning-guide",
      "/ingredients/dry-brine-duck",
      "/ingredients/best-acid-for-duck",
    ],
  },
};

/** Which directions genuinely flatter each cut, in preference order. */
const CUT_DIRECTIONS: Record<Cut, Direction[]> = {
  breast: ["bright", "savoury", "spiced", "classic", "smoky"],
  roast: ["classic", "bright", "spiced", "savoury", "smoky"],
  confit: ["savoury", "bright", "classic", "spiced", "smoky"],
  smoked: ["smoky", "bright", "classic", "savoury", "spiced"],
  wild: ["spiced", "savoury", "bright", "classic", "smoky"],
};

const CUT_NOTES: Record<Cut, { starch: string; green: string; cook: string; cookLabel: string }> = {
  breast: {
    starch: "Duck-fat potatoes, or a soft polenta if you want the sauce to lead",
    green: "Bitter greens — chicory, radicchio or watercress — dressed sharply",
    cook: "/cook/how-to-cook-duck-breast",
    cookLabel: "How to cook duck breast",
  },
  roast: {
    starch: "Roast potatoes in the rendered fat, or bread-and-herb stuffing for a holiday table",
    green: "Braised red cabbage, or green beans with shallot and vinegar",
    cook: "/cook/whole-roast-duck",
    cookLabel: "Whole roast duck",
  },
  confit: {
    starch: "Lentils, white beans, or potatoes crisped in the confit fat",
    green: "Frisée with mustard vinaigrette, or wilted chard",
    cook: "/cook/duck-leg-confit",
    cookLabel: "Duck leg confit",
  },
  smoked: {
    starch: "Warm grains — farro or barley — or a potato salad with plenty of vinegar",
    green: "Peppery leaves, shaved fennel, or a pickled-vegetable plate",
    cook: "/cook/how-to-cook-duck-breast",
    cookLabel: "How to cook duck breast",
  },
  wild: {
    starch: "Wild rice, barley, or celeriac purée",
    green: "Kale or cabbage with bacon and vinegar; roasted root vegetables",
    cook: "/cook/how-to-cook-wild-duck-breast",
    cookLabel: "How to cook wild duck breast",
  },
};

const OCCASION_NOTES: Record<Occasion, string> = {
  weeknight:
    "Keep it to one pan and one sauce: the fond from the duck plus one acid is a complete sauce. Skip the second side.",
  party:
    "Build the sauce ahead and reheat it while the duck rests — that's the step that usually runs late.",
  holiday:
    "Give the bird a day of dry-brining time in the fridge and plan the sauce as a make-ahead component.",
};

const RICHNESS_NOTES: Record<Richness, string> = {
  lighter:
    "Lean on acid and raw or barely dressed greens; keep butter out of the sauce and finish with citrus instead.",
  balanced:
    "One rich element (fat-roasted starch or a buttered sauce) plus one sharp element is the reliable ratio.",
  indulgent:
    "Duck-fat starch, a buttered reduction, and a pickle or sharp green so the plate still resets between bites.",
};

const LINK_LABELS: Record<string, string> = {
  "/ingredients/orange-with-duck": "Why orange works with duck",
  "/ingredients/cherry-plum-with-duck": "Cherry, plum & stone fruit with duck",
  "/ingredients/best-acid-for-duck": "The best acids for duck",
  "/ingredients/best-herbs-spices-for-duck": "Best herbs & spices for duck",
  "/ingredients/duck-seasoning-guide": "How to season duck",
  "/ingredients/dry-brine-duck": "How to dry brine duck",
  "/ingredients/duck-fat-vs-butter-oil": "Duck fat vs butter, olive oil & neutral oil",
  "/ingredients/duck-marinade-guide": "Duck marinades",
  "/cook/best-sauces-for-duck-breast": "Best sauces for duck breast",
  "/cook/what-to-serve-with-duck-breast": "What to serve with duck breast",
  "/cook/how-to-cook-duck-breast": "How to cook duck breast",
  "/cook/how-to-cook-wild-duck-breast": "How to cook wild duck breast",
  "/cook/whole-roast-duck": "Whole roast duck",
  "/cook/duck-leg-confit": "Duck leg confit",
  "/recipes/smoked-duck-with-plum-sauce": "Smoked duck with plum sauce",
};

function ChoiceGroup<T extends string>({
  legend,
  hint,
  options,
  value,
  onChange,
}: {
  legend: string;
  hint?: string;
  options: { value: T; label: string; note?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="font-display text-lg text-foreground">{legend}</legend>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={`rounded-sm border px-3.5 py-2.5 text-left text-sm transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/60"
              }`}
            >
              <span className="block font-medium">{o.label}</span>
              {o.note && (
                <span
                  className={`mt-0.5 block text-xs ${
                    active ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {o.note}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function PairingFinder() {
  const [cut, setCut] = useState<Cut>("breast");
  const [direction, setDirection] = useState<Direction>("bright");
  const [occasion, setOccasion] = useState<Occasion>("weeknight");
  const [richness, setRichness] = useState<Richness>("balanced");

  const result = useMemo(() => {
    const preferred = CUT_DIRECTIONS[cut];
    // Chosen direction always leads; the rest of the ordering is the cut's own
    // preference list, so the output is stable for any combination.
    const ordered: Direction[] = [direction, ...preferred.filter((d) => d !== direction)];
    const picks = ordered.slice(0, richness === "lighter" ? 2 : 3);
    const primary = DIRECTION_TABLE[direction];
    const notes = CUT_NOTES[cut];
    const links = Array.from(new Set([...primary.links, notes.cook]));
    return { picks, primary, notes, links };
  }, [cut, direction, richness]);

  useCalculatorComplete({
    calculatorName: "Duck Pairing Finder",
    toolSlug: "duck-pairing-finder",
    result: {
      cut,
      flavor_direction: direction,
      occasion,
      richness,
      directions_returned: result.picks.length,
    },
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <ChoiceGroup
          legend="What are you cooking?"
          options={CUTS}
          value={cut}
          onChange={setCut}
        />
        <ChoiceGroup
          legend="Which flavour direction?"
          hint="This leads the result; the finder adds the next-best directions for your cut."
          options={DIRECTIONS}
          value={direction}
          onChange={setDirection}
        />
        <ChoiceGroup legend="Occasion" options={OCCASIONS} value={occasion} onChange={setOccasion} />
        <ChoiceGroup
          legend="Richness preference"
          hint="Optional. Lighter narrows the result to two directions and pushes acid over butter."
          options={RICHNESS}
          value={richness}
          onChange={setRichness}
        />
      </form>

      <aside
        aria-live="polite"
        className="rounded-sm border border-border bg-cream p-5 lg:sticky lg:top-24 lg:self-start lg:p-6"
      >
        <p className="eyebrow text-primary">Your pairing plan</p>
        <h2 className="mt-2 font-display text-2xl text-foreground">{result.primary.headline}</h2>

        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-foreground">Flavour directions to consider</dt>
            <dd className="mt-1 text-muted-foreground">
              <ol className="list-decimal space-y-1 pl-5">
                {result.picks.map((d) => (
                  <li key={d}>{DIRECTION_TABLE[d].headline}</li>
                ))}
              </ol>
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">Sauce family</dt>
            <dd className="mt-1 text-muted-foreground">{result.primary.sauce}</dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">Acid</dt>
            <dd className="mt-1 text-muted-foreground">{result.primary.acid}</dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">Starch</dt>
            <dd className="mt-1 text-muted-foreground">{result.notes.starch}</dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">Vegetable or green</dt>
            <dd className="mt-1 text-muted-foreground">{result.notes.green}</dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">Seasoning ideas</dt>
            <dd className="mt-1 text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5">
                {result.primary.seasoning.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">For this occasion</dt>
            <dd className="mt-1 text-muted-foreground">{OCCASION_NOTES[occasion]}</dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">Balancing the richness</dt>
            <dd className="mt-1 text-muted-foreground">{RICHNESS_NOTES[richness]}</dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-border pt-5">
          <p className="eyebrow text-primary">Read next</p>
          <ul className="mt-3 space-y-2 text-sm">
            {result.links.map((path) => (
              <li key={path}>
                <Link to={path} className="text-primary underline underline-offset-4">
                  {LINK_LABELS[path] ?? path}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
