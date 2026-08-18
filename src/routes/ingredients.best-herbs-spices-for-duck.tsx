import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Section, DataTable, Callout, FaqList } from "@/components/site/ArticleShell";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { ingredientByPath } from "@/data/ingredients";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const PAGE = ingredientByPath("/ingredients/best-herbs-spices-for-duck")!;

const FAQ = [
  {
    q: "What is the single most useful herb for duck?",
    a: "Thyme, because it works across almost every method: it survives a long confit, it holds up in a roasting cavity, and a sprig dropped into the pan for the last minute of a breast sear perfumes the fat without dominating it.",
  },
  {
    q: "Can I use a poultry rub made for chicken on duck?",
    a: "Usually yes, but check the sugar and paprika content. Duck renders far more fat than chicken, and sugary rubs sitting in that fat over a long roast can darken well before the bird is finished. Rubs heavy on dried herbs and pepper transfer better than sweet, paprika-forward ones.",
  },
  {
    q: "Do dried herbs work as well as fresh?",
    a: "For woody herbs — thyme, rosemary, sage, oregano — dried works well because their aromatics are robust and they have time to rehydrate during cooking. Soft herbs like parsley, tarragon, chervil and mint lose most of their character when dried; use those fresh and add them at the end.",
  },
];

export const Route = createFileRoute("/ingredients/best-herbs-spices-for-duck")({
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
      title="Best Herbs & Spices for Duck: A Flavor-Pairing Guide"
      intro={PAGE.description}
      trail={[
        { name: "Ingredients", to: "/ingredients" },
        { name: PAGE.title, to: PAGE.path },
      ]}
      meta={`${PAGE.minutes} min read · Flavour pairing`}
    >
      <Section id="why" heading="What duck actually needs from a seasoning">
        <p>
          Duck presents three things to a seasoning: a large amount of rendering fat, dark muscle
          with a mineral, faintly liver-adjacent depth, and — on farmed birds — a mild sweetness in
          the skin. Fat carries aroma extremely well, which is why duck takes strong, resinous and
          resinous-adjacent flavours that would bulldoze chicken. It also means anything you add
          early gets amplified as the fat renders and bastes the meat in it.
        </p>
        <p>
          So the useful question is not "which herbs go with poultry" but "which aromatics survive
          fat and time, and which ones need to be added at the last second." That single distinction
          organises everything below.
        </p>
      </Section>

      <Section id="woody" heading="1. Woody herbs — the structural backbone">
        <p>
          <strong>Thyme, rosemary, sage, bay, oregano, marjoram.</strong> These have tough leaves
          and oil-soluble aromatics, so they release slowly and keep releasing. That makes them the
          right choice any time the duck is going to cook for a while in contact with its own fat: a
          whole roast, a confit, a braise, a slow leg cook.
        </p>
        <p>
          <strong>Why they work:</strong> their aromatics are fat-soluble, so they infuse the
          rendering fat rather than burning off. The resinous, slightly bitter edge of rosemary and
          sage also reads as a counterweight to richness, in the same way a bitter green does on the
          plate.
        </p>
        <p>
          <strong>Where they clash:</strong> rosemary and sage are the two easiest to overdo. In a
          long confit, a lot of rosemary turns medicinal and pine-like; sage in quantity goes musty.
          Thyme and bay are close to unlimited by comparison. On a quick-seared breast, whole woody
          sprigs contribute less than you'd think — drop them into the fat only for the final
          minutes, where the hot fat can actually extract them.
        </p>
      </Section>

      <Section id="warm-spices" heading="2. Warm spices — depth and a hint of sweetness">
        <p>
          <strong>Star anise, Chinese five-spice, cinnamon, clove, allspice, coriander seed,
          fennel seed.</strong> This family is the reason duck feels at home in both a French and a
          Chinese kitchen. Warm spices read as sweet without adding sugar, which flatters duck's own
          faint sweetness, and their volatile oils are lifted by fat.
        </p>
        <p>
          <strong>Why they work:</strong> star anise and five-spice in particular have an aromatic
          weight that stands up to dark meat — they sit alongside the duck's flavour rather than
          being swamped by it. In a rub or a cure they perfume the whole bird; in a pan sauce,
          bloomed briefly in fat, they give a sauce a finished, restaurant-like top note.
        </p>
        <p>
          <strong>Where they clash:</strong> clove and cinnamon have almost no margin. A whole clove
          too many and the dish tastes like mulled wine; the same is true of cassia-heavy
          five-spice blends. Treat these as accents measured in single pieces, not spoonfuls. Warm
          spices also fight fresh, green sauces — pick one direction.
        </p>
      </Section>

      <Section id="pepper" heading="3. Peppery and spicy — contrast rather than balance">
        <p>
          <strong>Black pepper, green peppercorn, Sichuan pepper, dried chile, smoked paprika,
          harissa.</strong> Where acid cuts fat, heat and pepper contrast it: the sensation sits
          next to the richness instead of neutralising it, which is why a pepper sauce feels bracing
          without being sharp.
        </p>
        <p>
          <strong>Why they work:</strong> duck's dark, slightly gamey muscle gives pepper something
          to push against. Green peppercorn with cream is a classic for a reason; Sichuan pepper's
          numbing quality is unusually effective against a fatty mouthfeel. Smoked paprika bridges
          into the smoky direction without a smoker.
        </p>
        <p>
          <strong>Where they clash:</strong> coarse black pepper applied before a long, hot roast can
          scorch and turn acrid in the rendered fat. Season with salt ahead and add most of the
          pepper after cooking, or in the sauce. Paprika burns easily for the same reason — it is
          better in a sauce or a short cook than on the skin of a two-hour bird.
        </p>
      </Section>

      <Section id="seeds-berries" heading="4. Aromatic seeds and berries — the game-meat register">
        <p>
          <strong>Juniper, caraway, fennel seed, coriander seed, mustard seed, pink peppercorn.</strong>{" "}
          This is the family that speaks to duck's wild side. Juniper in particular is the classic
          partner for game birds: its resinous, gin-like note lands on the same axis as duck's
          mineral depth and makes it taste intentional rather than merely strong.
        </p>
        <p>
          <strong>Why they work:</strong> seeds are dense, oil-rich and slow to release, so they
          behave like woody herbs — good in cures, rubs and long cooks. Toasting or lightly crushing
          them first opens the aromatics; whole and untoasted they contribute very little.
        </p>
        <p>
          <strong>Where they clash:</strong> juniper is potent, and too much reads soapy. Caraway is
          divisive and strongly associated with rye and cabbage, so it pulls the whole dish toward
          Central European — fine if that is where you are going, jarring if the sauce is citrus and
          delicate.
        </p>
      </Section>

      <Section id="finishing" heading="5. Fresh finishing herbs — the last-second lift">
        <p>
          <strong>Parsley, tarragon, chervil, chives, mint, coriander leaf, basil.</strong> Soft
          herbs have volatile, water-soluble aromatics that cook off almost immediately. They are
          not seasonings for the bird; they are seasonings for the plate.
        </p>
        <p>
          <strong>Why they work:</strong> a raw green note arriving at the same moment as hot,
          rendered fat is genuinely refreshing — it is the herbal equivalent of a squeeze of lemon.
          Tarragon has a particular affinity with duck because its anise character bridges to the
          warm-spice family while staying fresh.
        </p>
        <p>
          <strong>Where they clash:</strong> added early they go grey and taste of nothing, so cooked
          parsley in a rub is wasted effort. Mint and coriander leaf are assertive enough to fight a
          reduction sauce; use them in an uncooked sauce like a salsa verde instead, where they are
          the point.
        </p>
      </Section>

      <Section id="matrix" heading="Seasoning matrix by method">
        <p>
          The same herb behaves differently depending on how long it sits in hot fat. Use this as a
          starting point, then adjust once you know how strong your own dried spices are.
        </p>
        <DataTable
          caption="Herb and spice choices matched to duck cooking method"
          columns={["Method", "Add early (in the fat / cure)", "Add late (pan or plate)", "Go easy on"]}
          rows={[
            [
              "Pan-seared breast",
              "Salt; cracked coriander seed in a dry rub",
              "Thyme sprig in the fat for the last 2 minutes; black pepper after resting; tarragon or chives on the plate",
              "Sugary rubs, paprika, chopped garlic (both burn in a long render)",
            ],
            [
              "Whole roast duck",
              "Thyme, bay, rosemary and halved onion or citrus in the cavity; salt on the skin",
              "Pepper after carving; parsley or watercress on the platter",
              "Coarse pepper and paprika on the skin; cinnamon and clove beyond a token amount",
            ],
            [
              "Confit / slow legs",
              "Thyme, bay, garlic, black peppercorn, juniper in the salt cure",
              "Nothing needed; parsley and lemon zest if you crisp the legs to serve",
              "Rosemary and sage in quantity — both turn medicinal over hours",
            ],
            [
              "Smoked duck",
              "Salt cure with coriander and fennel seed; smoked paprika if not using a smoker",
              "Cracked pepper; pickled fruit or sharp greens alongside",
              "Delicate soft herbs — smoke overwhelms them",
            ],
            [
              "Wild duck",
              "Juniper, black pepper, thyme; a little fennel seed",
              "Green peppercorn sauce; sharp mustard; watercress",
              "Sweet spice blends, which exaggerate any liver-like notes",
            ],
          ]}
        />
      </Section>

      <Section id="building" heading="Building a rub without a recipe">
        <p>
          A reliable rub has four slots, and you only need one entry in each: salt (always, and by
          far the most important), one woody herb, one warm spice or aromatic seed, and one pepper
          or heat element. Thyme, coriander seed and black pepper is a complete rub. Five-spice and
          salt is a complete rub. Adding a fifth and sixth ingredient rarely improves the result and
          usually just muddies it.
        </p>
        <Callout label="One thing to keep dry" tone="gold">
          <p>
            Anything wet on the skin — a paste, an oil-bound rub, a marinade — works against crisp
            skin, because water has to leave the surface before it can brown properly. Keep rubs
            dry, and keep them mostly on the flesh side if you are chasing crackling-grade skin.
          </p>
        </Callout>
      </Section>

      <FaqList items={FAQ} />

      <RelatedGuides paths={PAGE.related} />
    </ArticleShell>
  );
}
