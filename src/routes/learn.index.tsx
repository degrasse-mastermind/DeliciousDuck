import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { HubOrientation } from "@/components/site/HubOrientation";
import { GuideCluster } from "@/components/site/GuideGrid";
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
            "Duck is a red-meat bird with a thick fat layer under the skin, which is why chicken habits fail on it. Breast is usually cooked to a medium-rare to medium range and rests pink; legs and whole birds need long enough for connective tissue to break down, well past the point where a chicken would be dry.",
            "The fat is the other half of the difference. It has to be rendered out slowly before the skin can crisp, and what you pour off is one of the best cooking fats in the kitchen. Guides in this section cover scoring, rendering, and the diagnostic questions behind skin that stays soft.",
            "Read this section when you want to understand why a method works, then move to Cook or Tools when you want to execute it. Safety facts here \u2014 thawing, storage, and minimum internal temperatures \u2014 carry a source note so you can check the original guidance yourself.",
          ]}
          sections={[
            {
              heading: "What temperature should duck be cooked to?",
              paragraphs: [
                "Two answers, and both are correct for different cuts. Whole birds and legs finish in the 175–180°F (79–82°C) range at the thigh, because that is where collagen turns to gelatine and the meat stops being chewy. Duck breast is treated as red meat: most kitchens pull it at 130–135°F (54–57°C) and serve it pink, above the 165°F (74°C) figure that poultry guidance sets as the safe minimum for all poultry including duck. That gap is a conscious culinary convention, not an oversight, and it is the same tradeoff people make with rare beef.",
                "If you would rather not make that tradeoff, cook the breast further and lean on the fat and the sauce for moisture. Either way, an instant-read thermometer in the thickest part — not touching bone — is what decides it.",
              ],
            },
            {
              heading: "Duck vs. chicken: why the habits do not transfer",
              paragraphs: [
                "Duck is a waterfowl with a subcutaneous fat layer, dark muscle throughout, and far more connective tissue in the legs than a chicken carries. That means the breast behaves like a small steak, the legs behave like short ribs, and the skin needs a long low render before it can crisp. Chicken has none of those requirements, which is why chicken timings produce soft skin and grey duck.",
                "It also changes the plate. A five- to six-pound Pekin yields far less meat than its weight suggests once the fat and frame are accounted for, so plan on one whole duck for three to four people, or a breast per person. Serve it against acidity — cherries, orange, verjus, pickled fruit — bitter greens, or something briny, and let the rendered fat do the work on the potatoes.",
              ],
            },
            {
              heading: "Thawing, storing, and buying with confidence",
              paragraphs: [
                "Most duck sold in the US arrives frozen. Thaw it in the refrigerator, allowing roughly 24 hours for every four to five pounds, and keep it on a tray because duck releases more liquid than you expect. Cold-water thawing is faster but demands a change of water every thirty minutes and cooking immediately after. Never thaw a whole duck on the counter.",
                "Breeds matter more than labels. Pekin is the mild, fatty, widely available default and the right bird for a first roast. Moulard is bigger and leaner in the breast, prized for magret and for confit legs. Muscovy is leaner still with a deeper flavour. Wild duck is a different ingredient entirely. Where a claim here touches safety, storage, or thawing, it carries a source note so you can read the original guidance yourself.",
              ],
            },
          ]}
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
