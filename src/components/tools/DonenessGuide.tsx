import { useMemo, useState } from "react";
import { useCalculatorComplete } from "@/hooks/use-calculator-complete";
import { SafetyNote } from "@/components/site/SafetyNote";

type Cut = "whole" | "breast" | "leg";
type Method = "seared" | "roasted" | "confit" | "grilled";
type Outcome = "rosy" | "medium" | "wellDone" | "fallApart";

const METHODS_BY_CUT: Record<Cut, { key: Method; label: string }[]> = {
  whole: [
    { key: "roasted", label: "Roasted" },
    { key: "grilled", label: "Grilled / smoked" },
  ],
  breast: [
    { key: "seared", label: "Pan-seared" },
    { key: "roasted", label: "Roasted" },
    { key: "grilled", label: "Grilled / smoked" },
  ],
  leg: [
    { key: "confit", label: "Confit / braised" },
    { key: "roasted", label: "Roasted" },
    { key: "grilled", label: "Grilled / smoked" },
  ],
};

const OUTCOMES_BY_CUT: Record<Cut, { key: Outcome; label: string }[]> = {
  whole: [
    { key: "medium", label: "Breast medium, legs cooked through" },
    { key: "wellDone", label: "Well done throughout" },
  ],
  breast: [
    { key: "rosy", label: "Rosy / medium-rare (culinary convention)" },
    { key: "medium", label: "Medium" },
    { key: "wellDone", label: "Well done" },
  ],
  leg: [{ key: "fallApart", label: "Fall-apart tender" }],
};

interface Guidance {
  probe: string;
  pullTemp: string;
  carryover: string;
  rest: string;
  texture: string;
  isBelowUsda: boolean;
}

function getGuidance(cut: Cut, method: Method, outcome: Outcome): Guidance {
  if (cut === "leg" || outcome === "fallApart") {
    return {
      probe: "Insert the probe into the thickest part of the thigh, away from the bone.",
      pullTemp: "Confit and braised legs are pulled when fork-tender, typically well past 175°F (79°C).",
      carryover: "Minimal — legs sit in fat or liquid at low, steady heat, so temperature keeps climbing only slightly after they come out.",
      rest: "5–10 minutes, loosely covered, before serving or shredding.",
      texture: "Meat should pull cleanly from the bone with no resistance and no pink at the joint.",
      isBelowUsda: false,
    };
  }
  if (cut === "whole") {
    return {
      probe: "Probe the thickest part of the inner thigh, avoiding the bone, and check the breast separately.",
      pullTemp: "Pull the whole bird once the thigh reads 165°F (73.9°C) or higher; the breast will run hotter given its faster heat penetration.",
      carryover: "A whole roasted duck carries over 5–8°F (3–4°C) in the thigh during rest, more in a well-insulated oven-proof platter.",
      rest: "20–25 minutes, loosely tented, before carving — this also lets rendered fat settle.",
      texture: "Juices should run clear where the thigh meets the body; no pink at the joint.",
      isBelowUsda: false,
    };
  }
  // breast
  if (outcome === "rosy") {
    return {
      probe: "Insert the probe horizontally through the thickest part of the breast, parallel to the cutting board.",
      pullTemp: "A widely used culinary target is pulling at roughly 130–135°F (54–57°C) for a rosy centre.",
      carryover: "Carryover is significant on a rendered, skin-on breast — expect a 5–10°F (3–5°C) rise while resting.",
      rest: "8–10 minutes, skin side up, before slicing.",
      texture: "Centre should be a deep rose colour, warm, and yielding, not cool or translucent.",
      isBelowUsda: true,
    };
  }
  if (outcome === "medium") {
    return {
      probe: "Insert the probe horizontally through the thickest part of the breast.",
      pullTemp: "A medium target sits around 140–145°F (60–63°C) at pull, before rest.",
      carryover: "Expect a 5–8°F (3–4°C) rise during rest on a well-rendered breast.",
      rest: "8–10 minutes before slicing.",
      texture: "Centre is pale pink throughout with no red at all.",
      isBelowUsda: true,
    };
  }
  return {
    probe: "Insert the probe into the thickest part of the breast, checking more than one spot.",
    pullTemp: "Pull once the thickest point reads 165°F (73.9°C) or higher.",
    carryover: "Carryover is smaller at this point, typically 3–5°F (2–3°C), since the meat is already closer to ambient-cooking equilibrium.",
    rest: "5–8 minutes before slicing.",
    texture: "Centre is uniformly opaque with no pink; the texture is firmer and less silky than a rarer breast.",
    isBelowUsda: false,
  };
}

