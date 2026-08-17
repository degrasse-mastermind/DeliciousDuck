import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section } from "@/components/site/ArticleShell";
import { AnswerFirst, ArticleBasis, ArticleByline } from "@/components/site/AcquisitionArticle";
import { DecisionNextSteps } from "@/components/site/DecisionGuide";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SafetyNote } from "@/components/site/SafetyNote";
import { SourceNotes } from "@/components/site/SourceNotes";
import { acquisitionPage } from "@/data/acquisition-cluster";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/learn/duck-vs-turkey-thanksgiving")!;
const PAGE = acquisitionPage("/learn/duck-vs-turkey-thanksgiving")!;

export const Route = createFileRoute("/learn/duck-vs-turkey-thanksgiving")({
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
          { name: "Learn", item: "/learn" },
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
    q: "How many people does one duck feed at Thanksgiving?",
    a: "Fewer than a turkey of similar size, because a duck carries more fat and bone relative to edible meat. We do not publish that as a fixed ratio: put your guest count and appetite into our whole-duck serving calculator, which shows the planning assumptions it uses and returns the number of birds and the raw weight to order. USDA's own turkey guide, by contrast, gives a planning allowance of 1 lb of turkey per person.",
  },
  {
    q: "Can I cook duck and turkey in the same oven?",
    a: "You can, but not comfortably at the same time. Both want space around them, and a duck sheds a lot of rendering fat that has to go somewhere. If you want both birds, roast the duck first, rest it while the turkey finishes, and carve the duck last.",
  },
  {
    q: "Does duck need a different internal temperature than turkey?",
    a: "No. USDA guidance puts all poultry, duck and turkey alike, at a minimum internal temperature of 165°F (73.9°C), measured with a food thermometer in the thickest part and away from bone. The lower temperatures you see for duck breast are a culinary convention, not a safety recommendation, and they are a separate question from a whole roasted holiday bird.",
  },
  {
    q: "Is duck harder to cook than turkey?",
    a: "It is different rather than harder. Duck is forgiving on moisture, because the fat layer bastes the meat as it renders, and unforgiving on logistics: you have to prick or score the skin, drain fat during the roast, and dry the skin ahead of time if you want it crisp. Turkey is the reverse — simple to manage in the oven, easy to overcook dry.",
  },
  {
    q: "Which gives better leftovers?",
    a: "Turkey gives more of them. Duck gives fewer but arguably better ones, plus two by-products a turkey does not: a jar of rendered fat for roast potatoes and a carcass that makes a deeply savoury stock. Either way, USDA guidance is that cooked poultry keeps three to four days in the refrigerator and should be reheated to 165°F (73.9°C).",
  },
  {
    q: "When should I order a duck for Thanksgiving?",
    a: "Earlier than you think, because holiday duck usually ships frozen and thawing is on your calendar, not the seller's. Work backward from the cooking date: USDA allows approximately 24 hours of refrigerator thawing for every 4 to 5 lb, then add the seller's stated transit window and a buffer day.",
  },
];


