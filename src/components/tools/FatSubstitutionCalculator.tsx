import { useMemo, useState } from "react";
import { useCalculatorComplete } from "@/hooks/use-calculator-complete";

type FatType = "butter" | "oliveOil" | "neutralOil" | "lard";
type Unit = "tsp" | "tbsp" | "cup" | "g" | "ml" | "oz";

const UNIT_TO_ML: Record<Unit, number | null> = {
  tsp: 4.929,
  tbsp: 14.787,
  cup: 236.588,
  ml: 1,
  g: null, // weight, handled separately
  oz: null, // weight, handled separately
};

const UNIT_TO_G: Record<"g" | "oz", number> = {
  g: 1,
  oz: 28.3495,
};

// Density in g/ml, and the fraction of that weight which is actual fat.
const FATS: Record<
  FatType,
  { label: string; densityGPerMl: number; fatFraction: number; note: string }
> = {
  butter: {
    label: "Butter",
    densityGPerMl: 0.911,
    fatFraction: 0.81,
    note: "Butter is roughly 80–82% fat, with water and milk solids making up the rest.",
  },
  oliveOil: {
    label: "Olive oil",
    densityGPerMl: 0.918,
    fatFraction: 1,
    note: "Olive oil is essentially 100% fat by weight.",
  },
  neutralOil: {
    label: "Neutral oil (canola, vegetable, sunflower)",
    densityGPerMl: 0.92,
    fatFraction: 1,
    note: "Neutral oils are essentially 100% fat by weight.",
  },
  lard: {
    label: "Lard / shortening",
    densityGPerMl: 0.92,
    fatFraction: 1,
    note: "Rendered lard and solid shortening are essentially 100% fat by weight.",
  },
};

const DUCK_FAT_DENSITY_G_PER_ML = 0.92;

function toGrams(amount: number, unit: Unit, fat: FatType): number | null {
  if (unit === "g") return amount * UNIT_TO_G.g;
  if (unit === "oz") return amount * UNIT_TO_G.oz;
  const ml = UNIT_TO_ML[unit];
  if (ml == null) return null;
  return amount * ml * FATS[fat].densityGPerMl;
}

function gramsToDisplay(grams: number) {
  const ml = grams / DUCK_FAT_DENSITY_G_PER_ML;
  const tbsp = ml / 14.787;
  const cups = ml / 236.588;
  return {
    grams: Math.round(grams),
    ml: Math.round(ml),
    tbsp: Math.round(tbsp * 4) / 4,
    cups: Math.round(cups * 100) / 100,
  };
}

export function FatSubstitutionCalculator() {
  const [fat, setFat] = useState<FatType>("butter");
  const [amountInput, setAmountInput] = useState("1");
  const [unit, setUnit] = useState<Unit>("cup");

  const amount = Number(amountInput);
  const valid = Number.isFinite(amount) && amount > 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const originalGrams = toGrams(amount, unit, fat);
    if (originalGrams == null) return null;
    // Grams of pure fat contributed by the original ingredient.
    const pureFatGrams = originalGrams * FATS[fat].fatFraction;
    // Duck fat is essentially 100% fat, so match pure-fat weight 1:1 by weight.
    return gramsToDisplay(pureFatGrams);
  }, [valid, amount, unit, fat]);

  useCalculatorComplete({
    calculatorName: "Duck fat substitution calculator",
    toolSlug: "duck-fat-substitution-calculator",
    ready: Boolean(result),
    result: {
      original_fat: fat,
      unit,
      duck_fat_grams: result?.grams,
      duck_fat_tbsp: result?.tbsp,
    },
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <form
        className="space-y-7 rounded-sm border border-border bg-card p-6 lg:p-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            Original fat
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(Object.keys(FATS) as FatType[]).map((key) => (
              <label
                key={key}
                className={`cursor-pointer rounded-sm border px-3 py-3 text-center text-sm transition-colors ${
                  fat === key
                    ? "border-primary bg-secondary text-primary"
                    : "border-input text-muted-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="fat"
                  value={key}
                  checked={fat === key}
                  onChange={() => setFat(key)}
                  className="sr-only"
                />
                {FATS[key].label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{FATS[fat].note}</p>
        </fieldset>

        <div>
          <label
            htmlFor="fat-amount"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            Amount
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="fat-amount"
              type="number"
              min={0}
              step={0.1}
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="h-12 w-full rounded-sm border border-input bg-background px-3 text-base"
            />
            <select
              aria-label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as Unit)}
              className="h-12 rounded-sm border border-input bg-background px-3 text-base"
            >
              <option value="tsp">tsp</option>
              <option value="tbsp">tbsp</option>
              <option value="cup">cup</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="oz">oz</option>
            </select>
          </div>
          {!valid && (
            <p className="mt-2 text-xs text-destructive">Enter an amount greater than zero.</p>
          )}
        </div>
      </form>

      <div className="rounded-sm bg-forest p-6 text-forest-foreground lg:p-8" aria-live="polite">
        <span className="eyebrow text-accent">Use instead</span>
        {result ? (
          <>
            <p className="mt-4 font-display text-4xl leading-tight lg:text-5xl">
              {result.tbsp} tbsp
            </p>
            <p className="mt-3 text-sm text-forest-foreground/80">
              of duck fat, by weight equivalent.
            </p>
            <dl className="mt-7 space-y-3 border-t border-forest-foreground/15 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-forest-foreground/70">Grams</dt>
                <dd>{result.grams} g</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-forest-foreground/70">Millilitres</dt>
                <dd>{result.ml} ml</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-forest-foreground/70">Cups</dt>
                <dd>{result.cups} cup</dd>
              </div>
            </dl>
            <p className="mt-6 text-xs leading-relaxed text-forest-foreground/60">
              {fat === "butter"
                ? "Butter is roughly 80% fat and 20% water and milk solids, so a straight 1:1 swap over-fats the recipe. This converts by matching actual fat weight, then reports it back in duck fat's own volume."
                : "This oil, lard, or shortening is essentially 100% fat, so the swap is close to 1:1 by weight — the figures above simply convert between units and account for the small density difference."}
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-forest-foreground/80">
            Enter a valid amount to see the duck-fat equivalent.
          </p>
        )}
      </div>
    </div>
  );
}
