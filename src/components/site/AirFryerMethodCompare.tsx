import { TrackedHubLink } from "@/components/site/ThanksgivingPlan";
import {
  AIR_FRYER_OUTBOUND_PLACEMENTS,
  AIR_FRYER_VS_SKILLET,
} from "@/data/air-fryer-inbound";

/**
 * Skillet versus air fryer, side by side. Deliberately does not declare a
 * winner: the two methods trade attention, crust control and sauce against
 * mess and effort, and which one wins depends on the evening.
 */
export function AirFryerMethodCompare() {
  return (
    <section
      aria-labelledby="skillet-vs-air-fryer"
      className="mt-16 border-t border-border pt-10"
    >
      <h2
        id="skillet-vs-air-fryer"
        className="font-display text-2xl text-foreground lg:text-3xl"
      >
        Skillet versus air fryer
      </h2>
      <p className="mt-2 text-base leading-[1.75] text-foreground/85">
        Neither method is the better one in general. The air fryer trades crust control and a pan
        sauce for a hands-off cook and a contained mess; a skillet trades attention and spatter for
        a crust you can steer minute by minute.
      </p>

      <ul className="mt-6 space-y-4">
        {AIR_FRYER_VS_SKILLET.map((row) => (
          <li key={row.factor} className="border-t border-border pt-4">
            <h3 className="font-display text-lg text-foreground">{row.factor}</h3>
            <dl className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="eyebrow text-primary">Air fryer</dt>
                <dd className="mt-1 text-sm leading-relaxed text-foreground/85">{row.airFryer}</dd>
              </div>
              <div>
                <dt className="eyebrow text-muted-foreground">Skillet</dt>
                <dd className="mt-1 text-sm leading-relaxed text-foreground/85">{row.skillet}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
        <TrackedHubLink
          to="/recipes/pan-seared-duck-breast"
          placement={AIR_FRYER_OUTBOUND_PLACEMENTS.panSearedComparison}
          intent="technique_validation"
        >
          The skillet version, step by step
        </TrackedHubLink>
        <TrackedHubLink
          to="/cook/how-to-cook-duck-breast"
          placement={AIR_FRYER_OUTBOUND_PLACEMENTS.breastMethodGuide}
          intent="technique_validation"
        >
          Every duck breast method compared
        </TrackedHubLink>
      </div>

      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-6">
        <TrackedHubLink
          to="/learn/how-to-score-duck-breast"
          placement={AIR_FRYER_OUTBOUND_PLACEMENTS.scoringGuide}
          intent="technique_validation"
        >
          How deep to score the fat cap
        </TrackedHubLink>
        <TrackedHubLink
          to="/learn/duck-breast-temperature-doneness"
          placement={AIR_FRYER_OUTBOUND_PLACEMENTS.donenessGuide}
          intent="technique_validation"
        >
          Doneness temperatures explained
        </TrackedHubLink>
      </div>
    </section>
  );
}
