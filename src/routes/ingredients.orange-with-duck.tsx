import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Section, DataTable, Callout, FaqList } from "@/components/site/ArticleShell";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { ingredientByPath } from "@/data/ingredients";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const PAGE = ingredientByPath("/ingredients/orange-with-duck")!;

const FAQ = [
  {
    q: "Why does my orange sauce taste like marmalade?",
    a: "Almost always too much reduced juice and not enough savoury or acidic support. Orange juice concentrates its sugar as it reduces. Build the sauce on stock, add vinegar, and use zest for aroma so you need less juice.",
  },
  {
    q: "Should I put the sauce over the duck skin?",
    a: "No, if you worked for crisp skin. Pool the sauce on the plate and set the duck on or beside it, skin exposed. Sauce over skin softens it within a minute.",
  },
  {
    q: "Is bitter orange necessary for a classic version?",
    a: "It is the traditional choice and it is genuinely different — bitterness gives the sauce backbone against duck fat. Bitter or Seville oranges are seasonal and hard to find in many places; the usual workaround is sweet orange plus extra acid and a little bitterness from another source, such as marmalade made with peel or a splash of Campari-style bitter.",
  },
];

export const Route = createFileRoute("/ingredients/orange-with-duck")({
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
      title="Why Orange Works With Duck — and How to Keep It From Becoming Too Sweet"
      intro={PAGE.description}
      trail={[
        { name: "Ingredients", to: "/ingredients" },
        { name: PAGE.title, to: PAGE.path },
      ]}
      meta={`${PAGE.minutes} min read · Pairing logic`}
    >
      <Section id="why" heading="Orange is three ingredients, not one">
        <p>
          The reason duck and orange became a canonical pairing — and the reason home versions so
          often taste like dessert — is that an orange contributes three quite different things, and
          most cooks only use one of them.
        </p>
        <p>
          <strong>Acid</strong> from the juice cuts fat and resets the palate between bites.{" "}
          <strong>Aromatic oils</strong> in the zest are fat-soluble and intensely perfumed; they read
          as "orange" far more vividly than juice does, without adding any sugar.{" "}
          <strong>Bitterness</strong> from the pith and peel — and, in a bitter orange, from the fruit
          itself — is the structural element that keeps the sauce tasting savoury.
        </p>
        <p>
          Juice alone gives you sugar and mild acid. That is why a juice-only sauce reduces into
          something closer to marmalade: you concentrated the sugar and drove off much of the
          brightness. The fix is to use all three parts of the fruit deliberately.
        </p>
      </Section>

      <Section id="balance" heading="The balance problem, and how to solve it">
        <p>
          A duck-and-orange sauce needs to be simultaneously fruity, savoury, sharp and slightly
          bitter. Five things do the work, and going short on any one of them shifts the whole sauce
          toward sweetness.
        </p>
        <DataTable
          caption="What each component contributes to an orange sauce for duck"
          columns={["Component", "Contributes", "If you skip it"]}
          rows={[
            [
              "Stock (duck or chicken, well reduced)",
              "Savoury base, body, meatiness",
              "The sauce is fruit syrup with no backbone",
            ],
            [
              "Orange juice, reduced",
              "Fruit character, sweetness, some acid",
              "Not really an orange sauce",
            ],
            [
              "Zest",
              "Vivid orange aroma with no added sugar",
              "You compensate with more juice — and more sugar",
            ],
            [
              "Vinegar (sherry, red wine, cider)",
              "The sharpness that stops it cloying",
              "Flat, heavy, sweet",
            ],
            [
              "Bitterness (peel, bitter orange, a bitter liqueur, or a caramel taken dark)",
              "Complexity and adult, savoury structure",
              "One-dimensional and juvenile-tasting",
            ],
          ]}
        />
        <Callout label="A practical rescue" tone="gold">
          <p>
            If a sauce has already gone too sweet: add vinegar a few drops at a time, then salt, then
            more reduced stock. Do not add more juice, and do not try to fix sweetness with more
            sugar-adjacent ingredients. Zest grated in at the end will make it read fruitier without
            adding sweetness.
          </p>
        </Callout>
      </Section>

      <Section id="method" heading="Where the sauce goes matters as much as what is in it">
        <p>
          Duck's appeal is a textural contrast between crisp skin and tender meat. A sauce spooned
          over the skin destroys that contrast in seconds. Every good plate of duck à l'orange you
          have eaten in a restaurant had the sauce under or beside the duck, not on it.
        </p>
        <p>
          Practically: rest and slice the duck, pool warm sauce on the plate, then lay the slices on
          top skin-up, or fan them beside the sauce. Serve extra in a jug. The same logic applies to
          any glossy reduction — see the{" "}
          <a href="/cook/best-sauces-for-duck-breast" className="text-primary underline underline-offset-4">
            duck sauce guide
          </a>{" "}
          for building the sauce itself, and the{" "}
          <a href="/cook/how-to-cook-duck-breast" className="text-primary underline underline-offset-4">
            duck breast guide
          </a>{" "}
          for timing it against the cook.
        </p>
        <p>
          If you are glazing rather than saucing a whole bird, an orange glaze goes on only in the
          final stretch of roasting; sugar plus a long roast in rendering fat means dark, bitter skin
          well before the duck is done. The{" "}
          <a href="/cook/whole-roast-duck" className="text-primary underline underline-offset-4">
            whole roast duck guide
          </a>{" "}
          covers that sequence.
        </p>
      </Section>

      <Section id="varieties" heading="Choosing your orange">
        <DataTable
          caption="Orange varieties and how they behave with duck"
          columns={["Variety", "Character", "Best used as"]}
          rows={[
            [
              "Bitter / Seville",
              "Sour and genuinely bitter, low in usable sweetness",
              "The traditional backbone of a classic sauce; needs no added acid, may need a little sugar",
            ],
            [
              "Sweet orange (navel, Valencia)",
              "Sweet, mildly acidic, reliable year-round",
              "The default — add vinegar and lean on zest to compensate for the sweetness",
            ],
            [
              "Blood orange",
              "Berry-like, slightly deeper, dramatic colour",
              "A sauce where colour is part of the pleasure; pairs well with a red-wine element",
            ],
            [
              "Mandarin / clementine / satsuma",
              "Very sweet, delicate, low acid, thin fragrant skin",
              "Segments as a garnish and zest for aroma, rather than as the reduction base",
            ],
            [
              "Marmalade (as a shortcut)",
              "Already sweet and already bitter from the peel",
              "A quick route to the bitter note — but cut the other sweetness back sharply",
            ],
          ]}
        />
      </Section>

      <Section id="beyond-sauce" heading="Orange without a sauce">
        <p>
          You do not need a reduction to get the pairing. Zest in the salt of a{" "}
          <a href="/ingredients/dry-brine-duck" className="text-primary underline underline-offset-4">
            dry brine
          </a>{" "}
          perfumes the meat. Halved oranges in the cavity of a roasting bird scent it from inside.
          Orange segments in a bitter-leaf salad — chicory, radicchio, watercress — served alongside
          duck does the balancing job on the plate rather than in the pan, and keeps the skin fully
          crisp. Fennel and orange together is a particularly good side for duck for the same reason.
        </p>
        <p>
          For which greens and starches suit which method, the{" "}
          <a href="/cook/what-to-serve-with-duck-breast" className="text-primary underline underline-offset-4">
            sides guide
          </a>{" "}
          and the{" "}
          <a href="/tools/duck-pairing-finder" className="text-primary underline underline-offset-4">
            Duck Pairing Finder
          </a>{" "}
          will get you to a full plate.
        </p>
      </Section>

      <Section id="failures" heading="Failure modes at a glance">
        <p>
          <strong>Cloying.</strong> Too much reduced juice, not enough vinegar, stock or bitterness.
        </p>
        <p>
          <strong>Harsh and puckering.</strong> Too much vinegar or unripe zest with white pith
          attached. Zest only the coloured layer.
        </p>
        <p>
          <strong>Thin and watery.</strong> The stock was not reduced enough. Body comes from reduced
          stock, not from the fruit.
        </p>
        <p>
          <strong>Soggy skin.</strong> The sauce went over the duck. Put it underneath next time.
        </p>
      </Section>

      <FaqList items={FAQ} />

      <RelatedGuides paths={PAGE.related} />
    </ArticleShell>
  );
}
