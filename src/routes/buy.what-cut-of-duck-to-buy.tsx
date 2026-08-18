import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section } from "@/components/site/ArticleShell";
import { AnswerFirst, ArticleBasis, ArticleByline } from "@/components/site/AcquisitionArticle";
import { DecisionNextSteps } from "@/components/site/DecisionGuide";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SourceNotes } from "@/components/site/SourceNotes";
import { acquisitionPage } from "@/data/acquisition-cluster";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
import { SourceMark } from "@/components/site/SourceMark";
import { ConversionPaths } from "@/components/site/ConversionPaths";

const GUIDE = guideByPath("/buy/what-cut-of-duck-to-buy")!;
const PAGE = acquisitionPage("/buy/what-cut-of-duck-to-buy")!;

export const Route = createFileRoute("/buy/what-cut-of-duck-to-buy")({
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
    q: "Is a whole duck cheaper than buying breasts?",
    a: "Per kilo it usually is, but the comparison only means something once you account for bone, rendered fat, and the parts you won't serve. A whole bird also gives you legs, fat, and a carcass for stock, so it is best judged as three purchases in one rather than as a straight price-per-kilo swap.",
  },
  {
    q: "Which cut should a first-time duck cook buy?",
    a: "A single duck breast. It cooks in one pan in under half an hour, it teaches you what rendering fat looks and sounds like, and a mistake costs you one portion instead of a centrepiece.",
  },
  {
    q: "Can I use duck breast for confit?",
    a: "No. Confit depends on the connective tissue and fat structure of the leg, which breaks down over hours of low poaching. A breast cooked that way turns dry and grey rather than tender.",
  },
  {
    q: "Does the breed on the label change which cut I should buy?",
    a: "Not for this decision. Breed names are description rather than a defined labelling claim, and we publish no breed-by-breed cooking adjustments because our cited sources do not support them. Pick the cut from the dish, then judge the individual bird on its fat cap and skin.",
  },
];

