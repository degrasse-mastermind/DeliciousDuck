import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArticleShell,
  Callout,
  DataTable,
  FaqList,
  Section,
  StepList,
} from "@/components/site/ArticleShell";
import { DuckConfidenceCard } from "@/components/site/DuckConfidenceCard";
import { QuackFix } from "@/components/site/QuackFix";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SafetyNote } from "@/components/site/SafetyNote";
import { SourceNotes } from "@/components/site/SourceNotes";
import { UseTheWholeDuck } from "@/components/site/UseTheWholeDuck";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/cook/whole-roast-duck")!;

export const Route = createFileRoute("/cook/whole-roast-duck")({
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
          { name: "Cook", item: "/cook" },
          { name: GUIDE.title, item: GUIDE.path },
        ]),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: WholeRoastDuckPage,
});

const FAQ = [
    {
      q: "Do I need to flip the duck while it roasts?",
      a: "No. Breast-side up on a rack is standard; the rack keeps the underside from sitting in fat, so flipping isn't necessary.",
    },
    {
      q: "Can I stuff the cavity?",
      a: "You can, but a filled cavity slows heat penetration and complicates the thigh temperature check — see the cooking-time guide for how much longer to plan.",
    },
    {
      q: "Why is my duck taking longer than the planning range?",
      a: "Home ovens vary in real temperature by 15–25°F even when the dial says otherwise, and a fridge-cold bird starts slower than a tempered one. Trust the thermometer over the clock.",
    },
  ];

