import { useMemo, useState } from "react";
import { useCalculatorComplete } from "@/hooks/use-calculator-complete";
import { Link } from "@tanstack/react-router";

type Cut = "whole" | "breast" | "legs" | "trim";
type SkinOn = "on" | "off";
type Provenance = "farmed" | "wild";
type Time = "under30" | "30to90" | "2hplus" | "overnight";
type Equipment = "oven" | "skillet" | "thermometer" | "grill";

interface Method {
  id: string;
  title: string;
  path: string;
  matches: (input: Inputs) => boolean;
  why: (input: Inputs) => string;
  risk: string;
  priority: number;
}

interface Inputs {
  cut: Cut;
  skin: SkinOn;
  provenance: Provenance;
  time: Time;
  equipment: Set<Equipment>;
}

const METHODS: Method[] = [
  {
    id: "seared-breast",
    title: "Pan-seared duck breast",
    path: "/cook/how-to-cook-duck-breast",
    priority: 10,
    matches: (i) =>
      i.cut === "breast" &&
      i.provenance === "farmed" &&
      i.equipment.has("skillet") &&
      i.time !== "overnight",
    why: () =>
      "You have a farmed breast, a heavy skillet, and under a couple of hours — this is the fastest route to rendered, crisp skin.",
    risk: "Skin renders unevenly in a thin or warped pan; a thermometer removes the guesswork on doneness.",
  },
  {
    id: "wild-breast",
    title: "Wild duck breast, pan-seared",
    path: "/cook/how-to-cook-wild-duck-breast",
    priority: 11,
    matches: (i) => i.cut === "breast" && i.provenance === "wild",
    why: () =>
      "Wild duck breast is leaner and cooks faster than farmed — the method and timing both change.",
    risk: "Overcooking dries wild breast quickly since there is less fat to protect it.",
  },
  {
    id: "whole-roast",
    title: "Whole roasted duck",
    path: "/cook/whole-roast-duck",
    priority: 8,
    matches: (i) =>
      i.cut === "whole" && i.equipment.has("oven") && (i.time === "2hplus" || i.time === "overnight"),
    why: () =>
      "A whole bird needs sustained oven time to render fat and cook both breast and legs through — you have the time and the oven for it.",
    risk: "Breast and legs cook at different rates; without a thermometer it is easy to overcook one while undercooking the other.",
  },
  {
    id: "confit",
    title: "Duck leg confit",
    path: "/cook/duck-leg-confit",
    priority: 9,
    matches: (i) => i.cut === "legs" && (i.time === "2hplus" || i.time === "overnight"),
    why: () =>
      "Legs are tougher than breast and reward the long, gentle cook that confit provides — you have the time for it.",
    risk: "Needs enough fat to fully submerge the legs, and low, steady heat over several hours.",
  },
  {
    id: "grilled-legs",
    title: "Grilled or smoked duck legs",
    path: "/cook/duck-leg-confit",
    priority: 5,
    matches: (i) => i.cut === "legs" && i.equipment.has("grill") && i.time !== "under30",
    why: () =>
      "You have a grill or smoker and enough time — legs hold up well to longer, indirect heat.",
    risk: "Legs need to reach a fully cooked, tender texture; flare-ups from rendering fat need managing.",
  },
  {
    id: "render-fat",
    title: "Render the fat and trim first",
    path: "/learn/how-to-render-duck-fat",
    priority: 3,
    matches: (i) => i.cut === "trim",
    why: () =>
      "Wings, carcass, and trim are best turned into rendered fat and stock rather than cooked as a standalone dish.",
    risk: "Rendering needs low, patient heat — rushing it burns the fat and adds bitterness.",
  },
  {
    id: "use-the-fat",
    title: "Put rendered fat to work",
    path: "/cook/ways-to-use-duck-fat",
    priority: 2,
    matches: (i) => i.cut === "trim" || (i.cut === "whole" && i.time === "overnight"),
    why: (i) =>
      i.cut === "trim"
        ? "Once you've rendered fat from trim, this is where to spend it."
        : "A long lead time on a whole duck is also a good moment to plan what the rendered fat becomes next.",
    risk: "Rendered fat should be strained and refrigerated promptly rather than left at room temperature.",
  },
  {
    id: "quick-fallback",
    title: "Pan-seared duck breast",
    path: "/cook/how-to-cook-duck-breast",
    priority: 1,
    matches: (i) => i.time === "under30" && i.cut !== "legs" && i.cut !== "trim",
    why: () =>
      "Under 30 minutes rules out anything slow-cooked; a hot skillet is the quickest reliable path to a cooked duck breast.",
    risk: "There is little margin for error in a short cook — a thermometer helps if you have one.",
  },
];

const FALLBACK: Method = {
  id: "fallback",
  title: "Start with rendering the fat",
  path: "/learn/how-to-render-duck-fat",
  priority: 0,
  matches: () => true,
  why: () => "Nothing in our rule set matched that exact combination — this is a safe, flexible starting point for almost any cut.",
  risk: "None specific; this is a general-purpose fallback.",
};

