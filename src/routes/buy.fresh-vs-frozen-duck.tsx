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

const GUIDE = guideByPath("/buy/fresh-vs-frozen-duck")!;
const PAGE = acquisitionPage("/buy/fresh-vs-frozen-duck")!;

export const Route = createFileRoute("/buy/fresh-vs-frozen-duck")({
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
    q: "Is frozen duck worse than fresh?",
    a: "No. For anything shipped to you, frozen is usually the safer and better option, because it is the only way to hold the bird reliably across multi-day transit. The trade-off is scheduling, not quality.",
  },
  {
    q: "What does 'fresh' legally mean on poultry?",
    a: "Under USDA labelling rules, raw poultry labelled fresh has never been held below 26°F (-3.3°C). Poultry held at 0°F (-17.8°C) or below must be labelled frozen or previously frozen. So 'fresh' does not mean never chilled hard — it means never frozen.",
  },
  {
    q: "My duck arrived partly thawed. Is it safe?",
    a: "It depends on temperature, not on whether ice remains. If the bird is still at or below 40°F (4.4°C) it has stayed out of the danger zone and can go into the refrigerator or be refrozen. If it is warm, or you cannot tell how long it was warm, do not cook it — contact the seller.",
  },
  {
    q: "Can I refreeze duck that thawed in the refrigerator?",
    a: "Yes. Food thawed in the refrigerator can be refrozen without cooking first, though you may lose some quality to moisture loss. Duck thawed in cold water should be cooked before refreezing.",
  },
  {
    q: "How far ahead should I order frozen duck?",
    a: "Add the seller's stated transit window to your thaw time and put a buffer day on top. For a whole duck that usually means ordering at least four or five days before you plan to cook.",
  },
];

function Page() {
  return (
    <ArticleShell
      eyebrow="Buy · Sourcing"
      title={GUIDE.title}
      intro="For duck, the fresh-versus-frozen question is really two questions: which is better on the plate, and which survives getting to your kitchen. The answers point in different directions depending on how you're buying."
      trail={[
        { name: "Buy", to: "/buy" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <AnswerFirst page={PAGE} />

      <ArticleByline page={PAGE} />

      <Section id="what-fresh-means" heading="What the labels actually mean">
        <p>
          “Fresh” on raw poultry is a defined term, not a compliment. Under USDA labelling rules,
          poultry sold as fresh has never been held below 26°F (-3.3°C). Poultry held at 0°F
          (-17.8°C) or below must be labelled frozen or previously frozen. Between those two points
          there is a band where a bird can be held very cold and still be sold as fresh.
        </p>
        <p>
          So the meaningful question is not “fresh or frozen?” but “how long has this bird been above
          freezing, and how well was it held?” A duck frozen hard within hours of processing has had
          almost no opportunity to deteriorate. A duck labelled fresh that has been in transit for
          three days has had plenty.
        </p>
      </Section>

      <Section id="compare" heading="Fresh and frozen, compared honestly">
        <DataTable
          caption="Fresh versus frozen duck on the factors that matter to a home cook"
          columns={["Factor", "Fresh", "Frozen"]}
          rows={[
            ["Cooking on the day you buy", "Yes", "No — thaw time has to be scheduled"],
            ["Suited to mail order", "Only over short, guaranteed transit", "Yes; this is why most shipped duck is frozen"],
            ["Storage flexibility", "Days", "Months"],
            ["Skin condition for crisping", "Good, if handled and dried well", "Good, if thawed slowly and dried thoroughly"],
            ["Main risk", "Time above freezing before you get it", "A cold chain that broke in transit"],
            ["Availability of specific cuts", "Limited to what your counter carries", "Much wider, because it ships"],
          ]}
        />
        <Callout label="The practical rule">
          <p>
            Buy fresh when you can see the bird and cook it within a couple of days. Buy frozen when
            it is shipping to you, and treat the delivery date as the start of a plan rather than as
            dinner.
          </p>
        </Callout>
      </Section>

      <Section id="receiving" heading="Receiving a mail-order delivery">
        <p>
          The single number to care about on arrival is temperature, not the amount of ice left in
          the box. Bacteria multiply rapidly in the danger zone between 40°F and 140°F (4.4°C and
          60°C), and perishable food should not be left in that range for more than two hours. That
          is the standard your delivery has to have met.
        </p>
        <ul className="mt-4 list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">Open it immediately.</span> A box left on
            a doorstep in the sun is the failure mode, and the clock started when the courier put it
            down.
          </li>
          <li>
            <span className="font-semibold text-foreground">Check the bird, not the packaging.</span>{" "}
            Firm and frozen, or still cold to the touch and at or below 40°F (4.4°C), is fine.
            Ambient-temperature meat is not, however much dry ice was in the box.
          </li>
          <li>
            <span className="font-semibold text-foreground">Look for a torn vacuum seal.</span> A
            breached bag with freezer burn on the skin is a quality problem for crisping, and worth
            raising with the seller.
          </li>
          <li>
            <span className="font-semibold text-foreground">Decide freezer or refrigerator now.</span>{" "}
            Still frozen and not cooking within days? Straight into the freezer. Cooking this week?
            Refrigerator, and start counting thaw time.
          </li>
          <li>
            <span className="font-semibold text-foreground">Document anything wrong.</span> Photograph
            a warm or leaking delivery before you dispose of it. If you cannot establish how long the
            bird was warm, do not cook it.
          </li>
        </ul>
      </Section>

      <Section id="scheduling" heading="Working backward from your cooking date">
        <p>
          Frozen duck costs you calendar, and the number that matters is refrigerator thaw time —
          roughly 24 hours per 2.3 kg (5 lb) at 40°F (4.4°C) or below. A whole duck is therefore an
          overnight-plus job, and duck breasts are usually ready the next morning. Our{" "}
          <Link to="/learn/how-to-thaw-duck" className="text-primary underline underline-offset-4">
            thawing guide
          </Link>{" "}
          has the weight-based times and the cold-water fallback for when you're late.
        </p>
        <p>
          Build the schedule in this order: cooking date, minus thaw time, minus the seller's stated
          transit window, minus one buffer day. That is your order date. Never plan to cook on the
          delivery day itself.
        </p>
        <Callout label="Refreezing" tone="gold">
          <p>
            Duck thawed in the refrigerator can be refrozen without cooking first — you trade a
            little moisture and texture, not safety. Duck thawed in cold water should be cooked
            before it goes back in the freezer.
          </p>
        </Callout>
      </Section>

      <Section id="storage" heading="How long you've got once it's home">
        <p>
          Follow published cold-storage windows rather than the smell test. Raw poultry holds only a
          short time in the refrigerator, and much longer frozen at 0°F (-17.8°C) — where it stays
          safe indefinitely, with quality rather than safety being the limit. Whatever the storage
          route, the cooking target does not change: 165°F (73.9°C) internal, measured with a food
          thermometer.
          <SourceMark to="sources" />
        </p>
      </Section>

      <ArticleBasis page={PAGE} />

      <DecisionNextSteps
        heading="Next steps"
        intro="Schedule the thaw, then read the shipping terms before you order."
        items={PAGE.funnel}
      />

      <ConversionPaths
        sourcePath="/buy/fresh-vs-frozen-duck"
        eyebrow="Next step"
        heading="Who ships fresh, who ships frozen"
      />

      <FaqList items={FAQ} />

      <SourceNotes ids={PAGE.sourceIds} />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
