import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Callout, FaqList, Section, StepList } from "@/components/site/ArticleShell";
import { DuckConfidenceCard } from "@/components/site/DuckConfidenceCard";
import { QuackFix } from "@/components/site/QuackFix";
import { SafetyNote } from "@/components/site/SafetyNote";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/cook/how-to-cook-wild-duck-breast")!;

export const Route = createFileRoute("/cook/how-to-cook-wild-duck-breast")({
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
  component: WildDuckBreastPage,
});

const FAQ = [
    {
      q: "Should I brine every wild duck breast?",
      a: "It's optional and helps most on very lean birds where moisture retention matters. A short 30–60 minute brine is enough; longer doesn't meaningfully improve results and can oversalt a small cut.",
    },
    {
      q: "Is it safe to cook wild duck breast to a lower temperature like farmed duck breast?",
      a: "The USDA minimum of 165°F (73.9°C) applies to duck regardless of source. Culinary conventions for lower temperatures on farmed duck breast are a chef's practice, not a food-safety recommendation, and wild-harvested birds carry their own handling considerations worth taking seriously.",
    },
  ];

function WildDuckBreastPage() {
  return (
    <ArticleShell
      eyebrow="Cook · Wild duck"
      title={GUIDE.title}
      intro="Wild duck breast is lean, variable, and unforgiving of the cold-pan method built for farmed birds. This is a method for reading the bird you actually have and cooking it fast enough to stay ahead of dryness."
      trail={[
        { name: "Cook", to: "/cook" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read · Technique`}
      sidebar={
        <DuckConfidenceCard
          data={{
            cut: "Wild duck breast, skin-on or skinless",
            difficulty: "Intermediate",
            biggestRisk: "Overcooking a lean, thin cut past the point of no return",
            essentialTechnique: "Hot-and-fast sear, not a cold-pan render",
            targetResult: "165°F (73.9°C) minimum, rested and sliced against the grain",
            essentialTool: "Instant-read thermometer",
            saveAfterwards: "Trim scraps and any skin for stock or rendering, if there's enough fat to bother",
          }}
        />
      }
    >
      <Section id="assess" heading="Assess the bird before you decide anything">
        <p>
          Every wild duck breast is a different cooking problem until you've actually looked at it.
          Before choosing a method, check:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Fat cover.</strong> Press the skin — if there's a visible, even layer of fat under
            it, you have more room for a slower sear. If the skin sits almost directly on the muscle,
            treat it as very lean.
          </li>
          <li>
            <strong>Size.</strong> A teal breast might be under 100 g; a mallard breast can run
            150–200 g. Smaller pieces cook through in less time and need closer attention.
          </li>
          <li>
            <strong>Shot damage.</strong> Check for embedded shot and bruised, blood-shot tissue.
            Trim damaged areas away — they cook and taste differently from clean muscle.
          </li>
          <li>
            <strong>Age.</strong> Older birds tend to have tougher muscle fibre. If you can't tell,
            treat unfamiliar birds as potentially tougher and avoid pushing past medium doneness by
            culinary convention, even briefly.
          </li>
        </ul>
      </Section>

      <Section id="skin-decision" heading="Skin-on or skinless: a decision tree">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Is there a usable fat layer under the skin?</strong> If yes, keep the skin on and
            score it lightly — it can still crisp, just faster than a farmed duck's thicker cap.
          </li>
          <li>
            <strong>Is the skin very thin with almost no fat beneath it?</strong> Skin-on won't crisp
            meaningfully and will mostly just chew rubbery. Consider removing it and searing the meat
            directly in a little added fat or butter instead.
          </li>
          <li>
            <strong>Is the skin damaged, torn, or heavily bruised from the shot?</strong> Remove it —
            damaged skin won't render evenly or look appetising, and there's no upside to leaving it on.
          </li>
        </ol>
      </Section>

      <Section id="hot-fast-vs-cold" heading="Hot-and-fast versus the cold-pan approach">
        <p>
          The cold-pan method used for farmed duck breast — starting skin-side down in an unheated pan
          and letting a thick fat cap render slowly over 8–10 minutes — depends entirely on that fat
          layer buffering the meat from the pan's heat while it renders. A lean wild breast has little
          or no such buffer. Put it in a cold pan and by the time any fat has rendered, the thin muscle
          underneath has already overcooked.
        </p>
        <p>
          Instead, get the pan properly hot first — medium-high, with a light film of fat or butter
          already shimmering — and sear the breast quickly on each side, typically 2–4 minutes per
          side depending on thickness, adjusting for size. The goal is a well-browned exterior before
          the thin interior has a chance to overshoot.
        </p>
      </Section>

      <Section id="fat-in-pan" heading="Adding fat or butter to the pan">
        <p>
          Because wild duck breast usually can't render enough of its own fat to cook in, add a
          tablespoon of neutral oil, rendered duck fat, or butter to the pan before searing. This
          protects the lean meat from sticking and scorching, and helps the exterior brown before the
          inside overcooks. Basting with butter and aromatics in the final minute adds flavour without
          extending cook time.
        </p>
      </Section>

      <SafetyNote>
        <p>
          On a thin wild duck breast, the difference between 155°F and 170°F can be under a minute of
          cook time. Pull the pan the moment the thermometer reads close to target — carryover will
          finish the job.
        </p>
      </SafetyNote>

      <StepList
        steps={[
          {
            title: "Pat dry and season",
            body: "Blot the surface dry so it sears instead of steams, then season generously with salt just before cooking.",
          },
          {
            title: "Heat the pan properly first",
            body: "Bring a heavy pan to medium-high with a thin film of added fat, until it shimmers. Do not start in a cold pan.",
            watchFor: "A pan that isn't hot enough will let the breast sit and lose moisture without browning.",
          },
          {
            title: "Sear both sides briskly",
            body: "Cook 2–4 minutes per side depending on thickness, turning once the first side is well browned.",
          },
          {
            title: "Check with a thermometer, not a clock",
            body: "Probe the thickest part. Pull the pan a few degrees before your target to account for carryover cooking.",
            watchFor: "Thin breasts can climb 5–10°F after leaving the pan — pull earlier than you would for a thicker farmed breast.",
          },
          {
            title: "Rest on a warm plate",
            body: "Rest 4–5 minutes loosely tented. A cold plate pulls heat out of an already-thin cut faster than you want.",
          },
          {
            title: "Slice thin, against the grain",
            body: "Thin slices cut across the muscle fibres are easier to chew on a leaner, denser cut than a farmed breast.",
          },
        ]}
      />

      <Section id="marinades" heading="What marinades and brines can and can't do">
        <p>
          A brief marinade or a short brine can season the meat and, in the case of a brine, help it
          hold a little more moisture through cooking. Both are worth using on a lean bird for that
          reason. What they cannot do is rescue a breast that's already been overcooked, and they
          cannot meaningfully tenderise genuinely tough muscle from an older bird — that's a texture
          problem rooted in the muscle fibre itself, and no amount of soaking reverses it after the
          fact. If a bird is likely tough, braising or slow, moist cooking suits it better than a quick
          sear regardless of what it's been marinated in.
        </p>
      </Section>

      <QuackFix
        title="Quack Fix: wild duck breast problems"
        items={[
          {
            symptom: "Livery or overly strong flavour",
            cause: "Blood-shot tissue near shot damage wasn't trimmed, or the bird's diet leaned heavily toward strong-flavoured foraging.",
            fixNow: "Trim away any dark, bruised tissue before cooking the next piece; a bold pan sauce with acid or fruit can also balance a strong flavour already on the plate.",
            prevent: "Inspect and trim breasts thoroughly before cooking, and expect diet-driven variation between birds.",
          },
          {
            symptom: "Dry and grey throughout",
            cause: "Overcooked past a safe target due to a cold-pan start or ignoring carryover.",
            fixNow: "Slice thin and serve with a sauce to add moisture back; there's no way to rehydrate the meat itself.",
            prevent: "Sear hot and fast, pull a few degrees early, and rest before slicing.",
          },
          {
            symptom: "Tough, chewy texture",
            cause: "An older bird's denser muscle fibre, or meat sliced with the grain instead of against it.",
            prevent: "Slice thin against the grain, and consider braising instead of searing for birds you suspect are older.",
            fixNow: "Slice thinner across the grain if it hasn't been sliced yet — this alone significantly improves how tough meat eats.",
          },
          {
            symptom: "Skin refuses to crisp",
            cause: "Not enough fat under the skin to render, or the pan wasn't hot enough when the breast went in.",
            fixNow: "Remove the skin before serving if it's not crisping — rubbery skin adds nothing.",
            prevent: "Assess fat cover before deciding to cook skin-on at all; thin-skinned birds are often better served skinless.",
          },
        ]}
      />

      <FaqList items={FAQ} />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
