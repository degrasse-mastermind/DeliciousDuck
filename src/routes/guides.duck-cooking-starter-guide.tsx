import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { ArticleShell, Section, DataTable, StepList, Callout } from "@/components/site/ArticleShell";
import { QuackFix } from "@/components/site/QuackFix";
import { SafetyNote } from "@/components/site/SafetyNote";
import { UseTheWholeDuck } from "@/components/site/UseTheWholeDuck";
import { GamePlanCta } from "@/components/site/GamePlanCta";
import { STARTER_GUIDE } from "@/data/starter-guide";
import { trackStarterGuidePrint, trackStarterGuideView } from "@/lib/analytics";
import { articleSchema, breadcrumbSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/guides/duck-cooking-starter-guide")({
  head: () => ({
    ...pageMeta({
      title: STARTER_GUIDE.seoTitle,
      description: STARTER_GUIDE.description,
      path: STARTER_GUIDE.path,
      ogType: "article",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Guides", item: STARTER_GUIDE.path },
          { name: STARTER_GUIDE.title, item: STARTER_GUIDE.path },
        ]),
      ),
      ldScript(
        articleSchema({
          headline: STARTER_GUIDE.title,
          description: STARTER_GUIDE.description,
          path: STARTER_GUIDE.path,
        }),
      ),
    ],
  }),
  component: StarterGuidePage,
});

/**
 * `anchor` is required alongside `to`: a checklist row links out with a phrase
 * that names its destination, never a bare "Read more". Generic anchors give
 * crawlers and screen-reader link lists nothing to go on.
 */
const CHECKLIST: { item: string; why: string; to?: string; anchor?: string }[] = [
  {
    item: "Instant-read thermometer",
    why: "The only way to know where a duck breast or leg actually is inside. Buy this before anything else.",
    to: "/gear/best-thermometer-for-duck",
    anchor: "How to choose a duck thermometer",
  },
  {
    item: "Heavy skillet you trust on low heat",
    why: "Duck breast starts in a cold, dry pan and renders slowly; thin pans run hot and scorch the fat.",
    to: "/gear/best-pan-for-duck-breast",
    anchor: "Choosing a pan for duck breast",
  },
  {
    item: "Small sharp knife with a controllable tip",
    why: "Scoring is shallow, precise work. A large blade makes depth harder to feel.",
    to: "/gear/best-knife-for-scoring-duck",
    anchor: "Choosing a knife for scoring skin",
  },
  {
    item: "Paper towels",
    why: "A dry surface is the single biggest lever on crisp skin. Pat, then pat again.",
  },
  {
    item: "Rack and a tray (for whole birds)",
    why: "Lets rendered fat drain away and air circulate under the bird instead of steaming its underside.",
  },
  {
    item: "Heatproof jar or container",
    why: "For the rendered fat you pour off — the most valuable byproduct in the kitchen.",
    to: "/learn/how-to-render-duck-fat",
    anchor: "How to render and store duck fat",
  },
];