export function MethodFinder() {
  const [cut, setCut] = useState<Cut>("breast");
  const [skin, setSkin] = useState<SkinOn>("on");
  const [provenance, setProvenance] = useState<Provenance>("farmed");
  const [time, setTime] = useState<Time>("30to90");
  const [equipment, setEquipment] = useState<Set<Equipment>>(new Set(["skillet", "thermometer"]));

  function toggleEquipment(key: Equipment) {
    setEquipment((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const inputs: Inputs = { cut, skin, provenance, time, equipment };

  const recommendations = useMemo(() => {
    const matched = METHODS.filter((m) => m.matches(inputs))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
    return matched.length > 0 ? matched : [FALLBACK];
  }, [cut, skin, provenance, time, equipment]);

  useCalculatorComplete({
    calculatorName: "What should I cook",
    toolSlug: "what-should-i-cook",
    ready: recommendations.length > 0,
    result: {
      cut,
      skin,
      provenance,
      time_available: time,
      equipment_count: equipment.size,
      top_method: recommendations[0]?.id,
      match_count: recommendations.length,
    },
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <form
        className="space-y-7 rounded-sm border border-border bg-card p-6 lg:p-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            What cut do you have?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(
              [
                { key: "whole", label: "Whole duck" },
                { key: "breast", label: "Breast" },
                { key: "legs", label: "Legs / thighs" },
                { key: "trim", label: "Wings, carcass, trim" },
              ] as { key: Cut; label: string }[]
            ).map((o) => (
              <label
                key={o.key}
                className={`cursor-pointer rounded-sm border px-3 py-3 text-center text-sm transition-colors ${
                  cut === o.key
                    ? "border-primary bg-secondary text-primary"
                    : "border-input text-muted-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="cut"
                  value={o.key}
                  checked={cut === o.key}
                  onChange={() => setCut(o.key)}
                  className="sr-only"
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            Skin
          </legend>
          <div className="mt-3 flex gap-2">
            {(["on", "off"] as SkinOn[]).map((o) => (
              <label
                key={o}
                className={`flex-1 cursor-pointer rounded-sm border px-3 py-2 text-center text-sm transition-colors ${
                  skin === o
                    ? "border-primary bg-secondary text-primary"
                    : "border-input text-muted-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="skin"
                  value={o}
                  checked={skin === o}
                  onChange={() => setSkin(o)}
                  className="sr-only"
                />
                Skin {o}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            Wild or farmed?
          </legend>
          <div className="mt-3 flex gap-2">
            {(["farmed", "wild"] as Provenance[]).map((o) => (
              <label
                key={o}
                className={`flex-1 cursor-pointer rounded-sm border px-3 py-2 text-center text-sm capitalize transition-colors ${
                  provenance === o
                    ? "border-primary bg-secondary text-primary"
                    : "border-input text-muted-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="provenance"
                  value={o}
                  checked={provenance === o}
                  onChange={() => setProvenance(o)}
                  className="sr-only"
                />
                {o}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            Time available
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(
              [
                { key: "under30", label: "Under 30 min" },
                { key: "30to90", label: "30–90 min" },
                { key: "2hplus", label: "2 hours+" },
                { key: "overnight", label: "Overnight / make-ahead" },
              ] as { key: Time; label: string }[]
            ).map((o) => (
              <label
                key={o.key}
                className={`cursor-pointer rounded-sm border px-3 py-3 text-center text-sm transition-colors ${
                  time === o.key
                    ? "border-primary bg-secondary text-primary"
                    : "border-input text-muted-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="time"
                  value={o.key}
                  checked={time === o.key}
                  onChange={() => setTime(o.key)}
                  className="sr-only"
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            Equipment on hand
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(
              [
                { key: "oven", label: "Oven" },
                { key: "skillet", label: "Heavy skillet" },
                { key: "thermometer", label: "Thermometer" },
                { key: "grill", label: "Grill / smoker" },
              ] as { key: Equipment; label: string }[]
            ).map((o) => (
              <label key={o.key} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={equipment.has(o.key)}
                  onChange={() => toggleEquipment(o.key)}
                  className="size-4 accent-primary"
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      <div className="space-y-5" aria-live="polite">
        <span className="eyebrow text-primary">Recommended methods</span>
        {recommendations.map((m, i) => (
          <div key={m.id} className="rounded-sm border border-border bg-card p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-xl text-foreground">
                {i + 1}. {m.title}
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
              <span className="font-semibold text-foreground">Why you're seeing this: </span>
              {m.why(inputs)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Key risk: </span>
              {m.risk}
            </p>
            <Link
              to={m.path}
              className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4"
            >
              Read the full method →
            </Link>
          </div>
        ))}
        <p className="text-xs leading-relaxed text-muted-foreground">
          This is a transparent, rule-based match against the options you selected — not a
          machine-generated recommendation. Change any answer above and the list updates
          immediately.
        </p>
      </div>
    </div>
  );
}
