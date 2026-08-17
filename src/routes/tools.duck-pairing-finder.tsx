import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { FaqList } from "@/components/site/ArticleShell";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { PairingFinder } from "@/components/tools/PairingFinder";
import { ToolAssumptions } from "@/components/tools/ToolAssumptions";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const FAQ = [
  {
    q: "Is this using AI to generate pairings?",
    a: "No. Every recommendation is a fixed table entry keyed on the four answers you give. The same answers always return the same plate, and the reasoning shown is the actual rule that matched.",
  },
  {
    q: "Why does my chosen flavour direction always appear first?",
    a: "Because it is your stated preference. The finder then adds the next-best directions for the cut you picked, in a fixed order, so you can see the alternatives without losing the one you wanted.",
  },
  {
    q: "Does the richness setting change the food safety advice?",
    a: "No. Richness only affects how many flavour directions are shown and whether the plan leans on acid instead of butter. Doneness and food-safety guidance lives on the cooking guides, and the USDA recommendation for all poultry, including duck, is a 165°F safe minimum internal temperature.",
  },
];

export const Route = createFileRoute("/tools/duck-pairing-finder")({
  head: () => ({
    ...pageMeta({
      title: "Duck Pairing Finder: Sauce, Acid, Sides & Seasoning | DeliciousDuck",
      description:
        "Choose your cut, flavour direction, occasion and richness preference to get a transparent, rule-based duck pairing plan: sauce family, acid, starch, greens and seasoning.",
      path: "/tools/duck-pairing-finder",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Tools", item: "/tools" },
          { name: "Duck Pairing Finder", item: "/tools/duck-pairing-finder" },
        ]),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Tool"
        title="Duck Pairing Finder"
        intro="Pick the cut, the flavour direction you want, the occasion, and how rich you want the plate. You get a sauce and acid family, a starch, a green, two seasoning ideas, and links to the guides behind each choice."
        trail={[
          { name: "Tools", to: "/tools" },
          { name: "Duck Pairing Finder", to: "/tools/duck-pairing-finder" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <PairingFinder />

        <div className="mt-14">
          <ToolAssumptions
            items={[
              {
                label: "How matching works",
                value:
                  "A fixed lookup table keyed on cut, flavour direction, occasion and richness. No model, no randomness, no hidden ranking.",
              },
              {
                label: "Direction ordering",
                value:
                  "Your chosen direction leads. The remaining suggestions follow the cut's own preference order, which is the same for every reader.",
              },
              {
                label: "Richness",
                value:
                  "'Lighter' returns two directions instead of three and pushes the plan toward acid rather than butter; it does not change the sauce family you selected.",
              },
              {
                label: "Not modelled",
                value:
                  "Guest count, budget, dietary restrictions, wine pairing, seasonal availability, and anything about doneness or timing.",
              },
            ]}
            note="This is a flavour-planning aid, not a doneness or food-safety judgement. Temperatures, timing and safety live on the linked cooking guides; the safe minimum internal temperature for all poultry, duck included, is 165°F (73.9°C)."
          />
        </div>

        <div className="mt-16 max-w-3xl">
          <h2 className="font-display text-3xl text-foreground">How to read the result</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            The plan is deliberately built in layers rather than handed to you as a finished recipe.
            The sauce family tells you what kind of sauce to build; the acid line is the part most
            home cooks skip, and it is what stops a duck plate from tasting heavy by the third bite.
            The starch and green are chosen to sit either side of that balance — one that uses the
            rendered fat, one that cuts it.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Change one answer at a time to see how the logic shifts. Switching from breast to confit
            moves the starch toward lentils and beans, because confit already brings its own fat;
            switching the occasion from weeknight to holiday changes the advice about what to
            prepare ahead rather than the flavours themselves.
          </p>
        </div>

        <FaqList items={FAQ} />

        <RelatedGuides
          paths={[
            "/ingredients/best-acid-for-duck",
            "/ingredients/best-herbs-spices-for-duck",
            "/cook/best-sauces-for-duck-breast",
            "/cook/what-to-serve-with-duck-breast",
            "/ingredients/orange-with-duck",
            "/ingredients/cherry-plum-with-duck",
          ]}
        />
      </section>
    </>
  );
}
