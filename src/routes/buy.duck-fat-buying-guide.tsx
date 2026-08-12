import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Section, Callout, DataTable, FaqList } from "@/components/site/ArticleShell";
import { DisclosureBanner, ComparisonCard, ComparisonTable, ShopThisGuide } from "@/components/site/Commerce";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { DUCK_FAT_OPTIONS, DUCK_FAT_FACTORS } from "@/data/comparisons";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/buy/duck-fat-buying-guide")!;

export const Route = createFileRoute("/buy/duck-fat-buying-guide")({
  head: () => ({
    ...pageMeta({ title: GUIDE.seoTitle, description: GUIDE.description, path: GUIDE.path, ogType: "article" }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Buy", item: "/buy" },
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
    q: "Is unrefined duck fat better than refined?",
    a: "Better for flavour, usually — unrefined fat keeps more of the roasted, savoury character. Refined fat is milder and more neutral, which some cooks prefer for delicate dishes. Neither is objectively superior; it depends on what you're making.",
  },
  {
    q: "How can I tell if a jar has gone bad?",
    a: "Look and smell before you cook with it. Fresh duck fat is pale gold and smells clean and faintly roasted. Discard it if it smells sour, sharp, or like old cooking oil, or if you see cloudy separation with a layer of darkened juice at the bottom that wasn't there when you opened it.",
  },
  {
    q: "Does duck fat need to be refrigerated?",
    a: "Once opened, yes — refrigeration meaningfully extends how long it stays good. An unopened, commercially sealed jar can often sit in a pantry, but check the label; once you break the seal, treat it like any other opened animal fat.",
  },
  {
    q: "Is it cheaper to render duck fat myself?",
    a: "Per gram, usually yes, since you're using trim you'd otherwise discard. It isn't free of cost, though — it takes roughly an hour of low, attentive heat, and yield varies enough between birds that it's worth doing a couple of times before you rely on it for a specific recipe.",
  },
];

function Page() {
  return (
    <ArticleShell
      eyebrow="Buying Guide"
      title={GUIDE.title}
      intro={GUIDE.description}
      trail={[
        { name: "Buy", to: "/buy" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <p>
        Duck fat is sold in enough formats and label variations that it's easy to buy the wrong
        size, the wrong purity, or more than you'll use before it turns. None of that requires
        guesswork — the format, the label, and a quick visual check tell you almost everything
        you need before you open the jar.
      </p>

      <DisclosureBanner />

      <Section id="formats" heading="Formats compared: jar, tub, tin, or render it yourself">
        <p>
          The right format depends entirely on what you're cooking, not on which one looks like
          the better deal on the shelf. A tub that's cheap per gram is a poor buy if half of it
          turns before you get through it.
        </p>
      </Section>

      <Section id="labels" heading="Label terms worth reading before you buy">
        <p>
          <strong>Pure rendered</strong> means duck fat and nothing else — the ingredient list
          should say so plainly. <strong>Blended</strong> fat is cut with another fat, usually to
          reduce cost; it isn't inferior for every use, but it isn't a substitute where you
          specifically want duck flavour, such as confit or roast potatoes. <strong>Seasoned</strong>{" "}
          fat has salt or aromatics added — fine for finishing, risky if you're using it in a
          recipe that already accounts for seasoning separately.
        </p>
        <p>
          <strong>Refined vs. unrefined</strong> is a flavour and smoke-point question more than a
          quality one. Unrefined fat carries more of the roasted, savoury character that makes
          duck fat worth seeking out in the first place. Refined fat is milder and more neutral —
          useful when you don't want the fat's flavour to dominate a dish.
        </p>
      </Section>

      <Section id="visual" heading="Judging quality by eye before you cook with it">
        <p>
          Colour and clarity tell you most of what a label can't. Good duck fat is pale gold and
          mostly translucent when melted, and solidifies to a soft, even, off-white when chilled.
          Cloudiness, a grey or brownish tint, or a visible separated layer of darker juice at the
          bottom of the jar are all signs the fat wasn't strained well or has started to turn —
          worth a sniff test before you commit it to a dish.
        </p>
      </Section>

      <Section id="storage" heading="Storage after opening: honest keeping windows">
        <p>
          Once opened, refrigerate duck fat and keep the container sealed between uses — it will
          pick up odours from the fridge otherwise. In the fridge, plan on using it within a few
          weeks for the best flavour, and treat any sign of off smell or cloudiness as a reason to
          discard it rather than push past it. Freezing extends that window substantially; portion
          it into smaller containers before freezing so you're not repeatedly thawing and
          refreezing the whole batch, which shortens its life every time.
        </p>
      </Section>

      <Section id="quantity" heading="How much you actually need">
        <p>
          Buying the right size starts with knowing roughly how much a given use takes. These are
          practical planning amounts, not fixed rules.
        </p>
        <DataTable
          caption="Duck fat quantity by use"
          columns={["Use", "Typical amount", "Notes"]}
          rows={[
            ["Roast potatoes for four", "60–90 g (about ¼–⅓ cup)", "Enough to coat and crisp without pooling in the tray."],
            ["Confit, legs fully submerged", "500 g–1 kg+ depending on pot size", "Needs enough depth to cover the legs; a large tub is the practical format here."],
            ["Everyday searing or greasing a pan", "1–2 teaspoons per use", "A small jar or tin lasts a long time at this rate."],
            ["Pan sauce or finishing drizzle", "1–2 tablespoons", "Small amounts; flavour matters more than quantity."],
          ]}
        />
        <p>
          If you're substituting duck fat for another fat in a recipe, or the reverse, the{" "}
          <Link
            to="/tools/duck-fat-substitution-calculator"
            className="text-primary underline underline-offset-4"
          >
            duck fat substitution calculator
          </Link>{" "}
          converts quantities so you're not guessing at a 1:1 swap that may not hold.
        </p>
      </Section>

      <Section id="render-yourself" heading="The render-at-home alternative — and its real cost">
        <p>
          If you already cook whole ducks or breasts regularly, rendering your own fat from trim
          is often the better economics — you're using a byproduct you'd otherwise throw away. The
          real cost isn't money, though; it's time and attention. Rendering properly takes roughly
          an hour of low, steady heat, and straining it well is what actually determines how long
          it keeps — leftover juices left in the fat are the most common reason home-rendered fat
          spoils earlier than store-bought. See{" "}
          <Link to="/learn/how-to-render-duck-fat" className="text-primary underline underline-offset-4">
            how to render duck fat
          </Link>{" "}
          for the full method, and{" "}
          <Link to="/cook/ways-to-use-duck-fat" className="text-primary underline underline-offset-4">
            ways to use duck fat
          </Link>{" "}
          once you've got a jar of it, homemade or bought.
        </p>
      </Section>

      <Section id="confit" heading="Buying specifically for confit">
        <p>
          Confit is the one use where format matters most: the legs need to be fully submerged, so
          buying jar-sized portions for a confit batch means buying several jars, which is both
          more expensive and more wasteful than one large tub. See{" "}
          <Link to="/cook/duck-leg-confit" className="text-primary underline underline-offset-4">
            duck leg confit
          </Link>{" "}
          for the quantities a typical batch actually needs before you shop.
        </p>
      </Section>

      <Section id="compare" heading="Compare the formats">
        <ComparisonTable caption="Duck fat formats compared" rows={DUCK_FAT_OPTIONS} factors={DUCK_FAT_FACTORS} />
        <div className="mt-6 grid gap-6">
          {DUCK_FAT_OPTIONS.map((row) => (
            <ComparisonCard key={row.id} row={row} factors={DUCK_FAT_FACTORS} />
          ))}
        </div>
        <Callout label="No hands-on testing" tone="gold">
          <p>
            None of the formats above reflects a hands-on test by DeliciousDuck, and no affiliate
            relationship is currently active with any brand or seller.
          </p>
        </Callout>
      </Section>

      <ShopThisGuide
        items={[
          {
            label: "A tub sized for what you're actually cooking",
            why: "Confit needs submersion depth; everyday roasting needs far less. Match the size to the use, not the unit price.",
            to: "/cook/duck-leg-confit",
            linkLabel: "See confit quantities",
          },
          {
            label: "A plan for fat rendered at home",
            why: "If you already cook whole ducks or breasts, you may not need to buy fat at all.",
            to: "/learn/how-to-render-duck-fat",
            linkLabel: "See how to render and store it",
          },
        ]}
      />

      <FaqList items={FAQ} />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
