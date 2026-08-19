import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Section, Callout, DataTable, FaqList } from "@/components/site/ArticleShell";
import {
  DisclosureBanner,
  ComparisonCard,
  ComparisonTable,
  QuickPicks,
  ShopThisGuide,
} from "@/components/site/Commerce";
import { ConversionPaths } from "@/components/site/ConversionPaths";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { BREAST_SELLERS, BREAST_SELLER_FACTORS } from "@/data/comparisons";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { DuckBreastJourney } from "@/components/site/DuckBreastJourney";
import { CommercialCallout } from "@/components/site/CommercialLink";
import { decisionGuide } from "@/data/decision-guides";
import {
  BestForGrid,
  DecisionMatrixTable,
  EditorialByline,
  MethodologyPanel,
  QuickDecision,
} from "@/components/site/DecisionGuide";

const GUIDE = guideByPath("/buy/where-to-buy-duck-breast-online")!;
const DG = decisionGuide("/buy/where-to-buy-duck-breast-online")!;

export const Route = createFileRoute("/buy/where-to-buy-duck-breast-online")({
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
          updated: DG.updated,
        }),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: Page,
});

const FAQ = [
  {
    q: "Which duck breast format should I buy for pan searing?",
    a: "Boneless and skin-on, with the fat cap intact. The cold-pan method exists to render that fat and crisp the skin, so a skinless breast rules the method out before you start. If a listing doesn't say “skin-on” in words, don't infer it from the photograph — ask.",
  },
  {
    q: "Is magret different from ordinary duck breast?",
    a: "Magret is the breast of a Moulard duck, and it's conventionally sold larger and thicker than a Pekin-type breast. That extra thickness is genuinely useful: it buys you more time to render the skin before the centre climbs past where you wanted it. It also needs a pan big enough to hold it flat.",
  },
  {
    q: "How many duck breasts should I order per person?",
    a: "One breast per person is the normal plating unit, and a larger magret-style breast is often sliced across for two smaller plates. Weights vary between sellers and between packs, so read the weight on the listing rather than assuming — we don't publish a guaranteed weight for anyone's breast.",
  },
  {
    q: "Will mail-order duck breast arrive frozen, and how do I thaw it?",
    a: "Almost always frozen, because that's how a seller holds a cold chain across multi-day transit. Thaw it in the refrigerator, never on the counter, and keep it refrigerated at 40°F (4°C) or below until you cook. Refrigerator-thawed raw poultry keeps 1–2 days before cooking.",
  },
  {
    q: "Can I trust a breed name on the listing to tell me how to cook it?",
    a: "Only loosely. The size and thickness of the breast in front of you decides your timing more than the name on the box does. Take the format and the weight from the listing, then judge fat cover and thickness once the package is open.",
  },
  {
    q: "Should I buy breast, or buy a whole duck and cut it myself?",
    a: "Buy breast when breast is the meal and you want two even pieces with no butchery. A whole bird is better value per pound and gives you legs and fat as well, but it commits you to a longer thaw and a different cook. For that comparison, start with the general sourcing guide.",
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
        Duck breast is the cut most people search for by name, and it's also the one sellers describe
        least consistently. Two listings can both say “duck breast” and mean different things: skin on
        or off, one piece or a pair, a modest Pekin breast or a magret twice its thickness. Sort out
        the format and the weight first. The seller you choose falls out of that, not the other way
        round.
      </p>

      <EditorialByline guide={DG} />

      <QuickDecision guide={DG} />

      <DisclosureBanner />

      <QuickPicks
        rows={BREAST_SELLERS}
        placement="where_to_buy_breast_quick_picks"
        shopNoun="duck breast"
        intro="The four sellers covered below, read for breast intent only, with who each one suits. Every detail comes from the seller's own public catalogue at the last check — no prices, rankings, or stock claims."
      />

      <MethodologyPanel guide={DG} />

      <Callout label="Buying more than breast?">
        <p>
          This page stays on one cut. If you're still deciding between breast, legs, and a whole
          bird — or comparing shipping minimums and cold-chain economics across a bigger order — the{" "}
          <Link
            to="/buy/where-to-buy-duck-online"
            className="text-primary underline underline-offset-4"
          >
            general guide to buying duck online
          </Link>{" "}
          covers the wider comparison, and{" "}
          <Link
            to="/buy/what-cut-of-duck-to-buy"
            className="text-primary underline underline-offset-4"
          >
            what cut of duck to buy
          </Link>{" "}
          works through the choice itself.
        </p>
      </Callout>

      <Section id="formats" heading="The formats you'll actually see listed">
        <p>
          Four descriptions cover nearly everything sold online, and the difference between them
          changes how you cook far more than the seller's name does.
        </p>
        <DataTable
          caption="Duck breast formats and what each one is for"
          columns={["How it's listed", "What you get", "What it's for"]}
          rows={[
            [
              "Boneless, skin-on",
              "A single breast half with the fat cap on, no bone",
              "The default for pan searing — score, render from cold, rest",
            ],
            [
              "Magret / Moulard breast",
              "A larger, thicker breast, usually sold singly",
              "Slicing across for a plate, with more margin while the skin renders",
            ],
            [
              "Skinless breast",
              "Lean meat, no fat cap",
              "Grilling, stir-fries, salads — anything that never wanted crisp skin",
            ],
            [
              "Frozen portioned pack",
              "Several pieces frozen individually or together",
              "Cooking in twos over weeks, or feeding a table on one schedule",
            ],
          ]}
        />
      </Section>

      <Section id="weight" heading="Weight per breast, and the pack you're committing to">
        <p>
          Two numbers decide whether an order suits your dinner: the weight of a single breast and
          how many pieces the pack contains. Both sit on the listing, and both move between sellers
          and between production batches — which is why we quote neither. Read them before you plan a
          headcount, and remember a large magret-style breast is often one piece serving two plates,
          not two pieces serving two people.
        </p>
        <p>
          Thickness matters as much as weight. A thicker breast gives you longer to render the fat
          before the centre passes the window you were aiming for, which is exactly why it's the
          friendlier cut for a plate you intend to slice. The{" "}
          <Link
            to="/learn/duck-breast-temperature-doneness"
            className="text-primary underline underline-offset-4"
          >
            pull temperatures and carryover
          </Link>{" "}
          page is where that window is set out.
        </p>
      </Section>

      <Section id="choose-by-outcome" heading="Choose by the cook, not by the brand">
        <p>
          Work from the dinner backwards. Each of these is a different purchase, even when it comes
          from the same seller.
        </p>
        <DataTable
          caption="Match the buy to the cook"
          columns={["What you're cooking", "What to buy", "Why"]}
          rows={[
            [
              "First attempt at pan-seared breast",
              "Two boneless, skin-on breasts at the smaller end of the range",
              "The skin is the point, and a smaller breast is quicker to get right",
            ],
            [
              "A sliced breast plate for guests",
              "A magret-style breast where the type is named",
              "Thicker meat means a wider window between crisp skin and overdone centre",
            ],
            [
              "Dinner for two, no leftovers",
              "A two-pack of similarly sized breasts",
              "One per person, and two pieces fit a 10–12 inch pan without crowding",
            ],
            [
              "Several guests on one schedule",
              "A multi-pack from a single producer",
              "Even pieces cook to the same timings; past four or five, consider whole birds",
            ],
            [
              "Grilling, stir-fry, or salad",
              "Skinless breast, or accept you'll remove the skin",
              "Nothing here renders a fat cap, so you're paying for weight you'll trim",
            ],
            [
              "Whatever's available this week",
              "Frozen portioned breast, including store pickup",
              "Frozen at the processor is a sound cold chain, and pickup removes courier risk",
            ],
          ]}
        />
      </Section>

      <Section id="shipping" heading="Shipping, arrival, and the checks worth doing at the door">
        <p>
          Breast is small, which cuts both ways: a box of two breasts carries less thermal mass than a
          whole bird, so it warms faster if it sits at a depot. Check the seller's ship days and
          stated transit window against a delivery day you'll be home for, then inspect the box before
          you unpack anything else.
        </p>
        <DataTable
          caption="What to check the moment a breast order arrives"
          columns={["Check", "What you want", "Reject if"]}
          rows={[
            ["Ice or gel packs", "Still cold or partly frozen", "Fully melted and warm to the touch"],
            ["Vacuum seal", "Tight against the meat, intact", "Punctured, loose, or full of air"],
            ["Meat temperature", "Still icy or cold", "Room temperature or noticeably soft"],
            ["Skin and fat cap", "Intact, pale, dry-looking", "Torn away from the meat, or slimy"],
            ["Colour and smell", "Deep pink to red, clean smell", "Grey-brown patches or any off odour"],
          ]}
        />
        <Callout label="Then: refrigerate, thaw, cook">
          <p>
            Get it into a refrigerator at 40°F (4°C) or below straight away, and thaw in the
            refrigerator rather than on the counter — see{" "}
            <Link to="/learn/how-to-thaw-duck" className="text-primary underline underline-offset-4">
              how to thaw duck safely
            </Link>
            . Once thawed in the refrigerator, raw breast keeps 1–2 days before you cook it, and it
            can be refrozen within that window if your plans change. If a shipment arrives
            compromised, photograph the packaging and the meat and contact the seller the same day.
          </p>
        </Callout>
      </Section>

      <Section id="matrix" heading="The four formats, side by side">
        <p>
          Read down the column for the format you were leaning toward, then across the rows that
          matter for this cook.
        </p>
        <DecisionMatrixTable guide={DG} />
      </Section>

      <BestForGrid guide={DG} />

      <CommercialCallout
        heading="Where duck breast is currently listed by name"
        intro="The same four duck-meat sellers we cover site-wide, ordered by how well each solves a breast-specific problem rather than by whether it pays us. Catalogues reviewed 2026-08-18 — check the current listing for formats, weights, and pack counts."
        placement="buy_duck_breast_primary_options"
        linkIds={["culver-duck", "tastyduck-duck", "fossil-farms-duck", "wild-fork-duck"]}
        criteria={[
          "Breast is named as its own product, with skin-on or skinless stated in words.",
          "The listing gives a weight per breast and a pack count, so you can plan a headcount.",
          "Frozen shipping is scheduled to a delivery day you will actually be home for.",
          "The order minimum makes sense for two breasts, not just for a freezer restock.",
        ]}
        footnote="We publish no prices, ratings, or stock claims, and no weight or delivery promises on a seller's behalf. Availability moves week to week."
      />

      <Section id="compare" heading="The sellers, read for breast">
        <p>
          Same four sellers as the general sourcing guide, compared on the things that only matter
          when breast is what you came for. Every attribute comes from the seller's own public
          catalogue at the verification date shown.
        </p>
        <ComparisonTable
          caption="Online duck breast sellers compared"
          rows={BREAST_SELLERS}
          factors={BREAST_SELLER_FACTORS}
        />
      </Section>

      <Section id="candidates" heading="Each seller in detail">
        <p>
          Notes below come from public catalogue information as of the verification date on each
          card. Check the seller's own page for current formats and terms.
        </p>
        <div className="mt-6 grid gap-6">
          {BREAST_SELLERS.map((row) => (
            <ComparisonCard
              key={row.id}
              row={row}
              factors={BREAST_SELLER_FACTORS}
              shopNoun="duck breast"
            />
          ))}
        </div>
      </Section>

      <DuckBreastJourney
        id="cluster-cook-it"
        title="Cooking the breast once it lands"
        intro="Buying is step one. These pages take it from the package to the plate."
        placement="buy_breast_after_delivery"
        groups={["before", "stove", "troubleshooting"]}
        excludePath="/buy/where-to-buy-duck-breast-online"
      />

      <ShopThisGuide
        items={[
          {
            label: "Boneless, skin-on breast",
            why: "The format the cold-pan method is built around, and the one worth insisting on.",
            to: "/recipes/pan-seared-duck-breast",
            linkLabel: "See the recipe",
          },
          {
            label: "A pan that fits two breasts flat",
            why: "Crowding steams the skin — pan size and piece size have to agree.",
            to: "/gear/best-pan-for-duck-breast",
            linkLabel: "See the pan guide",
          },
          {
            label: "A fast-reading probe",
            why: "Breast lives in a few-degree window, and guessing costs you the whole cut.",
            to: "/gear/best-thermometer-for-duck",
            linkLabel: "See the thermometer guide",
          },
        ]}
      />

      <FaqList items={FAQ} />

      <div className="mt-14">
        <NewsletterSignup id="field-guide" interest="sourcing" />
      </div>

      <ConversionPaths
        heading="What to read before you order"
        sourcePath="/buy/where-to-buy-duck-breast-online"
        eyebrow="Next step"
        intro="The cook decides the format — so start with the method you intend to use."
      />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