function StarterGuidePage() {
  useEffect(() => {
    // Genuine view only: fires once per mount, after hydration. No PII.
    trackStarterGuideView({ path: STARTER_GUIDE.path });
  }, []);

  function handlePrint() {
    trackStarterGuidePrint({ path: STARTER_GUIDE.path });
    if (typeof window !== "undefined") window.print();
  }

  return (
    <ArticleShell
      eyebrow="Starter guide"
      title={STARTER_GUIDE.title}
      intro="A concise reference for your first duck: what makes it different from chicken, which cut to start with, the five techniques that decide the result, and what to buy before you begin."
      trail={[{ name: STARTER_GUIDE.title, to: STARTER_GUIDE.path }]}
      meta={`${STARTER_GUIDE.minutes} min read · First-party guide`}
    >
      <div data-print-hide className="mb-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex h-11 items-center gap-2 rounded-sm bg-primary px-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-forest-deep"
        >
          <Printer aria-hidden="true" className="size-4" />
          Print the quick reference
        </button>
        <span className="text-sm text-muted-foreground">
          Prints the checklist, temperatures, and technique block only. Want a plan for the duck

          you&apos;re actually cooking?{" "}
          <Link to="/tools/duck-game-plan" className="text-primary underline underline-offset-4">
            Build your Duck Game Plan
          </Link>
          .
        </span>
      </div>

      <GamePlanCta id="game-plan_starter-guide" tone="quiet" className="mb-10" />


      <Section id="start-here" heading="Start here: duck is not chicken">
        <p>
          Almost every problem a first-time duck cook runs into comes from treating duck as a darker
          chicken. Two differences drive nearly all of it. First, fat: duck breast carries a thick
          fat cap under the skin that has to be melted out slowly before the skin can crisp, and a
          whole duck sits in its own rendering fat as it roasts. Second, muscle type: duck breast is
          a dark, well-exercised muscle that most cooks treat like a steak, while the legs are
          connective-tissue-heavy and want long, slow cooking.
        </p>
        <p>
          Add real variability — fat cap thickness, bird size, farmed versus wild, breed — and you
          get the third rule: cook duck to a temperature, never to a clock. Times on this site and
          in our calculators are planning estimates. The thermometer is the decision-maker.
        </p>
      </Section>

      <Section id="cut-chooser" heading="Cut chooser: which duck to start with">
        <DataTable
          caption="Choosing your first cut"
          columns={["Cut", "Cook it like", "Choose it when", "Start here"]}
          rows={[
            [
              "Duck breast",
              "A steak: cold dry pan, skin down, gradual render, short rest",
              "You want a 30-minute result and full control over doneness",
              "How to Cook Duck Breast",
            ],
            [
              "Whole duck",
              "A roast: long oven time, fat drained off, skin dried in advance",
              "You're cooking for a table and want fat plus a carcass out of it",
              "Whole Roast Duck",
            ],
            [
              "Legs",
              "A braise or confit: low and slow until the meat gives way",
              "You want the most forgiving cut in the bird",
              "Duck Leg Confit",
            ],
            [
              "Wild duck",
              "Leaner, stronger, less fat to render; shorter cooking window",
              "You've been given birds and don't want to waste them",
              "How to Cook Wild Duck Breast",
            ],
          ]}
        />
        <ul className="mt-6 grid gap-2 text-base leading-[1.7]">
          <li>
            <Link to="/cook/how-to-cook-duck-breast" className="text-primary underline underline-offset-4">
              How to Cook Duck Breast
            </Link>{" "}
            — the cold-pan method, start to finish.
          </li>
          <li>
            <Link to="/cook/whole-roast-duck" className="text-primary underline underline-offset-4">
              Whole Roast Duck
            </Link>{" "}
            — drying, timing, and fat management for a full bird.
          </li>
          <li>
            <Link to="/cook/duck-leg-confit" className="text-primary underline underline-offset-4">
              Duck Leg Confit
            </Link>{" "}
            — the most forgiving introduction to duck.
          </li>
          <li>
            <Link
              to="/cook/how-to-cook-wild-duck-breast"
              className="text-primary underline underline-offset-4"
            >
              How to Cook Wild Duck Breast
            </Link>{" "}
            and{" "}
            <Link
              to="/learn/wild-duck-vs-farmed-duck"
              className="text-primary underline underline-offset-4"
            >
              wild versus farmed
            </Link>
            .
          </li>
        </ul>
      </Section>

      <div data-print-block>
        <Section id="five-techniques" heading="The five techniques that matter most">
          <StepList
            steps={[
              {
                title: "Dry the surface — properly",
                body: "Pat the skin dry with paper towels, and for a whole bird leave it uncovered in the fridge for several hours or overnight. Water on the surface has to boil off before browning can start, and that steam is the most common reason skin ends up pale and rubbery.",
                watchFor: "Skin that looks matte and slightly tacky rather than damp and shiny.",
              },
              {
                title: "Score the fat cap, not the meat",
                body: "On breast, cut a shallow grid through the full thickness of the fat and stop at the membrane above the muscle. That multiplies exposed fat surface and gives melted fat a route out.",
                watchFor: "A change in resistance under the blade — that's the membrane. Stop there.",
              },
              {
                title: "Render fat gradually over low heat",
                body: "Breast goes into a cold, dry pan skin-side down over low-to-moderate heat so the fat has time to melt before the skin sets. Pour off the fat as it collects. Rushing this with high heat browns the skin before the fat underneath has rendered.",
                watchFor: "A steady, quiet sizzle — not an aggressive crackle.",
              },
              {
                title: "Use a thermometer, every time",
                body: "Probe the thickest part of the muscle, away from bone. Duck varies too much for a time chart to be authoritative, and carry-over heat keeps climbing after the pan or oven.",
                watchFor: "Pull before your target if you're resting the meat; it will continue to rise.",
              },
              {
                title: "Rest before slicing or carving",
                body: "Give breast several minutes and a whole bird longer before cutting. Slicing immediately dumps juice onto the board and drops the eating temperature faster than resting does.",
                watchFor: "Rest skin-side up, uncovered — a foil tent softens the crust you just built.",
              },
            ]}
          />
        </Section>

        <Section id="temperature" heading="Temperature and safety quick reference">
          <SafetyNote>
            <p>
              Treat 165°F (73.9°C) as the official target for whole birds and pieces. Anything below
              that is a culinary convention, not a safety recommendation, and the decision is yours
              to make with full information.
            </p>
          </SafetyNote>
          <DataTable
            caption="Reference points — official safety guidance versus common culinary practice"
            columns={["What", "Number", "Status"]}
            rows={[
              [
                "USDA minimum for duck (whole and pieces)",
                "165°F / 73.9°C",
                "Official food-safety guidance",
              ],
              [
                "Duck breast served pink",
                "Commonly 130–140°F / 54–60°C",
                "Widespread culinary convention — below USDA guidance, carries risk",
              ],
              [
                "Duck legs, braised or confit",
                "Well past 165°F, cooked until tender",
                "Culinary endpoint that also exceeds safety guidance",
              ],
              [
                "Higher-risk eaters (children, older adults, pregnancy, immunocompromised)",
                "165°F / 73.9°C",
                "Follow official guidance, no exceptions",
              ],
            ]}
          />
          <p className="mt-6">
            Full detail:{" "}
            <Link
              to="/learn/duck-breast-temperature-doneness"
              className="text-primary underline underline-offset-4"
            >
              duck breast temperature and doneness
            </Link>
            , or work it through interactively with the{" "}
            <Link to="/tools/duck-doneness-guide" className="text-primary underline underline-offset-4">
              duck doneness guide
            </Link>
            .
          </p>
        </Section>

        <Section id="checklist" heading="Your first duck shopping checklist">
          <p>
            Six things cover every method on this site. The gear pages explain how we think about
            each category and what the trade-offs are, using published specifications and the
            requirements of the methods themselves.
          </p>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {CHECKLIST.map((entry) => (
              <li key={entry.item} className="py-4">
                <p className="font-display text-lg text-foreground">{entry.item}</p>
                <p className="mt-1 text-base leading-[1.7] text-muted-foreground">
                  {entry.why}
                  {entry.to && (
                    <>
                      {" "}
                      <Link to={entry.to} className="text-primary underline underline-offset-4">
                        {entry.anchor ?? entry.item}
                      </Link>
                      .
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            Sourcing the bird itself:{" "}
            <Link to="/buy/where-to-buy-duck-online" className="text-primary underline underline-offset-4">
              where to buy duck online
            </Link>
            , and{" "}
            <Link to="/buy/duck-fat-buying-guide" className="text-primary underline underline-offset-4">
              buying duck fat
            </Link>{" "}
            if you'd rather not render your own first.
          </p>
        </Section>
      </div>

      <Section id="first-duck" heading="Your first duck: two recommended paths">
        <Callout label="Path A — duck breast tonight" tone="gold">
          <p>
            Score the cold fat cap (
            <Link to="/learn/how-to-score-duck-breast" className="underline underline-offset-4">
              how to score
            </Link>
            ), start it in a cold dry pan, render slowly, probe to your target (
            <Link to="/learn/duck-breast-temperature-doneness" className="underline underline-offset-4">
              temperature guide
            </Link>
            ), rest, slice across the grain. Then decide what goes with it:{" "}
            <Link to="/cook/best-sauces-for-duck-breast" className="underline underline-offset-4">
              sauces
            </Link>{" "}
            and{" "}
            <Link to="/cook/what-to-serve-with-duck-breast" className="underline underline-offset-4">
              sides
            </Link>
            .
          </p>
        </Callout>
        <Callout label="Path B — whole roast duck this weekend">
          <p>
            Thaw properly (
            <Link to="/learn/how-to-thaw-duck" className="underline underline-offset-4">
              thawing
            </Link>
            ), dry-brine and air-dry the skin (
            <Link to="/ingredients/dry-brine-duck" className="underline underline-offset-4">
              dry brine
            </Link>
            ), size the bird with the{" "}
            <Link to="/tools/whole-duck-serving-calculator" className="underline underline-offset-4">
              serving calculator
            </Link>
            , plan the oven with the{" "}
            <Link to="/tools/duck-cooking-time-planner" className="underline underline-offset-4">
              cooking time planner
            </Link>
            , then{" "}
            <Link to="/learn/how-to-carve-a-duck" className="underline underline-offset-4">
              carve it
            </Link>
            .
          </p>
        </Callout>
        <p className="mt-6">
          Not sure which? The{" "}
          <Link to="/tools/what-should-i-cook" className="text-primary underline underline-offset-4">
            method finder
          </Link>{" "}
          asks what you have and what time you've got, and the{" "}
          <Link to="/tools/duck-pairing-finder" className="text-primary underline underline-offset-4">
            pairing finder
          </Link>{" "}
          handles flavour once the method is settled.
        </p>
      </Section>

      <QuackFix
        title="Quack Fix: first-timer mistakes"
        items={[
          {
            symptom: "Skin is soft, pale, or rubbery",
            cause: "Wet surface, or fat rendered too fast over high heat",
            fixNow: "Pour off the fat, lower the heat, and give the skin more time face-down",
            prevent: "Dry the skin thoroughly and start breast in a cold, dry pan",
          },
          {
            symptom: "Breast came out grey and tough",
            cause: "Cooked by time rather than temperature, or no rest before slicing",
            fixNow: "Nothing mid-cook; slice thinner across the grain and serve with a sauce",
            prevent: "Probe the thickest part and rest before slicing",
          },
          {
            symptom: "Legs are chewy and stringy",
            cause: "Treated like breast and cooked fast to a pink target",
            fixNow: "Return them to low, moist heat and keep going until they yield",
            prevent: "Braise or confit legs; they need time, not restraint",
          },
          {
            symptom: "Smoke, spatter, and a scorched pan",
            cause: "Rendered fat left in a screaming-hot pan",
            fixNow: "Pull the pan off the heat and pour the fat into a heatproof container",
            prevent: "Drain fat every few minutes and keep the heat moderate",
          },
          {
            symptom: "Whole bird is dry on the breast, undercooked at the thigh",
            cause: "One target temperature applied to two very different muscles",
            fixNow: "Rest the bird, then return the legs alone to the oven",
            prevent: "Probe both, and plan the roast with the cooking time planner",
          },
        ]}
      />

      <UseTheWholeDuck
        intro="Two things come out of nearly every duck you cook, and both are worth keeping."
        items={[
          {
            part: "Rendered fat",
            use: "Strain the fat you poured off into a clean jar and refrigerate it. It's the best roasting-potato fat there is.",
            to: "/learn/how-to-render-duck-fat",
            linkLabel: "How to render duck fat",
          },
          {
            part: "Carcass and trim",
            use: "Bones, wing tips, and neck make a deeply flavoured stock — the base of the sauce for your next duck.",
            to: "/cook/ways-to-use-duck-fat",
            linkLabel: "Ways to use duck fat",
          },
        ]}
      />

      <section
        data-print-hide
        aria-labelledby="starter-related"
        className="mt-16 border-t border-border pt-10"
      >
        <h2 id="starter-related" className="font-display text-2xl text-foreground lg:text-3xl">
          Where to go next
        </h2>
        <ul className="mt-6 grid gap-3 text-base leading-[1.7] sm:grid-cols-2">
          {[
            { to: "/cook", label: "Cook — recipes and technique" },
            { to: "/learn", label: "Learn — how duck actually works" },
            { to: "/ingredients", label: "Ingredients — seasoning and pairing" },
            { to: "/gear", label: "Gear — what to buy first" },
            { to: "/buy", label: "Buy — sourcing duck and duck fat" },
            { to: "/tools", label: "Tools — calculators and planners" },
            { to: "/recipes", label: "Recipes — every published recipe" },
            { to: "/learn/why-duck-skin-isnt-crispy", label: "Diagnose: why skin isn't crispy" },
          ].map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="text-primary underline underline-offset-4">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </ArticleShell>
  );
}
