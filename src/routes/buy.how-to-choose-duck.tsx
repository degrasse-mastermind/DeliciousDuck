import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section } from "@/components/site/ArticleShell";
import { AnswerFirst, ArticleBasis, ArticleByline } from "@/components/site/AcquisitionArticle";
import { DecisionNextSteps } from "@/components/site/DecisionGuide";
import { CommercialCallout } from "@/components/site/CommercialLink";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SourceNotes } from "@/components/site/SourceNotes";
import { acquisitionPage } from "@/data/acquisition-cluster";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
import { SourceMark } from "@/components/site/SourceMark";
import { ConversionPaths } from "@/components/site/ConversionPaths";

const GUIDE = guideByPath("/buy/how-to-choose-duck")!;
const PAGE = acquisitionPage("/buy/how-to-choose-duck")!;

export const Route = createFileRoute("/buy/how-to-choose-duck")({
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
    q: "What should duck skin look like?",
    a: "Intact, dry to the touch, and evenly thick across the breast, with a creamy rather than grey cast. Torn skin and thin patches never crisp evenly, because the fat underneath renders at different rates.",
  },
  {
    q: "Does the colour of the meat tell me anything?",
    a: "Duck breast is naturally dark, so redness on its own is not a warning sign. In our own kitchen judgement we pass over birds that look dull or dried at the cut edges; colour is not a safety test, and safe handling and cooking temperature are what determine safety.",
  },
  {
    q: "Which label terms are worth reading?",
    a: "The age class, whether the bird is sold fresh or frozen, and the pack or best-by date. Those are defined. 'Premium', 'gourmet' and 'artisan' are not, and a named breed is description rather than a defined claim — we publish no cooking adjustments by breed.",
  },
  {
    q: "Should I buy a bigger or smaller duck?",
    a: "Size mainly changes serving count and roasting time, not quality. Pick the weight from your guest count, then judge the individual bird on skin and fat cap.",
  },
  {
    q: "How long can I keep a raw duck in the refrigerator?",
    a: "Raw poultry keeps only a short window refrigerated at 40°F (4.4°C) or below — check published cold-storage guidance and plan to cook or freeze rather than to stretch it.",
  },
];