const METHOD_NOTE: Record<Method, string> = {
  seared: "A hot, dry pan renders skin fat quickly and heats the breast from one side, so probe from the side, not through the top.",
  roasted: "Oven heat is more even, but hot spots near the oven walls can skew a single probe reading — check more than one point.",
  confit: "Fat- or liquid-submerged cooking is gentle and forgiving; doneness is judged by texture as much as temperature.",
  grilled: "Direct flame creates uneven surface heat; move the probe away from any charred exterior before reading.",
};

export function DonenessGuide() {
  const [cut, setCut] = useState<Cut>("breast");
  const [method, setMethod] = useState<Method>("seared");
  const [outcome, setOutcome] = useState<Outcome>("rosy");

  const availableMethods = METHODS_BY_CUT[cut];
  const availableOutcomes = OUTCOMES_BY_CUT[cut];

  const activeMethod = availableMethods.some((m) => m.key === method)
    ? method
    : availableMethods[0]!.key;
  const activeOutcome = availableOutcomes.some((o) => o.key === outcome)
    ? outcome
    : availableOutcomes[0]!.key;

  const guidance = useMemo(
    () => getGuidance(cut, activeMethod, activeOutcome),
    [cut, activeMethod, activeOutcome],
  );

  useCalculatorComplete({
    calculatorName: "Duck doneness guide",
    toolSlug: "duck-doneness-guide",
    result: { cut, method: activeMethod, outcome: activeOutcome },
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <form
        className="space-y-7 rounded-sm border border-border bg-card p-6 lg:p-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            Cut
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(["whole", "breast", "leg"] as Cut[]).map((key) => (
              <label
                key={key}
                className={`cursor-pointer rounded-sm border px-3 py-3 text-center text-sm transition-colors ${
                  cut === key
                    ? "border-primary bg-secondary text-primary"
                    : "border-input text-muted-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="cut"
                  value={key}
                  checked={cut === key}
                  onChange={() => {
                    setCut(key);
                    setMethod(METHODS_BY_CUT[key][0]!.key);
                    setOutcome(OUTCOMES_BY_CUT[key][0]!.key);
                  }}
                  className="sr-only"
                />
                {key === "whole" ? "Whole duck" : key === "breast" ? "Breast" : "Leg / thigh"}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            Method
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {availableMethods.map((m) => (
              <label
                key={m.key}
                className={`cursor-pointer rounded-sm border px-3 py-3 text-center text-sm transition-colors ${
                  activeMethod === m.key
                    ? "border-primary bg-secondary text-primary"
                    : "border-input text-muted-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value={m.key}
                  checked={activeMethod === m.key}
                  onChange={() => setMethod(m.key)}
                  className="sr-only"
                />
                {m.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            Desired outcome
          </legend>
          <div className="mt-3 space-y-2">
            {availableOutcomes.map((o) => (
              <label
                key={o.key}
                className={`flex cursor-pointer items-center gap-3 rounded-sm border px-3 py-3 text-sm transition-colors ${
                  activeOutcome === o.key
                    ? "border-primary bg-secondary"
                    : "border-input hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  value={o.key}
                  checked={activeOutcome === o.key}
                  onChange={() => setOutcome(o.key)}
                  className="size-4 accent-primary"
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      <div className="space-y-6" aria-live="polite">
        <div className="rounded-sm bg-forest p-6 text-forest-foreground lg:p-8">
          <span className="eyebrow text-accent">Probe & pull</span>
          <p className="mt-4 text-sm leading-relaxed text-forest-foreground/90">{guidance.probe}</p>
          <dl className="mt-6 space-y-4 border-t border-forest-foreground/15 pt-5 text-sm">
            <div>
              <dt className="text-forest-foreground/70">Pull temperature</dt>
              <dd className="mt-1">{guidance.pullTemp}</dd>
            </div>
            <div>
              <dt className="text-forest-foreground/70">Carryover</dt>
              <dd className="mt-1">{guidance.carryover}</dd>
            </div>
            <div>
              <dt className="text-forest-foreground/70">Rest</dt>
              <dd className="mt-1">{guidance.rest}</dd>
            </div>
            <div>
              <dt className="text-forest-foreground/70">Texture check</dt>
              <dd className="mt-1">{guidance.texture}</dd>
            </div>
          </dl>
          <p className="mt-6 text-xs leading-relaxed text-forest-foreground/60">{METHOD_NOTE[activeMethod]}</p>
        </div>

        <SafetyNote>
          {guidance.isBelowUsda ? (
            <p>
              The pull temperature above is a widely used <strong>culinary convention</strong>, not
              a USDA-endorsed safe temperature. It is chosen deliberately below 165°F (73.9°C) for
              texture. Choose a well-done target instead if you are cooking for anyone at higher
              risk from foodborne illness.
            </p>
          ) : (
            <p>This target meets or exceeds the USDA minimum internal temperature for poultry.</p>
          )}
        </SafetyNote>
      </div>
    </div>
  );
}
