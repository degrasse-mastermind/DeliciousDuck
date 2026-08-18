/**
 * Site-wide CTA hierarchy — one reusable source of truth.
 *
 * Four levels, differentiated by shape, weight and icon as well as colour, so
 * nothing depends on colour alone:
 *
 * - `CTA.primary`     warm-gold filled button, deep-forest label. The single
 *                     dominant action in a section (lead magnet, key tool).
 * - `CTA.commercial`  deep-forest filled button for outbound purchase actions.
 *                     Always paired with an external/shopping icon.
 * - `CTA.secondary`   bordered/outline button for the alternative action.
 * - `CTA.tertiary`    underlined text link with an arrow for internal editorial
 *                     links. Never button-styled.
 *
 * Every button level clears a 44px tap target (`min-h-11`) and carries a visible
 * keyboard focus ring.
 */

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

const BUTTON_BASE =
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${FOCUS}`;

export const CTA = {
  /** Dominant action. High-contrast warm gold on deep forest text. */
  primary: `${BUTTON_BASE} bg-accent text-gold-foreground hover:bg-gold-soft`,
  /** Dominant action, compact — tight headers on small screens. Still 44px tall. */
  primaryCompact: `inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sm bg-accent px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gold-foreground transition-colors hover:bg-gold-soft ${FOCUS}`,
  /** Outbound commercial action. Distinct filled deep-forest treatment. */
  commercial: `${BUTTON_BASE} bg-forest text-forest-foreground hover:bg-forest-deep`,
  /** Alternative action. Bordered, never filled. */
  secondary: `${BUTTON_BASE} border border-primary/45 bg-transparent text-primary hover:border-primary hover:bg-secondary`,
  /** Same as secondary, for use on the dark forest hero. */
  secondaryOnDark: `${BUTTON_BASE} border border-forest-foreground/45 bg-transparent text-forest-foreground hover:border-accent hover:text-accent`,
  /** Internal editorial link. Underlined text, arrow affordance. */
  tertiary: `inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-4 decoration-primary/40 transition-colors hover:decoration-primary ${FOCUS}`,
  /** Tertiary link at eyebrow scale, for card footers and lists. */
  tertiarySmall: `inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary underline underline-offset-4 decoration-primary/40 transition-colors hover:decoration-primary ${FOCUS}`,
} as const;

/** Pale-warm panel used to lift commercial recommendations out of article copy. */
export const COMMERCE_PANEL =
  "rounded-sm border border-accent/35 bg-cream/70 p-5 sm:p-6";

/** Decision labels used consistently across every commercial module. */
export const DECISION_LABELS = {
  bestFor: "Best for",
  standsOut: "Why it stands out",
  check: "What to check",
} as const;
