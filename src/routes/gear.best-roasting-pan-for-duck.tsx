import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Section, Callout, DataTable, FaqList } from "@/components/site/ArticleShell";
import {
  DisclosureBanner,
  ComparisonCard,
  ComparisonTable,
  EvaluationNote,
  ShopThisGuide,
} from "@/components/site/Commerce";
import { CommercialCallout } from "@/components/site/CommercialLink";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { ROASTING_PANS, ROASTING_PAN_FACTORS } from "@/data/comparisons";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/gear/best-roasting-pan-for-duck")!;

const FAQ = [
  {
    q: "What size roasting pan do I need for a whole duck?",
    a: "The size that fits your bird, not a number from a chart. Set the duck on the rack you plan to use, measure that footprint, and choose a pan the bird sits inside without touching the sides. Then check the loaded pan still clears your oven walls.",
  },
  {
    q: "Do I really need a rack?",
    a: "You need something that keeps the skin out of the rendered fat. A rack made for the pan, a rigid wire rack that fits, or a bed of thick vegetable slices all do that job. Skin sitting in liquid fat won't crisp.",
  },
  {
    q: "Can I roast a duck on a sheet pan?",
    a: "Yes, with a rack. Airflow is the strong point; the shallow rim is the limitation, so watch the fat level and move some off into a heatproof container as it collects rather than waiting.",
  },
  {
    q: "Is cast iron a good roasting vessel for duck?",
    a: "It suits legs, a halved bird, or a spatchcocked one, where the retained heat browns the underside well. For a whole bird the shape works against you: the duck sits low and the sides reduce airflow where you want it most.",
  },
  {
    q: "Can I use a glass or ceramic baking dish?",
    a: "Check the manufacturer's instructions first. Glass and ceramic bakeware carries its own oven-temperature limits and guidance about thermal shock — adding cold liquid to a hot dish, for example — and those instructions vary by brand, so follow the ones that came with your dish rather than a general rule.",
  },
  {
    q: "What about nonstick or disposable foil trays?",
    a: "Both can work within their stated limits. Nonstick pans have a maximum oven temperature set by the maker; disposable foil trays are thin, so support them on a sheet pan and follow the packaging instructions for oven use.",
  },
  {
    q: "How much fat will a duck render?",
    a: "It varies with the bird and how it's cooked, so we won't quote a figure. Plan for enough capacity that the pan isn't near its limit, keep a heatproof container within reach, and move fat off when the level looks high rather than at a fixed interval.",
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

const FIT_METHOD = [
  [
    "1. Measure bird and rack together",
    "Set the duck on the rack you'll actually use and measure that whole footprint, height included.",
  ],
  [
    "2. Choose a pan that holds them without contact",
    "The bird shouldn't touch the sides, and air should be able to move all the way round it.",
  ],
  [
    "3. Confirm the loaded pan fits your oven",
    "Slide it in cold, loaded, and check you can get hands and mitts around it to lift it out.",
  ],
  [
    "4. Check the maker's temperature and care instructions",
    "Maximum oven temperature and cleaning guidance vary by pan — read them before you roast, not after.",
  ],
  [
    "5. Leave capacity for the rendered fat",
    "Enough depth that the fat isn't near the rim, with a heatproof container ready to take some off.",
  ],
];

const RACKS = [
  [
    "Flat rack",
    "Whole birds, legs, breasts, and everything else you roast",
    "Even lift and a stable base, as long as it's rigid enough not to flex under a loaded bird",
    "Sits lower, so the underside is closer to the fat as it collects",
  ],
  [
    "V rack",
    "Whole birds you want cradled and steady",
    "Holds the bird higher and keeps it from rolling; often easier to lift out with the bird on it",
    "Shape only suits whole birds, and it takes up more storage than a flat rack",
  ],
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
      autoSketch={false}
    >
      <p>
        A whole duck asks two things of a roasting pan: room for the fat it renders, and a way to
        keep the bird out of it. Everything else — brand, finish, price — sits behind those two
        jobs. There's no single pan that's right for every kitchen, so this guide is about matching
        a setup to your bird and your oven rather than naming a winner.
      </p>

      <DisclosureBanner />

      <Callout label="The short answer" tone="gold">
        <p>
          Any pan that fits your bird on its rack, clears your oven loaded, and holds the render
          without crowding the rim will roast a good duck. Measure before you buy, check the
          manufacturer's maximum oven temperature, and spend your attention on the rack — it does
          more for the skin than the pan does.
        </p>
      </Callout>

      <Section id="fat" heading="The fat is the design brief">
        <p>
          Duck renders more fat than chicken, and that fat pools in the bottom of the pan while the
          bird is still cooking. Skin sitting in liquid fat doesn't crisp — it cooks gently, in
          exactly the way you don't want on top of a roast. So the vessel has to elevate the bird
          and hold the render with margin to spare when you move it.
        </p>
        <p>
          Don't throw that fat away. Strained and stored properly it's the most useful thing the
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

      <Section id="fit" heading="Sizing: measure, don't guess">
        <p>
          Duck sizes, racks, and home ovens all vary enough that a universal set of pan dimensions
          would be misleading. Use this five-step fit check instead — it takes a couple of minutes
          with a tape measure and rules out the mistakes that actually spoil a roast.
        </p>
        <DataTable
          caption="A measured fit check for any roasting setup"
          columns={["Step", "What you're checking"]}
          rows={FIT_METHOD}
        />
        <p className="mt-4 text-sm text-muted-foreground">
          If you're shopping before the bird is in the house, measure the rack and the oven now and
          leave yourself margin on both.
        </p>
      </Section>

      <Section id="rack" heading="Flat rack or V rack">
        <p>
          If you buy one thing after reading this, buy a rack that fits the pan you already own. A
          rack that flexes under a loaded bird can tip it into the fat part-way through the roast,
          which is worse than no rack at all — rigidity matters more than shape.
        </p>
        <DataTable
          caption="Flat rack compared with a V rack"
          columns={["Rack", "Suits", "Strengths", "Limitations"]}
          rows={RACKS}
        />
        <p className="mt-4">
          No rack tonight? Thick slices of onion, halved carrots, or a coil of foil will lift the
          bird off the base. It's a workaround rather than a purchase — but a good one.
        </p>
      </Section>

      <Section id="materials" heading="Materials, and what to check on each">
        <ul className="mt-4 space-y-3 text-base leading-relaxed text-foreground/85">
          <li className="border-l-2 border-border pl-4">
            <strong>Stainless steel.</strong> The common choice for roasters and racks. Check the
            maker's oven-temperature rating and cleaning guidance; heavier pans generally feel more
            stable loaded.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Hard-anodized aluminium.</strong> Light for its size and widely sold as
            oven-safe, but ratings differ by product — read the specification for the pan in front
            of you rather than assuming a category limit.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Cast iron.</strong> Holds heat well and browns firmly, which suits legs and flat
            cuts. Season and dry it per the maker's instructions, and deglaze acidic sauces in
            something else.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Glass and ceramic.</strong> Bakeware in these materials comes with its own
            temperature limits and thermal-shock guidance. Follow the instructions supplied with
            your dish; they vary by brand and aren't interchangeable.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Nonstick and coated pans.</strong> Usable within the manufacturer's stated
            maximum oven temperature. Look that number up before roasting hot, and don't infer it
            from another pan.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Disposable foil trays.</strong> A fallback, not an equivalent. Support the tray
            on a sheet pan, keep the fat level low, move it with two hands, and follow the oven-use
            instructions on the packaging.
          </li>
        </ul>
      </Section>

      <Section id="handling" heading="Handling a hot pan of liquid fat">
        <p>
          This is the part gear guides skip. Part-way through a duck roast you'll be moving a hot
          pan holding hot liquid fat. Before you buy, check that the handles are big enough to grip
          in oven mitts, that you can carry the pan level with two hands, and that the setup feels
          stable when it's loaded. To remove fat, ladle it into a heatproof container standing on a
          towel on the counter rather than tipping the whole pan.
        </p>
      </Section>

      <Section id="checklist" heading="The buyer's checklist">
        <ul className="mt-4 space-y-3 text-base leading-relaxed text-foreground/85">
          <li className="border-l-2 border-border pl-4">
            <strong>Actual bird and rack fit.</strong> Measured together, with the bird clear of the
            sides and air able to move round it.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Oven fit, loaded.</strong> The pan goes in and comes out with room for your
            hands and mitts.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Maximum oven temperature.</strong> Confirmed from the manufacturer for that
            specific pan, coating included.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Stable handling when loaded.</strong> Grippable handles, no worrying flex, and a
            level two-handed carry.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Rack configuration.</strong> Flat or V, rigid, and sized to the pan you're
            buying it for.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Cleanup and care.</strong> Dishwasher or hand-wash, seasoning needs, and how
            forgiving the surface is after a fatty roast.
          </li>
          <li className="border-l-2 border-border pl-4">
            <strong>Storage.</strong> Where it lives the rest of the year — a pan you'll use again
            earns its cupboard more easily than one you won't.
          </li>
        </ul>
      </Section>

      <Section id="compare" heading="Compare the four setups">
        <ComparisonTable
          caption="Four roasting setups for duck"
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

      <CommercialCallout
        heading="Shop the setup you measured for"
        intro="Both setups that lift the bird clear of its fat. Measure the bird, rack, pan, and oven first — then browse. The disposable foil fallback is not linked; buy that where you already shop."
        placement="roasting_setup_options"
        linkIds={["amazon-roasting-pan-rack", "amazon-sheet-pan-rack"]}
        criteria={[
          "The rack lifts the bird clear of the pan floor and sits stably under it.",
          "The loaded setup clears your oven walls and door on every side.",
          "Sides deep enough to hold the render without touching the bird.",
          "Handles you can grip with mitts while the pan holds hot fat.",
        ]}
        footnote="Category links, not product recommendations. Check the retailer's own listing for specifications, availability, and terms."
      />

      <Section id="who" heading="Which one suits you">
        <p>
          <strong>Roasting pan and rack if</strong> you roast whole birds a few times a year — duck,
          chicken, turkey at the holidays — and you'd rather have depth to spare for the fat.
        </p>
        <p>
          <strong>Half-sheet and rack if</strong> you want open airflow, don't mind moving fat off
          part-way through, and would rather own a pan that works all year.
        </p>
        <p>
          <strong>Cast iron if</strong> you're cooking legs, a halved bird, or a spatchcocked duck
          and want to render, roast, and build a sauce in one vessel.
        </p>
        <p>
          <strong>A disposable foil tray if</strong> you need a second vessel at short notice — with
          a sheet pan underneath it and the packaging instructions followed.
        </p>
      </Section>

      <ShopThisGuide
        items={[
          {
            label: "A rack that fits the pan you already own",
            why: "It addresses the actual problem — a bird sitting in its fat won't crisp underneath.",
            to: "/cook/whole-roast-duck",
            linkLabel: "See the whole-roast method",
          },
          {
            label: "A heatproof container for the render",
            why: "Somewhere safe for the fat to go mid-roast, and worth keeping afterwards.",
            to: "/learn/how-to-render-duck-fat",
            linkLabel: "How to strain and store it",
          },
          {
            label: "An instant-read thermometer",
            why: "Pan choice changes how fast the bird cooks; temperature is the reliable signal.",
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
