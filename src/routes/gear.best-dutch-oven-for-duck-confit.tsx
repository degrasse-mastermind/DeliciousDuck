import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section } from "@/components/site/ArticleShell";
import { DisclosureBanner, EvaluationNote, ShopThisGuide } from "@/components/site/Commerce";
import { CommercialCallout } from "@/components/site/CommercialLink";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { ConversionPaths } from "@/components/site/ConversionPaths";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SourceMark } from "@/components/site/SourceMark";
import { SourceNotes } from "@/components/site/SourceNotes";
import {
  BestForGrid,
  DecisionMatrixTable,
  EditorialByline,
  MethodologyPanel,
  QuickDecision,
} from "@/components/site/DecisionGuide";
import { decisionGuide } from "@/data/decision-guides";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/gear/best-dutch-oven-for-duck-confit")!;
const DG = decisionGuide("/gear/best-dutch-oven-for-duck-confit")!;

const FAQ = [
  {
    q: "Do I need a Dutch oven to make duck confit?",
    a: "No. Any lidded, oven-safe vessel with a nonreactive interior works, as long as the legs fit in a single snug layer with enough depth to cover them in fat. A Dutch oven is popular because it does all of that and holds a low oven steadily.",
  },
  {
    q: "What size pot should I use for duck confit?",
    a: "Size by the legs, not by quarts. Lay the cured legs flat in the vessel you own: if they sit in one layer without overlapping and there is still an inch or two of wall above them, that is the right vessel. A pot that gives them room to spread out will just need more fat.",
  },
  {
    q: "Is a braiser better than a Dutch oven for confit?",
    a: "A braiser is wide and shallow, which is excellent for a single snug layer but can leave too little headroom for fat above the legs. Check the depth against the legs you are actually cooking before committing.",
  },
  {
    q: "Can I use a ceramic baking dish for confit?",
    a: "Yes for oven-only cooking, if the dish is snug, deep enough, and used within the manufacturer's stated oven-safe limit. Cover it with its own lid or with foil, and keep it off the stovetop.",
  },
  {
    q: "Does the vessel material change the flavour?",
    a: "Not meaningfully, as long as the interior is nonreactive. Enamel, stainless and glazed ceramic all leave the cure and the fat alone; bare cast iron and unlined aluminium are the ones to avoid with a salty, sometimes acidic cure.",
  },
];

