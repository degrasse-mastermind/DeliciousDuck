import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section } from "@/components/site/ArticleShell";
import { ConversionPaths } from "@/components/site/ConversionPaths";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SourceNotes } from "@/components/site/SourceNotes";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/learn/whole-duck-cooking-time")!;

export const Route = createFileRoute("/learn/whole-duck-cooking-time")({
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
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: WholeDuckCookingTimePage,
});

const FAQ = [
    {
      q: "Why did my duck take an hour longer than the chart said?",
      a: "The most common causes are an oven running cooler than its dial, a bird that went in fridge-cold rather than tempered, or a filled cavity. All three add real time; none of them are unusual.",
    },
    {
      q: "Is it safe to go by the clock alone if I trust my oven?",
      a: "No. Verify doneness with a food thermometer regardless of elapsed time, since bird size, shape and oven behavior all vary.",
    },
    {
      q: "Should I baste to speed things up?",
      a: "Basting doesn't meaningfully change cooking time and opening the oven repeatedly extends it slightly by dropping the internal temperature each time.",
    },
  ];

function WholeDuckCookingTimePage() {
  return (
    <ArticleShell
      eyebrow="Learn · Whole duck"
      title={GUIDE.title}
      intro="Minutes-per-pound tells you when to start checking. It never tells you when the duck is done — only a thermometer does that."
      trail={[
        { name: "Learn", to: "/learn" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <Section id="planning-vs-verdict" heading="Planning device, not a verdict">
        <p>
          Weight-based cooking times exist so you can plan a meal backward from a serving time —
          they tell you roughly when to preheat, when to start checking, and when guests should
          arrive. They are built from averages across ovens, bird conformation and starting
          temperature, none of which match your kitchen exactly. Internal temperature, read with a
          thermometer, is the only number that tells you the bird is actually done. Treat every
          time below as the planning half of the job and the thermometer as the verdict.
        </p>
        <p>
          Use{" "}
          <Link to="/tools/duck-cooking-time-planner" className="text-primary underline underline-offset-4">
            the duck cooking-time planner
          </Link>{" "}
          to generate a starting estimate for your bird's exact weight, and{" "}
          <Link to="/tools/whole-duck-serving-calculator" className="text-primary underline underline-offset-4">
            the serving calculator
          </Link>{" "}
          to work out how large a bird you need in the first place.
        </p>
      </Section>

      <Section id="planning-ranges" heading="Planning ranges by weight and oven temperature">
        <p>
          The ranges below assume a fridge-cold, unstuffed bird roasted breast-side up on a rack.{" "}
          If you are still deciding what to roast it in, the{" "}
          <Link to="/gear/best-roasting-pan-for-duck" className="text-primary underline underline-offset-4">
            roasting pan guide
          </Link>{" "}
          covers sizing and fat capacity.
          They are wide on purpose — real ovens, real birds and real thermometers disagree more
          than recipe cards admit.
        </p>
        <DataTable
          caption="Whole duck planning ranges (unstuffed, fridge-cold start)"
          columns={["Weight", "Low oven, 300–325°F (149–163°C)", "Moderate oven, 350°F (177°C)", "Hot oven, 425–450°F (218–232°C)", "Verify with a thermometer"]}
          rows={[
            ["1.8–2.0 kg (4–4.5 lb)", "2.5–3 hr", "2–2.5 hr", "1.25–1.5 hr", "Thigh ≥165°F (73.9°C)"],
            ["2.3–2.7 kg (5–6 lb)", "3–3.5 hr", "2.5–3 hr", "1.5–1.75 hr", "Thigh ≥165°F (73.9°C)"],
            ["2.9–3.2 kg (6.5–7 lb)", "3.5–4 hr", "3–3.5 hr", "1.75–2 hr", "Thigh ≥165°F (73.9°C)"],
          ]}
        />
        <p className="text-sm text-muted-foreground">
          A hot, uninterrupted oven roasts fastest but crisps unevenly without a low-render stage
          first; most whole-duck methods, including our own, combine a low stage with a hot finish
          rather than holding one temperature throughout. See the{" "}
          <Link to="/cook/whole-roast-duck" className="text-primary underline underline-offset-4">
            whole roast duck guide
          </Link>{" "}
          for that sequencing.
        </p>
      </Section>

      <Section id="calibration" heading="Oven calibration and convection variance">
        <p>
          Most home ovens run 15–25°F (8–14°C) off their dial setting, and that error is rarely
          consistent across the whole cavity — the back or top can run noticeably hotter than the
          front or bottom. An oven thermometer left on the rack for a week of normal use will tell
          you more about your actual oven than any online calculator can. Convection (fan) ovens
          typically shave 15–20% off standard roasting times and produce more even browning; if
          your recipe or the ranges above assume a conventional oven, start checking a convection
          roast noticeably earlier.
        </p>
      </Section>

      <Section id="starting-temp" heading="Fridge-cold vs tempered starts">
        <p>
          A duck taken straight from the fridge takes longer to come up to temperature than one
          rested at room temperature for 30–45 minutes first, and the difference can be 15–20
          minutes over a full roast. Food-safety guidance limits how long raw poultry should sit
          out of refrigeration, so "tempering" a duck means a short counter rest before it goes in
          the oven, not an extended one — keep it under an hour and go straight into a hot oven
          afterward.
        </p>
      </Section>

      <Section id="stuffing" heading="Why stuffing complicates doneness">
        <p>
          Filling the cavity with stuffing, fruit or aromatics adds mass that has to come up to a
          safe temperature along with the bird, and it slows heat penetration to the surrounding
          meat because the filling insulates the cavity walls. A stuffed whole duck commonly needs
          20–40 minutes longer than the unstuffed ranges above, and the stuffing itself must also
          reach 165°F (73.9°C) — check it with the thermometer, not just the thigh. If timing
          precision matters for your dinner, cook aromatics loosely and stuffing separately.
        </p>
      </Section>

      <Section id="resting" heading="Rest time and carryover">
        <p>
          Let a whole duck rest 15–20 minutes, loosely tented with foil, before carving. Internal
          temperature continues to climb by a few degrees during this window as heat equalises
          from the outside in, and the resting period also lets juices redistribute so slices don't
          run dry the moment you cut into them. Carve straight from a hot bird and you'll lose more
          moisture to the board than the extra few minutes of patience ever cost you.
        </p>
      </Section>

      <FaqList items={FAQ} />

      <ConversionPaths
        sourcePath="/learn/whole-duck-cooking-time"
        eyebrow="Verify the finish"
        intro="These ranges plan the roast; a probe reading ends it."
      />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
