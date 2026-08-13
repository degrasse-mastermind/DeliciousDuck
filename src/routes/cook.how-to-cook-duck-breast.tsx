import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Section, StepList, Callout, DataTable } from "@/components/site/ArticleShell";
import { DuckConfidenceCard } from "@/components/site/DuckConfidenceCard";
import { QuackFix } from "@/components/site/QuackFix";
import { SafetyNote } from "@/components/site/SafetyNote";
import { ShopThisGuide } from "@/components/site/Commerce";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { DuckBreastJourney } from "@/components/site/DuckBreastJourney";
import { DUCK_BREAST_CLUSTER } from "@/lib/duck-breast-cluster";

const GUIDE = guideByPath("/cook/how-to-cook-duck-breast")!;

export const Route = createFileRoute("/cook/how-to-cook-duck-breast")({
  head: () => ({
    ...pageMeta({ title: GUIDE.seoTitle, description: GUIDE.description, path: GUIDE.path, ogType: "article" }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Cook", item: "/cook" },
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
      eyebrow="Technique"
      title={GUIDE.title}
      intro={GUIDE.description}
      trail={[
        { name: "Cook", to: "/cook" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read · Technique`}
      sidebar={
        <DuckConfidenceCard
          data={{
            cut: "Boneless duck breast, skin on (magret or Pekin)",
            difficulty: "Intermediate",
            biggestRisk: "Skin scorches before the fat under it renders",
            essentialTechnique: "Cold-pan start with gradual heat rise",
            targetResult: "Shattering-crisp skin, warm rosy-to-cooked centre",
            essentialTool: "Instant-read or leave-in probe thermometer",
            saveAfterwards: "Pour off and strain the rendered fat for roasting",
          }}
        />
      }
    >
      <Section id="why-cold-pan" heading="Why a cold pan, not a hot one">
        <p>
          Duck breast carries a thick fat cap between the skin and the muscle. That fat needs time
          and a moderate, sustained heat to melt out through the scored channels. Drop a scored
          breast into a screaming-hot pan and the outer surface of the skin seizes and browns
          before the fat beneath it has had any chance to liquefy — you get a dark, leathery skin
          sitting on top of a layer of unrendered fat, which is chewy rather than crisp no matter
          how long you leave it after that point.
        </p>
        <p>
          Starting the breast skin-side down in a cold or barely warm pan means the pan and the
          fat heat up together. As the pan climbs from room temperature through roughly
          250–300°F (121–149°C) at the skin surface, the fat has time to render steadily, and the
          skin dries out and crisps as the fat leaves it rather than before. This is the entire
          physical argument for the cold-pan method: it trades speed for a longer window during
          which fat can escape before proteins in the skin lock into a tough layer.
        </p>
      </Section>

      <Section id="scoring" heading="Score before the pan is ever hot">
        <p>
          Score the skin in a tight parallel or diamond pattern, cutting through the fat layer but
          stopping at the membrane just above the meat — see{" "}
          <a href="/learn/how-to-score-duck-breast" className="text-primary underline underline-offset-4">
            how to score duck breast
          </a>{" "}
          for spacing and knife angle. Scoring multiplies the surface area of fat exposed to heat
          and gives rendered fat channels to escape through instead of pooling under an unbroken
          skin. Do this while the breast is cold, straight from the refrigerator — cold fat is firm
          and cuts cleanly, while room-temperature fat smears under the blade.
        </p>
      </Section>

      <Section id="method" heading="The cold-pan method, step by step">
        <StepList
          steps={[
            {
              title: "Pat dry and season just before cooking",
              body: "Blot the skin fully dry with paper towel and season both sides with salt. Salting more than a few minutes ahead is fine, but wet skin steams instead of rendering, so dry it again immediately before it goes in the pan.",
            },
            {
              title: "Place skin-side down in a cold, dry pan",
              body: "Use a heavy pan with real thermal mass — cast iron or a thick stainless clad pan holds the slow climb better than a thin pan that swings with the burner. No oil is needed; the duck supplies its own fat within a minute or two.",
              watchFor: "A pan that's already hot. If it hisses on contact, it's too late — start over with a cooler pan.",
            },
            {
              title: "Bring the heat up gradually over 8–12 minutes",
              body: "Set the burner to medium-low and let the pan warm with the duck in it. You are listening for a slow, steady sizzle, not an aggressive one. This stretch does almost all the fat rendering.",
            },
            {
              title: "Pour off fat two or three times during the cook",
              body: "As liquid fat pools in the pan, tip it off into a heatproof container. Deep fat around the breast insulates the skin from the pan and slows crisping — clearing it repeats direct pan contact and speeds rendering. Save the poured fat; it is clean and usable.",
            },
            {
              title: "Flip once the skin is deep golden-brown and firm",
              body: "This is usually 10–14 minutes skin-down, though pan and breast size change that. The skin should look uniformly rendered — matte, not glassy, with no soft or translucent patches. Flip and cook the flesh side briefly, generally 1–3 minutes, mainly to set colour rather than to cook it through.",
            },
            {
              title: "Check temperature with a probe, not a clock",
              body: "Insert the thermometer through the side of the breast into the thickest part, avoiding the fat cap and the pan surface. Pull the breast a few degrees under your target, since carryover during resting continues to raise the internal temperature.",
            },
            {
              title: "Rest 5–8 minutes, skin-side up, uncovered or loosely tented",
              body: "Resting redistributes juices and finishes the internal rise from carryover heat. Resting skin-down or under a tight foil tent traps steam against the crisp skin and softens it.",
            },
            {
              title: "Slice across the grain, on a slight bias",
              body: "Cut through the skin first with a sawing motion so it doesn't tear, then continue through the meat. Fan slices immediately — the skin loses crispness the longer it sits assembled and cooling.",
            },
          ]}
        />
      </Section>

      <SafetyNote>
        <p>
          Duck breast is commonly served in the 130–140°F (54–60°C) range for a rosy, tender
          centre. That range is a long-standing culinary convention, not a food-safety
          recommendation. See{" "}
          <a href="/learn/duck-breast-temperature-doneness" className="text-primary underline underline-offset-4">
            duck breast temperature and doneness
          </a>{" "}
          for the full breakdown of pull temperature, carryover, and who should stick to 165°F.
        </p>
      </SafetyNote>

      <Section id="ready-to-cook" heading="Ready to cook it">
        <p>
          For the exact quantities, timings and rest in one place, use the{" "}
          <a href="/recipes/pan-seared-duck-breast" className="text-primary underline underline-offset-4">
            pan-seared duck breast recipe
          </a>. If you still need the cut itself, the{" "}
          <a href="/buy/where-to-buy-duck-online" className="text-primary underline underline-offset-4">
            guide to buying duck online
          </a>{" "}
          covers which suppliers ship skin-on breasts and what to check on arrival.
        </p>
      </Section>

      <DuckBreastJourney
        id="choose-your-next-answer"
        title="Choose your next answer"
        intro="Whatever you need next — a number, a fix, a recipe, or a pan — it is one of these ten pages."
        placement="hub_next_answer"
        variant="grouped"
        excludePath="/cook/how-to-cook-duck-breast"
      />

      <Section id="temp-ladder" heading="The temperature ladder at a glance">
        <DataTable
          caption="Pan-stage heat and what's happening in the skin"
          columns={["Stage", "Approx. skin-surface heat", "What's happening"]}
          rows={[
            ["Cold start", "Room temp – 200°F (93°C)", "Pan and fat warm together; no browning yet"],
            ["Steady render", "200–275°F (93–135°C)", "Fat liquefies and drains through scored channels"],
            ["Crisping", "275–320°F (135–160°C)", "Skin surface dries and browns; watch closely here"],
            ["Flip point", "~320°F (160°C) skin surface", "Skin is matte gold-brown and firm to the touch"],
          ]}
        />
      </Section>

      <QuackFix
        title="Quack Fix: cold-pan duck breast"
        intro="The five failures that account for almost every disappointing duck breast."
        items={[
          {
            symptom: "Skin is dark brown but still chewy and fatty underneath",
            cause: "Pan started too hot, so the surface seized before the fat cap rendered",
            fixNow: "Nothing recovers this cook fully; finish to a safe internal temperature and note the pan was too hot at the start",
            prevent: "Start the breast in a genuinely cold pan and raise heat gradually over 8–12 minutes",
          },
          {
            symptom: "Skin stays pale and rubbery the whole cook",
            cause: "Skin wasn't dry, or it wasn't scored, or the pan never got hot enough to finish crisping",
            fixNow: "Raise the heat for the final two minutes skin-down and blot any surface moisture with a towel first",
            prevent: "Dry the skin thoroughly, score it, and don't crowd the pan",
          },
          {
            symptom: "Breast is overcooked by the time the skin is crisp",
            cause: "Fat wasn't poured off, so the breast sat insulated in a deep pool and needed longer over heat",
            fixNow: "Pour off fat now and finish over slightly higher heat for a shorter stretch",
            prevent: "Tip out rendered fat two or three times during the render stage",
          },
          {
            symptom: "Thermometer reads unevenly between two probe attempts",
            cause: "Probe touched the fat cap, bone, or the pan through the breast",
            fixNow: "Re-probe through the side into the geometric centre of the thickest part",
            prevent: "Always insert horizontally through the side, not down through the top",
          },
          {
            symptom: "Skin has gone soft by the time it's plated",
            cause: "Rested skin-side down, tightly covered, or sliced too far ahead of serving",
            fixNow: "Nothing brings back crisped skin once steamed soft; serve promptly next time",
            prevent: "Rest skin-up, uncovered or loosely tented, and slice just before serving",
          },
        ]}
      />

      <Section id="what-you-need" heading="What you actually need">
        <p>
          Duck breast is not an equipment-heavy cook. It is worth being blunt about which of these
          things changes the outcome and which is a convenience, because the difference is large.
        </p>
        <h3 className="font-display text-xl text-foreground">Essential</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>A heavy pan you already own.</strong> Cast iron or thick clad stainless is
            ideal, but any pan with real thermal mass will hold the slow climb. If you have one,
            you do not need another —{" "}
            <a href="/gear/best-pan-for-duck-breast" className="text-primary underline underline-offset-4">
              what to look for in a pan
            </a>{" "}
            matters only when you are replacing one.
          </li>
          <li>
            <strong>A thermometer.</strong> This is the one item that genuinely changes results,
            because pulling by clock alone is guesswork on a cut this thin. See{" "}
            <a href="/gear/best-thermometer-for-duck" className="text-primary underline underline-offset-4">
              thermometers for duck
            </a>.
          </li>
          <li>
            <strong>A sharp knife.</strong> Whatever knife you own, if it is sharp it will score
            the fat cap. Sharpness matters more than shape.
          </li>
        </ul>
        <h3 className="font-display text-xl text-foreground">Useful</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            A heatproof container for the fat you pour off, so you can strain and keep it rather
            than throwing away the best by-product of the cook.
          </li>
          <li>
            A knife with good tip control, which makes scoring more consistent rather than merely
            possible —{" "}
            <a href="/gear/best-knife-for-scoring-duck" className="text-primary underline underline-offset-4">
              blade shapes for scoring
            </a>.
          </li>
          <li>A rack or warm plate to rest on, so the skin is not sitting in juices.</li>
        </ul>
        <h3 className="font-display text-xl text-foreground">Optional</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>A leave-in probe, which is convenience for multiple breasts rather than accuracy.</li>
          <li>A splatter screen, purely for cleanup.</li>
          <li>A fat separator or fine strainer, if you render often enough to care.</li>
        </ul>
      </Section>

      <ShopThisGuide
        items={[
          {
            label: "A pan with real thermal mass",
            why: "Cast iron or thick stainless clad holds a slow, even climb through the render stage far better than a thin pan.",
            to: "/gear/best-pan-for-duck-breast",
            linkLabel: "Compare pans for duck breast",
          },
          {
            label: "An instant-read or leave-in probe thermometer",
            why: "Pulling breast by time alone is guesswork; a probe placed correctly is the only reliable doneness check.",
            to: "/gear/best-thermometer-for-duck",
            linkLabel: "Compare duck thermometers",
          },
          {
            label: "A knife that scores cleanly without dragging",
            why: "A blade with good tip control cuts through fat without nicking the meat underneath.",
            to: "/gear/best-knife-for-scoring-duck",
            linkLabel: "Compare scoring knives",
          },
        ]}
      />

      <div className="mt-14">
        <NewsletterSignup id="field-guide" interest="duck-breast" />
      </div>

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
