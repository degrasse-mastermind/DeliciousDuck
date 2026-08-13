import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Section, DataTable } from "@/components/site/ArticleShell";
import { DuckMatchmaker } from "@/components/site/DuckMatchmaker";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, ldScript, pageMeta } from "@/lib/seo";
import { DuckBreastJourney } from "@/components/site/DuckBreastJourney";

const GUIDE = guideByPath("/cook/best-sauces-for-duck-breast")!;

export const Route = createFileRoute("/cook/best-sauces-for-duck-breast")({
  head: () => ({
    ...pageMeta({ title: GUIDE.seoTitle, description: GUIDE.description, path: GUIDE.path, ogType: "article" }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Cook", item: "/cook" },
          { name: GUIDE.title, item: GUIDE.path },
        ]),
      ),
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ArticleShell
      eyebrow="Pairing"
      title={GUIDE.title}
      intro={GUIDE.description}
      trail={[
        { name: "Cook", to: "/cook" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read · Pairing`}
    >
      <Section id="why-families" heading="Why organise by flavour family, not by recipe">
        <p>
          Duck breast's dominant characteristic at the table is rendered fat and rich, slightly
          mineral-tasting muscle. Nearly every sauce that works with it is doing one of a small
          number of jobs: cutting the fat with acid or sweetness, deepening the meat's own flavour
          with reduction, adding savoury weight, contrasting it with heat, or lifting it with
          something bright and green. Thinking in families rather than fixed recipes lets you
          build a sauce from what's in the kitchen, matched to how the duck was cooked.
        </p>
      </Section>

      <Section id="fruit-acid" heading="1. Fruit and acid">
        <p>
          Fruit-and-acid sauces — orange, cherry, blackberry, pomegranate, balsamic-fruit
          reductions — work because acidity and fruit sugars cut through duck fat the way they cut
          through any rich meat, resetting the palate between bites. They flatter pan-seared,
          cold-pan breast especially well, since the fond left in the pan after searing gives the
          fruit reduction a savoury backbone rather than tasting purely sweet.
        </p>
        <p>
          Build logic in general terms: a fruit component (juice, purée, or whole fruit), an acid
          if the fruit itself isn't sharp enough (vinegar or citrus), a small amount of sugar or
          honey only if the fruit is tart, and stock or pan fond for savoury depth. Reduce until it
          coats a spoon rather than runs off it.
        </p>
        <p>
          <strong>Pan material:</strong> acidic reductions can react with unseasoned cast iron and
          pick up a metallic edge over long simmering, so finish acid-heavy sauces in stainless
          steel or enamelled cookware rather than bare cast iron.
        </p>
        <p>
          <strong>Pitfall:</strong> over-reducing turns these sauces cloyingly sweet and sticky;
          pull them while still pourable, since they thicken further as they cool.
        </p>
      </Section>

      <Section id="wine-reduction" heading="2. Wine reduction">
        <p>
          Red wine, port, or Madeira reductions built on the pan fond from a seared or roasted
          breast deliver savoury depth and tannic structure that plays well against duck's fat
          content — the tannin does some of the same cutting work as acid, just with more body and
          less brightness. These suit both pan-seared and roasted whole-duck breast, since they
          rely on real fond, and a hard sear produces more of it than a gentle poach would.
        </p>
        <p>
          Build logic: deglaze the fond with wine, reduce by roughly half to concentrate it,
          enrich with stock, reduce again to a sauce consistency, and finish off the heat with a
          small knob of butter or a spoon of the duck's own rendered fat for shine and body.
        </p>
        <p>
          <strong>Pan material:</strong> use the same pan the duck was seared in — that's the
          point of building the sauce, since the fond is the flavour base. A seasoned cast-iron
          pan handles a short wine reduction fine as long as it isn't left simmering acidic liquid
          for an extended period.
        </p>
        <p>
          <strong>Pitfall:</strong> reducing wine without also reducing stock leaves the sauce
          thin and sharply alcoholic-tasting; both need to concentrate together.
        </p>
      </Section>

      <Section id="savoury-umami" heading="3. Savoury and umami">
        <p>
          Mushroom, soy-based, miso, or demi-glace-style sauces add depth without competing for
          sweetness or acidity, which suits duck cooked plainly — simply seared and rested, with
          the sauce doing most of the flavour work. This family is forgiving of home stovetop
          technique since it doesn't rely on a dramatic fond the way a wine reduction does.
        </p>
        <p>
          Build logic: a concentrated savoury base (reduced stock, soy, or a mushroom infusion),
          balanced with a small amount of acid or sweetness to keep it from tasting flat, and
          finished with fat for texture.
        </p>
        <p>
          <strong>Pan material:</strong> stainless or non-stick works well; soy- and miso-based
          sauces can scorch and stick in cast iron because of their sugar content, so keep heat
          moderate.
        </p>
        <p>
          <strong>Pitfall:</strong> too much reduced soy or miso pushes the sauce toward salty and
          one-dimensional; balance with acid or a neutral stock addition before serving.
        </p>
      </Section>

      <Section id="pepper-spice" heading="4. Pepper and spice">
        <p>
          Green peppercorn, five-spice, or chile-forward sauces contrast rather than cut duck's
          fat — the heat and spice register as a separate sensation alongside the richness instead
          of neutralising it. These flatter breast finished hot and fast, including{" "}
          <a href="/cook/how-to-cook-wild-duck-breast" className="text-primary underline underline-offset-4">
            wild duck breast
          </a>
          , where the leaner meat can otherwise taste plain without a bold counterpoint.
        </p>
        <p>
          Build logic: bloom whole or cracked spice in a little fat first to open its aromatics,
          deglaze with a splash of cream, stock, or brandy depending on the direction, and reduce
          briefly — these sauces generally want less cooking time than a wine reduction, since
          overcooking dulls the spice's top notes.
        </p>
        <p>
          <strong>Pan material:</strong> any heavy pan works; the main risk is scorching whole
          spices over too-high heat rather than a material issue.
        </p>
        <p>
          <strong>Pitfall:</strong> adding cream to a very hot, acidic pan can cause it to split;
          pull the pan off direct high heat before adding dairy.
        </p>
      </Section>

      <Section id="bright-herbal" heading="5. Bright and herbal">
        <p>
          Salsa verde, chimichurri, or herb-and-citrus oils are uncooked or barely cooked, and they
          work by contrast in temperature and freshness rather than by reduction — cold, sharp, and
          green against warm, rich duck. These suit any cooking method but particularly benefit
          simply cooked breast where the duck itself is the main event and the sauce is a garnish
          rather than a coating.
        </p>
        <p>
          Build logic: chopped fresh herbs, an acid (vinegar or citrus), oil to bind, and something
          sharp like capers, shallot, or mustard for edge. No reduction, no cooking — mix and rest
          briefly so flavours combine.
        </p>
        <p>
          <strong>Pan material:</strong> not applicable; these are built off the stove.
        </p>
        <p>
          <strong>Pitfall:</strong> made too far ahead, herb-based sauces oxidise and dull in
          colour and flavour; make close to serving.
        </p>
      </Section>

      <Section id="sauce-matrix" heading="Sauce family, method and occasion at a glance">
        <DataTable
          caption="Sauce family compared by method fit and occasion"
          columns={["Sauce family", "Best cooking method", "Typical occasion"]}
          rows={[
            ["Fruit & acid", "Pan-seared cold-pan breast", "Dinner party, holiday"],
            ["Wine reduction", "Pan-seared or roasted whole duck", "Dinner party, holiday"],
            ["Savoury / umami", "Simply seared or roasted", "Weeknight, dinner party"],
            ["Pepper & spice", "Hot-and-fast sear, wild duck", "Weeknight, casual entertaining"],
            ["Bright & herbal", "Any method", "Weeknight, warm-weather entertaining"],
          ]}
        />
      </Section>

      <DuckMatchmaker
        startingLabel="Sauce family"
        intro="A starting point for matching sauce family to how the duck was cooked and who's at the table."
        rows={[
          {
            starting: "Fruit & acid (orange, cherry, pomegranate)",
            sauce: "Reduced with pan fond, finished with a little butter",
            sides: "Roasted root vegetables, wild rice",
            occasion: "Holiday centrepiece",
          },
          {
            starting: "Wine reduction (red wine, port, Madeira)",
            sauce: "Built on fond, enriched with stock and butter",
            sides: "Potato gratin, braised greens",
            occasion: "Dinner party",
          },
          {
            starting: "Savoury / umami (mushroom, miso)",
            sauce: "Reduced stock base with a splash of acid",
            sides: "Simple grains, roasted mushrooms",
            occasion: "Weeknight",
          },
          {
            starting: "Pepper & spice (green peppercorn, five-spice)",
            sauce: "Bloomed spice, deglazed with cream or brandy",
            sides: "Steamed rice, stir-fried vegetables",
            occasion: "Casual entertaining",
          },
          {
            starting: "Bright & herbal (salsa verde, chimichurri)",
            sauce: "Uncooked herb-acid-oil blend",
            sides: "Grilled vegetables, simple salad",
            occasion: "Warm-weather weeknight",
          },
        ]}
      />

      <DuckBreastJourney
        id="cluster-plate-to-pan"
        title="From the plate back to the pan"
        intro="A sauce is only as good as the breast under it. These pages cover the cook itself."
        placement="sauces_pathway"
        excludePath="/cook/best-sauces-for-duck-breast"
      />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
