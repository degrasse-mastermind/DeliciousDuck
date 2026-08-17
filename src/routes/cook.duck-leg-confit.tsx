import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section, StepList } from "@/components/site/ArticleShell";
import { DuckConfidenceCard } from "@/components/site/DuckConfidenceCard";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SafetyNote } from "@/components/site/SafetyNote";
import { SourceNotes } from "@/components/site/SourceNotes";
import { UseTheWholeDuck } from "@/components/site/UseTheWholeDuck";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
import { DecisionNextSteps } from "@/components/site/DecisionGuide";

const GUIDE = guideByPath("/cook/duck-leg-confit")!;

export const Route = createFileRoute("/cook/duck-leg-confit")({
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
  component: DuckLegConfitPage,
});

const FAQ = [
    {
      q: "Can I confit without curing the legs first?",
      a: "You can skip the cure and season only at the surface, but the meat will taste flatter and slightly wetter; the cure is what carries seasoning through the muscle.",
    },
    {
      q: "Why did my confit turn out tough instead of tender?",
      a: "The fat likely ran too hot — a visible simmer toughens the muscle fibres instead of slowly breaking down connective tissue. Hold it at 190–210°F (88–99°C) and check with a thermometer.",
    },
    {
      q: "Is it safe to store confit at room temperature the traditional way?",
      a: "Modern food-safety guidance does not recommend it. Refrigerate confit, keeping the legs submerged in fat, and treat it like any other cooked poultry with a 1–2 week refrigerated window.",
    },
  ];

