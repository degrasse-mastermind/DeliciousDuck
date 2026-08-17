import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section } from "@/components/site/ArticleShell";
import { AnswerFirst, ArticleBasis, ArticleByline } from "@/components/site/AcquisitionArticle";
import { DecisionNextSteps } from "@/components/site/DecisionGuide";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SourceNotes } from "@/components/site/SourceNotes";
import { acquisitionPage } from "@/data/acquisition-cluster";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/buy/how-much-duck-per-person")!;
const PAGE = acquisitionPage("/buy/how-much-duck-per-person")!;

export const Route = createFileRoute("/buy/how-much-duck-per-person")({
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
    q: "How many people does one whole duck feed?",
    a: "A 2.2 kg (about 4.9 lb) duck yields roughly 880 g of edible cooked meat at a 40% yield, which is about four standard 180 g portions. Treat that as four people at a main course, or three if the duck is the only substantial thing on the table.",
  },
  {
    q: "Is one duck breast enough per person?",
    a: "Yes, for a plated main with sides. Breast weights vary a lot between suppliers, so check the pack weight against the 180 g standard portion below if you are catering tightly.",
  },
  {
    q: "Why is duck yield lower than chicken?",
    a: "Duck carries far more fat and a heavier frame relative to its muscle, and much of the fat renders out during cooking. That rendered fat is worth saving — it just is not meat on a plate.",
  },
  {
    q: "How many duck legs per person for confit?",
    a: "One leg per person as a main, or two if the legs are small and there is little else on the plate. Confit is rich, so appetites run smaller than people expect.",
  },
  {
    q: "Should I buy extra on purpose?",
    a: "Often yes — a slightly larger bird costs less than a second cook, and cooked duck keeps. Refrigerate cooked leftovers within two hours and use them within three to four days.",
  },
];

function Page() {
  return (
    <ArticleShell
      eyebrow="Buy · Sourcing"
      title={GUIDE.title}
      intro="Duck yields less edible meat per kilo than most people assume, which is why undercatering is the most common duck-buying mistake. Here is how to turn a guest count into a shopping weight."
      trail={[
        { name: "Buy", to: "/buy" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <AnswerFirst page={PAGE} />

      <ArticleByline page={PAGE} />

      <Section id="the-arithmetic" heading="The arithmetic, in one paragraph">
        <p>
          Pick a portion size. Multiply by guests. Divide by yield. That is the whole calculation.
          Our planning assumptions are a 40% edible cooked yield on a whole duck, and portions of
          140 g for a light serving, 180 g for a standard main, and 240 g for hearty appetites. Four
          people at 180 g need 720 g of cooked meat, which at 40% means about 1.8 kg of raw whole
          duck — so buy a bird at or a little above 2 kg.
        </p>
        <Callout label="Let the calculator do it">
          <p>
            The{" "}
            <Link
              to="/tools/whole-duck-serving-calculator"
              className="text-primary underline underline-offset-4"
            >
              whole-duck serving calculator
            </Link>{" "}
            runs exactly this arithmetic — guest count and appetite in, number of birds and raw
            weight out, with the same assumptions stated on the page.
          </p>
        </Callout>
      </Section>

      <Section id="whole-bird" heading="Whole duck: raw weight by guest count">
        <DataTable
          caption="Raw whole-duck weight to buy, at a 40% edible cooked yield and a 180 g standard portion"
          columns={["Guests", "Cooked meat needed", "Raw whole duck to buy", "Practical guidance"]}
          rows={[
            ["2", "360 g", "about 0.9 kg", "Most whole ducks are bigger — buy one and plan leftovers"],
            ["4", "720 g", "about 1.8 kg", "One bird in the usual 2–2.5 kg range"],
            ["6", "1.08 kg", "about 2.7 kg", "One large bird, or two smaller ones for easier carving"],
            ["8", "1.44 kg", "about 3.6 kg", "Two birds; one duck rarely stretches this far"],
            ["10", "1.8 kg", "about 4.5 kg", "Two large birds, roasted together"],
          ]}
        />
        <p>
          Adjust down to 140 g per person if duck is one of several mains, and up to 240 g if it is
          the centrepiece and your guests eat well.
        </p>
      </Section>

      <Section id="parts" heading="Breasts, legs and fat">
        <DataTable
          caption="Portion planning by cut"
          columns={["Cut", "Per person", "Note"]}
          rows={[
            ["Duck breast", "1 breast", "Plated main with sides; check the pack weight if it looks small"],
            ["A large breast (over roughly 350 g)", "1 breast serves 1–2", "Slice thin and serve as part of a fuller plate"],
            ["Leg quarters, confit", "1 leg", "Rich enough that a second is often untouched"],
            ["Leg meat, shredded into a sauce or filling", "roughly 1 leg per 2 people", "The meat goes further once it is off the bone"],
            ["Rendered duck fat, for roasting potatoes", "a generous spoonful per person", "Buy or render more than you think; it keeps"],
          ]}
        />
      </Section>

      <Section id="fat-and-frame" heading="The 60% you didn't buy for nothing">
        <p>
          The gap between raw weight and edible meat is not waste. It is bone for stock and fat you
          can render and keep — the reason a whole duck is better value than the yield figure alone
          suggests. Rendering the trim and skin gives you cooking fat that stores for weeks, and{" "}
          <Link
            to="/learn/how-to-render-duck-fat"
            className="text-primary underline underline-offset-4"
          >
            the rendering guide
          </Link>{" "}
          covers doing it properly. If you'd rather skip the step,{" "}
          <Link to="/buy/duck-fat-buying-guide" className="text-primary underline underline-offset-4">
            the duck fat buying guide
          </Link>{" "}
          works through when buying it makes more sense.
        </p>
      </Section>

      <Section id="leftovers" heading="Plan the leftovers rather than fear them">
        <p>
          Buying slightly over is usually the right call, because cooked duck is genuinely good the
          next day and the second cook is the expensive one. Follow USDA leftover guidance: get
          cooked poultry into the refrigerator within two hours of cooking, and use refrigerated
          leftovers within three to four days.
        </p>
        <p>
          For serving-day timing on a whole bird, the{" "}
          <Link
            to="/learn/whole-duck-cooking-time"
            className="text-primary underline underline-offset-4"
          >
            cooking-time guide
          </Link>{" "}
          works backward from when you want to eat.
        </p>
      </Section>

      <ArticleBasis page={PAGE} />

      <DecisionNextSteps
        heading="Next steps once you know your weight"
        intro="Run the numbers, then work out the best way to buy them."
        items={PAGE.funnel}
      />

      <FaqList items={FAQ} />

      <SourceNotes ids={PAGE.sourceIds} />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
