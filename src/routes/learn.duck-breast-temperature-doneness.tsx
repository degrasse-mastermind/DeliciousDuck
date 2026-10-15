import { createFileRoute } from "@tanstack/react-router";
import { distributionMetadata } from "@/lib/distribution-metadata";
import { AirFryerRecipeLink } from "@/components/site/AirFryerRecipeLink";
import { AIR_FRYER_INBOUND_PLACEMENTS } from "@/data/air-fryer-inbound";
import { ArticleShell, Section, DataTable, Callout, FaqList } from "@/components/site/ArticleShell";
import { SafetyNote } from "@/components/site/SafetyNote";
import { SourceNotes } from "@/components/site/SourceNotes";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
import { DuckBreastJourney } from "@/components/site/DuckBreastJourney";
import { CommercialCallout } from "@/components/site/CommercialLink";
import { DecisionNextSteps } from "@/components/site/DecisionGuide";
import { ConversionPaths } from "@/components/site/ConversionPaths";

const GUIDE = guideByPath("/learn/duck-breast-temperature-doneness")!;
const DISTRIBUTION = distributionMetadata("/learn/duck-breast-temperature-doneness");

const FAQ = [
  {
    q: "What internal temperature should duck breast be?",
    a: "Two answers, for two questions. The USDA safe minimum for poultry, duck included, is 165°F (73.9°C). Medium-rare at 130–135°F (54–57°C) is a culinary texture convention below USDA’s recommended minimum, not a safety clearance. Measure 165°F before removal; do not assume resting will supply the difference.",
  },
  {
    q: "What internal temperature is duck cooked at, beyond the breast?",
    a: "165°F (73.9°C) is the safe minimum for every part of the bird. Beyond that, targets follow texture: duck legs and the thigh of a whole bird are usually taken to 175–185°F (79–85°C), where connective tissue has softened and the meat pulls easily, and confit legs sit in fat held at 190–210°F (88–99°C) until a skewer meets no resistance.",
  },

  {
    q: "What temperature is medium duck breast?",
    a: "Medium at 140–145°F (60–63°C) describes a culinary texture preference below the USDA minimum. It is not a safe equivalent to a measured 165°F.",
  },
  {
    q: "Is pink duck breast safe to eat?",
    a: "Pink at 130–135°F is a texture choice, not a safety endpoint. USDA recommends measuring at least 165°F (74°C); color cannot establish safety. Proper handling and avoiding cross-contamination still matter. Cook to 165°F for very young, elderly, pregnant, or immunocompromised diners.",
  },
  {
    q: "How much does duck breast carry over while resting?",
    a: "Carryover varies with thickness and cooking conditions. Measure rather than assume a fixed rise, and reach the recommended minimum before removing duck from the heat.",
  },
  {
    q: "Where do you put the thermometer in a duck breast?",
    a: "Through the side, horizontally, with the tip in the geometric centre of the thickest part. Probing down through the fat cap, touching the pan, or landing near the tapered thin edge all read high and can leave the centre undercooked.",
  },
];


