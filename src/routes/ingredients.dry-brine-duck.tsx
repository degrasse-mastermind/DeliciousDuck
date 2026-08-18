import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Section, DataTable, Callout, StepList, FaqList } from "@/components/site/ArticleShell";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SafetyNote } from "@/components/site/SafetyNote";
import { SourceNotes } from "@/components/site/SourceNotes";
import { ingredientByPath } from "@/data/ingredients";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const PAGE = ingredientByPath("/ingredients/dry-brine-duck")!;

const FAQ = [
  {
    q: "Is a dry brine the same as a cure?",
    a: "No. A dry brine is a light, short salting for seasoning and surface drying. A cure uses much more salt over a longer contact time to change texture and preserve, as in confit or smoked duck, and those quantities and durations belong to the specific method.",
  },
  {
    q: "Do I need to rinse the salt off afterwards?",
    a: "No, if you salted lightly for seasoning — rinsing washes away the seasoning you just added and re-wets the skin you were trying to dry. Pat away any visible pooled liquid instead. Rinsing only makes sense after a heavy cure.",
  },
  {
    q: "Does dry brining make duck safe to eat rarer?",
    a: "No. Salting is a seasoning and surface-drying technique, not a safety step. Cook to your own judgement on texture, knowing the safe minimum internal temperature for all poultry, duck included, is 165°F (73.9°C).",
  },
];

