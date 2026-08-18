import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Section, DataTable, Callout, FaqList } from "@/components/site/ArticleShell";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { ingredientByPath } from "@/data/ingredients";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const PAGE = ingredientByPath("/ingredients/best-acid-for-duck")!;

const FAQ = [
  {
    q: "What is the single most useful acid to keep for duck?",
    a: "Sherry vinegar. It is sharp but rounded, has a nutty depth that suits dark meat, works in a pan sauce and in a dressing, and it rarely fights whatever else is on the plate.",
  },
  {
    q: "When should I add acid — during cooking or at the end?",
    a: "Both, for different reasons. Acid added early to a sauce and reduced becomes rounded and integrated; acid added off the heat at the end tastes bright and immediate. A common professional habit is to do both: build with wine or vinegar, then correct with a few drops at the end.",
  },
  {
    q: "Can lemon replace vinegar in a duck sauce?",
    a: "It can supply the sharpness, but it reads fresher and less deep, and it loses character quickly when reduced. For a reduction, vinegar or wine holds up better; for finishing, lemon or a squeeze of orange is excellent.",
  },
];

export const Route = createFileRoute("/ingredients/best-acid-for-duck")({
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
      ldScript(
        articleSchema({
          headline: GUIDE.title,
          description: GUIDE.description,
          path: GUIDE.path,
        }),
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
      title="The Best Acids for Duck: Vinegar, Citrus, Wine & Pickles"
      intro={PAGE.description}
      trail={[
        { name: "Ingredients", to: "/ingredients" },
        { name: PAGE.title, to: PAGE.path },
      ]}
      meta={`${PAGE.minutes} min read · Pairing logic`}
    >
      <Section id="why" heading="Acid is the structural counterweight to duck fat">
        <p>
          Fat coats the palate. That is most of the pleasure of duck, and it is also why a plate of
          duck without acid starts strong and gets heavy by the third or fourth bite. Acid clears
          that coating and resets the palate, so the fifth bite tastes as good as the first.
        </p>
        <p>
          Every classic duck dish is really an acid delivery system. Duck à l'orange is citrus. Duck
          with cherries is fruit acid plus wine. Peking duck is scallion, cucumber and a sharp-sweet
          sauce. Confit is served with a bitter, mustardy salad or with cornichons. Once you notice
          the pattern, you can improvise confidently: whatever else the plate is doing, ask where the
          acid is coming from.
        </p>
        <Callout label="The diagnostic question" tone="gold">
          <p>
            If a duck dish tastes flat, heavy or greasy and it is not underseasoned, it is almost
            always short on acid — not short on salt, sugar or herbs. Add a few drops of vinegar or a
            squeeze of citrus and taste again before changing anything else.
          </p>
        </Callout>
      </Section>

      <Section id="vinegars" heading="Vinegars, compared">
        <DataTable
          caption="Vinegar choices for duck and what each one does"
          columns={["Vinegar", "Character", "Reduces well?", "Best for"]}
          rows={[
            [
              "Sherry",
              "Sharp, nutty, savoury depth",
              "Very well",
              "The default all-rounder: pan sauces, lentil sides, salads with confit",
            ],
            [
              "Red wine",
              "Assertive, tannic, fruity",
              "Well",
              "Cherry and plum sauces, wild duck, anything with red wine already in it",
            ],
            [
              "Cider",
              "Bright, apple-fruity, softer",
              "Moderately",
              "Apple, cabbage and autumnal directions; glazes for legs",
            ],
            [
              "Rice",
              "Mild, clean, low sharpness",
              "Poorly — its delicacy is lost",
              "Asian-direction dipping sauces, quick pickles, dressings for shredded duck",
            ],
            [
              "Balsamic",
              "Sweet, syrupy, dominant",
              "It thickens rather than sharpens",
              "Use sparingly as a sweet-sour accent, not as the main acid",
            ],
            [
              "White wine",
              "Clean and sharp with little character",
              "Well",
              "When you want sharpness without adding flavour",
            ],
          ]}
        />
      </Section>

      <Section id="citrus" heading="Citrus: brightness, aroma and bitterness">
        <p>
          Citrus offers something vinegar cannot: aromatic zest oils. Those are fat-soluble, which
          means duck fat carries them beautifully, and they deliver a huge amount of perceived
          freshness with no added sugar or sharpness. Zest is the most underused acid-adjacent
          ingredient in duck cooking, even though it is not itself acidic.
        </p>
        <p>
          Juice is milder and sweeter than vinegar and loses brightness when reduced hard, so use it
          as a component rather than as the whole acid budget. Orange in particular needs help — the
          full logic is on the{" "}
          <a href="/ingredients/orange-with-duck" className="text-primary underline underline-offset-4">
            duck and orange page
          </a>
          . Lemon is the most reliable finisher; lime pushes the plate toward Southeast Asian
          flavours; grapefruit brings bitterness that works surprisingly well against fatty skin.
        </p>
      </Section>

      <Section id="wine" heading="Wine reductions: acid plus body">
        <p>
          Wine gives acid, alcohol-soluble aromatics, tannin and — once reduced with stock — genuine
          body. It is the acid that also builds the sauce. Red wine and port suit dark fruit and wild
          duck; dry white and vermouth suit lighter, herbal directions; fortified wines like Madeira
          and sherry add nutty depth that flatters duck's mineral notes.
        </p>
        <p>
          Reduce wine before adding stock, and reduce the combined sauce further than feels
          necessary — thin sauce is the most common home fault. Then correct at the end with a few
          drops of vinegar, because a reduction loses top-note sharpness even as it gains depth. Full
          sauce mechanics live in the{" "}
          <a href="/cook/best-sauces-for-duck-breast" className="text-primary underline underline-offset-4">
            duck sauce guide
          </a>
          .
        </p>
      </Section>

      <Section id="pickles-mustard" heading="Pickles, mustard and other acid on the plate">
        <p>
          Acid does not have to be in the sauce. Sometimes it is better not to be — particularly when
          you want the skin to stay crisp and dry. A sharp component beside the duck does the same
          balancing work with none of the risk.
        </p>
        <p>
          <strong>Quick pickles</strong> — shallot, red onion, cucumber, radish, cherry, plum, or
          fennel — are the most flexible option and take minutes. <strong>Cornichons and capers</strong>{" "}
          are the traditional partners for confit and rillettes. <strong>Mustard</strong> supplies acid
          plus heat plus emulsifying power, which is why a mustardy vinaigrette on bitter leaves is
          the classic confit side. <strong>Sauerkraut and braised red cabbage with vinegar</strong>
          {" "}handle the job for whole roast birds. <strong>Yoghurt or crème fraîche</strong> brings mild
          acid with richness, useful when you want softness rather than sharpness.
        </p>
      </Section>

      <Section id="matrix" heading="Acid pairing matrix by method and occasion">
        <DataTable
          caption="Which acid to reach for, by duck method and occasion"
          columns={["Duck", "In the sauce", "On the plate", "Skip"]}
          rows={[
            [
              "Pan-seared breast, weeknight",
              "Sherry or red wine vinegar deglaze with stock",
              "Lemon on bitter greens",
              "Balsamic reduction — too sweet and heavy for a quick plate",
            ],
            [
              "Duck breast, dinner party",
              "Red wine and stock reduction, corrected with vinegar off the heat",
              "Pickled cherry or shallot",
              "Rice vinegar — its character disappears in a reduction",
            ],
            [
              "Whole roast, holiday",
              "Pan juices with wine and cider or red wine vinegar",
              "Braised red cabbage; orange and chicory salad",
              "Heavy sweet glazes with no acid at all",
            ],
            [
              "Confit / crisped legs",
              "Little or none — keep the skin dry",
              "Mustard vinaigrette on bitter leaves; cornichons",
              "Anything poured over the skin",
            ],
            [
              "Smoked duck",
              "Rice or cider vinegar with a little soy and fruit",
              "Quick-pickled cucumber; sharp slaw",
              "Balsamic — it collides with the smoke",
            ],
            [
              "Wild duck",
              "Red wine reduction with juniper",
              "Watercress with lemon; sharp fruit jelly",
              "Sweet-only accompaniments, which exaggerate strong flavours",
            ],
          ]}
        />
      </Section>

      <Section id="how-much" heading="How much, and when to stop">
        <p>
          Add acid in small increments and taste between them. The target is the point where the dish
          tastes lively and the fat feels lighter, one step before you can identify "vinegar" as a
          flavour. If you overshoot, the fixes are salt, a little sugar or fruit, more reduced stock,
          or a knob of butter — in that order.
        </p>
        <p>
          Acid also interacts with fat choice: a sauce enriched with butter tolerates more acid than
          one finished with duck fat, because dairy softens sharpness. See{" "}
          <a href="/ingredients/duck-fat-vs-butter-oil" className="text-primary underline underline-offset-4">
            duck fat vs butter and oil
          </a>{" "}
          for that trade-off, and use the{" "}
          <a href="/tools/duck-pairing-finder" className="text-primary underline underline-offset-4">
            Duck Pairing Finder
          </a>{" "}
          if you want the whole plate suggested at once.
        </p>
      </Section>

      <FaqList items={FAQ} />

      <RelatedGuides paths={PAGE.related} />
    </ArticleShell>
  );
}
