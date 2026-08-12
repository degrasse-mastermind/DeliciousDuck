import { ToolAssumptions } from "@/components/tools/ToolAssumptions";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { SafetyNote } from "@/components/site/SafetyNote";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SourceNotes } from "@/components/site/SourceNotes";
import { FaqList } from "@/components/site/ArticleShell";
import { CookingTimePlanner } from "@/components/tools/CookingTimePlanner";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/tools/duck-cooking-time-planner")({
  head: () => ({
    ...pageMeta({
      title: "Duck Cooking-Time Planner | DeliciousDuck",
      description:
        "Plan a roasting window for a whole duck by weight and oven temperature, with a suggested prep-start time. A planning estimate, not a doneness test.",
      path: "/tools/duck-cooking-time-planner",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Tools", item: "/tools" },
          { name: "Duck Cooking-Time Planner", item: "/tools/duck-cooking-time-planner" },
        ]),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: Page,
});

const FAQ = [
  {
    q: "Why is the result a range instead of one number?",
    a: "Oven calibration, bird shape, and how tightly it's trussed all shift real cooking time. A range keeps expectations honest instead of implying false precision.",
  },
  {
    q: "Does the planner replace a thermometer?",
    a: "No. It only tells you roughly when to start checking. Doneness is always confirmed with a food thermometer, not a clock.",
  },
  {
    q: "Why do stuffed and fridge-cold birds take longer?",
    a: "Stuffing slows heat reaching the cavity, and a cold start means more of the cook goes into raising the bird's core temperature before it can brown.",
  },
];

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Tool"
        title="Duck Cooking-Time Planner"
        intro="Get a realistic planning window for roasting a whole duck, plus a suggested time to start prepping so dinner lands on schedule."
        trail={[
          { name: "Tools", to: "/tools" },
          { name: "Duck Cooking-Time Planner", to: "/tools/duck-cooking-time-planner" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <CookingTimePlanner />

        <div className="mt-12">
          <ToolAssumptions
            items={[
            { label: "Base timings", value: "Per-kilo roasting ranges for a typical domestic oven at the stated temperature, drawn from established technique rather than lab testing." },
            { label: "Stuffed birds", value: "Add 12% to total time as a planning allowance; a stuffed cavity also needs its own temperature check." },
            { label: "Straight from the fridge", value: "Add 6% to total time for a bird that has not sat out to lose its chill." },
            { label: "Resting", value: "A 20-minute rest is built into the schedule and assumed to be uncovered or loosely tented." },
            { label: "Not modelled", value: "Oven calibration drift, convection versus conventional, bird shape, rack position, tray crowding, or altitude." },
            ]}
            note="This is a planning estimate, not a doneness test — real cooking time routinely differs by twenty minutes or more. Finish every bird on a calibrated instant-read thermometer, not on the clock."
          />
        </div>

        <div className="mt-16 rounded-sm border-l-2 border-primary bg-cream p-5">
          <SafetyNote heading="This is a planning range, not a doneness check">
            <p>
              Use the range above only to schedule your evening. The bird is done when a
              thermometer confirms it — not when the clock says so.
            </p>
          </SafetyNote>
        </div>

        <div className="mt-16 max-w-3xl">
          <h2 className="font-display text-3xl text-foreground">How the numbers work</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Each oven-temperature preset uses a minutes-per-kilogram band drawn from common
            roasting practice: lower heat renders more fat and gives a wider, more forgiving
            window; higher heat crisps skin faster but narrows the margin for error. The planner
            multiplies that band by your bird's weight, then nudges it upward if the duck is
            stuffed or going in cold from the fridge — both slow how quickly heat reaches the
            centre.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            The suggested prep-start time works backward from your target serving time, adding the
            top of the cooking range, a 20-minute rest, and a margin for carving and plating.
            Real ovens vary, so treat the first check-in point as the start of a window, not the
            finish line.
          </p>
        </div>

        <FaqList items={FAQ} />
        <SourceNotes ids={["usdaPoultryTemp", "usdaPoultryPrep"]} />
        <RelatedGuides
          paths={[
            "/cook/whole-roast-duck",
            "/learn/whole-duck-cooking-time",
            "/tools/whole-duck-serving-calculator",
          ]}
        />
      </section>
    </>
  );
}