export const Route = createFileRoute("/ingredients/dry-brine-duck")({
  head: () => ({
    ...pageMeta({
      title: PAGE.seoTitle,
      description: PAGE.description,
      path: PAGE.path,
      ogType: "article",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Ingredients", item: "/ingredients" },
          { name: PAGE.title, item: PAGE.path },
        ]),
      ),
      ldScript(
        articleSchema({
          headline: PAGE.title,
          description: PAGE.description,
          path: PAGE.path,
        }),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ArticleShell
      eyebrow="Ingredients"
      title="How to Dry Brine Duck for Better Seasoning & Crisp Skin"
      intro={PAGE.description}
      trail={[
        { name: "Ingredients", to: "/ingredients" },
        { name: PAGE.title, to: PAGE.path },
      ]}
      meta={`${PAGE.minutes} min read · Culinary prep technique`}
      sidebar={<SafetyNote />}
    >
      <Section id="what" heading="What dry brining is, in plain terms">
        <p>
          Dry brining means salting duck and then letting it sit, uncovered, in the fridge before
          cooking. There is no bucket of water and no submersion. The salt draws moisture out of the
          meat, dissolves in it, and that concentrated brine is drawn back in — so you end up with
          seasoning that has moved below the surface and a skin surface that has dried out in the
          fridge's moving air.
        </p>
        <p>
          For duck specifically, the second half is the point. Wet skin cannot crisp until the water
          has gone, and a dry, taut skin surface renders and browns far more predictably. Wet brining
          does the opposite: it adds water to the exact surface you want dry.
        </p>
      </Section>

      <Section id="why" heading="Why it suits duck better than wet brining">
        <DataTable
          caption="Dry brine versus wet brine for duck"
          columns={["", "Dry brine", "Wet brine"]}
          rows={[
            ["Effect on skin", "Dries the surface — helps rendering and crisping", "Wets the surface — works against crisp skin"],
            ["Seasoning", "Concentrated; salt moves inward", "Diluted; adds water along with salt"],
            ["Fridge space", "A rack and a tray", "A large container of liquid"],
            ["Risk of over-salting", "Moderate, and easy to control by weight", "Lower, but flavour is also more washed out"],
            ["Best duck use case", "Breast, whole bird, legs before roasting", "Rarely the right choice for fatty duck"],
          ]}
        />
      </Section>

      <Section id="planning" heading="Planning salt by weight">
        <p>
          Salting by weight rather than by spoon is the single change that makes this technique
          repeatable, because salt crystals differ enormously in density — a spoon of fine sea salt
          holds far more salt than a spoon of coarse flakes.
        </p>
        <p>
          Weigh the duck or the portion, then weigh out salt as a percentage of that weight. As
          editorial planning guidance rather than a tested formula: around 1% of the meat's weight is
          a common seasoning-level target for a light dry brine, and roughly 0.75% suits people who
          prefer things less salty. Below about 0.5% you are unlikely to notice much benefit; well
          above 1.5% you are moving toward cure territory and should expect a firmer, saltier result.
          Adjust to your own taste over a few cooks and write down what you liked.
        </p>
        <Callout label="Culinary prep, not a safety step" tone="gold">
          <p>
            Dry brining is about seasoning and skin texture. It does not sterilise anything and it
            does not change how done duck needs to be. Keep the duck refrigerated throughout, handle
            it like any raw poultry, and use the doneness guidance on the cooking pages — the USDA
            recommends 165°F as the safe minimum internal temperature for poultry, including duck.
          </p>
        </Callout>
      </Section>

      <Section id="airflow" heading="Airflow and fridge setup">
        <p>
          The drying half of the technique depends on air reaching the skin. A duck sitting in a
          sealed container in its own liquid will season but will not dry.
        </p>
        <StepList
          steps={[
            {
              title: "Elevate the duck",
              body: "Set it on a rack over a tray so air circulates underneath and rendered liquid drains away rather than pooling against the skin.",
            },
            {
              title: "Leave it uncovered",
              body: "Uncovered is what allows the surface to dehydrate. Keep it on a shelf where nothing can drip onto other food, and keep raw poultry below ready-to-eat items.",
            },
            {
              title: "Skin side up",
              body: "Give the skin the best exposure to moving air; it is the surface whose dryness you are buying.",
            },
            {
              title: "Blot before cooking",
              body: "Pat away any visible moisture, especially in the folds and cavity. Do not rinse a light brine — you would undo both the seasoning and the drying.",
            },
          ]}
        />
      </Section>

      <Section id="timing" heading="Timing ranges by cut">
        <p>
          These are planning ranges, chosen for how far salt has to travel and how much skin there is
          to dry — not fixed rules. Shorter still helps; longer is where the skin gets genuinely taut.
        </p>
        <DataTable
          caption="Dry brine planning guidance by duck cut"
          columns={["Cut", "Useful planning range", "Notes"]}
          rows={[
            [
              "Duck breast",
              "A few hours up to overnight",
              "Salt flesh and skin separately. Overnight gives noticeably drier, tighter skin.",
            ],
            [
              "Whole duck",
              "Overnight up to a couple of days",
              "Get salt under the breast skin and into the cavity; the skin surface is large and benefits most from the longer end.",
            ],
            [
              "Legs and thighs for roasting",
              "Overnight",
              "Robust cut, hard to over-season at seasoning-level salt percentages.",
            ],
            [
              "Legs destined for confit",
              "Follow the confit method instead",
              "That is a cure with its own salt quantity and duration, not a dry brine.",
            ],
            [
              "Wild duck",
              "Short — a few hours",
              "Lean and low in fat; long salting can make an already firm bird firmer.",
            ],
          ]}
        />
        <p className="mt-6">
          If you are cooking on a schedule, the{" "}
          <a href="/tools/duck-cooking-time-planner" className="text-primary underline underline-offset-4">
            cooking time planner
          </a>{" "}
          helps you work backwards from serving time, and the{" "}
          <a href="/cook/whole-roast-duck" className="text-primary underline underline-offset-4">
            whole roast duck guide
          </a>{" "}
          covers the roast itself.
        </p>
      </Section>

      <Section id="failure" heading="Failure modes">
        <p>
          <strong>Too salty.</strong> Almost always a spoon-measurement problem, or salt applied to a
          portion far smaller than assumed. Weigh next time; serve with an unsalted starch and a
          sharp acid to compensate this time.
        </p>
        <p>
          <strong>Skin still not crisp.</strong> Usually the duck was covered, or sat in pooled
          liquid, or the skin was not blotted before it hit the heat. Rendering technique matters too
          — see{" "}
          <a href="/learn/why-duck-skin-isnt-crispy" className="text-primary underline underline-offset-4">
            why duck skin isn't crispy
          </a>
          .
        </p>
        <p>
          <strong>Meat tastes cured rather than seasoned.</strong> Too much salt for too long. Drop the
          percentage and shorten the time; you were curing, not brining.
        </p>
      </Section>

      <FaqList items={FAQ} />

      <SourceNotes ids={["usdaPoultryTemp", "usdaPoultryPrep", "fdaColdStorage"]} />

      <RelatedGuides paths={PAGE.related} />
    </ArticleShell>
  );
}
