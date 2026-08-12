import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Section, DataTable, Callout, FaqList } from "@/components/site/ArticleShell";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { ingredientByPath } from "@/data/ingredients";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const PAGE = ingredientByPath("/ingredients/duck-fat-vs-butter-oil")!;

const FAQ = [
  {
    q: "Can I swap duck fat for butter one-for-one?",
    a: "Not by volume in baking, because butter contains water and milk solids while duck fat is almost entirely fat. In a pan, roasting tray or fryer the swap is straightforward. For pastry and baked goods use the substitution calculator, which handles the water difference.",
  },
  {
    q: "Is duck fat better for roast potatoes than oil?",
    a: "It tastes different rather than strictly better, and the difference is real: duck fat gives a savoury, faintly meaty flavour that oil cannot. For crispness alone, a good high-heat oil performs well. Most people who switch do it for flavour.",
  },
  {
    q: "Can I reuse duck fat?",
    a: "Yes, and that is much of its value — fat rendered from a roast or strained after frying can be kept refrigerated and used again. Strain out solids, since food debris is what makes any reused fat deteriorate and taste stale.",
  },
];

export const Route = createFileRoute("/ingredients/duck-fat-vs-butter-oil")({
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
      title="Duck Fat vs Butter, Olive Oil & Neutral Oil: When It Actually Matters"
      intro={PAGE.description}
      trail={[
        { name: "Ingredients", to: "/ingredients" },
        { name: PAGE.title, to: PAGE.path },
      ]}
      meta={`${PAGE.minutes} min read · Comparison reference`}
    >
      <Section id="summary" heading="The short version">
        <p>
          Duck fat is worth reaching for when you want savoury depth and a dry, crisp surface —
          roasting, frying, sautéing, confit-style cooking, and any pastry where a meaty note is
          welcome. It is not worth reaching for when you want a clean or bright flavour, a delicate
          emulsion, dairy character, or a fat that will be eaten raw and cold.
        </p>
        <p>
          The mistake is treating it as a luxury upgrade for everything. It is a flavoured fat with a
          specific personality, closer in role to bacon fat or good olive oil than to a neutral
          cooking medium.
        </p>
      </Section>

      <Section id="composition" heading="What makes them behave differently">
        <p>
          Only one structural difference really matters in the kitchen: water content. Butter is not
          pure fat — it contains water and milk solids, which is why it foams, browns, burns, and why
          swapping it for a pure fat by volume changes a dough's hydration. Duck fat, lard, ghee and
          oils are essentially all fat.
        </p>
        <p>
          The second difference is flavour origin. Butter's flavour comes from dairy solids, and those
          same solids are what brown into nuttiness and then burn. Duck fat's flavour comes from the
          fat itself, so it stays consistent as it heats and does not have solids to scorch. Olive
          oil carries peppery, grassy compounds that are volatile — much of what you pay for in a
          good bottle is lost when you cook it hard.
        </p>
        <DataTable
          caption="Practical comparison of four cooking fats for duck-adjacent cooking"
          columns={["Fat", "Flavour", "Water content", "Browning behaviour", "Where it wins"]}
          rows={[
            [
              "Duck fat",
              "Savoury, rounded, faintly meaty; not gamey",
              "Essentially none",
              "Browns food cleanly; no solids to burn",
              "Roast potatoes and root vegetables, frying, sautéing, confit, savoury pastry",
            ],
            [
              "Butter",
              "Dairy-sweet, nutty when browned",
              "Significant",
              "Foams, browns, then burns from the milk solids",
              "Pan sauces, finishing, laminated and cake pastry, anything where dairy is the flavour",
            ],
            [
              "Extra virgin olive oil",
              "Peppery, grassy, sometimes bitter",
              "None",
              "Fine at moderate heat; its aromatics degrade with hard heat",
              "Dressings, moderate sautéing, Mediterranean flavour direction",
            ],
            [
              "Neutral oil (sunflower, canola, groundnut)",
              "Almost none by design",
              "None",
              "Very tolerant of high heat",
              "Deep frying, high-heat searing, any dish where you want no added flavour",
            ],
          ]}
        />
        <Callout label="On smoke points" tone="gold">
          <p>
            You will find confident smoke-point numbers for duck fat all over the internet, and they
            disagree with each other — the figure varies with how the fat was rendered, how refined it
            is, and how often it has been used. We are not going to invent a precise number. The
            practical guidance: duck fat handles ordinary roasting, sautéing and shallow frying
            comfortably, and for sustained deep frying at the highest temperatures a refined neutral
            oil is the safer, cheaper choice.
          </p>
        </Callout>
      </Section>

      <Section id="use-cases" heading="Use-case by use-case">
        <p>
          <strong>Roast potatoes and root vegetables.</strong> This is duck fat's strongest case. It
          coats well, holds heat, produces a dry crisp exterior, and adds savoury flavour that no oil
          matches. Butter would burn over a long roast; olive oil's character is largely lost.
        </p>
        <p>
          <strong>Searing and sautéing.</strong> Duck fat performs well and adds flavour. But if you
          are cooking a duck breast, you do not need any added fat at all — the breast renders its own,
          and adding fat at the start slows rendering. Start dry and cold; see the{" "}
          <a href="/cook/duck-breast" className="text-primary underline underline-offset-4">
            duck breast guide
          </a>
          .
        </p>
        <p>
          <strong>Pan sauces.</strong> Butter usually wins, because emulsified butter gives a sauce
          gloss and body that a pure fat does not. Duck fat can enrich a sauce, but it will not give
          you that finishing shine. Sauce-building is covered in the{" "}
          <a href="/cook/best-sauces-for-duck-breast" className="text-primary underline underline-offset-4">
            duck sauce guide
          </a>
          .
        </p>
        <p>
          <strong>Pastry.</strong> Duck fat makes excellent savoury shortcrust and gives a tender,
          rich result with a mild meatiness. It is a poor choice for laminated doughs, where butter's
          water content generates the steam that creates layers, and for sweet baking, where the
          flavour reads oddly. Because of the water difference, do not swap by volume — use the{" "}
          <a href="/tools/duck-fat-substitution" className="text-primary underline underline-offset-4">
            duck fat substitution calculator
          </a>
          .
        </p>
        <p>
          <strong>Frying.</strong> Duck fat fries beautifully and is traditional for potatoes. For
          large volumes it is expensive and, if you are frying frequently at high heat, a refined
          neutral oil is more economical and more heat-tolerant.
        </p>
        <p>
          <strong>Confit and slow cooking in fat.</strong> Duck fat is the point, not a substitute —
          the method depends on submerging the meat in it. See the{" "}
          <a href="/cook/duck-leg-confit" className="text-primary underline underline-offset-4">
            confit guide
          </a>
          .
        </p>
        <p>
          <strong>Cold and raw applications.</strong> Duck fat is solid and waxy when cold, so it is
          wrong for dressings and vinaigrettes. Olive oil owns that space.
        </p>
      </Section>

      <Section id="cost" heading="Cost, waste and the case for rendering your own">
        <p>
          Bought duck fat is expensive per unit compared with neutral oil, which is exactly why the
          reuse logic matters. Duck fat you rendered yourself from trimmings, skin, or the tray under
          a roast is effectively free, and it is the same product. One whole roast duck typically
          yields enough fat for several rounds of roast potatoes.
        </p>
        <p>
          That changes the economics of the comparison entirely: the honest recommendation is to buy
          duck fat once to see whether you like it, then render and keep your own from every bird you
          cook. Strain it while warm, keep it refrigerated in a clean sealed jar, and top it up.
          Details in the{" "}
          <a href="/learn/how-to-render-duck-fat" className="text-primary underline underline-offset-4">
            rendering guide
          </a>{" "}
          and{" "}
          <a href="/learn/duck-fat-uses" className="text-primary underline underline-offset-4">
            what to do with duck fat
          </a>
          .
        </p>
        <p>
          If you do want to buy rather than render — worth it if you cook potatoes in it often and do
          not roast whole birds — the{" "}
          <a href="/buy/where-to-buy-duck-fat" className="text-primary underline underline-offset-4">
            duck fat buying guide
          </a>{" "}
          covers what to look for and where it is normally sold.
        </p>
      </Section>

      <Section id="decision" heading="A one-line decision rule">
        <p>
          Ask what the fat is doing. If it is a cooking medium whose flavour you want in the finished
          dish, duck fat is a strong choice. If it is a carrier for something else's flavour, use
          neutral oil. If the dish's character is dairy, use butter. If the dish is bright, raw or
          Mediterranean, use olive oil.
        </p>
      </Section>

      <FaqList items={FAQ} />

      <RelatedGuides paths={PAGE.related} />
    </ArticleShell>
  );
}
