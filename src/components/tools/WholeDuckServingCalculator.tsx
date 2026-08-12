import { useMemo, useState } from "react";
import { useCalculatorComplete } from "@/hooks/use-calculator-complete";

type Appetite = "light" | "standard" | "hearty";

const APPETITE: Record<Appetite, { label: string; cookedPerPerson: number; note: string }> = {
  light: {
    label: "Light",
    cookedPerPerson: 140,
    note: "Duck as one course among several, or served with plenty of sides.",
  },
  standard: {
    label: "Standard",
    cookedPerPerson: 200,
    note: "Duck as the main event with two or three sides.",
  },
  hearty: {
    label: "Hearty",
    cookedPerPerson: 280,
    note: "Big appetites, or duck served without substantial sides.",
  },
};

/**
 * Yield model, stated openly so readers can sanity-check it:
 * a whole duck is roughly 40% edible cooked meat after bone,
 * rendered fat, and moisture loss.
 */
const EDIBLE_YIELD = 0.4;

export function WholeDuckServingCalculator() {
  const [guests, setGuests] = useState(6);
  const [appetite, setAppetite] = useState<Appetite>("standard");
  const [leftovers, setLeftovers] = useState(false);
  const [duckWeightKg, setDuckWeightKg] = useState(2.2);

  const result = useMemo(() => {
    const safeGuests = Math.max(1, Math.min(60, Math.round(guests) || 1));
    const safeWeight = Math.max(1, Math.min(4, duckWeightKg || 1));
    const perPerson = APPETITE[appetite].cookedPerPerson * (leftovers ? 1.35 : 1);
    const cookedNeededG = safeGuests * perPerson;
    const cookedPerDuckG = safeWeight * 1000 * EDIBLE_YIELD;
    const ducksExact = cookedNeededG / cookedPerDuckG;
    const ducks = Math.max(1, Math.ceil(ducksExact));
    const rawWeightKg = ducks * safeWeight;
    const surplusG = Math.round(ducks * cookedPerDuckG - cookedNeededG);

    return {
      ducks,
      ducksExact,
      cookedNeededG: Math.round(cookedNeededG),
      cookedPerDuckG: Math.round(cookedPerDuckG),
      rawWeightKg,
      surplusG,
      perPerson: Math.round(perPerson),
    };
  }, [guests, appetite, leftovers, duckWeightKg]);

  useCalculatorComplete({
    calculatorName: "Whole duck serving calculator",
    toolSlug: "whole-duck-serving-calculator",
    result: {
      appetite,
      leftovers,
      ducks: result.ducks,
      raw_weight_kg: Number(result.rawWeightKg.toFixed(1)),
      cooked_needed_g: result.cookedNeededG,
    },
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        className="space-y-7 rounded-sm border border-border bg-card p-6 lg:p-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label
            htmlFor="guests"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            How many people are eating?
          </label>
          <input
            id="guests"
            type="number"
            min={1}
            max={60}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="mt-2 h-12 w-full rounded-sm border border-input bg-background px-3 text-base"
          />
        </div>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            Appetite
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(Object.keys(APPETITE) as Appetite[]).map((key) => (
              <label
                key={key}
                className={`cursor-pointer rounded-sm border px-3 py-3 text-center text-sm transition-colors ${
                  appetite === key
                    ? "border-primary bg-secondary text-primary"
                    : "border-input text-muted-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="appetite"
                  value={key}
                  checked={appetite === key}
                  onChange={() => setAppetite(key)}
                  className="sr-only"
                />
                {APPETITE[key].label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{APPETITE[appetite].note}</p>
        </fieldset>

        <div>
          <label
            htmlFor="duck-weight"
            className="flex items-baseline justify-between text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            Average whole-duck weight
            <span className="font-sans text-sm font-normal normal-case tracking-normal text-muted-foreground">
              {duckWeightKg.toFixed(1)} kg ({(duckWeightKg * 2.205).toFixed(1)} lb)
            </span>
          </label>
          <input
            id="duck-weight"
            type="range"
            min={1}
            max={4}
            step={0.1}
            value={duckWeightKg}
            onChange={(e) => setDuckWeightKg(Number(e.target.value))}
            className="mt-3 w-full accent-primary"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Most supermarket Pekin ducks land between 2.0 kg and 2.5 kg.
          </p>
        </div>

        <label className="flex items-start gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={leftovers}
            onChange={(e) => setLeftovers(e.target.checked)}
            className="mt-0.5 size-4 accent-primary"
          />
          <span>
            Plan for leftovers
            <span className="block text-xs text-muted-foreground">
              Adds roughly a third more cooked meat for next-day rillettes, salads, or ragù.
            </span>
          </span>
        </label>
      </form>

      <div className="rounded-sm bg-forest p-6 text-forest-foreground lg:p-8">
        <span className="eyebrow text-accent">Your result</span>
        <p className="mt-4 font-display text-6xl leading-none">
          {result.ducks}
          <span className="ml-3 align-middle font-sans text-base font-normal tracking-normal text-forest-foreground/70">
            whole {result.ducks === 1 ? "duck" : "ducks"}
          </span>
        </p>
        <p className="mt-3 text-sm text-forest-foreground/80">
          About {result.rawWeightKg.toFixed(1)} kg (
          {(result.rawWeightKg * 2.205).toFixed(1)} lb) of raw duck to buy.
        </p>

        <dl className="mt-7 space-y-3 border-t border-forest-foreground/15 pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-forest-foreground/70">Cooked meat per person</dt>
            <dd>{result.perPerson} g</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-forest-foreground/70">Cooked meat needed</dt>
            <dd>{(result.cookedNeededG / 1000).toFixed(2)} kg</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-forest-foreground/70">Yield per duck</dt>
            <dd>{result.cookedPerDuckG} g</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-forest-foreground/70">Spare after serving</dt>
            <dd>{result.surplusG} g</dd>
          </div>
        </dl>

        <p className="mt-6 text-xs leading-relaxed text-forest-foreground/60">
          Calculated at {Math.round(EDIBLE_YIELD * 100)}% edible cooked yield, which accounts for
          bone, rendered fat, and moisture loss. Adjust the weight slider if your butcher's birds
          run larger or smaller.
        </p>
      </div>
    </div>
  );
}