export const Route = createFileRoute("/learn/duck-breast-temperature-doneness")({
  head: () => ({
    ...pageMeta({
      title: GUIDE.seoTitle,
      description: GUIDE.description,
      path: GUIDE.path,
      ogType: "article",
      ...(DISTRIBUTION ? { image: DISTRIBUTION.primaryImage } : {}),
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
      eyebrow="Reference"
      title={GUIDE.title}
      intro={GUIDE.description}
      trail={[
        { name: "Learn", to: "/learn" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read · Reference`}
    >
      <Section id="two-numbers" heading="Two different numbers, two different jobs">
        <p>
          Duck breast temperature guidance splits into two categories that get conflated constantly:
          a food-safety minimum set by USDA, and a set of culinary conventions used to hit a
          particular texture. They answer different questions. USDA recommends a measured minimum
          internal temperature of 165°F (74°C) for duck, including breasts and whole birds. Lower
          culinary temperatures describe texture preferences below that recommendation; proper
          handling and avoiding cross-contamination still matter.
        </p>
      </Section>

      <SafetyNote heading="The official safety minimum" />

      <Callout label="One thermometer recommendation">
        For everyday spot checks, our specification-based choice is the TempPro TP19H. If your
        current thermometer works reliably, keep using it. See the{" "}
        <a
          href="/gear/best-thermometer-for-duck"
          className="text-primary underline underline-offset-4"
        >
          two thermometer choices and their limitations
        </a>
        .
      </Callout>

      <Section id="doneness-table" heading="Doneness reference: measured temperatures">
        <p>
          These culinary bands describe texture, not safety. Every temperature below 165°F is below
          USDA's recommended minimum. Carryover varies; no fixed temperature rise during resting is
          promised.
        </p>
        <DataTable
          caption="Duck breast doneness reference"
          columns={["Target", "Measured internal temperature", "Meaning"]}
          rows={[
            ["Rare", "120–125°F (49–52°C)", "Culinary convention only; below the safety minimum"],
            [
              "Medium-rare",
              "130–135°F (54–57°C)",
              "Culinary convention only; below the safety minimum",
            ],
            ["Medium", "140–145°F (60–63°C)", "Culinary convention only; below the safety minimum"],
            [
              "USDA safe minimum",
              "165°F (74°C) measured before removal",
              "Confirm with a food thermometer; do not rely on color or assumed carryover",
            ],
          ]}
        />
      </Section>

      <Section id="other-cuts" heading="Duck temperature beyond the breast: legs, thighs and whole bird">
        <p>
          Breast is the only cut people cook to a rosy centre. Everywhere else on the duck, the
          useful target sits well above the safety minimum, because legs and thighs are worked
          muscle that only turns tender once collagen has broken down.
        </p>
        <DataTable
          caption="Where each part of the duck is done"
          columns={["Cut", "Useful target", "Why that number"]}
          rows={[
            [
              "Duck breast",
              "130–135°F (54–57°C) final, or 165°F (73.9°C) for the safety minimum",
              "A few degrees decide rosy versus grey; see the table above",
            ],
            [
              "Whole duck (thigh texture target)",
              "175–185°F (79–85°C)",
              "For safety, measure at least 165°F in the innermost thigh and wing and the thickest part of the breast, avoiding bone. Higher thigh temperatures are a texture preference.",
            ],
            [
              "Duck legs, confit",
              "Fat held at 190–210°F (88–99°C) until a skewer meets no resistance",
              "Measure the meat at 165°F or above for the safety minimum, then assess tenderness separately; fat temperature alone does not establish the meat temperature.",
            ],
          ]}
        />
        <p>
          For the timings that get a bird to those numbers, see{" "}
          <a href="/learn/whole-duck-cooking-time" className="text-primary underline underline-offset-4">
            whole duck cooking time by weight
          </a>{" "}
          and the{" "}
          <a href="/recipes/roasted-whole-duck" className="text-primary underline underline-offset-4">
            two-stage roasted whole duck recipe
          </a>
          . For legs, the{" "}
          <a href="/cook/duck-leg-confit" className="text-primary underline underline-offset-4">
            duck leg confit method
          </a>{" "}
          explains why the fat temperature matters more than the clock. If you are finishing breast
          in the oven rather than the pan, the{" "}
          <a href="/recipes/oven-roasted-duck-breast" className="text-primary underline underline-offset-4">
            oven-roasted duck breast recipe
          </a>{" "}
          also requires checking the internal temperature.
        </p>
      </Section>



      <Section id="carryover" heading="Why carryover varies by thickness and pan heat">
        <p>
          Heat can continue moving from the hotter outer layers toward the centre after cooking.
          Carryover varies with the cut and cooking conditions; a fixed rise cannot be guaranteed.
        </p>
        <Callout label="Measure the minimum before removal">
          Check that duck has reached 165°F (74°C) before taking it off the heat. Resting is not a
          substitute for that measurement.
        </Callout>
      </Section>

      <Section id="probe-placement" heading="Probe placement: where readings go wrong">
        <p>
          Insert the thermometer through the side of the breast, horizontally, so the tip sits in
          the geometric centre of the thickest part. Three placement mistakes produce misleading
          readings:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Through the fat cap.</strong> Fat conducts and holds heat differently from
            muscle, so a probe that passes through the fat layer before reaching meat gives a
            reading skewed toward the fat's temperature, not the meat's.
          </li>
          <li>
            <strong>Touching the pan.</strong> Probing straight down from the top risks the tip
            grazing the pan surface, which reads far hotter than the meat around it.
          </li>
          <li>
            <strong>Off-centre toward a thin edge.</strong> Duck breast tapers; a probe placed
            near the thin end reads higher than the true thickest-point temperature and can
            undercook the centre.
          </li>
        </ul>
      </Section>

      <Section id="thermometer-error" heading="Thermometer error and rest time">
        <p>
          Consumer instant-read thermometers commonly carry a manufacturer-stated accuracy of
          ±1–2°F (±0.5–1°C), and that error compounds with any probe misplacement above. Given
          that duck breast doneness bands are often only 5–10°F wide, a small placement or
          calibration error can shift a reading from one doneness category into the next. Treat a
          single reading as an estimate and re-check in a second spot if the number looks
          surprising. If you are choosing a probe, our{" "}
          <a href="/gear/best-thermometer-for-duck" className="text-primary underline underline-offset-4">
            thermometer guide for duck
          </a>{" "}
          covers the side-probe access and response speed that matter for a breast, and the{" "}
          <a href="/recipes/pan-seared-duck-breast" className="text-primary underline underline-offset-4">
            pan-seared duck breast recipe
          </a>{" "}
          shows where these readings fall in the actual cook.
        </p>
        <p>
          Rest time matters independently of carryover: beyond letting temperature finish rising,
          resting allows juices compressed toward the centre during cooking to redistribute, so a
          breast sliced immediately off the pan loses more juice onto the board than one rested
          5–8 minutes first.
        </p>
      </Section>

      <DuckBreastJourney
        id="cluster-by-stage"
        title="Where the numbers fit in the wider method"
        intro="Temperature is one decision inside a longer sequence. Here is the sequence."
        placement="doneness_by_stage"
        variant="grouped"
        excludePath="/learn/duck-breast-temperature-doneness"
      />

      <Section id="pink-is-fine" heading="Why 'pink is fine' is a culinary claim, not a safety one">
        <p>
          Duck breast served pink at 130–135°F is a texture choice with a long history in
          restaurant kitchens, built on the assumption of quality sourcing, proper handling, and
          quick cooking that limits surface contamination exposure. It is not equivalent to a
          safety clearance. USDA's poultry guidance does not carry a "pink is acceptable" exception
          for duck the way, for example, whole-muscle beef has one for rareness. Color is also an
          unreliable proxy for either safety or doneness on its own — cure, added ingredients, and
          myoglobin variation between birds can make cooked duck look pinker or paler than its
          actual internal temperature would suggest.
        </p>
        <p>
          The practical takeaway: measure at least 165°F (74°C), keep raw poultry separate from
          ready-to-eat food, and use proper handling. Lower temperatures carry risk, especially for
          young children, older adults, pregnant people and immunocompromised diners.
        </p>
      </Section>

      <CommercialCallout
        heading="The one tool these numbers depend on"
        intro="Every temperature on this page assumes a probe you can trust to read quickly and repeatably at the thickest part of the breast."
        placement="temperature_gear"
        linkIds={["thermoworks-thermometer"]}
        criteria={[
          "A reading settles in a few seconds, so the breast is not overshooting while you wait.",
          "The probe tip is thin enough to enter from the side without tearing the fat cap.",
          "Stated accuracy is tight enough that a 130°F target is not really a 135°F one.",
        ]}
        footnote={
          <>
            Then use those readings inside the method in{" "}
            <a href="/cook/how-to-cook-duck-breast" className="text-primary underline underline-offset-4">
              how to cook duck breast
            </a>
            .
          </>
        }
      />

      <FaqList items={FAQ} />

      <SourceNotes
        ids={[
          "usdaPoultryTemp",
          "usdaPoultryPrep",
          "usdaDuckMeasuredTemperature",
          "usdaFoodThermometers",
        ]}
      />

      <DecisionNextSteps
        heading="The tools these numbers assume"
        intro="Every target on this page assumes you can read the temperature quickly and in the right spot."
        items={[
          { to: "/gear/best-thermometer-for-duck", label: "Best thermometer for duck", why: "Which type suits the cook you do most, and the specifications that decide it." },
          { to: "/gear/best-pan-for-duck-breast", label: "Best pan for duck breast", why: "Carryover and render behaviour both change with the pan you are cooking in." },
        ]}
      />

      <ConversionPaths
        sourcePath="/learn/duck-breast-temperature-doneness"
        eyebrow="Verify the finish"
        heading="Reading these numbers reliably"
      />

      <AirFryerRecipeLink
        placement={AIR_FRYER_INBOUND_PLACEMENTS.donenessGuide}
        className="mt-10"
      >
        Measured internal temperatures also guide an air fryer cook, where timings shift between
        machines and the probe is all you have.
      </AirFryerRecipeLink>

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
