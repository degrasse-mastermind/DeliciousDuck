import { ClipboardCheck, FlaskConical } from "lucide-react";
import type { Recipe } from "@/data/recipes";

/**
 * Recipe trust box.
 *
 * Two states only, driven by `recipe.verification`:
 * - Editorial Working Draft — written from established technique and published
 *   safety guidance, not yet cooked and measured in our kitchen.
 * - Kitchen Verified — cooked, measured, and photographed in our kitchen, with
 *   the test date shown.
 *
 * The verified state renders only when the internal validation record actually
 * supports it, so a stray flag alone cannot produce a testing claim. Nothing
 * here emits rating or review schema.
 */
export function RecipeTrustBox({ recipe }: { recipe: Recipe }) {
  const v = recipe.validation;
  const verified =
    recipe.verification === "kitchenVerified" &&
    Boolean(v.lastKitchenTest) &&
    (v.outcome === "pass" || v.outcome === "pass-with-revisions");

  if (!verified) {
    return (
      <aside
        aria-label="Recipe verification status"
        className="rounded-sm border border-border bg-cream p-5"
      >
        <div className="flex items-center gap-2.5">
          <FlaskConical aria-hidden="true" className="size-4 text-primary" />
          <p className="eyebrow text-primary">Editorial working draft</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This recipe is an editorial working draft: the method, timings, and temperatures follow
          established technique and published food-safety guidance, but it has not yet been cooked
          and measured in the DeliciousDuck kitchen. Cook to the stated internal temperatures
          rather than to the clock. See our{" "}
          <a href="/editorial-standards" className="text-primary underline underline-offset-4">
            editorial standards
          </a>{" "}
          for how a recipe moves from working draft to kitchen verified.
        </p>
        <dl className="mt-4 grid gap-x-6 gap-y-2 text-xs text-muted-foreground sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="uppercase tracking-[0.12em]">Status</dt>
            <dd className="text-foreground/80">Not yet kitchen tested</dd>
          </div>
          <div className="flex gap-2">
            <dt className="uppercase tracking-[0.12em]">Revision</dt>
            <dd className="text-foreground/80">{v.revision}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="uppercase tracking-[0.12em]">Photography</dt>
            <dd className="text-foreground/80">
              {v.photoStatus === "own-kitchen" ? "Our kitchen" : "Illustrative, not of this cook"}
            </dd>
          </div>
        </dl>
      </aside>
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
