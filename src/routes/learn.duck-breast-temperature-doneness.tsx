import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Section, DataTable, Callout } from "@/components/site/ArticleShell";
import { SafetyNote } from "@/components/site/SafetyNote";
import { SourceNotes } from "@/components/site/SourceNotes";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/learn/duck-breast-temperature-doneness")!;

export const Route = createFileRoute("/learn/duck-breast-temperature-doneness")({
  head: () => ({
    ...pageMeta({ title: GUIDE.seoTitle, description: GUIDE.description, path: GUIDE.path, ogType: "article" }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Learn", item: "/learn" },
          { name: GUIDE.title, item: GUIDE.path },
        ]),
      ),
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
          Duck breast temperature guidance splits into two categories that get conflated
          constantly: a food-safety minimum set by USDA, and a set of culinary conventions used to
          hit a particular texture. They answer different questions. The safety number answers
          "is this free of the pathogens poultry can carry." The culinary numbers answer "what
          texture am I aiming for," and assume you accept the trade-offs that come with a
          lower-temperature centre.
        </p>
      </Section>

      <SafetyNote heading="USDA safety minimum" />

      <Section id="doneness-table" heading="Doneness table: pull temperature, final temperature, appearance">
        <p>
          "Pull temperature" is the internal reading at which you take the breast off the heat.
          "Final temperature" is what it reaches a few minutes later, after carryover cooking has
          run its course during the rest. The gap between the two is carryover, covered in detail
          below.
        </p>
        <DataTable
          caption="Duck breast doneness reference"
          columns={["Target", "Pull temp", "Final temp (after rest)", "Appearance", "Texture", "Category"]}
          rows={[
            [
              "Rare",
              "115–120°F (46–49°C)",
              "120–125°F (49–52°C)",
              "Deep red throughout, very soft",
              "Very tender, almost yielding",
              "Culinary convention only — not a USDA-recognised safe endpoint",
            ],
            [
              "Medium-rare",
              "125–130°F (52–54°C)",
              "130–135°F (54–57°C)",
              "Rosy pink centre, browned edges",
              "Tender, moist, the common restaurant target",
              "Culinary convention only",
            ],
            [
              "Medium",
              "135–140°F (57–60°C)",
              "140–145°F (60–63°C)",
              "Pale pink centre",
              "Firmer, still moist",
              "Culinary convention only",
            ],
            [
              "Well done / USDA safe minimum",
              "160°F (71°C)",
              "165°F (73.9°C) or above",
              "No pink, opaque throughout",
              "Firm, denser, more prone to drying if overshot",
              "Meets USDA's 165°F minimum internal temperature",
            ],
          ]}
        />
        <p className="text-sm text-muted-foreground">
          Pull temperatures assume you rest the breast for 5–8 minutes afterward. If you plan to
          serve immediately with no rest, pull closer to your final target instead.
        </p>
      </Section>

      <Section id="carryover" heading="Why carryover varies by thickness and pan heat">
        <p>
          Carryover cooking happens because the outer layers of the meat are hotter than the
          centre at the moment you stop applying heat, and that heat keeps migrating inward while
          the surface cools. The size of the effect depends mainly on two things: how thick the
          cut is, and how hot the outer layers got before you pulled it.
        </p>
        <p>
          A thick magret duck breast (350–450 g / 12–16 oz) holds more residual heat in its
          outer layers relative to its core, so it can carry over 8–10°F (4.5–5.5°C) after
          leaving the pan. A smaller Pekin breast (150–200 g / 5–7 oz) carries over less, often
          only 4–6°F (2–3°C), because there's less thermal mass storing heat near the surface. A
          breast finished over high, aggressive heat also tends to carry over more than one
          finished gently, because the temperature gradient between surface and centre is steeper.
        </p>
        <Callout label="Rule of thumb">
          Pull thicker breasts further under target than thin ones, and pull anything cooked hard
          and fast further under target than something cooked gently.
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
          surprising.
        </p>
        <p>
          Rest time matters independently of carryover: beyond letting temperature finish rising,
          resting allows juices compressed toward the centre during cooking to redistribute, so a
          breast sliced immediately off the pan loses more juice onto the board than one rested
          5–8 minutes first.
        </p>
      </Section>

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
          The practical takeaway: treat 165°F as the number that removes the safety question
          entirely, and treat anything below it as a deliberate trade you're making for texture —
          one worth reconsidering for very young, elderly, pregnant, or immunocompromised diners.
        </p>
      </Section>

      <SourceNotes ids={["usdaPoultryTemp", "usdaPoultryPrep"]} />
      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
