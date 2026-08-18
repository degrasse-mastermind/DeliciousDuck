import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Section, Callout, FaqList } from "@/components/site/ArticleShell";
import { DisclosureBanner, ComparisonCard, ComparisonTable, ShopThisGuide, EvaluationNote } from "@/components/site/Commerce";
import { ConversionPaths } from "@/components/site/ConversionPaths";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { KNIVES, KNIFE_FACTORS } from "@/data/comparisons";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
import { DuckBreastJourney } from "@/components/site/DuckBreastJourney";
import { CommercialCallout } from "@/components/site/CommercialLink";

const GUIDE = guideByPath("/gear/best-knife-for-scoring-duck")!;

export const Route = createFileRoute("/gear/best-knife-for-scoring-duck")({
  head: () => ({
    ...pageMeta({ title: GUIDE.seoTitle, description: GUIDE.description, path: GUIDE.path, ogType: "article" }),
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

const FAQ = [
  {
    q: "Do I need a special duck knife?",
    a: "No. There's no dedicated “duck scoring knife” category worth buying into. What you need is a thin, sharp blade with a light tip — a petty knife, a sharp chef's knife, or a boning knife all qualify.",
  },
  {
    q: "Is a more expensive knife better for scoring?",
    a: "Not reliably. Price tracks steel quality and fit and finish more than it tracks the two things that actually matter here: how thin the blade is behind the edge, and how sharp it currently is. A cheap knife freshly sharpened will outscore an expensive one that's gone dull.",
  },
  {
    q: "Can I use a serrated knife to score duck skin?",
    a: "You can, but it drags and tears rather than slicing cleanly, which is the opposite of what a good score line needs. Save serrated blades for bread and tomatoes.",
  },
  {
    q: "How often should I sharpen the knife I use for this?",
    a: "Hone before every use if the knife has a steel-friendly edge, and have it properly sharpened whenever it stops popping cleanly through skin without pressure. For most home cooks that's every few months of regular use, sooner if you notice yourself pressing harder than you used to.",
  },
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
        Scoring duck skin is a fifteen-second job, and almost every problem with it — torn skin,
        cuts that go too deep into the meat, a wandering diamond pattern — traces back to the
        knife, not the cook. The good news is that the knife that solves it isn't a specialist
        purchase or a premium brand. It's whichever blade in your kitchen is thin, sharp, and
        easy to steer.
      </p>

      <DisclosureBanner />

      <EvaluationNote scope="knives" />

      <Section id="framework" heading="What actually decides the outcome">
        <p>
          Before comparing shapes, it helps to know what you're optimising for. See{" "}
          <Link to="/learn/how-to-score-duck-breast" className="text-primary underline underline-offset-4">
            how to score duck breast
          </Link>{" "}
          for the technique itself — this guide is about the tool, not the cuts.
        </p>
      </Section>

      <Section id="sharpness" heading="Sharpness beats brand, every time">
        <p>
          A dull edge doesn't slice duck skin — it pushes and compresses it, which is how you end
          up tearing the fat cap or dragging the whole breast sideways on the board. Sharpness is
          also the one factor that has nothing to do with what you paid: a mid-range knife
          maintained on a honing steel and sharpened periodically will out-cut a neglected
          expensive one. If your knife struggles here, sharpening it is very often the actual
          upgrade you need, not a new knife.
        </p>
      </Section>

      <Section id="thinness" heading="Thinness behind the edge">
        <p>
          Separate from sharpness is geometry: how thin the blade is just behind the cutting edge.
          A thin grind parts the skin cleanly with almost no downward pressure. A thick-shouldered
          blade — common on budget knives built for durability over finesse — has to wedge its way
          through, which is what pushes the fat cap out of shape instead of slicing it. This is
          largely fixed at manufacture; no amount of honing changes the geometry of the blade
          itself.
        </p>
      </Section>

      <Section id="tip" heading="Tip geometry and control">
        <p>
          Scoring is tip-led work — you're steering a shallow, controlled line across a curved,
          slightly springy surface. A fine, light tip (petty, paring, or boning knives all have
          one) is easy to keep at a consistent shallow depth. A heavier, blunter tip, common on
          some larger chef's knives, is more prone to suddenly biting deeper than you intended if
          your pressure isn't perfectly even.
        </p>
      </Section>

      <Section id="length" heading="Blade length: one stroke vs. several">
        <p>
          A blade long enough to cross the breast in a single, confident pull gives a straighter,
          more even line than several short, timid passes stitched together. For most breasts,
          that means something in the 120–210 mm range — short knives like a paring blade need
          more passes, which is a real trade-off worth accepting only when the extra control
          matters more, as it does on a small or delicately fatted breast.
        </p>
      </Section>

      <Section id="stiffness" heading="Stiff vs. flexible blades">
        <p>
          A stiff blade holds a straight line and a consistent depth without effort. A flexible
          one — common on some boning knives — tends to wander slightly under pressure, which
          shows up as a scoring pattern that drifts rather than staying crisp. If you're choosing
          between two similar knives, the stiffer one is the safer bet for this specific job.
        </p>
      </Section>

      <Section id="grip" heading="Handle grip with greasy hands">
        <p>
          Duck fat gets on your hands fast, and a slick handle is a genuine safety issue with a
          sharp blade in your grip. Textured or slightly contoured handles hold up better than
          polished wood or smooth resin once things get greasy. Wipe your hand and the handle
          between passes if you notice your grip loosening — it's a cheap habit that prevents a
          real injury.
        </p>
      </Section>

      <Section id="avoid" heading="What to avoid">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Serrated knives.</strong> They saw and drag instead of slicing, which tears
            skin rather than cutting it cleanly.
          </li>
          <li>
            <strong>Anything dull.</strong> A dull blade is the single most common cause of a
            messy score line, regardless of the knife's shape or price.
          </li>
          <li>
            <strong>Thick-shouldered budget blades.</strong> Durable for rough kitchen tasks, but
            the thick grind behind the edge wedges through skin instead of parting it.
          </li>
        </ul>
      </Section>

      <Section id="board" heading="Board and safety technique">
        <p>
          Score on a stable board with a damp towel underneath so it can't slide, and always cut
          away from your guiding hand's fingers, which should be curled back and out of the
          blade's path. Score only through the skin and fat, stopping before you reach the meat —
          cutting into the meat is a common mistake that lets juices escape during cooking instead
          of staying under the crisping skin. If you also carve the finished bird, see{" "}
          <Link to="/learn/how-to-carve-a-duck" className="text-primary underline underline-offset-4">
            how to carve a duck
          </Link>{" "}
          — it's a different knife job with different priorities.
        </p>
      </Section>

      <Section id="if-one" heading="If you only own one knife">
        <p>
          A sharp petty or utility knife (120–150 mm) is the single best all-round choice: short
          enough for excellent control, long enough to cross most breasts in one pull, and thin
          behind the edge by design. If the only knife you own is a chef's knife, that's fine too
          — as long as it's genuinely sharp. A dull chef's knife is the worst combination on this
          list, not because of its shape but because dullness undoes every other advantage a
          longer blade offers.
        </p>
      </Section>

      <Section id="profiles" heading="Buyer profiles">
        <p>
          <strong>Choose a petty or utility knife if:</strong> you want one knife dedicated to
          scoring, trimming, and general precision work, and don't need it to double as a carving
          knife.
        </p>
        <p>
          <strong>Choose your existing chef's knife if:</strong> it's already sharp and you'd
          rather not add another blade to the drawer.
        </p>
        <p>
          <strong>Choose a boning knife if:</strong> you regularly break down whole birds and want
          one blade that handles scoring and jointing.
        </p>
        <p>
          <strong>Choose a paring knife if:</strong> you're working a small or wild duck breast
          with a thin fat cap where maximum control matters more than speed.
        </p>
      </Section>

      <Section id="compare" heading="Compare the four blade shapes">
        <ComparisonTable caption="Knife shapes for scoring duck skin" rows={KNIVES} factors={KNIFE_FACTORS} />
        <div className="mt-6 grid gap-6">
          {KNIVES.map((row) => (
            <ComparisonCard key={row.id} row={row} factors={KNIFE_FACTORS} />
          ))}
        </div>
        <Callout label="No hands-on testing" tone="gold">
          <p>
            None of the categories above reflects a hands-on test by DeliciousDuck. Some links on
            this page are affiliate links to retail categories, which never changes which blade
            shape we recommend.
          </p>
        </Callout>
      </Section>

      <CommercialCallout
        heading="If you do need another blade"
        intro="Sharpening what you own fixes most scoring problems. If a second knife genuinely helps, these are the two shapes this guide recommends. No models named, no prices or ratings."
        placement="knife_options"
        linkIds={["amazon-utility-knife", "amazon-boning-knife"]}
        criteria={[
          "A blade short enough to control at a shallow angle — roughly 4–6 inches for scoring.",
          "A thin edge geometry, so you part skin rather than push it.",
          "A handle you can hold securely with a wet hand.",
          "An edge you are willing to maintain, whichever steel you choose.",
        ]}
        footnote="Category links, not product recommendations. Check the retailer's own listing for specifications, availability, and terms."
      />

      <ShopThisGuide
        items={[
          {
            label: "A knife that's actually sharp, not a new one",
            why: "Sharpening the knife you already own solves more scoring problems than buying another blade does.",
            to: "/learn/how-to-score-duck-breast",
            linkLabel: "See the scoring technique",
          },
          {
            label: "A carving knife for the finished bird",
            why: "Scoring and carving ask different things of a blade — don't assume one knife has to do both well.",
            to: "/learn/how-to-carve-a-duck",
            linkLabel: "See how to carve a duck",
          },
        ]}
      />

      <FaqList items={FAQ} />

      <DuckBreastJourney
        id="cluster-scoring-in-context"
        title="Scoring in context"
        intro="Scoring is one cut inside a longer cook. Here is everything either side of it."
        placement="knife_in_context"
        excludePath="/gear/best-knife-for-scoring-duck"
      />

      <ConversionPaths
        heading="What this knife has to do"
        sourcePath="/gear/best-knife-for-scoring-duck"
        eyebrow="Read this first"
        intro="The cut this blade has to make."
      />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
