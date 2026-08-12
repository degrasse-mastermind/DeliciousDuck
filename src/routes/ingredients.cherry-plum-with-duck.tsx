import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Section, DataTable, Callout, FaqList } from "@/components/site/ArticleShell";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { ingredientByPath } from "@/data/ingredients";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const PAGE = ingredientByPath("/ingredients/cherry-plum-with-duck")!;

const FAQ = [
  {
    q: "Fresh or dried fruit for a duck sauce?",
    a: "Dried fruit gives concentrated flavour, more sugar and body but no fresh acidity, so it needs vinegar or wine alongside. Fresh fruit gives brightness and a lighter texture but can be watery and unpredictable in sweetness. Many good sauces use both: dried for depth, fresh added late for lift.",
  },
  {
    q: "Which is better with duck breast — cherry or plum?",
    a: "Cherry suits duck breast slightly better because its acidity and clean red-fruit flavour cut a rare, fatty slice without adding much weight. Plum, especially cooked down, is jammier and works better with confit, smoked duck and whole roast.",
  },
  {
    q: "Can I use jam as a shortcut?",
    a: "Yes, as a starting point, but treat it as sugar plus fruit rather than as sauce. Cut it with reduced stock and vinegar until it tastes savoury and sharp, not spreadable.",
  },
];

