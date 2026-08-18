import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Section, Callout, DataTable, FaqList } from "@/components/site/ArticleShell";
import {
  DisclosureBanner,
  ComparisonCard,
  ComparisonTable,
  EvaluationNote,
  ShopThisGuide,
} from "@/components/site/Commerce";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { ROASTING_PANS, ROASTING_PAN_FACTORS } from "@/data/comparisons";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/gear/best-roasting-pan-for-duck")!;

const FAQ = [
  {
    q: "What size roasting pan do I need for a whole duck?",
    a: "A 13 × 9 inch (33 × 23 cm) pan handles a typical 4.5–6 lb duck with room for air to move around it. Bigger is fine; smaller starts to crowd the bird against the sides, which is where skin stays pale.",
  },
  {
    q: "Do I really need a rack?",
    a: "Yes, or something that does the same job. A duck renders a substantial amount of fat, and any skin sitting in that fat is poaching rather than roasting. A fitted rack, a wire cooling rack that fits, or even a bed of thick onion slices will lift the bird clear.",
  },
  {
    q: "Can I roast a duck on a sheet pan?",
    a: "You can, and the airflow is excellent, but a 1 inch rim fills with fat quickly. Use a sturdy half-sheet with a rack, keep a heatproof jar nearby, and ladle fat off as it collects rather than waiting until the pan is brimming.",
  },
  {
    q: "Is cast iron a good roasting vessel for duck?",
    a: "For legs, a halved bird, or a spatchcocked one, it's excellent. For a whole duck it's the wrong shape — the bird sits low in its own fat and the sides block airflow where you most want it.",
  },
  {
    q: "How deep should the sides be?",
    a: "About 2.5–3 inches (6–8 cm) is the sweet spot. That's deep enough to hold the render and let you pour some off safely, without turning the pan into a steam box around the lower half of the bird.",
  },
  {
    q: "Should I add water to the pan?",
    a: "No. Water in the pan creates steam, and steam is the enemy of the skin you're working to crisp. The bird will supply plenty of liquid fat on its own.",
  },
];

export const Route = createFileRoute("/gear/best-roasting-pan-for-duck")({
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
          { name: "Gear", item: "/gear" },
          { name: GUIDE.title, item: GUIDE.path },
        ]),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: Page,
});

const SIZING = [
  ["4.5–5 lb (2.0–2.3 kg) duck", "13 × 9 in (33 × 23 cm)", "Half-sheet with a rack", "Roughly 1 to 1.5 cups of fat"],
  ["5–6 lb (2.3–2.7 kg) duck", "14 × 10 in (36 × 25 cm)", "Half-sheet with a rack", "Plan to pour off at least once"],
  ["Two ducks, side by side", "16 × 13 in (41 × 33 cm) or two pans", "Two half-sheets", "Two pours, minimum"],
  ["Legs or a spatchcocked bird", "Quarter-sheet or 12 in skillet", "12 in cast iron", "Well under a cup"],
];

