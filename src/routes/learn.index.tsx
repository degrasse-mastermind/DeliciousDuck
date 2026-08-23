import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { HubOrientation } from "@/components/site/HubOrientation";
import { GuideCluster } from "@/components/site/GuideGrid";
import { SourceNotes } from "@/components/site/SourceNotes";

import { guidesByPillar } from "@/data/guides";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

const LEARN_GUIDES = guidesByPillar("learn");

export const Route = createFileRoute("/learn/")({
  head: () => ({
    ...pageMeta({
      title: "Learn Duck: Temperature, Fat, Carving & Safety | DeliciousDuck",
      description:
        "Duck reference guides: breast temperature and doneness, scoring, why skin won't crisp, whole-duck timing, carving, safe thawing, rendering fat, and wild versus farmed.",
      path: "/learn",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Learn", item: "/learn" },
        ]),
      ),
      ldScript(
        itemListSchema(
          "Duck fundamentals guides",
          LEARN_GUIDES.map((g) => ({ name: g.title, url: g.path })),
        ),
      ),
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Duck, Explained Properly"
        intro="The reference layer of the site: how duck behaves, why it is cooked differently from chicken, and the answers to the questions people search for before they ever open a recipe."
        trail={[{ name: "Learn", to: "/learn" }]}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <GuideCluster
          id="breast-fundamentals"
          mark="learn-breast"
          eyebrow="Fundamentals"
          heading="Duck breast fundamentals"
          intro="Temperature, scoring, and the diagnostic guide for skin that refuses to crisp — the three things that decide a breast."
          guides={LEARN_GUIDES.filter((g) => g.cluster === "breast")}
        />

        <GuideCluster
          id="whole-fundamentals"
          mark="learn-whole"
          eyebrow="Planning & handling"
          heading="Whole duck: timing, carving & handling"
          intro="Planning a roast, verifying it, taking it apart, and thawing it safely in the first place."
          guides={LEARN_GUIDES.filter((g) => g.cluster === "whole-duck")}
        />

        <GuideCluster
          id="fat-fundamentals"
          mark="learn-fat"
          eyebrow="By-products"
          heading="Duck fat"
          intro="The by-product that is arguably the best thing about cooking duck."
          guides={LEARN_GUIDES.filter((g) => g.cluster === "duck-fat")}
        />

        <GuideCluster
          id="wild-fundamentals"
          mark="learn-wild"
          eyebrow="Game birds"
          heading="Wild duck"
          intro="Why techniques that work on a farmed Pekin can ruin a wild bird."
          guides={LEARN_GUIDES.filter((g) => g.cluster === "wild-duck")}
        />

        <HubOrientation
          heading={"Why duck is cooked differently"}
          paragraphs={[
            "Duck is a dark-meated bird with a thick fat layer under the skin, which is why chicken habits fail on it. Legs and whole birds need long enough for connective tissue to break down, well past the point where a chicken would be dry, while the breast cooks in minutes. It is still poultry, so USDA's 165°F (74°C) safe minimum internal temperature applies to every cut of it.",
            "The fat is the other half of the difference. It has to be rendered out slowly before the skin can crisp, and what you pour off is one of the best cooking fats in the kitchen. Guides in this section cover scoring, rendering, and the diagnostic questions behind skin that stays soft.",
            "Read this section when you want to understand why a method works, then move to Cook or Tools when you want to execute it. Safety facts here \u2014 thawing, storage, and minimum internal temperatures \u2014 carry a source note so you can check the original guidance yourself.",
          ]}
          sections={[
            {
              heading: "What temperature should duck be cooked to?",
              paragraphs: [
                "USDA recommends a safe minimum internal temperature of 165°F (74°C) for all poultry, and that includes duck — whole birds, legs, pieces, and breasts — measured with a food thermometer in the thickest part, away from bone. Cooked to that figure, a whole duck or a leg is exactly where you want it anyway: 165°F at the breast and 175–180°F (79–82°C) at the thigh is where connective tissue softens and the meat stops being chewy.",
                "Many restaurants and classic French preparations serve duck breast pink, pulling it around 130–135°F (54–57°C). That is a culinary convention and it departs from USDA guidance — it is below the recommended safe minimum, so it carries a real risk that cooking to 165°F removes. The two are not equally safe, and duck is poultry, so the reasoning people apply to rare steak does not transfer. If you cook breast pink anyway, understand the tradeoff, buy from a source you trust, and do not serve it to young children, older adults, pregnant people, or anyone immunocompromised.",
                "Either way, the thermometer decides it, not the clock. Our doneness guide lays out each range and what it looks like on the plate.",
              ],
              links: [
                { label: "Breast temperature & doneness", to: "/learn/duck-breast-temperature-doneness" },
                { label: "Doneness guide", to: "/tools/duck-doneness-guide" },
                { label: "Whole-duck cooking time", to: "/learn/whole-duck-cooking-time" },
              ],
            },
            {
              heading: "Duck vs. chicken: why the habits do not transfer",
              paragraphs: [
                "Duck is a waterfowl with a subcutaneous fat layer, dark muscle throughout, and far more connective tissue in the legs than a chicken carries. That means the legs behave like short ribs, the breast cooks far faster than the rest of the bird, and the skin needs a long low render before it can crisp. Chicken has none of those requirements, which is why chicken timings produce soft skin and disappointing duck. The safe minimum internal temperature is the same for both: 165°F (74°C).",
                "It also changes the plate. A five- to six-pound Pekin yields far less meat than its weight suggests once the fat and frame are accounted for, so plan on one whole duck for three to four people, or one breast per person — and expect that to move with bird size, appetites, and how substantial your sides are. For a larger table, roast two birds rather than one big one. Serve duck against acidity — cherries, orange, verjus, pickled fruit — bitter greens, or something briny, and let the rendered fat do the work on the potatoes.",
              ],
              links: [
                { label: "How much duck per person", to: "/buy/how-much-duck-per-person" },
                { label: "Serving calculator", to: "/tools/whole-duck-serving-calculator" },
                { label: "What to serve with duck", to: "/cook/what-to-serve-with-duck-breast" },
              ],
            },
            {
              heading: "Thawing, storing, and buying with confidence",
              paragraphs: [
                "Most duck sold in the US arrives frozen. USDA considers three thawing methods safe: in the refrigerator, in cold water, or in the microwave. Refrigerator thawing is the one to plan for — allow roughly 24 hours for every four to five pounds, and keep the bird on a tray because duck releases more liquid than you expect. Cold-water thawing is faster but demands a change of water every thirty minutes and cooking immediately afterwards. Never thaw a duck on the counter.",
                "Store raw duck in the coldest part of the refrigerator and cook or freeze it within a day or two; refrigerate cooked duck within two hours and use it within three to four days, reheating leftovers to 165°F (74°C). Rendered fat should be strained and refrigerated in a clean sealed jar, or frozen if you want to keep it well beyond a few weeks — judge it by smell before you use it rather than by a date we cannot source.",
                "Breeds matter more than labels. Pekin is the mild, fatty, widely available default and the right bird for a first roast. Moulard is bigger and leaner in the breast, prized for magret and for confit legs. Muscovy is leaner still with a deeper flavour. Wild duck is a different ingredient entirely. Every safety, thawing, and storage figure above comes from the USDA and FDA references at the foot of this page.",
              ],
              links: [
                { label: "How to thaw duck", to: "/learn/how-to-thaw-duck" },
                { label: "How to render duck fat", to: "/learn/how-to-render-duck-fat" },
                { label: "How to choose duck", to: "/buy/how-to-choose-duck" },
              ],
            },
          ]}
        />

        <SourceNotes
          ids={["usdaPoultryTemp", "usdaPoultryPrep", "usdaThawing", "usdaLeftovers", "fdaColdStorage"]}
        />



        <div className="mt-20 rounded-sm border border-border bg-cream p-6 lg:p-8">
          <h2 className="font-display text-2xl text-foreground">Put it into practice</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Fundamentals are most useful next to a pan. Pair a guide with a technique page or a
            calculator.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Link to="/cook/how-to-cook-duck-breast" className="underline-offset-4 hover:underline">
              How to cook duck breast
            </Link>
            <Link
              to="/learn/duck-vs-turkey-thanksgiving"
              className="underline-offset-4 hover:underline"
            >
              Duck vs. turkey
            </Link>
            <Link
              to="/learn/thanksgiving-duck-dinner"
              className="underline-offset-4 hover:underline"
            >
              Thanksgiving duck plan
            </Link>

            <Link to="/tools/duck-doneness-guide" className="underline-offset-4 hover:underline">
              Doneness guide
            </Link>
            <Link to="/tools" className="underline-offset-4 hover:underline">
              All tools
            </Link>
            <Link to="/ingredients" className="underline-offset-4 hover:underline">
              Ingredients &amp; pairings
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
