import { createFileRoute } from "@tanstack/react-router";
import { AirFryerRecipeLink } from "@/components/site/AirFryerRecipeLink";
import { AIR_FRYER_INBOUND_PLACEMENTS } from "@/data/air-fryer-inbound";
import { ArticleShell, Section, DataTable, StepList } from "@/components/site/ArticleShell";
import { QuackFix } from "@/components/site/QuackFix";
import { ConversionPaths } from "@/components/site/ConversionPaths";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/learn/how-to-score-duck-breast")!;

export const Route = createFileRoute("/learn/how-to-score-duck-breast")({
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
      ldScript(
        articleSchema({
          headline: GUIDE.title,
          description: GUIDE.description,
          path: GUIDE.path,
        }),
      ),
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ArticleShell
      eyebrow="Technique"
      title={GUIDE.title}
      intro={GUIDE.description}
      trail={[
        { name: "Learn", to: "/learn" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read · Technique`}
    >
      <Section id="why-score" heading="What scoring actually does">
        <p>
          Scoring cuts a grid of shallow lines through the fat cap on a duck breast without
          reaching the meat underneath. Those cuts break an otherwise continuous sheet of fat and
          skin into smaller sections, which does two things during cooking: it multiplies the
          surface area of fat exposed directly to pan heat, so it renders faster and more evenly,
          and it opens channels for melted fat to drain away from the skin instead of pooling
          under it. Unscored skin can still crisp, but slowly and unevenly, and it traps rendered
          fat against the surface longer than scored skin does.
        </p>
      </Section>

      <Section id="depth" heading="Depth: through the fat, not into the meat">
        <p>
          The cut needs to go through the full thickness of the fat cap and stop at the thin
          membrane sitting just above the muscle. Cutting into the meat itself lets juices escape
          during cooking and gives the flesh nowhere to go but tougher near each cut. Cutting too
          shallow — only nicking the surface of the skin — barely changes rendering behaviour at
          all, since most of the fat volume is still sealed under unbroken skin.
        </p>
        <p>
          A reliable way to judge depth by feel: you should sense a slight change in resistance as
          the blade passes from fat into the firmer membrane, and stop there. On most breasts that
          is roughly 3–5 mm (1/8–3/16 in) deep, but go by feel and sight rather than a fixed
          number, since fat cap thickness varies by bird and season.
        </p>
      </Section>

      <Section id="cold-skin" heading="Why the skin has to be cold">
        <p>
          Fat that's cold, straight from the refrigerator, is firm and holds its shape under the
          blade, so a cut goes in cleanly and stays where you put it. Fat that has warmed to room
          temperature turns soft and slightly greasy, and the blade tends to drag and smear it
          rather than slice through cleanly, which blurs the cut lines and makes consistent
          spacing harder to judge. Score straight from the fridge, then let the breast sit briefly
          before it goes in the pan if your recipe calls for a short temper.
        </p>
      </Section>

      <Section id="pattern" heading="Pattern choice: parallel, diamond, or none">
        <DataTable
          caption="Scoring pattern trade-offs"
          columns={["Pattern", "What it does", "Best for", "Trade-off"]}
          rows={[
            [
              "Parallel lines",
              "Opens fat evenly along one axis; simplest to cut consistently",
              "Everyday cooking, faster prep",
              "Slightly less total surface area exposed than a diamond grid",
            ],
            [
              "Diamond cross-hatch",
              "Maximises exposed fat surface and drainage channels in both directions",
              "Thicker fat caps, presentation-focused plating",
              "Takes longer and is easier to cut unevenly under time pressure",
            ],
            [
              "No scoring",
              "Leaves the fat cap as a continuous sheet",
              "Very thin-fat breasts where there's little to render",
              "Slower, less even rendering; higher risk of soft patches",
            ],
          ]}
        />
      </Section>

      <Section id="method" heading="Knife grip, angle and spacing">
        <p>
          Depth control is a knife problem before it is a technique problem — see{" "}
          <a href="/gear/best-knife-for-scoring-duck" className="text-primary underline underline-offset-4">
            knives for scoring duck skin
          </a>{" "}
          for blade shapes that give tip feedback. Once the skin is scored, the{" "}
          <a href="/cook/how-to-cook-duck-breast" className="text-primary underline underline-offset-4">
            cold-pan duck breast method
          </a>{" "}
          is what turns those channels into rendered fat.
        </p>
        <StepList
          steps={[
            {
              title: "Choose a knife with tip control",
              body: "A sharp paring knife, boning knife, or the tip of a chef's knife works better than the full blade of a large knife, since scoring is a controlled, shallow motion rather than a long draw.",
            },
            {
              title: "Grip with your index finger along the spine",
              body: "Choking up on the blade with a finger along the top gives you direct feedback on depth as you cut, which matters more here than raw cutting speed.",
            },
            {
              title: "Angle the blade low, almost flat to the skin",
              body: "A low angle keeps the cut shallow and consistent along its length. A steep, near-vertical angle makes it easy to punch through into the meat by accident.",
            },
            {
              title: "Space cuts 8–10 mm (about 1/3 in) apart",
              body: "Tighter spacing exposes more fat but takes longer and risks the cuts merging into a torn mess; wider spacing leaves more unrendered fat between cuts.",
            },
            {
              title: "Cut in one continuous stroke per line",
              body: "Short, sawing strokes are more likely to wander off depth partway through. One smooth pass at a steady depth keeps the cut even end to end.",
            },
          ]}
        />
      </Section>

      <QuackFix
        title="Quack Fix: scoring mistakes"
        items={[
          {
            symptom: "Juice leaks out of the breast during cooking",
            cause: "Cuts went through the membrane into the meat",
            fixNow: "Nothing to do mid-cook; the breast will still cook fine, just with slightly more moisture loss",
            prevent: "Score at a low, shallow angle and stop the moment resistance changes underneath the blade",
          },
          {
            symptom: "Skin still looks soft and pale after a full render",
            cause: "Scoring was too shallow or too widely spaced to open enough fat surface",
            fixNow: "Extend the render time over slightly higher heat and pour off fat more frequently",
            prevent: "Cut fully through the fat cap and space lines 8–10 mm apart",
          },
          {
            symptom: "Cut lines are ragged or uneven in depth",
            cause: "Skin was at room temperature and smeared under the blade, or the knife lacked tip control",
            fixNow: "Wipe the skin dry and finish scoring the missed sections carefully before it goes in the pan",
            prevent: "Score straight from cold, and use a knife with a fine, controllable tip",
          },
          {
            symptom: "Fat renders unevenly across the breast",
            cause: "Scoring pattern didn't cover the whole surface, often skipping the edges",
            fixNow: "Rotate the breast in the pan and manually spoon hot fat over any unscored patches",
            prevent: "Carry the scoring pattern edge to edge, including the tapered ends",
          },
        ]}
      />

      <ConversionPaths
        sourcePath="/learn/how-to-score-duck-breast"
        eyebrow="Choosing the blade"
        intro="The knife decision this cut actually depends on."
      />

      <AirFryerRecipeLink
        placement={AIR_FRYER_INBOUND_PLACEMENTS.scoringGuide}
        className="mt-10"
      >
        Scoring matters even more in an air fryer, where draining is the only way fat leaves the
        basket.
      </AirFryerRecipeLink>

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
