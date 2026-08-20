import type { ReactNode } from "react";
import { useModuleImpression } from "@/hooks/useModuleImpression";
import { trackConversionModuleView } from "@/lib/analytics";
import type {
  DestinationType,
  ModulePlacement,
  ModuleType,
} from "@/lib/impression-events";

/**
 * ModuleImpression — a transparent wrapper that emits one honest
 * `conversion_module_view` when a high-value module becomes meaningfully
 * visible.
 *
 * It renders a plain `<div>` with `display: contents`-free layout semantics
 * avoided on purpose: the wrapper is a normal block element so the observed box
 * matches the module's own box. Pass `className` when the module needs the
 * wrapper to be layout-neutral in a grid.
 *
 * One event per module, never per link: clicks keep their existing
 * `internal_conversion_click` / `affiliate_click` / `merchant_click` semantics.
 */
export function ModuleImpression({
  placement,
  moduleType,
  destinationType,
  intent,
  className,
  children,
}: {
  placement: ModulePlacement | string;
  moduleType: ModuleType;
  destinationType: DestinationType;
  intent?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}) {
  const ref = useModuleImpression<HTMLDivElement>(() =>
    trackConversionModuleView({ placement, moduleType, destinationType, intent }),
  );

  return (
    <div ref={ref} {...(className ? { className } : {})}>
      {children}
    </div>
  );
}
