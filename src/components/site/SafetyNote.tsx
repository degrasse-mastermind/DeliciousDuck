import { ShieldAlert } from "lucide-react";
import { USDA_SAFETY_LINE } from "@/data/sources";

/**
 * The single safety block used anywhere temperature is discussed. Keeps the
 * USDA recommendation visually and verbally separate from culinary practice.
 */
export function SafetyNote({
  children,
  heading = "Food safety: the USDA number",
}: {
  children?: React.ReactNode;
  heading?: string;
}) {
  return (
    <aside
      aria-label="Food safety guidance"
      className="rounded-sm border border-destructive/30 bg-destructive/5 p-5"
    >
      <div className="flex items-center gap-2.5">
        <ShieldAlert aria-hidden="true" className="size-4 text-destructive" />
        <h2 className="eyebrow text-destructive">{heading}</h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{USDA_SAFETY_LINE}</p>
      {children && (
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/85">{children}</div>
      )}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Lower internal temperatures are a widespread culinary convention for duck breast, not a USDA
        safety recommendation. Cooking below 165°F carries risk, and that risk is higher for young
        children, older adults, pregnant people, and anyone immunocompromised.
      </p>
    </aside>
  );
}
