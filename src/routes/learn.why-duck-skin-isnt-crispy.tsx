import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Section, Callout } from "@/components/site/ArticleShell";
import { QuackFix } from "@/components/site/QuackFix";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, ldScript, pageMeta } from "@/lib/seo";
import { DuckBreastJourney } from "@/components/site/DuckBreastJourney";
import { CommercialCallout } from "@/components/site/CommercialLink";
import { DecisionNextSteps } from "@/components/site/DecisionGuide";
import { ConversionPaths } from "@/components/site/ConversionPaths";

const GUIDE = guideByPath("/learn/why-duck-skin-isnt-crispy")!;

export const Route = createFileRoute("/learn/why-duck-skin-isnt-crispy")({
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
      eyebrow="Diagnostic"
      title={GUIDE.title}
      intro={GUIDE.description}
      trail={[
        { name: "Learn", to: "/learn" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read · Diagnostic`}
    >
      <Section id="diagnose-fast" heading="Diagnose it in 30 seconds">
        <p>Look at the breast right now and match what you see:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Skin is soft, pale, and slightly gelatinous.</strong> Likely wet skin at the start, or not enough render time. Skip to items 1 and 4 below.</li>
          <li><strong>Skin browned fast but is chewy underneath.</strong> Heat was too high too early. See item 2.</li>
          <li><strong>Some parts crisp, other parts soft in the same pan.</strong> Overcrowding. See item 3.</li>
          <li><strong>Skin was crisp off the pan but went soft on the plate.</strong> Sauce touched the skin, or it rested wrong. See items 5 and 7.</li>
          <li><strong>Skin never crisped at all, even after a long cook.</strong> It probably wasn't scored. See item 6.</li>
        </ul>
      </Section>

      <QuackFix
        title="Quack Fix: seven reasons duck skin won't crisp"
        intro="Work through these in order of how often each one actually causes the problem."
        items={[
          {
            symptom: "Skin surface is wet or glistening before it hits the pan",
            cause: "Moisture on the skin has to evaporate before browning can even start, and it steams the surface in the meantime instead of drying it",
            fixNow: "Pull the breast out, blot it thoroughly dry with paper towel on both sides, and start again in a clean, dry pan",
            prevent: "Pat skin fully dry immediately before cooking; an uncovered rest in the fridge beforehand also helps dry it out",
          },
          {
            symptom: "Pan was hot when the breast went in",
            cause: "High heat browns and seizes the skin surface before the fat cap underneath has time to render out",
            fixNow: "Lower the heat immediately and be patient; you can partially recover render time but the surface is already set",
            prevent: "Start in a cold or barely warm pan and let heat climb gradually over 8–12 minutes",
          },
          {
            symptom: "Some breasts crisp, others in the same pan stay soft",
            cause: "Overcrowding drops local pan temperature unevenly and traps steam between breasts, especially where they touch",
            fixNow: "Spread the breasts out or cook in batches; separate any that are touching right now",
            prevent: "Leave visible gaps between pieces — cook two batches rather than crowd one pan",
          },
          {
            symptom: "Skin browned but a layer of unrendered fat remains underneath",
            cause: "Cooking time at the render stage was cut short, often by rushing to flip",
            fixNow: "Flip back skin-down and continue at moderate heat until the fat cap visibly thins and the skin turns matte gold",
            prevent: "Judge the flip by how the skin looks and feels, not by a fixed clock time",
          },
          {
            symptom: "Skin was crisp, then went soft once sauce or glaze touched it",
            cause: "Liquid sauces and glazes wet the skin surface the same way pre-cook moisture does",
            fixNow: "Plate the sauce underneath or beside the sliced duck rather than over the skin",
            prevent: "Always sauce the plate, not the skin, and add glazes only in the final seconds if the technique calls for a lacquered finish",
          },
          {
            symptom: "Skin never crisps however long it cooks",
            cause: "The skin wasn't scored, so fat is sealed under an unbroken surface with nowhere to drain",
            fixNow: "If it's early in the cook, remove, score it cold, and restart; if it's already cooked through, there's no fixing that piece",
            prevent: "Score through the fat cap in a parallel or diamond pattern before the breast goes anywhere near heat",
          },
          {
            symptom: "Skin was perfect off the pan but soft by the time it's served",
            cause: "Resting skin-side down or under a tight cover traps steam against the crisp surface",
            fixNow: "Nothing recovers already-softened skin; serve as is and adjust for next time",
            prevent: "Rest skin-side up, uncovered or loosely tented, and slice and plate promptly",
          },
        ]}
      />

      <DuckBreastJourney
        id="cluster-after-diagnosis"
        title="Once the skin is sorted, here's the rest of the cluster"
        intro="This page fixes one failure. These are the pages that stop it happening, and the ones that follow it."
        placement="crisp_skin_after_diagnosis"
        excludePath="/learn/why-duck-skin-isnt-crispy"
      />

      <Section id="prevention-checklist" heading="Prevention checklist for next time">
        <ul className="list-disc space-y-2 pl-5">
          <li>Score the fat cap fully, edge to edge, while the skin is cold.</li>
          <li>Pat the skin completely dry immediately before cooking.</li>
          <li>Start in a cold, dry, heavy pan — no oil needed.</li>
          <li>Raise heat gradually; don't rush the render stage.</li>
          <li>Leave space between pieces; cook in batches if the pan is small.</li>
          <li>Pour off rendered fat two or three times during cooking.</li>
          <li>Flip on appearance — matte, deep gold — not on a fixed timer.</li>
          <li>Keep sauce off the skin; plate it separately.</li>
          <li>Rest skin-up, uncovered, and serve promptly.</li>
        </ul>
        <Callout label="Related technique">
          For the full step-by-step method these fixes assume, see{" "}
          <a href="/cook/how-to-cook-duck-breast" className="text-primary underline underline-offset-4">
            how to cook duck breast
          </a>.
        </Callout>
      </Section>

      <CommercialCallout
        heading="If the fix keeps failing, measure instead of guessing"
        intro="Most crisp-skin failures are heat management, not equipment. A probe is the exception: it tells you whether you pulled early or ran the pan too hot."
        placement="crisp_skin_gear"
        linkIds={["thermoworks-thermometer"]}
        criteria={[
          "Fast enough to check mid-render without leaving the pan unattended.",
          "Readable at a glance when your hands are busy pouring off fat.",
        ]}
        footnote={
          <>
            Pan choice matters second; see{" "}
            <a href="/gear/best-pan-for-duck-breast" className="text-primary underline underline-offset-4">
              best pan for duck breast
            </a>{" "}
            and the full method in{" "}
            <a href="/cook/how-to-cook-duck-breast" className="text-primary underline underline-offset-4">
              how to cook duck breast
            </a>
            .
          </>
        }
      />

      <DecisionNextSteps
        intro="Two of the causes above are equipment problems rather than technique problems. These guides decide the equipment."
        items={[
          { to: "/gear/best-pan-for-duck-breast", label: "Best pan for duck breast", why: "If your render stalls or browns unevenly, the pan material is usually the variable." },
          { to: "/gear/best-thermometer-for-duck", label: "Best thermometer for duck", why: "If you are pulling the breast by feel, a fast probe removes the guess that costs you the skin." },
        ]}
      />

      <ConversionPaths
        sourcePath="/learn/why-duck-skin-isnt-crispy"
        eyebrow="If it is the pan"
        heading="When equipment is the limiting factor"
      />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