function DuckLegConfitPage() {
  return (
    <ArticleShell
      eyebrow="Cook · Duck fat"
      title={GUIDE.title}
      intro="Confit is a preservation technique wearing a dinner-party costume: salt draws moisture out, fat excludes air, and a long, gentle poach turns tough leg meat tender. This is a planning and technique guide, not a hands-on-tested recipe — treat every time and temperature as a range to verify in your own kitchen."
      trail={[
        { name: "Cook", to: "/cook" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
      sidebar={
        <DuckConfidenceCard
          data={{
            cut: "Duck legs (thigh and drumstick attached)",
            difficulty: "Intermediate",
            biggestRisk: "Under-curing the salt or treating fat-sealed storage as shelf-stable",
            essentialTechnique: "Dry salt cure, then a slow submerged poach well under a simmer",
            targetResult: "Meat that pulls cleanly from the bone; USDA minimum of 165°F (73.9°C) reached during cooking",
            essentialTool: "An oven-safe pot or deep dish that holds the legs fully submerged in fat",
            saveAfterwards: "The poaching fat, strained and reused for future confit or roasting",
          }}
        />
      }
    >
      <Section id="why-cure" heading="Why salt cure first">
        <p>
          Duck legs are dense working muscle — flavourful but tough if cooked quickly. A dry salt
          cure applied before poaching draws surface moisture out through osmosis, seasons the
          meat all the way through rather than just the surface, and firms the texture slightly so
          the meat holds together through a long, slow cook instead of falling apart into mush.
          It is not primarily what makes confit shelf-stable — the fat and the cooking do that
          work — but skipping the cure gives you bland, wetter meat.
        </p>
      </Section>

      <Section id="cure-ratio" heading="Cure ratio and timing">
        <p>
          A widely used starting point is 1.5–2% salt by weight of the legs — for four legs
          weighing roughly 1.2 kg (2.6 lb) total, that's about 18–24 g (1–1.5 tbsp) of salt. Add
          crushed garlic, thyme, bay and cracked black pepper to taste; these flavour the surface
          but don't affect the cure's function. Rub the mixture over the legs, lay them in a single
          layer on a tray, cover, and refrigerate.
        </p>
        <DataTable
          caption="Cure time ranges by result"
          columns={["Cure time", "Result"]}
          rows={[
            ["6–8 hours", "Light seasoning, subtler flavour, softer texture"],
            ["12–24 hours", "The commonly used range — well-seasoned without tasting overtly salty"],
            ["36+ hours", "Firmer, more intensely seasoned; rinse thoroughly before cooking"],
          ]}
        />
        <p>
          Rinse the cure off and pat the legs fully dry before they go into the fat — residual
          surface salt concentrates unevenly during the long poach otherwise.
        </p>
      </Section>

      <Section id="fat-needed" heading="How much fat you need — and getting away with less">
        <p>
          Classic confit fully submerges the legs in rendered duck fat, which for four legs in a
          snug pot generally means 1–1.5 L (about 4–6 cups). That's a meaningful amount if you're
          not already sitting on rendered fat from previous roasts — see{" "}
          <Link to="/learn/how-to-render-duck-fat" className="text-primary underline underline-offset-4">
            how to render duck fat
          </Link>{" "}
          to build up a supply. If you don't have enough, choose a pot or deep baking dish sized
          close to the legs so less fat is needed to submerge them, and top up the shortfall with a
          neutral oil — the legs won't taste identical to an all-duck-fat confit, but they'll still
          poach and protect properly as long as they stay fully covered.
        </p>
      </Section>

      <Section id="poach" heading="The low-temperature poach window">
        <p>
          Confit is poached, not simmered — the fat should hold at roughly 190–210°F (88–99°C),
          well below a rolling simmer, with the smallest bubbles occasionally breaking the surface.
          In a domestic oven this usually means setting the dial to 200–225°F (93–107°C) and
          checking the fat temperature directly with a thermometer rather than trusting the dial,
          since oven thermostats are least accurate at low settings. Cook uncovered or loosely
          covered for 2.5–3.5 hours, until the meat is fork-tender and pulls easily from the bone
          but hasn't disintegrated.
        </p>
      </Section>

      <StepList
        steps={[
          {
            title: "Cure",
            body: "Rub legs with 1.5–2% salt by weight plus aromatics, and refrigerate 12–24 hours.",
          },
          {
            title: "Rinse and dry",
            body: "Rinse off the cure and pat the legs completely dry before they meet the fat.",
          },
          {
            title: "Submerge in fat",
            body: "Arrange legs snugly in a pot or dish and pour in enough melted duck fat (or a duck-fat-and-oil blend) to fully cover them.",
          },
          {
            title: "Poach low and slow",
            body: "Hold the fat at 190–210°F (88–99°C) in a 200–225°F (93–107°C) oven for 2.5–3.5 hours, checking with a thermometer rather than the dial.",
            watchFor: "Visible simmering or bubbling — that means the fat is too hot and the meat will toughen instead of tenderizing.",
          },
          {
            title: "Check doneness",
            body: "The meat should pull easily from the bone with light pressure and register at least 165°F (73.9°C) internally.",
          },
          {
            title: "Cool and store",
            body: "Cool the legs in the fat, then transfer to a covered container, submerged, and refrigerate.",
          },
          {
            title: "Crisp to serve",
            body: "Lift legs from the cold fat, scrape off excess, and crisp skin-side down in a hot pan or a 425°F (218°C) oven for 10–15 minutes before serving.",
          },
        ]}
      />

      <SafetyNote>
        <p>
          The low poaching temperature is a texture choice, not a food-safety shortcut — over the
          course of the 2.5–3.5 hour cook, the meat's internal temperature passes well above the
          165°F (73.9°C) USDA minimum even though the surrounding fat never reaches a simmer.
          Confirm this with a thermometer inserted into the thickest part of the thigh rather than
          assuming time alone has done the job.
        </p>
      </SafetyNote>

      <Section id="storage" heading="Cooling, storage and an honest note on tradition">
        <p>
          Traditional confit was stored fat-sealed at cool cellar temperature for weeks or months,
          which made sense before refrigeration was universal and salt levels were often higher
          than modern recipes use. That is not a food-safety practice current guidance
          recommends. Cool the cooked legs, keep them submerged in their fat, and refrigerate —
          properly chilled, fat-sealed confit should be treated like any other cooked poultry:
          use it within 3–4 days, and never hold it at room
          temperature. If you want longer storage, freeze the legs in their fat — 2–3 months is
          comfortable — instead of relying on a room-temperature seal.
        </p>
      </Section>

      <UseTheWholeDuck
        items={[
          {
            part: "Poaching fat",
            use: "Strain and refrigerate — it takes on rich, savoury flavour from the cure and can be reused for another batch of confit or for roasting potatoes.",
            to: "/cook/ways-to-use-duck-fat",
            linkLabel: "15 ways to use duck fat",
          },
        ]}
      />

      <FaqList items={FAQ} />

      <SourceNotes ids={["usdaPoultryTemp", "usdaLeftovers", "fdaColdStorage"]} />

      <DecisionNextSteps
        intro="Confit is the one duck cook where the shopping list is the hard part."
        items={[
          { to: "/buy/duck-fat-buying-guide", label: "Duck fat buying guide", why: "Which format actually gives you enough fat to submerge the legs, and when rendering your own wins." },
          { to: "/gear/best-thermometer-for-duck", label: "Best thermometer for duck", why: "A long, low cook is easier to hold steady with a probe than with the oven dial alone." },
        ]}
      />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