function Page() {
  return (
    <ArticleShell
      eyebrow="Buy · Sourcing"
      title={GUIDE.title}
      intro="A good duck makes crisp skin possible; a poor one makes it hard work. Almost everything you need to judge is visible in the fat cap, the skin, and three lines on the label."
      trail={[
        { name: "Buy", to: "/buy" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <AnswerFirst page={PAGE} />

      <ArticleByline page={PAGE} />

      <Section id="skin-first" heading="Start with the skin and the fat cap">
        <p>
          Crisp duck skin is a rendering problem: the fat under the skin has to melt out and leave a
          thin, dry layer behind. That process needs an intact, evenly thick fat cap. Where the skin
          is torn, fat escapes early and the exposed meat scorches. Where the cap is thin, that
          patch finishes long before the thick end does.
        </p>
        <ul className="mt-4 list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">Even thickness across the breast.</span>{" "}
            Some taper is normal; a cap that is generous at one end and almost bare at the other is
            not.
          </li>
          <li>
            <span className="font-semibold text-foreground">Intact, unbroken skin.</span> Tears and
            puncture holes are the single most common reason a breast crisps unevenly.
          </li>
          <li>
            <span className="font-semibold text-foreground">Dry to the touch.</span> Surface moisture
            has to go before the skin browns; a bird that is already dry saves you a step.
          </li>
          <li>
            <span className="font-semibold text-foreground">Even in appearance.</span> This one is our
            own kitchen preference rather than a graded standard: we pass over birds that look dried
            out at the cut edges. Appearance is not a safety test — handling, storage time and cooking
            temperature are.
          </li>
        </ul>
        <p>
          Why this matters technically is covered in{" "}
          <Link
            to="/learn/why-duck-skin-isnt-crispy"
            className="text-primary underline underline-offset-4"
          >
            why duck skin isn't crispy
          </Link>{" "}
          and{" "}
          <Link
            to="/learn/how-to-score-duck-breast"
            className="text-primary underline underline-offset-4"
          >
            how to score duck breast
          </Link>
          .
        </p>
      </Section>

      <Section id="label" heading="The label: what's defined and what isn't">
        <DataTable
          caption="Which duck label terms carry a defined meaning"
          columns={["On the package", "Defined?", "What to do with it"]}
          rows={[
            [
              "Age class (duckling versus mature duck)",
              "Yes — a USDA labelling class",
              "Duckling suits dry heat; a mature bird suits slower, moist cooking",
            ],
            [
              "Fresh versus frozen",
              "Yes — set by holding temperature",
              "Determines your schedule more than your quality expectations",
            ],
            ["Pack or best-by date", "Yes", "Read it before anything else on the front of the pack"],
            [
              "A named breed",
              "Not a defined labelling claim",
              "Treat as description only — see the note below",
            ],
            ["Premium, gourmet, artisan, select", "No", "Ignore entirely"],
          ]}
        />
        <p>
          Some packages and listings name a breed. We do not publish cooking adjustments by breed:
          the sources we cite are labelling, handling and storage guidance, and they do not
          substantiate breed-by-breed claims about fat cover, breast size or flavour. Until we can
          support such a comparison, treat a breed name as description rather than instruction, and
          judge the fat cap and skin actually in front of you using the checks above.
        </p>
      </Section>

      <Section id="counter-vs-online" heading="At a counter versus sight unseen">
        <p>
          At a counter you can apply the checklist above directly, which is its main advantage. Buying
          online you cannot, so you shift the same scrutiny onto the packaging on arrival: an intact
          vacuum seal, no freezer burn on the skin, and a bird that is still properly cold. What you
          are checking is the same thing — whether the skin and fat cap arrived in a state that can
          crisp.
        </p>
        <p>
          If it arrived from a distance, work through{" "}
          <Link to="/buy/fresh-vs-frozen-duck" className="text-primary underline underline-offset-4">
            fresh versus frozen duck
          </Link>{" "}
          for the receiving checks before you commit to a cooking date.
        </p>
        <Callout label="What you can fix, and what you can't">
          <p>
            Surface moisture, a mildly uneven cap, and a light scoring job are all fixable in your
            kitchen. Torn skin, freezer burn, and a bird that arrived warm are not.
          </p>
        </Callout>
      </Section>

      <Section id="handling" heading="From the counter to the fridge">
        <p>
          Handling starts at purchase. Keep raw duck cold and separated from ready-to-eat food on the
          way home, refrigerate at 40°F (4.4°C) or below promptly, and remember that perishable food
          should not spend more than two hours in the danger zone between 40°F and 140°F (4.4°C and
          60°C). Plan to cook or freeze within the published cold-storage window for raw poultry
          rather than stretching it on smell.
        </p>
        <p>
          Whatever you bought, the cooking target is unchanged: 165°F (73.9°C) internal, measured
          with a food thermometer.
          <SourceMark to="sources" />{" "}
          <Link
            to="/learn/duck-breast-temperature-doneness"
            className="text-primary underline underline-offset-4"
          >
            The doneness guide
          </Link>{" "}
          sets that against the lower restaurant convention for a pink breast.
        </p>
      </Section>

      <ArticleBasis page={PAGE} />

      <div className="mt-12">
      </div>

      <CommercialCallout
        heading="Sellers you can order duck from"
        intro="One national mail-order seller whose public catalogue lists duck by the cut, with what it is practically useful for. Catalogue reviewed 2026-08-18."
        placement="choose_duck_sources"
        linkIds={["culver-duck"]}
        criteria={[
          "The cut and breed are named on the product page, not just \"duck\".",
          "Frozen shipping is scheduled for a delivery window you will be home for.",
          "The order minimum and shipping cost suit the quantity you actually cook.",
        ]}
        footnote="We publish no prices, ratings, or stock claims. Check the seller's own page for current availability and terms."
      />


      <DecisionNextSteps
        heading="Next steps"
        intro="Where to buy from, and what to cook it in."
        items={PAGE.funnel}
      />

      <ConversionPaths
        sourcePath="/buy/how-to-choose-duck"
        eyebrow="Next step"
        heading="Where to buy what you just decided on"
      />

      <FaqList items={FAQ} />

      <SourceNotes ids={PAGE.sourceIds} />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