export const Route = createFileRoute("/ingredients/cherry-plum-with-duck")({
  head: () => ({
    ...pageMeta({
      title: PAGE.seoTitle,
      description: PAGE.description,
      path: PAGE.path,
      ogType: "article",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Ingredients", item: "/ingredients" },
          { name: PAGE.title, item: PAGE.path },
        ]),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ArticleShell
      eyebrow="Ingredients"
      title="Cherry, Plum & Stone Fruit With Duck: A Pairing Framework"
      intro={PAGE.description}
      trail={[
        { name: "Ingredients", to: "/ingredients" },
        { name: PAGE.title, to: PAGE.path },
      ]}
      meta={`${PAGE.minutes} min read · Pairing logic`}
    >
      <Section id="why" heading="Why stone fruit and duck fit together">
        <p>
          Stone fruit brings three things duck wants: acidity to cut fat, sugar to echo the faint
          sweetness in duck skin, and — in the darker fruits and their skins — a tannic, slightly
          astringent edge that behaves the way red wine does against rich meat. That third quality is
          the one people underrate, and it is why dark plum skin and sour cherry work better than,
          say, a very ripe peach.
        </p>
        <p>
          Think of it as the same job orange does, in a different register: orange is bright and
          bitter, stone fruit is deep and tannic. The choice between them is mostly about whether you
          want the plate to feel fresh or autumnal.
        </p>
      </Section>

      <Section id="fruit-by-fruit" heading="Fruit by fruit">
        <DataTable
          caption="Stone fruit characteristics and duck applications"
          columns={["Fruit", "Acid", "Sweetness", "Tannin / astringency", "Best duck use"]}
          rows={[
            [
              "Sour / Morello cherry",
              "High",
              "Moderate",
              "Low–moderate",
              "The most reliable partner for a rare duck breast; sharp enough to need little vinegar",
            ],
            [
              "Sweet cherry",
              "Low–moderate",
              "High",
              "Low",
              "Fine, but needs vinegar and stock to keep it savoury",
            ],
            [
              "Dark plum (damson, greengage-adjacent, Italian prune plum)",
              "Moderate–high",
              "Moderate",
              "High, mostly in the skin",
              "Whole roast, confit, smoked duck; cook skin-on for structure",
            ],
            [
              "Apricot",
              "Moderate",
              "Moderate",
              "Low",
              "Warm-spiced and North African directions; good with legs and shredded duck",
            ],
            [
              "Peach / nectarine",
              "Low",
              "High",
              "Very low",
              "Grilled alongside rather than made into sauce; needs acid support",
            ],
            [
              "Dried cherry, prune, dried apricot",
              "Low",
              "High and concentrated",
              "Moderate",
              "Braises, stuffings, winter sauces; always pair with vinegar or wine",
            ],
          ]}
        />
      </Section>

      <Section id="fresh-dried" heading="Fresh versus dried, and why it changes the sauce">
        <p>
          Drying removes water and concentrates sugar, and it does not preserve fresh acidity. A sauce
          built on dried fruit is therefore denser and sweeter and almost always needs a sharp
          counterweight — red wine, sherry vinegar, or both. It also holds body better, which makes it
          well suited to braises and to sauces you want to make ahead.
        </p>
        <p>
          Fresh fruit brings acidity and a cleaner flavour but releases water, so a fresh-fruit sauce
          needs either reduction time or a reduced stock base to have any body. A useful hybrid: build
          the base with a little dried fruit and reduced stock for depth, then add fresh halved
          cherries or plum wedges in the last minute so they keep shape and brightness.
        </p>
        <Callout label="Support ingredients that make fruit taste savoury" tone="gold">
          <p>
            Reduced duck or chicken stock for body; red wine or port for tannin and depth; sherry,
            red-wine or balsamic vinegar for sharpness; a bay leaf, thyme sprig or star anise for
            aroma; salt and pepper, generously. Fruit plus sugar is a compote. Fruit plus stock plus
            vinegar is a sauce.
          </p>
        </Callout>
      </Section>

      <Section id="matrix" heading="Matching by cut and method">
        <p>
          The richer and smokier the duck, the darker and more tannic the fruit can be. The leaner or
          rarer the duck, the more you want acidity and less cooked-down sugar.
        </p>
        <DataTable
          caption="Stone fruit pairings by duck cut and cooking method"
          columns={["Duck", "Fruit direction", "Support", "Aromatics", "Serve"]}
          rows={[
            [
              "Pan-seared breast",
              "Sour cherry, fresh dark plum wedges",
              "Reduced stock, red wine, sherry vinegar",
              "Thyme, black pepper",
              "Sauce pooled under the slices, skin exposed",
            ],
            [
              "Whole roast duck",
              "Cooked dark plum, damson",
              "Pan juices, port, red-wine vinegar",
              "Bay, star anise, cinnamon in token amounts",
              "Sauce in a jug; glaze only in the final stretch",
            ],
            [
              "Confit / crisped legs",
              "Prune, dried cherry, plum",
              "Reduced stock, red wine, mustard",
              "Thyme, garlic, juniper",
              "Alongside lentils or beans; keep crisp skin dry",
            ],
            [
              "Smoked duck",
              "Plum, sour cherry",
              "Cider or rice vinegar, a little soy",
              "Star anise, ginger, chilli",
              "Sauce or a sharp pickled-fruit condiment",
            ],
            [
              "Wild duck",
              "Sour cherry, damson, sloe",
              "Red wine, game or chicken stock",
              "Juniper, bay, black pepper",
              "Small amount of intensely reduced sauce",
            ],
          ]}
        />
      </Section>

      <Section id="failures" heading="Where fruit sauces go wrong">
        <p>
          <strong>It tastes like pudding.</strong> No stock, no vinegar, too much reduction. Fruit
          concentrates as it cooks; savoury elements do not appear on their own.
        </p>
        <p>
          <strong>It is watery.</strong> Fresh fruit released liquid into a sauce with no reduced-stock
          base. Reduce further, or start from stock next time.
        </p>
        <p>
          <strong>Everything is one flavour.</strong> Add a texture and a fresh element — a few raw or
          barely-cooked fruit pieces, a sharp green, cracked pepper at the end.
        </p>
        <p>
          <strong>The skin went soft.</strong> The sauce was ladled over the duck. Put it underneath.
        </p>
      </Section>

      <Section id="recipe" heading="If you want a worked example">
        <p>
          Our{" "}
          <a href="/recipes/smoked-duck-with-plum-sauce" className="text-primary underline underline-offset-4">
            smoked duck with plum sauce
          </a>{" "}
          applies this framework end to end. Note that it currently carries our editorial working
          status — we publish it as a documented working draft rather than a kitchen-verified recipe,
          and the trust label on that page tells you exactly where it stands.
        </p>
        <p>
          For the general sauce mechanics, see the{" "}
          <a href="/cook/best-sauces-for-duck-breast" className="text-primary underline underline-offset-4">
            sauce guide
          </a>
          ; for balancing a whole plate, use the{" "}
          <a href="/tools/duck-pairing-finder" className="text-primary underline underline-offset-4">
            Duck Pairing Finder
          </a>
          .
        </p>
      </Section>

      <FaqList items={FAQ} />

      <RelatedGuides paths={PAGE.related} />
    </ArticleShell>
  );
}