function Page() {
  return (
    <ArticleShell
      eyebrow="Gear Guide"
      title={GUIDE.title}
      intro={GUIDE.description}
      trail={[
        { name: "Gear", to: "/gear" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <p>
        A whole duck asks two things of a roasting pan: hold the fat it renders, and keep the bird
        out of it. Everything else — brand, finish, price — is secondary to those two jobs. Get the
        rack and the depth right and a modest pan will roast a better duck than an expensive one
        that lets the bird sit in a puddle.
      </p>

      <DisclosureBanner />

      <Callout label="The short answer" tone="gold">
        <p>
          A roasting pan around 13 × 9 in (33 × 23 cm) with 2.5–3 in sides and a rack that fits it
          is the most reliable choice. A sturdy half-sheet pan with a wire rack is the best
          substitute, and it's the one you'll use for everything else too. Cast iron is for legs and
          flat cuts, not a whole bird.
        </p>
      </Callout>

      <Section id="fat" heading="The fat is the design brief">
        <p>
          Duck renders far more fat than chicken, and that fat pools in the bottom of the pan while
          the bird is still cooking. Skin sitting in liquid fat doesn't crisp — it confits, softly
          and gently, in exactly the way you don't want on the top of a roast. So the pan has to
          elevate the bird and hold the render without threatening to overflow when you move it.
        </p>
        <p>
          Don't throw that fat away. Strained and stored properly it's the most valuable thing the
          bird produces — see{" "}
          <Link
            to="/learn/how-to-render-duck-fat"
            className="text-primary underline underline-offset-4"
          >
            how to render and store duck fat
          </Link>{" "}
          and{" "}
          <Link to="/cook/ways-to-use-duck-fat" className="text-primary underline underline-offset-4">
            what to do with it
          </Link>
          .
        </p>
      </Section>

      <Section id="rack" heading="The rack matters more than the pan">
        <p>
          If you buy one thing after reading this, buy a rack that fits the pan you already own.
          A fitted V-rack cradles a whole bird and keeps it steady; a flat wire rack works just as
          well provided it's rigid enough not to bow under five pounds. A rack that flexes tips the
          bird into the fat halfway through the roast, which is worse than no rack at all.
        </p>
        <p>
          No rack tonight? Thick slices of onion, halved carrots, or a coil of foil will lift the
          bird an inch off the base. It's a workaround, not a purchase — but it's a good one.
        </p>
      </Section>

      <Section id="sizing" heading="Sizing, by bird">
        <p>
          Sizes below are practical starting points based on typical whole-duck dimensions, not
          measured yields. Leave at least an inch of clearance on every side so hot air can circle
          the bird rather than stall against a wall.
        </p>
        <DataTable
          caption="Roasting vessel sizing for duck"
          columns={["What you're roasting", "Roasting pan", "Sheet-pan alternative", "Expected render"]}
          rows={SIZING}
        />
        <p className="mt-4 text-sm text-muted-foreground">
          Fat quantities vary with the bird, its breed, and how long it roasts. Treat them as a
          reason to keep a heatproof jar within reach, not a target.
        </p>
      </Section>

      <Section id="depth" heading="Depth, airflow, and the trade-off between them">
        <p>
          Deep sides hold more fat; shallow sides let more air reach the skin. The compromise most
          duck roasting settles on is 2.5–3 inches. Go much deeper and the lower third of the bird
          sits in a warm, humid pocket that keeps its skin slack — the same reason crowding a pan
          ruins duck breast, which the{" "}
          <Link
            to="/learn/why-duck-skin-isnt-crispy"
            className="text-primary underline underline-offset-4"
          >
            crisp-skin diagnostic
          </Link>{" "}
          covers in more detail. Go much shallower and you'll be pouring fat off more often than
          you'd like.
        </p>
      </Section>

      <Section id="handling" heading="Handling a hot pan full of liquid fat">
        <p>
          This is the part gear guides skip. Halfway through a duck roast you will be lifting a hot
          pan holding a cup or more of fat hot enough to burn instantly. Before you buy, check that
          the handles are big enough for oven mitts, that they're riveted rather than spot-welded,
          and that you can carry the pan two-handed without tilting it. For pouring, ladle the fat
          into a heatproof jar sitting on a towel on the counter rather than tipping the whole pan.
        </p>
      </Section>

      <Section id="checklist" heading="The buyer's checklist">
        <ul className="mt-4 space-y-3 text-base leading-relaxed text-foreground/85">
          <li className="border-l-2 border-border pl-4">
            <strong>A rack that fits, and doesn't flex.</strong> Non-negotiable, whatever the pan.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>2.5–3 in (6–8 cm) sides.</strong> Enough for the render, not enough to steam the
            bird.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>An inch of clearance around the bird.</strong> Measure your oven too — a big pan
            with no room to breathe is a false economy.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Riveted handles you can grip in mitts.</strong> You'll be moving the pan hot and
            heavy.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Heavy-gauge metal that won't warp.</strong> A warped base sends the fat to one
            corner and the heat with it.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Something you'll use again.</strong> A half-sheet earns its storage space; a
            single-purpose roaster has to be worth the cupboard.
          </li>
        </ul>
      </Section>

      <Section id="compare" heading="Compare the three vessels">
        <ComparisonTable
          caption="Roasting vessels for a whole duck"
          rows={ROASTING_PANS}
          factors={ROASTING_PAN_FACTORS}
        />
        <div className="mt-6 grid gap-6">
          {ROASTING_PANS.map((row) => (
            <ComparisonCard key={row.id} row={row} factors={ROASTING_PAN_FACTORS} />
          ))}
        </div>
        <EvaluationNote scope="roasting pans and racks for duck" />
      </Section>

      <Section id="who" heading="Which one suits you">
        <p>
          <strong>Buy the roasting pan and rack if</strong> you roast whole birds a few times a year
          — duck, chicken, turkey at the holidays — and you'd rather not think about the fat.
        </p>
        <p>
          <strong>Use a half-sheet and rack if</strong> you want the crispest skin, don't mind
          ladling fat off part-way, and would rather own a pan that works every day of the year.
        </p>
        <p>
          <strong>Reach for cast iron if</strong> you're cooking legs, a halved bird, or a
          spatchcocked duck, and you want to render, roast, and finish in one vessel.
        </p>
      </Section>

      <ShopThisGuide
        items={[
          {
            label: "A rack that fits the pan you already own",
            why: "It solves the actual problem — a bird sitting in its fat won't crisp underneath.",
            to: "/cook/whole-roast-duck",
            linkLabel: "See the whole-roast method",
          },
          {
            label: "A heatproof jar for the render",
            why: "Somewhere safe for the fat to go mid-roast, and worth keeping afterwards.",
            to: "/learn/how-to-render-duck-fat",
            linkLabel: "How to strain and store it",
          },
          {
            label: "An instant-read thermometer",
            why: "Pan choice changes how fast the bird cooks; the temperature is the only reliable signal.",
            to: "/gear/best-thermometer-for-duck",
            linkLabel: "What to look for in a probe",
          },
        ]}
      />

      <FaqList items={FAQ} />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
