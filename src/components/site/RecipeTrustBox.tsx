import { ClipboardCheck } from "lucide-react";
import type { Recipe } from "@/data/recipes";

/**
 * Recipe method-basis metadata.
 *
 * Two states, driven by `recipe.verification`:
 * - Default — quiet one-line metadata naming what the method rests on
 *   (established technique plus published safety guidance). No status panel,
 *   no ledger, and no negative testing copy in reader-facing surfaces.
 * - Kitchen Verified — cooked, measured, and photographed in our kitchen, with
 *   the test date shown.
 *
 * The verified state renders only when the internal validation record actually
 * supports it, so a stray flag alone cannot produce a testing claim. Nothing
 * here emits rating or review schema.
 */
export function RecipeTrustBox({
  recipe,
  /**
   * How to read the method's numbers. Defaults to internal temperatures, which
   * is right for meat; recipes with no internal target temperature pass their
   * own so the line stays true for the dish on the page.
   */
  guidanceNote = "Cook to the stated internal temperatures rather than to the clock.",
}: {
  recipe: Recipe;
  guidanceNote?: string;
}) {
  const v = recipe.validation;
  const verified =
    recipe.verification === "kitchenVerified" &&
    Boolean(v.lastKitchenTest) &&
    (v.outcome === "pass" || v.outcome === "pass-with-revisions");

  if (!verified) {
    return (
      <p
        aria-label="Recipe method basis"
        className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground"
      >
        <span className="font-semibold text-foreground">Method basis: </span>
        established culinary technique and published food-safety guidance. {guidanceNote}{" "}
        <a href="/editorial-standards" className="text-primary underline underline-offset-4">
          Editorial standards
        </a>
      </p>
    );
  }

  return (
    <aside
      aria-label="Recipe verification status"
      className="rounded-sm border border-primary/30 bg-secondary p-5"
    >
      <div className="flex items-center gap-2.5">
        <ClipboardCheck aria-hidden="true" className="size-4 text-primary" />
        <p className="eyebrow text-primary">Kitchen verified</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground/85">
        We cooked this recipe as written, measured the actual times and internal temperatures, and
        recorded the result. Where the test disagreed with the draft, the recipe was revised before
        publication.
      </p>
      <dl className="mt-4 grid gap-x-6 gap-y-2 text-xs text-muted-foreground sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="uppercase tracking-[0.12em]">Last tested</dt>
          <dd className="text-foreground/80">{v.lastKitchenTest}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="uppercase tracking-[0.12em]">Revision</dt>
          <dd className="text-foreground/80">{v.revision}</dd>
        </div>
        {v.testedBy && (
          <div className="flex gap-2">
            <dt className="uppercase tracking-[0.12em]">Tested by</dt>
            <dd className="text-foreground/80">{v.testedBy}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="uppercase tracking-[0.12em]">Photography</dt>
          <dd className="text-foreground/80">
            {v.photoStatus === "own-kitchen" ? "Our kitchen" : "Illustrative"}
          </dd>
        </div>
      </dl>
      {v.measuredNotes.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-foreground/85">
          {v.measuredNotes.map((n) => (
            <li key={n} className="border-l-2 border-primary/40 pl-3">
              {n}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
