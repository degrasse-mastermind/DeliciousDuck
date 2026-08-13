import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Section, Callout, DataTable, FaqList } from "@/components/site/ArticleShell";
import { DisclosureBanner, ComparisonCard, ComparisonTable, ShopThisGuide, EvaluationNote } from "@/components/site/Commerce";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { DUCK_MERCHANTS, MERCHANT_FACTORS } from "@/data/comparisons";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";

const GUIDE = guideByPath("/buy/where-to-buy-duck-online")!;

export const Route = createFileRoute("/buy/where-to-buy-duck-online")({
  head: () => ({
    ...pageMeta({ title: GUIDE.seoTitle, description: GUIDE.description, path: GUIDE.path, ogType: "article" }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Buy", item: "/buy" },
          { name: GUIDE.title, item: GUIDE.path },
        ]),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: Page,
});

const FAQ = [
  {
    q: "Is fresh duck always better than frozen?",
    a: "Not necessarily. A well-frozen duck from a careful processor often beats a “fresh” bird that has sat several days in transit. What matters more is how it was frozen, how it's packed, and how long it spent above freezing before it reached you.",
  },
  {
    q: "What's the difference between Pekin, Moulard, and Muscovy?",
    a: "Pekin is the standard mild, fattier duck most home cooks know. Moulard is a larger cross bred mainly for foie gras and magret, with a meatier, leaner breast. Muscovy is leaner still, with a more pronounced, slightly gamey flavour. Recipes calibrated for Pekin will render less fat and cook faster on a Muscovy breast.",
  },
  {
    q: "Should I trust production-method claims on a listing?",
    a: "Treat them as a starting point, not a verdict. Specific language — breed name, farm name, processing date — is worth more than generic marketing terms like “premium” or “gourmet,” which carry no defined meaning.",
  },
  {
    q: "Is it worth paying for faster shipping?",
    a: "Only if the alternative risks the cold chain. A duck that arrives still fully frozen on standard shipping is a better outcome than one that arrives partially thawed on a slower, cheaper option — check the seller's stated transit window against your own delivery day before you decide.",
  },
];

function Page() {
  return (
    <ArticleShell
      eyebrow="Buying Guide"
      title={GUIDE.title}
      intro={GUIDE.description}
      trail={[
        { name: "Buy", to: "/buy" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <p>
        Buying duck online is a different exercise from buying chicken. There's no single dominant
        supplier, cuts are named inconsistently between sellers, and almost everything ships frozen
        with a cold chain you're trusting a courier to respect. Star ratings and marketing copy
        won't tell you what you actually need to know. A short list of concrete questions will.
      </p>

      <DisclosureBanner />

      <EvaluationNote scope="duck sellers" />

      <Section id="framework" heading="The comparison framework">
        <p>
          Before you look at any specific seller, work through these seven questions. They apply
          whether you're comparing two mail-order distributors or deciding between mail order and
          your local butcher.
        </p>
      </Section>

      <Section id="cuts" heading="Cut availability">
        <p>
          Decide what you actually need before you shop. A whole duck is the easiest thing to find
          anywhere. Named cuts — magret (a Moulard or Muscovy breast), leg quarters, or rendered fat
          sold on its own — are far less consistently stocked, and a seller that lists them clearly
          by name is doing you a real favour over one that just says "duck breast."
        </p>
      </Section>

      <Section id="labelling" heading="Breed and species labelling: what it changes in your kitchen">
        <p>
          Breed isn't a marketing detail here — it changes how you cook the bird. <strong>Pekin</strong> is
          the standard commercial duck: smaller, fattier, and forgiving. <strong>Moulard</strong> is bred
          for a large, meaty breast (magret) and produces most of the foie gras supply; the breast is
          thicker and leaner than Pekin and needs a longer, gentler render. <strong>Muscovy</strong> is
          leaner again, with less subcutaneous fat and a firmer, more pronounced flavour — recipes
          written for Pekin will overcook a Muscovy breast if you don't adjust.
        </p>
        <p>
          If a listing doesn't name the breed, ask before you order, especially if you're planning a
          specific recipe around expected fat yield. See{" "}
          <Link to="/learn/wild-duck-vs-farmed-duck" className="text-primary underline underline-offset-4">
            wild duck vs. farmed duck
          </Link>{" "}
          for how much species variation can move the numbers.
        </p>
      </Section>

      <Section id="fresh-frozen" heading="Fresh vs. frozen: what frozen really costs you in planning">
        <p>
          Almost all mail-order duck ships frozen — it's the only way to guarantee food safety across
          a multi-day transit. That's not a downgrade on quality, but it is a planning cost: a whole
          duck can take 24–48 hours to thaw safely in the refrigerator, and you need to build that
          into your schedule before the day you intended to cook. See{" "}
          <Link to="/learn/how-to-thaw-duck" className="text-primary underline underline-offset-4">
            how to thaw duck safely
          </Link>{" "}
          for weight-based timings.
        </p>
      </Section>

      <Section id="shipping" heading="Shipping minimums and cold-chain economics">
        <p>
          Cold-chain shipping is expensive, so most sellers set an order minimum to make the box
          worth sending — often meant to be shared across a few cuts or a group order. Read the
          checkout page, not just the product page, before you decide a seller is cheap or
          expensive: a low headline price on one duck can be erased entirely by a shipping charge
          that assumes a much bigger order.
        </p>
      </Section>

      <Section id="transparency" heading="Sourcing transparency">
        <p>
          Look for specifics: breed, farm or producer name, and a processing or best-by date.
          Generic claims (“premium,” “farm-raised,” “gourmet”) carry no verifiable meaning on their
          own. A seller willing to publish producer detail is usually also more careful about the
          rest of the process — from feed programme to how the bird was packed.
        </p>
      </Section>

      <Section id="packaging" heading="Packaging on arrival — what to inspect and when to reject">
        <p>
          The box tells you almost everything about whether the cold chain held. Check it the moment
          it arrives, before you even unpack the rest of your groceries.
        </p>
        <DataTable
          caption="What to check the moment the box arrives"
          columns={["Check", "What you want", "Reject if"]}
          rows={[
            ["Ice packs / gel packs", "Still cold or partially frozen", "Fully melted and warm to the touch"],
            ["Vacuum seal", "Intact, tight against the meat", "Punctured, loose, or full of air"],
            ["Duck temperature", "Still icy or cold to the touch", "Room temperature or noticeably soft"],
            ["Colour and smell", "Pale pink to red, clean smell", "Grey-brown patches or any off odour"],
            ["Packing time in transit", "Matches the seller's stated window", "Box sat at a depot far longer than promised"],
          ]}
        />
        <Callout label="If something's wrong">
          <p>
            Photograph the packaging and the bird before you do anything else, and contact the
            seller the same day. Most legitimate sellers will replace or refund a shipment that
            arrived compromised — but only if you report it immediately rather than after you've
            already put it in the freezer for two weeks.
          </p>
        </Callout>
      </Section>

      <Section id="geography" heading="Geography and delivery days">
        <p>
          Transit time compounds every other risk on this list. A seller two states away on a
          two-day shipping method is a safer bet than one across the country on the same service.
          Check which days a seller actually ships — many avoid dispatching right before a weekend
          so a box doesn't sit at a depot for two extra days.
        </p>
      </Section>

      <Section id="cost-per-portion" heading="Compare cost per usable portion, not the headline price">
        <p>
          A whole duck looks cheap next to a pack of breasts until you account for bone, fat loss,
          and the parts you won't use for the meal you're planning. Before comparing prices between
          two listings, work out what each will actually give you on the plate. The{" "}
          <Link to="/tools/whole-duck-serving-calculator" className="text-primary underline underline-offset-4">
            whole-duck serving calculator
          </Link>{" "}
          converts a raw weight into expected cooked yield, so you can compare a whole bird against
          pre-cut portions on equal terms.
        </p>
      </Section>

      <Section id="local" heading="When a local butcher or Asian supermarket beats mail order">
        <p>
          If you live near either, it's usually the better default. You skip the cold-chain shipping
          fee and the thaw-planning window entirely, you can inspect the bird before you pay, and
          whole ducks at these counters are frequently the cheapest option available to you. The
          trade-off is inconsistent availability of specific cuts and, often, less written detail
          about breed or origin — a conversation with the person behind the counter is your best
          substitute for a product listing.
        </p>
      </Section>

      <Section id="compare" heading="Compare the routes side by side">
        <ComparisonTable caption="Duck sourcing routes compared" rows={DUCK_MERCHANTS} factors={MERCHANT_FACTORS} />
      </Section>

      <Section id="candidates" heading="Sourcing candidates">
        <p>
          The two mail-order sellers below appear as sourcing candidates based on their public
          catalogue information as of the last verification date. DeliciousDuck has not placed an
          order for a hands-on review of either, and no affiliate relationship is currently active
          with any seller on this page.
        </p>
        <div className="mt-6 grid gap-6">
          {DUCK_MERCHANTS.map((row) => (
            <ComparisonCard key={row.id} row={row} factors={MERCHANT_FACTORS} />
          ))}
        </div>
      </Section>

      <ShopThisGuide
        items={[
          {
            label: "Whole duck, breed known",
            why: "The most flexible purchase — it covers roasting, confit legs, and stock from one bird.",
            to: "/cook/whole-roast-duck",
            linkLabel: "See the roasting method",
          },
          {
            label: "Named magret or breast portions",
            why: "Worth seeking out specifically if you cook breast more often than whole birds.",
            to: "/cook/how-to-cook-duck-breast",
            linkLabel: "See the breast method",
          },
        ]}
      />

      <FaqList items={FAQ} />

      <div className="mt-14">
        <NewsletterSignup id="field-guide" interest="sourcing" />
      </div>

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
