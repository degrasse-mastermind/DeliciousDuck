import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section } from "@/components/site/ArticleShell";
import { ConversionPaths } from "@/components/site/ConversionPaths";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SourceNotes } from "@/components/site/SourceNotes";
import { SourceMark } from "@/components/site/SourceMark";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/learn/is-duck-healthy")!;

const FAQ = [
  {
    q: "Is duck healthier than chicken?",
    a: "Skinless duck and skinless chicken are in the same nutritional neighbourhood: duck carries more fat and iron, chicken breast carries more protein per calorie. Neither is a health food or a problem; the skin and the cooking fat make far more difference than the species does.",
  },
  {
    q: "How many calories are in a duck breast?",
    a: "A 6 oz (170 g) roasted duck breast eaten without the skin is roughly 340 calories with about 40 g of protein. Eaten with the skin, expect closer to 570 calories, because the skin is where nearly all the fat sits.",
  },
  {
    q: "Is duck fat healthier than butter?",
    a: "Duck fat is about half monounsaturated and roughly one third saturated, so its fatty-acid profile sits between butter and olive oil. It is still 100% fat at about 115 calories per tablespoon — a reasonable swap for butter, not a reason to use more fat.",
  },
  {
    q: "Is duck considered red meat?",
    a: "Nutritionally it behaves like a lean red meat: all dark muscle, higher in iron and zinc than chicken. Regulators classify it as poultry, which is why the same poultry safety guidance applies.",
  },
  {
    q: "Can I eat duck on a low-carb or keto diet?",
    a: "Yes. Duck has no carbohydrate, and skin-on duck plus its rendered fat fits high-fat eating patterns easily. Watch the sauces instead — most classic duck sauces carry sugar.",
  },
];

export const Route = createFileRoute("/learn/is-duck-healthy")({
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
          { name: "Learn", item: "/learn" },
          { name: GUIDE.title, item: GUIDE.path },
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
  component: IsDuckHealthyPage,
});

function IsDuckHealthyPage() {
  return (
    <ArticleShell
      eyebrow="Learn · Nutrition"
      title={GUIDE.title}
      intro="Duck has a reputation for being fatty, and the reputation is half right. Almost all of the fat is in the skin, which means the same bird can be a lean protein or a rich indulgence depending on one decision at the table."
      trail={[
        { name: "Learn", to: "/learn" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <Section id="numbers" heading="The numbers, per 100 g cooked">
        <p>
          These are reference values for roasted domesticated duck, with chicken alongside for
          scale. Read the two duck rows as the same bird eaten two ways.
          <SourceMark to="sources" />
        </p>
        <DataTable
          caption="Roasted poultry, per 100 g cooked"
          columns={["Item", "Calories", "Protein", "Fat"]}
          rows={[
            ["Duck, meat only (skin removed)", "about 201", "23.5 g", "11.2 g"],
            ["Duck, meat with skin", "about 337", "19.0 g", "28.4 g"],
            ["Chicken breast, meat only", "about 165", "31 g", "3.6 g"],
            ["Chicken thigh, meat with skin", "about 229", "25 g", "13 g"],
          ]}
        />
        <p>
          Skinless duck lands close to a lean cut of beef: solid protein, moderate fat, and more
          iron and zinc than any part of a chicken. Leave the skin on and the fat more than doubles.
          Nothing about that is dangerous — it is simply the difference between a weeknight protein
          and a celebration dish, and it is entirely under your control.
        </p>
      </Section>

      <Section id="the-skin-decision" heading="The skin decides almost everything">
        <p>
          Duck stores its fat between the skin and the meat rather than marbled through it. That is
          unusual, and it is good news: rendering pours most of that fat into the pan, where you can
          keep it for later instead of eating it now. A properly rendered breast gives up a
          surprising amount of fat while the meat stays lean.
        </p>
        <p>
          So there are three honest options: eat the crisp skin and count it as the indulgence it
          is; render hard and eat the meat with the skin left on the plate; or remove the skin before
          cooking and lose the best part of the bird. The first two are the good ones. How to render
          properly is in{" "}
          <a
            href="/learn/how-to-render-duck-fat"
            className="text-primary underline underline-offset-4"
          >
            how to render duck fat
          </a>
          .
        </p>
      </Section>

      <Section id="duck-fat" heading="Is duck fat actually better than butter?">
        <p>
          By fatty-acid profile, duck fat sits between butter and olive oil: roughly half
          monounsaturated and about a third saturated by weight.
          <SourceMark to="sources" /> That makes it a reasonable one-for-one swap for butter in
          roasting and frying, and it has the higher smoke point of the two.
        </p>
        <p>
          What it is not is a licence to use more fat. A tablespoon is about 115 calories, the same
          ballpark as any cooking fat. The case for duck fat is flavour and heat tolerance, not
          health — a distinction the{" "}
          <a
            href="/ingredients/duck-fat-vs-butter-oil"
            className="text-primary underline underline-offset-4"
          >
            duck fat versus butter and oil
          </a>{" "}
          comparison goes into properly.
        </p>
        <Callout label="Practical read">
          If you already cook potatoes in butter or oil, swapping in duck fat changes the flavour a
          lot and the nutrition very little. See{" "}
          <a
            href="/cook/ways-to-use-duck-fat"
            className="text-primary underline underline-offset-4"
          >
            ways to use duck fat
          </a>{" "}
          for where the swap earns its place.
        </Callout>
      </Section>

      <Section id="micronutrients" heading="What duck gives you that chicken doesn't">
        <p>
          Duck is a meaningful source of iron, zinc, selenium and B vitamins — particularly B12 and
          niacin — at levels closer to red meat than to poultry, because it is all dark muscle. For
          anyone eating less beef but wanting the iron, duck is a genuinely useful substitution.
        </p>
      </Section>

      <Section id="safety" heading="Safety, briefly">
        <p>
          Duck is poultry, so the same handling rules apply: refrigerate below 40°F (4.4°C), thaw in
          the fridge rather than on the counter, and treat 165°F (74°C) as the official safe minimum
          internal temperature for poultry.
          <SourceMark to="sources" /> Restaurant practice serves duck breast rosy at 130–135°F
          (54–57°C); that is a considered trade-off rather than an oversight, and{" "}
          <a
            href="/learn/duck-breast-temperature-doneness"
            className="text-primary underline underline-offset-4"
          >
            the doneness guide
          </a>{" "}
          lays out both sides so you can choose deliberately.
        </p>
      </Section>

      <Section id="verdict" heading="The verdict">
        <p>
          Duck is a nutrient-dense protein with an unusual amount of removable fat and no
          carbohydrate. Cooked with the fat rendered out, it is a lean, iron-rich dinner. Cooked
          skin-on and eaten skin-and-all, it is a rich one. Both are fine; the only version worth
          avoiding is the under-rendered one, which delivers the calories of the second with the
          pleasure of neither.
        </p>
      </Section>

      <FaqList items={FAQ} />

      <ConversionPaths
        sourcePath="/learn/is-duck-healthy"
        eyebrow="If duck fat is the part you want"
        heading="Buying duck fat rather than rendering it"
      />

      <SourceNotes
        ids={["fdcDuckMeat", "fdcDuckFat", "fdcChickenCompare", "usdaPoultryTemp", "fdaColdStorage"]}
      />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