export const Route = createFileRoute("/gear/best-dutch-oven-for-duck-confit")({
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
          { name: "Gear", item: "/gear" },
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

function Page() {
  return (
    <ArticleShell
      eyebrow="Gear Guide"
      title="Best Pot for Duck Confit: Dutch Oven vs Braiser"
      intro={GUIDE.description}
      trail={[
        { name: "Gear", to: "/gear" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
      autoSketch={false}
    >
      <p>
        The best pot for duck confit is the snuggest one you own that also has a lid, a nonreactive
        interior, and enough depth to keep the legs under fat. Fit is the whole decision. A vessel
        that holds the legs in one tight layer needs dramatically less rendered fat than a wide pot,
        and a crowded or stacked vessel cooks unevenly because the legs on top spend the cook only
        half-submerged.
      </p>
      <p>
        So before you shop: lay your cured legs flat in the pot you already have. If they sit in a
        single layer without overlapping, and there is still wall above them to hold fat, you are
        done — buy fat instead of hardware.
      </p>

      <EditorialByline guide={DG} />

      <QuickDecision guide={DG} />

      <Callout label="Use what you own">
        A snug, lidded, nonreactive, oven-safe vessel that fits the legs in one layer is the correct
        pot, whatever it cost. Enameled cast iron, a stainless Dutch oven, a deep covered sauté pan
        and a covered ceramic casserole all qualify. The only vessels worth replacing are bare cast
        iron or unlined aluminium, which react with a salty cure, and anything so wide that the legs
        spread out.
      </Callout>

      <DisclosureBanner />

      <CommercialCallout
        heading="If the pot you own fails the fit test"
        intro="An enameled Dutch oven is the durable all-purpose option when you need a snug, lidded, nonreactive vessel. Measure your legs and existing pot before buying."
        linkIds={["amazon-enameled-dutch-oven"]}
        placement="confit_vessel_early_option"
      />

      <MethodologyPanel guide={DG} />

      <Section id="fit" heading="Why fit decides everything">
        <p>
          Confit works because the legs stay covered. Fat is the seal and the medium; the moment a
          leg breaks the surface it starts to dry and colour instead of cooking gently. Two things
          break that seal: a vessel wide enough that the fat spreads into a shallow pool, and a
          vessel small enough that the legs have to be stacked.
        </p>
        <p>
          Width is the expensive mistake. Every extra inch of floor area has to be filled with
          rendered fat before the fat level even reaches the top of the legs, so an oversized pot can
          easily double what you buy or render. Depth is the cheap insurance: you want the legs
          covered with a little headroom, not a pot filled to the rim.
        </p>
        <DataTable
          caption="What each fit problem does to the cook"
          columns={["Vessel", "What happens", "What it costs you"]}
          rows={[
            [
              "Snug single layer",
              "Legs stay covered with the least fat, and the fat temperature stays even around them",
              "Nothing — this is the target",
            ],
            [
              "Too wide",
              "Fat spreads out; you keep topping up to reach the top of the legs",
              "Fat you did not need to buy, and a longer warm-up",
            ],
            [
              "Too small / stacked",
              "Upper legs sit proud of the fat and cook in air rather than fat",
              "Uneven texture, dry patches, and awkward turning mid-cook",
            ],
            [
              "Too shallow",
              "Little headroom above the legs, so the fat creeps close to the rim",
              "Spills, and a harder pot to move safely",
            ],
          ]}
        />
      </Section>

      <Section id="measure" heading="Measure before you buy">
        <p>Five minutes with the legs and the pot answers this better than any spec sheet.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Lay the legs flat in the vessel, as they will actually cook. They should touch but not
            overlap.
          </li>
          <li>
            Check the wall above them. You want room for fat to cover the legs plus a margin, not a
            pot filled level with the rim.
          </li>
          <li>
            Confirm the interior is nonreactive — enamel, stainless or glazed ceramic — because the
            cure is salty and often carries citrus or wine.
          </li>
          <li>
            Confirm a lid that seats properly. Foil is a workable stand-in; a loose lid is not a
            reason to buy a new pot.
          </li>
          <li>
            Check the maker's stated oven-safe temperature, including the lid and any knob or
            handle, against the low oven you plan to use.
          </li>
          <li>
            Lift it empty, then imagine it full of hot fat. If that is not a movement you can make
            calmly, choose a lighter vessel or a smaller batch.
          </li>
          <li>
            If you plan to warm the fat on the stovetop first, confirm the vessel is rated for your
            hob — including induction, which needs a magnetic base.
          </li>
        </ul>
        <p>
          Working out how much fat that vessel will take?{" "}
          <Link
            to="/learn/how-to-render-duck-fat"
            className="text-primary underline underline-offset-4"
          >
            Rendering your own
          </Link>{" "}
          and the{" "}
          <Link to="/buy/duck-fat-buying-guide" className="text-primary underline underline-offset-4">
            duck-fat buying guide
          </Link>{" "}
          cover the formats and quantities.
        </p>
      </Section>

      <Section id="how-vessel-changes-cook" heading="How the vessel changes the cook">
        <Section id="fat-volume" heading="Fat volume" level={3}>
          <p>
            Narrow and deep is cheaper to fill than wide and shallow, for the same number of legs.
            This is the single biggest practical difference between two pots that both "work".
          </p>
        </Section>
        <Section id="submersion" heading="Even submersion" level={3}>
          <p>
            One layer means every leg meets the same fat at the same temperature. Stack them and the
            top layer cooks differently, which shows up as texture you cannot fix later.
          </p>
        </Section>
        <Section id="stability" heading="Temperature stability" level={3}>
          <p>
            Confit is a long, low cook, so the vessel's thermal mass matters more than its
            responsiveness. Heavy enameled cast iron rides out an oven cycling around its setpoint;
            lighter stainless follows the oven more closely, which is fine as long as you are
            measuring the fat rather than trusting the dial. The safety target is the meat
            temperature: poultry is safe at a minimum internal 165°F (74°C)
            <SourceMark to="sources" />, even though the fat around it never simmers.
          </p>
        </Section>
        <Section id="handling" heading="Safe handling" level={3}>
          <p>
            You will move this vessel while it holds a litre or more of hot fat. Loop handles you can
            grip with two mitts, a lid that stays put, and a weight you can control matter more than
            any finish. Plan where the pot is going to land before you lift it.
          </p>
        </Section>
        <Section id="storage" heading="Cooling and storage" level={3}>
          <p>
            Legs keep best submerged in their fat under refrigeration, so a vessel you can cover and
            put straight in the fridge saves a transfer. Cool it promptly rather than leaving it on
            the counter, and keep cooked confit refrigerated<SourceMark to="sources" /> — see the
            storage section of{" "}
            <Link to="/cook/duck-leg-confit" className="text-primary underline underline-offset-4">
              the confit method
            </Link>{" "}
            for the windows.
          </p>
        </Section>
      </Section>

      <Section id="matrix" heading="The decision matrix">
        <p>
          Four vessel categories against the things that actually change your cook. Nothing here is
          a ranking — the rows are the questions to ask of the pot in front of you.
        </p>
        <DecisionMatrixTable guide={DG} />
      </Section>

      <BestForGrid guide={DG} />

      <Section id="mistakes" heading="Common buying mistakes">
        <ul className="list-disc space-y-2 pl-5">
          <li>Buying the biggest pot on the shelf, then paying for fat to fill the empty space.</li>
          <li>
            Choosing a wide, shallow braiser without checking there is headroom above the legs.
          </li>
          <li>Using bare cast iron or unlined aluminium with a salty, sometimes acidic cure.</li>
          <li>
            Ignoring the maker's oven-safe limit for the lid, knob or handle rather than just the
            body.
          </li>
          <li>
            Buying a vessel you cannot lift full of hot fat, which turns a calm cook into a risk.
          </li>
          <li>Replacing a pot that already fits the legs in one layer.</li>
        </ul>
      </Section>

      <CommercialCallout
        heading="Browse the vessel categories"
        intro="Category links only — we name no models and publish no prices, ratings or capacities. Take your measurements to the listing."
        placement="confit_vessel_options"
        linkIds={[
          "amazon-enameled-dutch-oven",
          "amazon-stainless-dutch-oven",
          "amazon-covered-ceramic-casserole",
        ]}
        criteria={[
          "Interior dimensions that hold your legs in one snug layer, with wall left above them.",
          "A nonreactive interior: enamel, stainless or glazed ceramic.",
          "A lid that seats properly, and a stated oven-safe limit that covers the whole assembly.",
          "A weight and handle shape you can move confidently when the vessel is full of hot fat.",
        ]}
        footnote="Check the retailer's own listing for dimensions, materials, oven-safe limits and terms."
      />

      <EvaluationNote scope="confit vessels" />

      <ShopThisGuide
        items={[
          {
            label: "A snug, lidded, oven-safe vessel",
            why: "The only piece of equipment confit genuinely requires. If yours fits the legs in one layer, you are set.",
            to: "/cook/duck-leg-confit",
            linkLabel: "See the confit method",
          },
          {
            label: "Enough rendered duck fat to cover the legs",
            why: "Your vessel's width decides the volume, so size the fat after you have measured the pot.",
            to: "/buy/duck-fat-buying-guide",
            linkLabel: "Compare duck-fat formats",
          },
          {
            label: "A thermometer you can read in the fat",
            why: "Domestic ovens are least accurate at low settings; measure the fat and the meat, not the dial.",
            to: "/gear/best-thermometer-for-duck",
            linkLabel: "Thermometer buying guide",
          },
        ]}
      />

      <NewsletterSignup id="confit-vessel-guide-secondary" interest="duck-fat" />

      <FaqList items={FAQ} />

      <ConversionPaths
        sourcePath="/gear/best-dutch-oven-for-duck-confit"
        eyebrow="Read these next"
        heading="What the vessel has to do"
        intro="The method and the fat maths behind the fit decision."
      />

      <SourceNotes ids={["usdaPoultryTemp", "usdaLeftovers", "fdaColdStorage"]} />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
