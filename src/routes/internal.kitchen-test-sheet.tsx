import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { RECIPES, formatMinutes, totalTimeMinutes } from "@/data/recipes";
import { recipeContentBySlug } from "@/data/recipe-content";

/**
 * Internal kitchen test sheet — owner tool, not site content.
 *
 * noindex/nofollow, excluded from the sitemap and from the site search index,
 * and not linked from any public navigation. Client-side only: nothing typed
 * here is stored or transmitted anywhere, which is stated on the page itself.
 */
export const Route = createFileRoute("/internal/kitchen-test-sheet")({
  head: () => ({
    meta: [
      { title: "Kitchen Test Sheet (internal) | DeliciousDuck" },
      {
        name: "description",
        content:
          "Internal kitchen validation worksheet for DeliciousDuck flagship recipes. Not public content.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: KitchenTestSheet,
});

interface Field {
  label: string;
  hint?: string;
  lines?: number;
}

const SECTIONS: { heading: string; fields: Field[] }[] = [
  {
    heading: "1 · Setup",
    fields: [
      { label: "Test date" },
      { label: "Tester" },
      { label: "Recipe revision being tested", hint: "e.g. 1.0" },
      { label: "Duck source / merchant", hint: "Where the bird or cut was bought" },
      { label: "Duck starting weight", hint: "Grams and oz, straight from the fridge" },
      { label: "Breast thickness at centre", hint: "mm / in — drives the render window" },
      { label: "Fridge-to-counter temper time" },
    ],
  },
  {
    heading: "2 · Ingredients as actually weighed",
    fields: [
      { label: "Salt: weight used and % of meat weight" },
      { label: "Any ingredient swapped or omitted", lines: 2 },
      { label: "Fat / oil quantity actually used" },
      { label: "Aromatics and quantities", lines: 2 },
    ],
  },
  {
    heading: "3 · Equipment used",
    fields: [
      { label: "Pan or roasting vessel (material and size)" },
      { label: "Thermometer model, and ice-bath check passed?" },
      { label: "Oven / smoker used, and dial vs measured air temp" },
      { label: "Other equipment" },
    ],
  },
  {
    heading: "4 · Timings and temperatures measured",
    fields: [
      { label: "Actual prep time (minutes)" },
      { label: "Actual cook time (minutes)" },
      { label: "Pan heat setting and observed surface behaviour", lines: 2 },
      { label: "Oven / smoker temperature held" },
      { label: "Render time before flip (breast)" },
      { label: "Internal temperature readings with times", hint: "Log every probe read", lines: 4 },
      { label: "Peak internal temperature reached" },
      { label: "Carryover rise during rest" },
      { label: "Resting time" },
    ],
  },
  {
    heading: "5 · Result assessment",
    fields: [
      { label: "Skin crispness (1–5) and description", lines: 2 },
      { label: "Fat fully rendered? Any unrendered layer left?" },
      { label: "Doneness of meat at centre — colour and texture", lines: 2 },
      { label: "Seasoning balance — under, correct, or over" },
      { label: "Sauce yield (ml) and consistency" },
      { label: "Rendered fat collected (ml)" },
      { label: "Servings actually produced" },
    ],
  },
  {
    heading: "6 · Deviations and verdict",
    fields: [
      { label: "Deviations from the published method", lines: 3 },
      { label: "What the recipe should say differently", lines: 4 },
      { label: "Photo captured? (own-kitchen hero + step shots)" },
      { label: "Final verdict: pass / pass with revisions / fail" },
      { label: "New revision number to publish" },
    ],
  },
];

const BREAST_SLUG = "pan-seared-duck-breast";

const USDA_NOTE =
  "USDA recommends cooking all poultry, including duck, to an internal temperature of 165°F (73.9°C). Any lower culinary target recorded here is a texture preference, not a USDA safety recommendation.";

const BREAST_PROTOCOL: { group: string; items: { label: string; hint?: string }[] }[] = [
  {
    group: "A · Before any heat",
    items: [
      {
        label: "Record each breast weight individually (g and oz)",
        hint: "Weigh separately — do not average two breasts together.",
      },
      { label: "Record centre thickness of each breast (mm / in)" },
      {
        label: "Record skin-on? farmed or wild? source / brand if known",
        hint: "Breed, merchant, packaging claims.",
      },
      {
        label: "Weigh the salt actually used (g)",
        hint: "Use the 1.0% helper below as a target only; enter what you truly used.",
      },
      { label: "Photograph raw skin BEFORE scoring", hint: "Minimum evidence photo." },
      { label: "Record scoring pattern and depth", hint: "e.g. 1 cm diamond, through skin only." },
      { label: "Photograph the scored skin", hint: "Minimum evidence photo." },
    ],
  },
  {
    group: "B · Render",
    items: [
      {
        label: "Confirm start: cold, dry, unoiled pan — skin down",
        hint: "Tick only if the pan was genuinely cold and no fat was added.",
      },
      { label: "Burner setting used (and hob type)" },
      {
        label: "Clock time when the first gentle rendering begins",
        hint: "The moment you hear/see steady quiet sizzle, not a hard fry.",
      },
      { label: "Fat poured off — how many times, and roughly how much each time" },
      { label: "Actual flip time (minutes from pan-down)" },
    ],
  },
  {
    group: "C · Finish and rest",
    items: [
      {
        label: "Internal temp at flip (°F/°C)",
        hint: "Probe from the side into the thickest centre, not from the top.",
      },
      { label: "Internal temp at pull (°F/°C)", hint: "Side probe, thickest centre." },
      { label: "Rest duration (minutes) and where it rested" },
      { label: "Post-rest internal temp and carryover rise" },
      { label: "Photograph skin immediately after rest", hint: "Minimum evidence photo." },
      { label: "Photograph the sliced cross-section", hint: "Minimum evidence photo." },
    ],
  },
  {
    group: "D · Rate the result",
    items: [
      { label: "Skin crispness (1–5) plus one sentence" },
      { label: "Remaining unrendered fat layer (none / thin / thick)" },
      { label: "Juiciness and tenderness (1–5)" },
      { label: "Seasoning (under / correct / over)" },
      {
        label: "Did the published 12–18 minute render window match reality?",
        hint: "If not, record the window you actually observed.",
      },
    ],
  },
];

const SHOT_LIST: { shot: string; kind: "Minimum evidence" | "Optional editorial" }[] = [
  { shot: "Raw breast and skin, before scoring", kind: "Minimum evidence" },
  { shot: "Scored skin, close up", kind: "Minimum evidence" },
  { shot: "Cold-pan start, skin down", kind: "Minimum evidence" },
  { shot: "Mid-render fat release in the pan", kind: "Minimum evidence" },
  { shot: "Finished skin immediately after rest", kind: "Minimum evidence" },
  { shot: "Sliced interior cross-section", kind: "Minimum evidence" },
  { shot: "Side-probe thermometer read, if practical to shoot safely", kind: "Optional editorial" },
  { shot: "Plated hero shot", kind: "Optional editorial" },
];

const TEMP_ROWS = [
  "First render activity",
  "5 minutes",
  "10 minutes",
  "15 minutes",
  "Flip",
  "Pull",
  "Post-rest",
];

function TextInput({ className = "" }: { className?: string }) {
  return (
    <input
      type="text"
      className={`h-11 w-full rounded-sm border border-input bg-card px-3 text-base text-foreground ${className}`}
    />
  );
}

function SaltHelper() {
  const [weight, setWeight] = useState("");
  const grams = Number.parseFloat(weight);
  const target = Number.isFinite(grams) && grams > 0 ? (grams * 0.01).toFixed(1) : null;

  return (
    <div className="mt-5 rounded-sm border border-border bg-cream p-4">
      <h3 className="text-sm font-semibold text-foreground">Salt target helper (1.0%)</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Informational only. This does not fill in the actual-salt-used field above — record what you
        really weighed there.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="salt-weight"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground"
          >
            Total breast weight (g)
          </label>
          <input
            id="salt-weight"
            type="number"
            min="0"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-2 h-11 w-40 rounded-sm border border-input bg-card px-3 text-base text-foreground"
          />
        </div>
        <p className="text-sm text-foreground/85" aria-live="polite">
          1.0% salt target:{" "}
          <strong className="text-foreground">{target ? `${target} g` : "—"}</strong>
        </p>
      </div>
    </div>
  );
}

function BreastProtocol() {
  return (
    <>
      <section className="mt-10 break-inside-avoid border-t border-border pt-8">
        <p className="eyebrow text-primary">Flagship test</p>
        <h2 className="mt-2 font-display text-2xl text-foreground">
          Duck Breast Verification Protocol
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Work top to bottom during the cook. Tick each checkpoint as it happens and write the
          measured value beside it.
        </p>

        {BREAST_PROTOCOL.map((group) => (
          <div key={group.group} className="mt-6 break-inside-avoid">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
              {group.group}
            </h3>
            <ul className="mt-3 space-y-4">
              {group.items.map((item) => (
                <li key={item.label} className="flex gap-3">
                  <input
                    type="checkbox"
                    aria-label={`Done: ${item.label}`}
                    className="mt-1.5 size-4 shrink-0 rounded-sm border-input accent-primary"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-foreground">{item.label}</span>
                    {item.hint && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.hint}</p>
                    )}
                    <TextInput className="mt-2" />
                  </div>
                </li>
              ))}
            </ul>
            {group.group.startsWith("A") && <SaltHelper />}
          </div>
        ))}
      </section>

      <section className="mt-10 break-inside-avoid border-t border-border pt-8">
        <h2 className="font-display text-2xl text-foreground">Render and temperature log</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Checkpoint
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Time
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Internal temp (if measured)
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Observation — skin colour, fat pool depth, edge curl
                </th>
              </tr>
            </thead>
            <tbody>
              {TEMP_ROWS.map((row) => (
                <tr key={row} className="border-b border-border align-top">
                  <th scope="row" className="w-40 py-2 pr-3 text-left font-semibold text-foreground">
                    {row}
                  </th>
                  <td className="py-2 pr-3">
                    <TextInput />
                  </td>
                  <td className="py-2 pr-3">
                    <TextInput />
                  </td>
                  <td className="py-2">
                    <TextInput />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{USDA_NOTE}</p>
      </section>

      <section className="mt-10 break-inside-avoid rounded-sm border border-primary/30 bg-cream p-5">
        <h2 className="eyebrow text-primary">Pass standard for this recipe</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/85">
          Pan-seared duck breast may be marked <code>kitchenVerified</code> only when{" "}
          <strong className="text-foreground">all four</strong> of the following are true:
        </p>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>1. A real cook of the published method was completed in our own kitchen.</li>
          <li>2. Own-kitchen photos exist — at minimum every shot marked minimum evidence below.</li>
          <li>3. Measured notes are recorded: weights, timings, and probe reads, not impressions.</li>
          <li>
            4. The tester explicitly chooses <strong className="text-foreground">pass</strong> — not
            &quot;pass with revisions&quot;, and not fail.
          </li>
        </ol>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A doneness temperature is never a pass condition. {USDA_NOTE}
        </p>
      </section>

      <section className="mt-10 break-inside-avoid border-t border-border pt-8">
        <h2 className="font-display text-2xl text-foreground">Photo shot list</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {SHOT_LIST.map((s) => (
            <li key={s.shot} className="flex items-start gap-3 border-b border-border pb-2">
              <input
                type="checkbox"
                aria-label={`Captured: ${s.shot}`}
                className="mt-1 size-4 shrink-0 rounded-sm border-input accent-primary"
              />
              <span className="flex-1 text-foreground/85">{s.shot}</span>
              <span
                className={`shrink-0 text-xs font-semibold uppercase tracking-[0.1em] ${
                  s.kind === "Minimum evidence" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {s.kind}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function KitchenTestSheet() {
  const [slug, setSlug] = useState(
    RECIPES.find((r) => r.slug === BREAST_SLUG)?.slug ?? RECIPES[0]!.slug,
  );
  const recipe = useMemo(() => RECIPES.find((r) => r.slug === slug)!, [slug]);
  const content = recipeContentBySlug(slug);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <header className="print:hidden">
        <p className="eyebrow text-primary">Internal tool · not public content</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground lg:text-5xl">
          Kitchen Test Sheet
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Pick a flagship recipe, print this sheet, and fill it in while you cook. Every field maps
          onto the internal validation record in <code>src/data/recipes.ts</code>, so a completed
          sheet can be transferred field-for-field and the recipe flipped from working draft to
          kitchen verified.
        </p>
        <aside className="mt-5 rounded-sm border border-border bg-cream p-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Nothing is saved.</strong> This page has no database
          and no storage — anything typed into a field is lost on reload. Print it, or write the
          results straight into the recipe data afterwards.
        </aside>

        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div>
            <label
              htmlFor="recipe"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
            >
              Recipe under test
            </label>
            <select
              id="recipe"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-2 h-12 min-w-[18rem] rounded-sm border border-input bg-card px-3 text-base text-foreground"
            >
              {RECIPES.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-forest-deep"
          >
            <Printer aria-hidden="true" className="size-4" />
            Print sheet
          </button>
        </div>
      </header>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="font-display text-3xl leading-tight text-foreground">{recipe.name}</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          {[
            ["Published prep", formatMinutes(recipe.prepTimeMinutes)],
            ["Published cook", formatMinutes(recipe.cookTimeMinutes)],
            ["Published total", formatMinutes(totalTimeMinutes(recipe))],
            ["Published yield", recipe.recipeYield],
            ["Key technique", recipe.keyTechnique],
            ["Current status", recipe.verification === "kitchenVerified" ? "Kitchen verified" : "Editorial working draft"],
            ["Current revision", recipe.validation.revision],
            ["Last kitchen test", recipe.validation.lastKitchenTest ?? "Never"],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2 border-b border-border py-1.5">
              <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
              <dd className="text-foreground/85">{value}</dd>
            </div>
          ))}
        </dl>

        {content && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="eyebrow text-primary">Published ingredients to weigh</h3>
              <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-foreground/85">
                {content.ingredientGroups.flatMap((g) => g.items).map((i) => (
                  <li key={i} className="border-l-2 border-primary/20 pl-3">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="eyebrow text-primary">Published steps to time</h3>
              <ol className="mt-3 space-y-1.5 text-sm leading-relaxed text-foreground/85">
                {content.steps.map((s, i) => (
                  <li key={s.title} className="border-l-2 border-border pl-3">
                    {i + 1}. {s.title}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </section>

      <section className="mt-8 break-inside-avoid rounded-sm border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
          Do not change the recipe yet
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This sheet is evidence collection only. DeliciousDuck should update the published method,
          timings, temperatures, or trust status only after the completed results have been reviewed
          — never mid-cook and never from memory.
        </p>
      </section>

      {slug === BREAST_SLUG && <BreastProtocol />}

      {SECTIONS.map((section) => (
        <section key={section.heading} className="mt-10 break-inside-avoid border-t border-border pt-8">
          <h2 className="font-display text-2xl text-foreground">{section.heading}</h2>
          <div className="mt-5 space-y-5">
            {section.fields.map((field) => (
              <div key={field.label}>
                <label className="text-sm font-semibold text-foreground">{field.label}</label>
                {field.hint && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{field.hint}</p>
                )}
                {field.lines && field.lines > 1 ? (
                  <textarea
                    rows={field.lines}
                    className="mt-2 w-full rounded-sm border border-input bg-card px-3 py-2 text-base text-foreground"
                  />
                ) : (
                  <input
                    type="text"
                    className="mt-2 h-11 w-full rounded-sm border border-input bg-card px-3 text-base text-foreground"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-10 break-inside-avoid rounded-sm border border-border bg-cream p-5 text-sm leading-relaxed text-muted-foreground">
        <h2 className="eyebrow text-primary">Transferring results into the site</h2>
        <ol className="mt-3 space-y-2">
          <li>
            1. Open <code>src/data/recipes.ts</code> and find this recipe&apos;s{" "}
            <code>validation</code> block.
          </li>
          <li>
            2. Set <code>lastKitchenTest</code> (ISO date), <code>testedBy</code>,{" "}
            <code>outcome</code>, and bump <code>revision</code>.
          </li>
          <li>
            3. Put measured times and probe reads into <code>measuredNotes</code>, and changes into{" "}
            <code>testerNotes</code>.
          </li>
          <li>
            4. Set <code>photoStatus: &quot;own-kitchen&quot;</code> once your own photos replace the
            illustrative images.
          </li>
          <li>
            5. Only then change <code>verification</code> to{" "}
            <code>&quot;kitchenVerified&quot;</code>. Apply any method or temperature revisions to{" "}
            <code>src/data/recipe-content.ts</code> in the same pass.
          </li>
          <li>
            6. Never reduce a stated safety temperature: USDA guidance for duck remains 165°F
            (73.9°C), and that number stays on the page regardless of test results.
          </li>
        </ol>
      </section>
    </div>
  );
}
