import { TrackedHubLink } from "@/components/site/ThanksgivingPlan";
import { AIR_FRYER_RECIPE_PATH } from "@/data/air-fryer-inbound";

/**
 * One contextual, tracked entry point into the air fryer duck breast recipe,
 * dropped once into a related page. A sentence rather than a module: the pages
 * that link here already have their own job to do.
 */
export function AirFryerRecipeLink({
  placement,
  children,
  className = "",
}: {
  placement: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-base leading-[1.75] text-foreground/85 ${className}`}>
      {children}{" "}
      <TrackedHubLink
        to={AIR_FRYER_RECIPE_PATH}
        placement={placement}
        intent="technique_validation"
      >
        Air fryer duck breast
      </TrackedHubLink>
    </p>
  );
}
