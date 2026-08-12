import { useMemo, useState } from "react";

type Unit = "kg" | "lb";
type Preset = "low" | "standard" | "hot";

const PRESETS: Record<
  Preset,
  { label: string; temp: string; minPerKg: number; maxPerKg: number; note: string }
> = {
  low: {
    label: "Low and slow",
    temp: "300°F / 150°C",
    minPerKg: 45,
    maxPerKg: 55,
    note: "Renders the most fat and gives the most forgiving window, at the cost of oven time.",
  },
  standard: {
    label: "Standard roast",
    temp: "350°F / 175°C",
    minPerKg: 35,
    maxPerKg: 42,
    note: "The most common approach for a whole roast duck: reliable skin, moderate time.",
  },
  hot: {
    label: "Hot finish",
    temp: "400°F / 200°C",
    minPerKg: 28,
    maxPerKg: 34,
    note: "Fastest route to crisp skin, but the narrowest margin for error — watch it closely.",
  },
};

const STUFFED_ADD = 0.12; // 12% longer, planning only
const FRIDGE_ADD = 0.06; // 6% longer, planning only
const REST_MINUTES = 20;

function fmtMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  if (h === 0) return `${m} min`;
  return `${h} h ${m ? `${m} min` : ""}`.trim();
}

export function CookingTimePlanner() {
  const [unit, setUnit] = useState<Unit>("kg");
  const [weightInput, setWeightInput] = useState("2.2");
  const [preset, setPreset] = useState<Preset>("standard");
  const [stuffed, setStuffed] = useState(false);
  const [fromFridge, setFromFridge] = useState(true);
  const [startTime, setStartTime] = useState("18:00");

  const parsedWeight = Number(weightInput);
  const validWeight = Number.isFinite(parsedWeight) && parsedWeight > 0;
  const weightKg = validWeight ? (unit === "kg" ? parsedWeight : parsedWeight / 2.205) : NaN;

  const result = useMemo(() => {
    if (!validWeight) return null;
    const clampedKg = Math.min(4.5, Math.max(0.8, weightKg));
    const p = PRESETS[preset];
    let minTotal = clampedKg * p.minPerKg;
    let maxTotal = clampedKg * p.maxPerKg;
    let multiplier = 1;
    if (stuffed) multiplier += STUFFED_ADD;
    if (fromFridge) multiplier += FRIDGE_ADD;
    minTotal *= multiplier;
    maxTotal *= multiplier;

    return {
      minTotal,
      maxTotal,
      rest: REST_MINUTES,
    };
  }, [validWeight, weightKg, preset, stuffed, fromFridge]);

  const prepStart = useMemo(() => {
    if (!result) return null;
    const [h, m] = startTime.split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    const serveMinutes = h * 60 + m;
    const totalNeeded = result.maxTotal + result.rest + 20; // 20 min margin for prep/carving
    let startMinutes = serveMinutes - totalNeeded;
    while (startMinutes < 0) startMinutes += 24 * 60;
    const sh = Math.floor(startMinutes / 60) % 24;
    const sm = Math.round(startMinutes % 60);
    return `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}`;
  }, [result, startTime]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        className="space-y-7 rounded-sm border border-border bg-card p-6 lg:p-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label
            htmlFor="weight"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            Whole-duck weight
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="weight"
              type="number"
              min={0.1}
              step={0.1}
              inputMode="decimal"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="h-12 w-full rounded-sm border border-input bg-background px-3 text-base"
            />
            <div className="flex overflow-hidden rounded-sm border border-input">
              {(["kg", "lb"] as Unit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  aria-pressed={unit === u}
                  className={`px-3 text-sm font-medium ${
                    unit === u
                      ? "bg-secondary text-primary"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {!validWeight && (
            <p className="mt-2 text-xs text-destructive">Enter a weight greater than zero.</p>
          )}
        </div>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            Oven temperature
          </legend>
          <div className="mt-3 space-y-2">
            {(Object.keys(PRESETS) as Preset[]).map((key) => (
              <label
                key={key}
                className={`flex cursor-pointer items-start gap-3 rounded-sm border px-3 py-3 text-sm transition-colors ${
                  preset === key
                    ? "border-primary bg-secondary"
                    : "border-input hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="preset"
                  value={key}
                  checked={preset === key}
                  onChange={() => setPreset(key)}
                  className="mt-0.5 size-4 accent-primary"
                />
                <span>
                  <span className="block font-medium text-foreground">
                    {PRESETS[key].label} — {PRESETS[key].temp}
                  </span>
                  <span className="block text-xs text-muted-foreground">{PRESETS[key].note}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={stuffed}
              onChange={(e) => setStuffed(e.target.checked)}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              Stuffed
              <span className="block text-xs text-muted-foreground">
                Cavity filled with stuffing or aromatics packed tightly enough to slow heat
                penetration.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={fromFridge}
              onChange={(e) => setFromFridge(e.target.checked)}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              Straight from the fridge
              <span className="block text-xs text-muted-foreground">
                Not rested at room temperature before roasting.
              </span>
            </span>
          </label>
        </div>

        <div>
          <label
            htmlFor="serve-time"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            Target serving time
          </label>
          <input
            id="serve-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-2 h-12 w-full rounded-sm border border-input bg-background px-3 text-base"
          />
        </div>
      </form>

      <div className="rounded-sm bg-forest p-6 text-forest-foreground lg:p-8" aria-live="polite">
        <span className="eyebrow text-accent">Planning range</span>
        {result ? (
          <>
            <p className="mt-4 font-display text-4xl leading-tight lg:text-5xl">
              {fmtMinutes(result.minTotal)} – {fmtMinutes(result.maxTotal)}
            </p>
            <p className="mt-3 text-sm text-forest-foreground/80">
              Total oven time at {PRESETS[preset].temp}, before resting.
            </p>
            <dl className="mt-7 space-y-3 border-t border-forest-foreground/15 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-forest-foreground/70">Rest before carving</dt>
                <dd>{result.rest} min</dd>
              </div>
              {prepStart && (
                <div className="flex justify-between gap-4">
                  <dt className="text-forest-foreground/70">Suggested prep-start time</dt>
                  <dd>{prepStart}</dd>
                </div>
              )}
            </dl>
            <p className="mt-6 text-xs leading-relaxed text-forest-foreground/60">
              This is a planning estimate, not a doneness test. Oven calibration, bird shape, and
              stuffing density all shift real cooking time by twenty minutes or more in either
              direction.
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-forest-foreground/80">
            Enter a valid weight to see a planning range.
          </p>
        )}
      </div>
    </div>
  );
}
