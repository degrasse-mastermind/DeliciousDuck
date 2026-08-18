import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Section, Callout, DataTable, FaqList } from "@/components/site/ArticleShell";
import { DisclosureBanner, ComparisonCard, ComparisonTable, ShopThisGuide } from "@/components/site/Commerce";
import { ConversionPaths } from "@/components/site/ConversionPaths";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SafetyNote } from "@/components/site/SafetyNote";
import { THERMOMETERS, THERMOMETER_FACTORS } from "@/data/comparisons";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
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

const GUIDE = guideByPath("/gear/best-thermometer-for-duck")!;
const DG = decisionGuide("/gear/best-thermometer-for-duck")!;

export const Route = createFileRoute("/gear/best-thermometer-for-duck")({
  head: () => ({
    ...pageMeta({ title: GUIDE.seoTitle, description: GUIDE.description, path: GUIDE.path, ogType: "article" }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Gear", item: "/gear" },
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
    q: "Do I really need a thermometer for duck breast?",
    a: "You don't strictly need one, but duck breast passes through its target window in well under a minute once it's near done. A thermometer removes the guesswork that otherwise costs you an overcooked breast.",
  },
  {
    q: "Can I use the same thermometer for a whole duck and a breast?",
    a: "An instant-read will work on both, but a thin-tipped model is far better on a breast, where a fat probe tears the muscle fibres and lets juice escape.",
  },
  {
    q: "How do I check a thermometer's accuracy?",
    a: "Ice-bath test: a slurry of ice and water should read 32°F (0°C). Boiling-water test at sea level should read 212°F (100°C), adjusted for altitude. If a unit is off by more than a couple of degrees, calibrate it if the model allows, or account for the offset.",
  },
  {
    q: "Is a leave-in probe more accurate than an instant-read?",
    a: "Accuracy depends on the specific unit, not the category. What differs is what each is built for: continuous monitoring versus a fast spot-check.",
  },
];

function Page() {
  return (
    <ArticleShell
      eyebrow="Gear Guide"
      title={GUIDE.title}
      intro={GUIDE.description}
      trail={[
        { name: "Gear", to: "/gear" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <p>
        The right thermometer for duck depends less on brand and more on what you're cooking. A
        breast that finishes in a few minutes needs a fast spot-check tool. A whole roast or a long
        confit needs something that can watch the oven while you're not standing over it. Buying the
        wrong category for your cooking style is the most common mistake here — not buying a "bad"
        unit.
      </p>

      <EditorialByline guide={DG} />

      <QuickDecision guide={DG} />

      <DisclosureBanner />

      <MethodologyPanel guide={DG} />

      <SafetyNote />

      <Section id="by-profile" heading="Match the thermometer to how you cook">
        <p>
          Start from your cooking profile, not a shopping list. Most home cooks fall into one of
          three patterns, and each rewards a different tool.
        </p>
        <DataTable
          caption="Cook profile → thermometer type"
          columns={["Cook profile", "Best tool", "Why"]}
          rows={[
            ["Breast-first cook", "Fast instant-read", "You're checking a thin cut inside a window measured in seconds; you need to be there and read it fast."],
            ["Whole-roast cook", "Leave-in probe with alarm, or instant-read for a final check", "A two-hour roast benefits from continuous monitoring; a final instant-read spot-check confirms the read before carving."],
            ["Confit / long, low cook", "Leave-in probe, or scheduled spot-checks", "The cook runs for hours at low, stable heat — continuous monitoring saves you from opening the oven repeatedly."],
          ]}
        />
        <p>
          See{" "}
          <Link to="/learn/duck-breast-temperature-doneness" className="text-primary underline underline-offset-4">
            duck breast temperature and doneness
          </Link>{" "}
          and{" "}
          <Link to="/learn/whole-duck-cooking-time" className="text-primary underline underline-offset-4">
            whole duck cooking time
          </Link>{" "}
          for the actual target numbers behind each profile.
        </p>
      </Section>

      <Section id="what-matters" heading="What actually matters on a spec sheet">
        <p>
          Once you know your category, these are the specifics worth reading before you buy —
          without assuming any particular brand or model has the best version of them.
        </p>
      </Section>

      <Section id="speed" heading="Read speed" level={3}>
        <p>
          On a breast, a thermometer that takes ten or more seconds to settle can cost you real
          overcooking while you wait for a stable number. Look for a stated read time in the low
          single digits of seconds on any instant-read you're considering.
        </p>
      </Section>

      <Section id="tip" heading="Tip diameter" level={3}>
        <p>
          A thin probe tip matters most on duck breast: a fat tip tears muscle fibres and lets juice
          run out through the hole it made, which is the opposite of what you want right before
          resting and slicing. Leave-in probes are generally thicker by design — fine for a thigh or
          a whole bird, clumsy on a breast.
        </p>
      </Section>

      <Section id="ergonomics" heading="Probe placement ergonomics" level={3}>
        <p>
          On a whole bird, you're aiming for the thickest part of the thigh without touching bone —
          a task that's much easier with a probe that has some stiffness and a clear depth marker or
          guard, rather than a floppy, unmarked wire.
        </p>
      </Section>

      <Section id="ambient" heading="Ambient oven probes" level={3}>
        <p>
          Some leave-in models include a second probe or a display mode that reads the oven's actual
          air temperature, not just the dial setting. This is worth having if you suspect your oven
          runs hot or cold — a common and largely invisible source of the "why did this take longer
          than the recipe said" problem covered in{" "}
          <Link to="/learn/whole-duck-cooking-time" className="text-primary underline underline-offset-4">
            whole duck cooking time
          </Link>
          .
        </p>
      </Section>

      <Section id="calibration" heading="Calibration, water resistance, and warranty" level={3}>
        <p>
          Check whether a model supports user calibration (useful after it's been dropped), what
          water-resistance rating it carries if you plan to rinse it under a tap, and the length and
          terms of the warranty — probes and cables are usually the first thing to fail. Treat all
          three as spec-sheet items to compare, not as claims we're making about any specific
          product.
        </p>
      </Section>

      <Section id="mistakes" heading="Common mistakes">
        <ul className="list-disc space-y-2 pl-5">
          <li>Buying a leave-in probe for someone who only ever cooks duck breast.</li>
          <li>Trusting a reading taken near bone, which reads differently from the surrounding meat.</li>
          <li>Never checking calibration after the unit has been dropped or left in a hot dishwasher.</li>
          <li>Reading immediately on insertion instead of waiting the stated settling time.</li>
        </ul>
      </Section>

      <Section id="which" heading="Which one should you buy">
        <p>
          <strong>Choose a fast instant-read if:</strong> you mostly cook duck breast, or you want one
          general-purpose tool that also works for other proteins.
        </p>
        <p>
          <strong>Choose a leave-in probe if:</strong> you roast whole ducks regularly, or you cook
          confit and want to avoid opening the oven every twenty minutes.
        </p>
        <p>
          <strong>Choose both if:</strong> you do a genuine mix of both cooking styles — a leave-in
          probe for the long cook, an instant-read for the final check before carving or slicing.
        </p>
        <p>
          For the actual target numbers and probe placement to use with whichever tool you choose,
          run through the{" "}
          <Link to="/tools/duck-doneness-guide" className="text-primary underline underline-offset-4">
            interactive duck doneness guide
          </Link>
          .
        </p>
      </Section>

      <DuckBreastJourney
        id="cluster-where-numbers-come-from"
        title="Where the numbers you'll be reading come from"
        intro="A probe is only useful with a target. These pages supply the targets and the method around them."
        placement="thermometer_numbers"
        variant="grouped"
        groups={["stove", "troubleshooting"]}
        excludePath="/gear/best-thermometer-for-duck"
      />

      <Section id="matrix" heading="The decision matrix">
        <p>
          Four categories, and the specification that decides each one. Nothing here is a ranking —
          the rows are the questions to ask, not scores.
        </p>
        <DecisionMatrixTable guide={DG} />
      </Section>

      <BestForGrid guide={DG} />

      <Section id="compare" heading="Compare instant-read, leave-in, and a brand candidate">
        <ComparisonTable
          caption="Thermometer categories compared"
          rows={THERMOMETERS}
          factors={THERMOMETER_FACTORS}
        />
        <div className="mt-6 grid gap-6">
          {THERMOMETERS.map((row) => (
            <ComparisonCard key={row.id} row={row} factors={THERMOMETER_FACTORS} />
          ))}
        </div>
        <Callout label="On the ThermoWorks entry" tone="gold">
          <p>
            ThermoWorks is listed here as a research-stage brand candidate based on its published
            specifications, not a recommendation or a test result. DeliciousDuck has not hands-on
            tested any model from this or any other brand.
          </p>
        </Callout>
      </Section>

      <CommercialCallout
        heading="Where to look for an instant-read"
        intro="One registered destination whose published catalogue lists fast-read thermometers. We name no model, and we have not tested one."
        placement="thermometer_instant_read"
        linkIds={["thermoworks-thermometer"]}
        criteria={[
          "A stated read time in low single-digit seconds, published by the manufacturer.",
          "A thin probe tip, so a duck breast does not drain through the hole you just made.",
          "A stated accuracy figure, plus user calibration if the model allows it.",
          "A water-resistance rating that covers how you actually intend to clean it.",
        ]}
        footnote="We publish no prices, ratings, or stock claims. Check the manufacturer's own page for current specifications and terms."
      />

      <CommercialCallout
        heading="Browse the two thermometer categories"
        intro="One instant-read for spot checks, one leave-in probe for long roasts. Category links only — we name no models and publish no prices or ratings."
        placement="thermometer_options"
        linkIds={["amazon-instant-read-thermometer", "amazon-leave-in-probe-thermometer"]}
        criteria={[
          "A published read time and accuracy figure from the manufacturer.",
          "A thin probe tip, so a duck breast does not drain through the hole.",
          "For a leave-in probe: an oven-safe cable and a settable alarm.",
          "Water resistance that matches how you actually clean it.",
        ]}
        footnote="Category links, not product recommendations. Check the retailer's own listing for specifications, availability, and terms."
      />

      <ShopThisGuide
        items={[
          {
            label: "A fast instant-read thermometer",
            why: "The minimum tool for cooking duck breast to a repeatable result.",
            to: "/learn/duck-breast-temperature-doneness",
            linkLabel: "See target temperatures",
          },
          {
            label: "A leave-in probe with alarm",
            why: "Worth adding once whole roasts or confit become a regular part of your cooking.",
            to: "/learn/whole-duck-cooking-time",
            linkLabel: "See cooking-time ranges",
          },
        ]}
      />

      <FaqList items={FAQ} />

      <ConversionPaths
        heading="What this thermometer has to do"
        sourcePath="/gear/best-thermometer-for-duck"
        eyebrow="Read these first"
        intro="What a probe is actually for, before you choose one."
      />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