function WholeRoastDuckPage() {
  return (
    <ArticleShell
      eyebrow="Cook · Whole duck"
      title={GUIDE.title}
      intro="A whole duck rewards patience more than skill. Most of the workflow below is about managing fat: rendering it out of the skin, keeping it off the oven floor, and not throwing it away when you're done."
      trail={[
        { name: "Cook", to: "/cook" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
      sidebar={
        <DuckConfidenceCard
          data={{
            cut: "Whole duck, 1.8–3.2 kg (4–7 lb)",
            difficulty: "Intermediate",
            biggestRisk: "Flabby skin from a wet bird, or dry breast from overshooting the thigh target",
            essentialTechnique: "Uncovered fridge dry, then low-render before a hot finish",
            targetResult: "165°F (73.9°C) minimum in the thigh, shatter-crisp skin",
            essentialTool: "Instant-read thermometer and a roasting rack",
            saveAfterwards: "Rendered fat and the carcass for stock",
          }}
        />
      }
    >
      <Section id="choosing" heading="Choosing and inspecting the bird">
        <p>
          Most whole ducks sold for roasting are Pekin (also labelled Long Island or White
          Pekin), running 1.8–3.2 kg (4–7 lb) with a thin, even fat cover under pale skin. Check
          the packaging date, look for skin that is dry rather than slick or grey, and press the
          breast gently — it should spring back rather than feel waterlogged. A bird sitting in
          excess liquid in its tray has likely been frozen and thawed less carefully than you'd
          want; it will still cook safely, but it will render less cleanly.
        </p>
        <p>
          Buy by weight, not by "serves four" labelling. A whole duck yields far less cooked meat
          per kilogram than chicken — plan portions with{" "}
          <Link to="/tools/whole-duck-serving-calculator" className="text-primary underline underline-offset-4">
            the serving calculator
          </Link>{" "}
          before you shop, since the honest yield surprises most first-timers.
        </p>
      </Section>

      <Section id="sourcing" heading="Where the bird comes from">
        <p>
          If you do not have a local source, the{" "}
          <a href="/buy/where-to-buy-duck-online" className="text-primary underline underline-offset-4">
            guide to buying duck online
          </a>{" "}
          covers shipping, sizes and what to inspect on arrival, and{" "}
          <a href="/learn/whole-duck-cooking-time" className="text-primary underline underline-offset-4">
            whole duck cooking time
          </a>{" "}
          maps the weight you end up with to a realistic oven window.
        </p>
      </Section>

      <Section id="prep" heading="Drying, trimming and scoring">
        <p>
          Unwrap the duck as soon as you get it home, pat it dry, and set it uncovered on a rack
          over a tray in the fridge for at least 8 hours and ideally overnight (up to 24 hours).
          This single step does more for crisp skin than any oven trick — it pulls surface
          moisture out so the skin starts dry instead of steaming in the first twenty minutes of
          roasting.
        </p>
        <p>
          Before it goes in the oven, cut away the loose flaps of neck skin and the thick pads of
          fat just inside the cavity opening — render these separately in a small pan rather than
          leaving them to smoke onto the bird. Then either prick or score the fat cap: pricking
          uses a skewer or fork tip at a shallow angle over the thighs, back and lower breast,
          just deep enough to open the fat without reaching the meat; scoring uses a paring knife
          in a light crosshatch over the breast skin only. Either works — pricking gives more
          escape routes for fat over a large area, scoring gives a more deliberate pattern on the
          breast. Don't do both hard, and never cut into the meat itself; that lets juices out
          instead of fat.
        </p>
        <p>
          A light truss — tying the legs together and tucking the wingtips under the body — keeps
          the bird compact and the breast from splaying, which helps even cooking. It doesn't need
          to be tight or elaborate.
        </p>
      </Section>

      <Section id="setup" heading="Rack, tray and oven strategy">
        <p>
          Set the duck breast-side up on a roasting rack over a tray deep enough to catch the fat
          it will render — a whole duck can release 1–2 cups (240–475 ml) of fat over a roast,
          and an overflowing tray is a real fire risk in a hot oven.
        </p>
        <p>
          Two oven strategies both work well. The low-render-then-hot-finish route starts at
          300–325°F (149–163°C) for the first hour or so to melt fat gently without hardening the
          skin, then finishes at 425–450°F (218–232°C) for the last 20–30 minutes to crisp and
          colour it. The steady-temperature route holds a single moderate oven, around 350°F
          (177°C), for the whole roast and relies on time and the fat cap alone for crisping.
          The two-stage method generally produces crisper skin; the steady method is simpler to
          manage if you're also cooking other dishes. Neither is "correct" — treat the times
          below as planning ranges, not guarantees, and use{" "}
          <Link to="/tools/duck-cooking-time-planner" className="text-primary underline underline-offset-4">
            the cooking-time planner
          </Link>{" "}
          to set a starting point for your bird's weight.
        </p>
        <DataTable
          caption="Planning ranges by weight (verify with a thermometer)"
          columns={["Weight", "Two-stage total", "Steady-oven total"]}
          rows={[
            ["1.8–2.0 kg (4–4.5 lb)", "1 hr 45 min – 2 hr 15 min", "2–2.5 hr"],
            ["2.3–2.7 kg (5–6 lb)", "2–2.5 hr", "2.5–3 hr"],
            ["2.9–3.2 kg (6.5–7 lb)", "2.25–2.75 hr", "2.75–3.25 hr"],
          ]}
        />
        <p className="text-sm text-muted-foreground">
          Drain the tray of rendered fat once or twice through the roast — carefully, with the
          bird held back with tongs or a second pair of hands — so it doesn't smoke or spatter
          once it gets hot enough to shimmer.
        </p>
      </Section>

      <StepList
        steps={[
          {
            title: "Dry, trim and season",
            body: "Pat the bird dry, trim excess neck and cavity fat, prick or score the fat cap, and season the cavity and skin generously with salt.",
          },
          {
            title: "Rack over a deep tray",
            body: "Place breast-side up on a rack set inside a roasting tray deep enough to catch rendering fat.",
          },
          {
            title: "Low render",
            body: "Roast at 300–325°F (149–163°C) until the fat cap has visibly softened and started to run, roughly the first half of total time.",
            watchFor: "A tray filling faster than expected — drain it rather than letting it approach the rim.",
          },
          {
            title: "Hot finish",
            body: "Raise the oven to 425–450°F (218–232°C) for the last 20–30 minutes to colour and crisp the skin.",
          },
          {
            title: "Check temperature in two places",
            body: "Probe the thickest part of the thigh, avoiding bone, and the thickest part of the breast. Both need to read at least 165°F (73.9°C) per USDA guidance.",
          },
          {
            title: "Rest",
            body: "Rest the whole bird 15–20 minutes, loosely tented, before carving. Internal temperature will continue to climb slightly during this time.",
          },
          {
            title: "Carve and save",
            body: "Carve legs and breasts, pour off and strain the rendered fat once cool enough to handle, and keep the carcass for stock.",
          },
        ]}
      />

      <SafetyNote>
        <p>
          A whole duck's legs and thighs are dense, well-worked muscle and generally still taste
          good well past 165°F, so cooking to the safe minimum in the thigh is not a compromise
          here the way it can be for a stand-alone breast. Don't estimate doneness by juice colour
          or time alone — a thermometer reading in both the thigh and breast is the only reliable
          check.
        </p>
      </SafetyNote>

      <QuackFix
        title="Quack Fix: whole duck"
        intro="Four problems that show up on almost every first attempt, and what to do about each."
        items={[
          {
            symptom: "Skin is soft or flabby, not crisp",
            cause: "The bird went into the oven with wet skin, or the fat cap never fully rendered before the hot finish.",
            fixNow: "Run the tray under the broiler for a few minutes, watching closely, to finish crisping.",
            prevent: "Dry uncovered in the fridge overnight and don't skip the low-render stage.",
          },
          {
            symptom: "Breast meat is dry by the time legs are done",
            cause: "A single flat internal temperature target ignores that breast and thigh cook at different rates.",
            fixNow: "Nothing recovers dry breast meat; slice thin and serve with a sauce to compensate.",
            prevent: "Check the breast a few minutes before you expect it to finish, and pull earlier if the legs still need time — or tent the breast with foil partway through.",
          },
          {
            symptom: "Legs are still pink or tough at the thigh joint near the bone",
            cause: "The joint area cooks slower than the surrounding flesh and the probe missed the true thickest point.",
            fixNow: "Return the bird to the oven and recheck every 10 minutes until the thigh clears 165°F (73.9°C).",
            prevent: "Probe close to but not touching the bone, and check both legs — they don't always finish evenly.",
          },
          {
            symptom: "Oven is smoking",
            cause: "Rendered fat has overflowed the tray or is scorching on a hot pan surface.",
            fixNow: "Lower the oven temperature, carefully drain the tray, and ventilate the kitchen.",
            prevent: "Use a tray with real depth and drain it once mid-roast rather than letting fat accumulate.",
          },
        ]}
      />

      <UseTheWholeDuck
        items={[
          {
            part: "Rendered fat",
            use: "Strain into a clean jar once cooled to warm; it keeps refrigerated for weeks and is the base for roast potatoes, confit and much more.",
            to: "/learn/how-to-render-duck-fat",
            linkLabel: "How to render and store duck fat",
          },
          {
            part: "Carcass and trim",
            use: "Simmer with aromatics for a rich stock — don't discard it after carving.",
            to: "/learn/how-to-carve-a-duck",
            linkLabel: "Carve for clean portions first",
          },
        ]}
      />

      <FaqList items={FAQ} />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