function Page() {
  return (
    <ArticleShell
      eyebrow="Buy · Sourcing"
      title={GUIDE.title}
      intro="Whole bird, breast, legs, or a jar of rendered fat. The right purchase is the one that matches the method you actually intend to cook — and duck punishes the mismatch more than chicken does."
      trail={[
        { name: "Buy", to: "/buy" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <AnswerFirst page={PAGE} />

      <ArticleByline page={PAGE} />

      <Section id="why-cut-first" heading="Why the cut decision comes before the seller decision">
        <p>
          Duck cuts are not interchangeable the way chicken pieces broadly are. A duck breast is a
          lean muscle sitting under a thick fat cap, and it wants high, direct, attentive heat for
          minutes. A duck leg is a hard-worked muscle full of connective tissue, and it wants low
          heat for hours. Buy one when the recipe wanted the other and no amount of technique
          rescues it.
        </p>
        <p>
          Work in this order: pick the dish, pick the cut it needs, then find a seller who names
          that cut on the label. Shopping the other way round — buying whatever duck is available
          and then choosing a recipe — is how people end up slow-cooking a breast.
        </p>
      </Section>

      <Section id="cuts-compared" heading="The four things you can actually buy">
        <DataTable
          caption="Duck cuts compared by what each one is for"
          columns={["What you buy", "Best method", "Effort", "Also gives you"]}
          rows={[
            [
              "Whole duck",
              "Roasting as a centrepiece, or breaking down into parts",
              "Highest — hours of oven time plus carving",
              "Legs, rendered fat, and a carcass for stock",
            ],
            [
              "Breast",
              "Pan-searing, cold-pan render, skin-side first",
              "Lowest — one pan, well under an hour",
              "Enough rendered fat to cook a side dish in",
            ],
            [
              "Leg quarters",
              "Confit, braising, slow roasting",
              "Moderate, but almost all of it unattended",
              "Fat to top up a confit batch and reuse",
            ],
            [
              "Rendered duck fat",
              "Roast potatoes, vegetables, searing, confit volume",
              "None — it is already done",
              "Nothing else; buy it for volume or convenience",
            ],
          ]}
        />
      </Section>

      <Section id="whole-vs-parts" heading="Whole bird versus breasts and legs">
        <p>
          A whole duck is the most flexible thing you can buy, and the most demanding. Roasted
          intact it is a genuine centrepiece, but the breast and the legs want different
          temperatures for different lengths of time, which is the whole reason whole-duck roasting
          has a technique of its own. Broken down instead, one bird gives you two breasts, two legs,
          a heap of trim to render, and a frame for stock — three separate cooks from one purchase.
        </p>
        <p>
          Buying parts trades that flexibility for control. Two breasts cook in one pan to one
          doneness. Four legs go into one confit batch and hold in the fridge for weeks. Nothing on
          the tray is compromising for anything else on the tray.
        </p>
        <Callout label="A useful default">
          <p>
            If you're cooking for a fixed date and want the meal to be predictable, buy parts. If
            you want the best value and don't mind spreading the bird across two or three meals, buy
            whole and break it down. See{" "}
            <Link to="/learn/how-to-carve-a-duck" className="text-primary underline underline-offset-4">
              carving a whole duck
            </Link>{" "}
            for the order that works.
          </p>
        </Callout>
      </Section>

      <Section id="by-dish" heading="Start from the dish">
        <DataTable
          caption="Which cut each duck dish actually needs"
          columns={["The dish you want", "Buy", "Read next"]}
          rows={[
            ["Seared, pink, plated main with crisp skin", "Breast, skin on", "How to cook duck breast"],
            ["Confit, rillettes, or shredded duck", "Leg quarters", "Duck leg confit"],
            ["A roast centrepiece for a table", "Whole duck", "Whole roast duck"],
            ["Roast potatoes that taste like a restaurant's", "Rendered duck fat", "Ways to use duck fat"],
            ["Duck ragù, tacos, or pie filling", "Leg quarters", "Duck leg confit"],
            ["Stock or broth", "Whole duck, or a saved carcass", "How to carve a duck"],
          ]}
        />
        <p>
          The technique pages behind those rows are{" "}
          <Link to="/cook/how-to-cook-duck-breast" className="text-primary underline underline-offset-4">
            how to cook duck breast
          </Link>
          ,{" "}
          <Link to="/cook/duck-leg-confit" className="text-primary underline underline-offset-4">
            duck leg confit
          </Link>
          ,{" "}
          <Link to="/cook/whole-roast-duck" className="text-primary underline underline-offset-4">
            whole roast duck
          </Link>
          , and{" "}
          <Link to="/cook/ways-to-use-duck-fat" className="text-primary underline underline-offset-4">
            ways to use duck fat
          </Link>
          . If you already have duck in the fridge and want the decision made for you, the{" "}
          <Link to="/tools/what-should-i-cook" className="text-primary underline underline-offset-4">
            what-should-I-cook tool
          </Link>{" "}
          asks five questions and picks a method.
        </p>
      </Section>

      <Section id="labels" heading="The label terms that change the cut you're getting">
        <p>
          The term worth finding on the package is the age class in the USDA labelling vocabulary for
          duck: younger birds sold as duckling are tender enough for dry-heat cooking such as
          roasting, while a bird labelled as a mature duck is better suited to slower, moist cooking.
          That distinction is defined by the labelling rules, so it is one you can actually act on.
        </p>
        <p>
          Everything else — “premium,” “gourmet,” “select” — has no defined meaning and tells you
          nothing about what will happen in your pan. Some listings also name a breed. We have not
          verified breed-by-breed cooking differences against a source we would stand behind, so we
          do not publish adjustments by breed; judge the bird in front of you on its fat cap and skin
          instead, using{" "}
          <Link to="/buy/how-to-choose-duck" className="text-primary underline underline-offset-4">
            our selection checks
          </Link>
          .
        </p>
      </Section>


      <Section id="safety" heading="One number that applies to every cut">
        <p>
          Whichever cut you buy, the safety target is the same: 165°F (73.9°C) internal, measured
          with a food thermometer, whole birds and pieces alike.
          <SourceMark to="sources" /> Restaurant convention for a pink breast
          sits below that, which is a decision worth making deliberately rather than by accident;{" "}
          <Link
            to="/learn/duck-breast-temperature-doneness"
            className="text-primary underline underline-offset-4"
          >
            the doneness guide
          </Link>{" "}
          sets the two side by side.
        </p>
      </Section>

      <ArticleBasis page={PAGE} />

      <DecisionNextSteps
        heading="Next steps once you've picked the cut"
        intro="Two pages that turn a cut into an order."
        items={PAGE.funnel}
      />

      <ConversionPaths
        sourcePath="/buy/what-cut-of-duck-to-buy"
        eyebrow="Next step"
        heading="Where to buy the cut you settled on"
      />

      <FaqList items={FAQ} />

      <SourceNotes ids={PAGE.sourceIds} />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
