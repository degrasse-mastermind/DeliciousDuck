import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section } from "@/components/site/ArticleShell";
import { AnswerFirst, ArticleBasis, ArticleByline } from "@/components/site/AcquisitionArticle";
import { DecisionNextSteps } from "@/components/site/DecisionGuide";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SourceNotes } from "@/components/site/SourceNotes";
import { acquisitionPage } from "@/data/acquisition-cluster";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/buy/duck-breeds-for-cooking")!;
const PAGE = acquisitionPage("/buy/duck-breeds-for-cooking")!;

export const Route = createFileRoute("/buy/duck-breeds-for-cooking")({
  head: () => ({
    ...pageMeta({
      title: GUIDE.seoTitle,
      description: GUIDE.description,
      path: GUIDE.path,
      ogType: "article",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Buy", item: "/buy" },
          { name: GUIDE.title, item: GUIDE.path },
        ]),
      ),
      ldScript(
        articleSchema({
          headline: GUIDE.title,
          description: GUIDE.description,
          path: GUIDE.path,
          updated: PAGE.updated,
        }),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: Page,
});

const FAQ = [
  {
    q: "Which duck breed is best for a beginner?",
    a: "Pekin. It carries the most fat under the skin, which gives you the widest margin for error while you learn what a proper render looks like, and it is the breed most published recipes are written around.",
  },
  {
    q: "What is the difference between magret and an ordinary duck breast?",
    a: "Magret is a Moulard breast. It is thicker and leaner than a Pekin breast, so it needs a longer, gentler render to get the fat out of a heavier cap without overcooking a bigger muscle.",
  },
  {
    q: "Is Muscovy duck gamey?",
    a: "It is more pronounced in flavour than Pekin and leaner, which reads as gamier to some people, but it is still a farmed bird and nothing like wild duck. Its bigger practical difference is less fat to render.",
  },
  {
    q: "Does the breed matter more than the age of the bird?",
    a: "Often not. USDA labelling separates younger birds sold as duckling from mature ducks, and that difference in tenderness can matter more to your method than breed does — a mature bird suits slower, moist cooking regardless of breed.",
  },
  {
    q: "What if the listing doesn't name a breed?",
    a: "Assume Pekin, because it is the standard commercial duck, but ask before ordering if your recipe depends on expected fat yield or a specific breast thickness.",
  },
];

function Page() {
  return (
    <ArticleShell
      eyebrow="Buy · Sourcing"
      title={GUIDE.title}
      intro="Breed is not a marketing detail on a duck label. It changes how much fat you have to render, how thick the muscle under it is, and how quickly the doneness window closes."
      trail={[
        { name: "Buy", to: "/buy" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <AnswerFirst page={PAGE} />

      <ArticleByline page={PAGE} />

      <Section id="why-it-matters" heading="Why breed changes your technique, not just your bill">
        <p>
          Almost every duck breast recipe you will read is calibrated for Pekin, whether it says so
          or not: a moderate-sized muscle under a generous fat cap, rendered slowly from a cold pan
          until the skin is thin and crisp. Change the breed and you change two of the three
          variables in that sentence. A thicker, leaner breast needs more time to render a heavier
          cap while carrying less internal fat to protect it from that extra time.
        </p>
        <p>
          That is the whole practical story of duck breeds in a home kitchen. Not flavour notes —
          rendering time, muscle thickness, and how much room for error you have.
        </p>
      </Section>

      <Section id="three-breeds" heading="Pekin, Moulard and Muscovy, side by side">
        <DataTable
          caption="Farmed duck breeds compared on the factors that change your cooking"
          columns={["Breed", "Fat under the skin", "Breast character", "What to change"]}
          rows={[
            [
              "Pekin",
              "Most — a generous, even cap",
              "Moderate thickness, mild flavour, forgiving",
              "Nothing; published recipes assume this bird",
            ],
            [
              "Moulard",
              "Heavy cap on a much larger breast",
              "Thick, meaty, leaner, sold as magret",
              "Render longer and lower, then finish briefly and rest longer",
            ],
            [
              "Muscovy",
              "Least — a thinner cap",
              "Firm, leaner, more pronounced flavour",
              "Expect less rendered fat and a shorter window to your target temperature",
            ],
          ]}
        />
        <p>
          Moulard is a cross bred principally for foie gras production, which is why its breast is
          both large and widely sold under its own name. Muscovy is a distinct species from the
          other two, and the leanest of the three commonly sold for cooking.
        </p>
      </Section>

      <Section id="adjustments" heading="The adjustments, in the order you'd make them">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">Render for longer on Moulard.</span> A
            heavier fat cap on a thicker breast does not thin out on a Pekin timeline. Keep the heat
            low and judge by the skin and the fat in the pan, not by the clock.
          </li>
          <li>
            <span className="font-semibold text-foreground">Probe earlier on Muscovy.</span> Less
            internal and subcutaneous fat means the centre climbs faster once the skin is done, so
            start checking before you think you need to.
          </li>
          <li>
            <span className="font-semibold text-foreground">Expect a different fat yield.</span> If
            you were planning to cook the side dish in the fat you render, a Muscovy breast may not
            give you as much as a Pekin one.
          </li>
          <li>
            <span className="font-semibold text-foreground">Score to the breed, not the recipe.</span>{" "}
            The point of{" "}
            <Link
              to="/learn/how-to-score-duck-breast"
              className="text-primary underline underline-offset-4"
            >
              scoring
            </Link>{" "}
            is to open channels through the fat without reaching the meat, so a thinner cap means a
            shallower cut.
          </li>
        </ul>
        <Callout label="The thermometer does the deciding">
          <p>
            Breed changes the timing but not the target. Whatever you buy, finish by temperature
            rather than by minutes —{" "}
            <Link
              to="/learn/duck-breast-temperature-doneness"
              className="text-primary underline underline-offset-4"
            >
              the doneness guide
            </Link>{" "}
            covers targets, probe placement and carryover, and{" "}
            <Link to="/tools/duck-doneness-guide" className="text-primary underline underline-offset-4">
              the interactive doneness tool
            </Link>{" "}
            walks it by cut and method.
          </p>
        </Callout>
      </Section>

      <Section id="age-class" heading="Age class often matters more than breed">
        <p>
          USDA labelling separates duck by age as well as kind, and that difference is the one most
          likely to catch you out. Younger birds sold as duckling are tender enough for dry heat —
          roasting and searing. A bird labelled as a mature duck is better suited to slower, moist
          cooking, and treating it like a duckling produces a tough result no seasoning fixes.
        </p>
        <p>
          If a package names an age class, read it before you read the breed.
        </p>
      </Section>

      <Section id="wild" heading="And wild duck is a different problem entirely">
        <p>
          None of the above transfers to a wild bird. Wild duck varies by species, diet, and how hard
          it has been flying, and it carries a fraction of the fat of any farmed breed —{" "}
          <Link
            to="/learn/wild-duck-vs-farmed-duck"
            className="text-primary underline underline-offset-4"
          >
            wild duck vs. farmed duck
          </Link>{" "}
          covers what actually changes, and{" "}
          <Link
            to="/cook/how-to-cook-wild-duck-breast"
            className="text-primary underline underline-offset-4"
          >
            how to cook wild duck breast
          </Link>{" "}
          gives it its own method.
        </p>
      </Section>

      <Section id="safety" heading="The safety number doesn't move by breed">
        <p>
          USDA guidance is that duck — whole birds and pieces alike, of any breed — should reach a
          minimum internal temperature of 165°F (73.9°C), measured with a food thermometer.
          Restaurant practice for a pink breast sits below that number; the doneness guide sets the
          two out side by side so the choice is yours to make knowingly.
        </p>
      </Section>

      <ArticleBasis page={PAGE} />

      <DecisionNextSteps
        heading="Next steps once you know which bird you want"
        intro="Finding a listing that names the breed, and cooking to temperature once it arrives."
        items={PAGE.funnel}
      />

      <FaqList items={FAQ} />

      <SourceNotes ids={PAGE.sourceIds} />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