function Page() {
  return (
    <ArticleShell
      eyebrow="Learn · Whole duck"
      title={GUIDE.title}
      intro="Duck against turkey, judged on the things you can actually observe in a kitchen: how each one eats, how much of it you get, what it does to your oven, and what you are left with on Friday."
      trail={[
        { name: "Learn", to: "/learn" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <AnswerFirst page={PAGE} />

      <ArticleByline page={PAGE} />

      <Section id="verdict" heading="The verdict, before the detail">
        <p>
          This is a table-size decision more than a taste decision. Turkey scales; duck does not. A
          duck gives you noticeably less edible meat per bird than a turkey of similar size, so a
          duck Thanksgiving is usually a smaller Thanksgiving — or a two-bird one.
        </p>

        <Callout label="Choose duck if">
          <p>
            You are cooking for two to six, you want a centrepiece that tastes like a restaurant
            dish rather than a tradition, and the words “crisp skin and rendered fat” sound like a
            feature rather than a chore.
          </p>
        </Callout>
        <Callout label="Choose turkey if" tone="gold">
          <p>
            The table is large, some guests would notice and mind if the bird were not turkey, you
            want sandwiches for days, or your oven and your side dishes are already fighting for
            space.
          </p>
        </Callout>
        <p>
          There is also a middle route that we like more than either extreme: roast a duck as the
          centrepiece for the cooks and the curious, and keep the meal's traditional weight in the
          sides. It is the version of this decision that upsets the fewest people.
        </p>
      </Section>

      <Section id="compare" heading="Side by side, honestly">
        <DataTable
          caption="Duck and turkey compared on the factors a home cook actually feels"
          columns={["Factor", "Duck", "Turkey"]}
          rows={[
            [
              "Flavour",
              "Dark, rich, faintly gamey; closer to red meat than to chicken. Stands up to fruit, acid and warm spice.",
              "Mild and neutral. Carries gravy, brine and stuffing rather than competing with them.",
            ],
            [
              "Texture",
              "Two textures in one bird: firm breast meat and soft, silky leg meat, under skin that can be genuinely crisp.",
              "Uniform and lean, with breast and leg finishing at different moments — the classic dry-breast problem.",
            ],
            [
              "Serving yield",
              "Low. Roughly 40% of raw weight as edible cooked meat, so about one bird for four people.",
              "High. A single large bird is the standard answer for a big table.",
            ],
            [
              "Oven and logistics",
              "Sheds a great deal of fat that must be drained or managed; wants dry skin and a rack. Rewards attention.",
              "Long, mostly unattended roast, but occupies the oven for hours and dominates the schedule.",
            ],
            [
              "Cost and availability",
              "Often a speciality order, frequently frozen and shipped. We publish no prices — check your own sellers.",
              "Widely stocked in season. Again, we publish no prices.",
            ],
            [
              "Leftovers",
              "Fewer, plus two by-products: rendered fat and a carcass for stock.",
              "Plenty, and they carry well into sandwiches, soup and hash.",
            ],
            [
              "Guest familiarity",
              "Unexpected. Delightful to most, a hard no for a few — ask first if the group is fixed on tradition.",
              "Expected. Nobody has to be talked into it.",
            ],
            [
              "Who should choose it",
              "Small tables, confident cooks, anyone who cares more about the eating than the volume.",
              "Large tables, first-time hosts, and anyone cooking for guests who came for the ritual.",
            ],
          ]}
        />
      </Section>

      <Section id="yield" heading="Yield is the decision, not the flavour">
        <p>
          Most duck Thanksgivings go wrong at the shopping stage. A whole duck looks like a small
          turkey and behaves like a large chicken with a fat layer: the frame is heavy, the fat cap
          is substantial, and the edible cooked meat lands near 40% of the raw weight. Plan for
          about four servings per bird and buy accordingly — two birds for eight, three for twelve.
        </p>
        <p>
          Rather than doing that arithmetic by hand, put your guest count and appetite into the{" "}
          <Link
            to="/tools/whole-duck-serving-calculator"
            className="text-primary underline underline-offset-4"
          >
            whole-duck serving calculator
          </Link>
          , which returns the number of birds and the raw weight to order. If you are weighing a
          whole bird against portioned cuts, our{" "}
          <Link to="/buy/how-much-duck-per-person" className="text-primary underline underline-offset-4">
            how much duck per person
          </Link>{" "}
          guide sets out the same assumptions in prose.
        </p>
        <Callout label="Two birds, one oven">
          <p>
            Two ducks roast happily side by side if air can circulate between them and the fat has
            somewhere to go. What they cannot do is share the oven with a turkey and three trays of
            sides at the same temperature.
          </p>
        </Callout>
      </Section>

      <Section id="logistics" heading="What each bird does to your day">
        <p>
          Turkey is a scheduling problem: it is large, it is slow, and it owns the oven. Duck is an
          attention problem: it needs its skin dried in advance, its fat drained during the roast,
          and a rest before carving. Neither is harder in the abstract — they simply demand
          different things from you.
        </p>
        <ul className="mt-4 list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">Thawing is calendar, not cooking.</span>{" "}
            USDA lists three safe methods — refrigerator, cold water and microwave — and
            refrigerator thawing runs roughly 24 hours per 5 lb. Our{" "}
            <Link to="/learn/how-to-thaw-duck" className="text-primary underline underline-offset-4">
              thawing guide
            </Link>{" "}
            has the weight-based times and the cold-water fallback.
          </li>
          <li>
            <span className="font-semibold text-foreground">Dry skin beats any basting trick.</span>{" "}
            An uncovered day in the refrigerator does more for duck skin than anything you can do in
            the oven. The full method is on our{" "}
            <Link to="/cook/whole-roast-duck" className="text-primary underline underline-offset-4">
              whole roast duck
            </Link>{" "}
            page.
          </li>
          <li>
            <span className="font-semibold text-foreground">Plan for the fat.</span> Rendered duck
            fat is a prize, not a mess, but it needs a heatproof container and a plan for when you
            pour it off mid-roast.
          </li>
          <li>
            <span className="font-semibold text-foreground">Finish by thermometer, not by clock.</span>{" "}
            Weight-based ranges are for planning only; see{" "}
            <Link
              to="/learn/whole-duck-cooking-time"
              className="text-primary underline underline-offset-4"
            >
              whole duck cooking time
            </Link>{" "}
            for the ranges and{" "}
            <Link
              to="/gear/best-thermometer-for-duck"
              className="text-primary underline underline-offset-4"
            >
              choosing a thermometer
            </Link>{" "}
            for the one tool this decision genuinely requires.
          </li>
          <li>
            <span className="font-semibold text-foreground">Rest, then carve.</span> Both birds
            carve better after a rest. For turkey, follow the standing time in USDA's own consumer
            guide, linked in the references below; for duck, our{" "}
            <Link to="/learn/how-to-carve-a-duck" className="text-primary underline underline-offset-4">
              carving guide
            </Link>{" "}
            takes it apart in the order that keeps the skin intact.
          </li>
        </ul>
      </Section>

      <Section id="safety" heading="The safety numbers, and where they come from">
        <p>
          Species does not change the target. Whichever bird you roast, doneness is a thermometer
          reading in the thickest part of the meat, away from bone, and not a colour or a timing.
        </p>
        <SafetyNote>
          <p>
            The same 165°F (73.9°C) minimum applies to turkey. For turkey-specific thawing,
            roasting and standing times we point you to USDA's consumer guide rather than publishing
            figures of our own — it is the first reference listed below.
          </p>
        </SafetyNote>
        <p>
          Two more rules travel with a holiday meal regardless of species: perishable food should
          not sit between 40°F and 140°F (4.4°C and 60°C) for more than two hours, and cooked
          poultry keeps three to four days in the refrigerator, reheated to 165°F (73.9°C).
        </p>
        <SourceNotes
          ids={["usdaPoultryTemp", "usdaTurkeyRoasting", "usdaThawing"]}
          id="safety-sources"
          heading="Safety references"
        />

      </Section>

      <Section id="leftovers" heading="Friday, and what you actually want on it">
        <p>
          If leftovers are the point of the holiday for you, turkey wins on volume and that is not a
          close call. Duck answers differently: less cold meat, but shredded leg for a hash, a jar
          of fat that turns roast potatoes into the best thing on the table for a month, and a
          carcass worth simmering the same evening.
        </p>
        <p>
          Cool and refrigerate leftovers promptly rather than leaving the platter out through the
          evening, keep them three to four days, and reheat to 165°F (73.9°C). Freeze anything you
          will not get through in that window.
        </p>
      </Section>

      <Section id="tradeoffs" heading="The honest tradeoffs">
        <p>
          Duck's weaknesses are real. It feeds fewer people per bird, it usually has to be ordered
          in advance and thawed on schedule, it asks more of you during the roast, and a small
          number of guests genuinely do not want a rich, dark-meat centrepiece at this particular
          meal. Turkey's weaknesses are equally real: a lean breast that punishes inattention, a
          long oven occupation, and a flavour that depends almost entirely on what you put around
          it.
        </p>
        <p>
          What we cannot tell you is which is cheaper or easier to find where you live. Duck pricing
          and holiday availability vary too much by region and season for us to publish a figure we
          have not verified, so treat cost as a question for your own sellers — our{" "}
          <Link
            to="/buy/where-to-buy-duck-online"
            className="text-primary underline underline-offset-4"
          >
            where to buy duck
          </Link>{" "}
          guide is a framework for judging them, not a price list.
        </p>
      </Section>

      <ArticleBasis page={PAGE} />

      <DecisionNextSteps
        heading="Next steps"
        intro="Settle the number of birds first, then the workflow, then the order date."
        items={PAGE.funnel}
      />

      <FaqList items={FAQ} />

      <SourceNotes ids={PAGE.sourceIds} />

      <div className="mt-16">
        <NewsletterSignup id="duck-vs-turkey-thanksgiving" interest="whole-duck" />
      </div>

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
