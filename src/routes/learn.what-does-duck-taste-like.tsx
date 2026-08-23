import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section } from "@/components/site/ArticleShell";
import { ConversionPaths } from "@/components/site/ConversionPaths";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SourceNotes } from "@/components/site/SourceNotes";
import { SourceMark } from "@/components/site/SourceMark";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/learn/what-does-duck-taste-like")!;

const FAQ = [
  {
    q: "Does duck taste like chicken?",
    a: "No. Duck is all dark meat, denser and richer, and it tastes closer to a lean steak than to chicken. Only the texture of a well-cooked leg is chicken-adjacent.",
  },
  {
    q: "Is duck gamey?",
    a: "Farmed duck — nearly all duck sold in US stores — is not gamey. It is rich and mildly sweet. Wild duck is a different animal: leaner, darker, and distinctly livery, especially in diving ducks.",
  },
  {
    q: "Does duck taste fatty or greasy?",
    a: "Only when the fat has not been rendered. Duck fat sits between the skin and the meat, so a slow render leaves crisp skin and clean-tasting meat. Greasiness is a cooking outcome, not a flavour of the bird.",
  },
  {
    q: "Which part of duck tastes best?",
    a: "The skin, if it is properly crisp. After that, breast for a steak-like slice and leg for deep, savoury, slow-cooked flavour.",
  },
  {
    q: "What does duck fat taste like?",
    a: "Mildly savoury and faintly sweet, with none of the strong flavour of lard. It reads mostly as richness, which is why potatoes cooked in it taste like better potatoes rather than like duck.",
  },
];

export const Route = createFileRoute("/learn/what-does-duck-taste-like")({
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
  component: WhatDoesDuckTasteLikePage,
});

function WhatDoesDuckTasteLikePage() {
  return (
    <ArticleShell
      eyebrow="Learn · Flavour"
      title={GUIDE.title}
      intro="If you have never eaten duck, the useful comparison is not chicken. It is a good steak: dark, dense, faintly sweet, and rich in a way that wants acid on the plate."
      trail={[
        { name: "Learn", to: "/learn" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <Section id="the-comparison" heading="Closer to steak than to chicken">
        <p>
          Duck has no white meat. Every part of the bird is dark, worked muscle, so it carries the
          mineral, slightly iron-edged depth people associate with beef rather than the neutral
          flavour of a chicken breast. Cooked to a rosy medium-rare, a duck breast slices like a
          small steak and tastes like one that happens to be sweeter and cleaner on the finish.
        </p>
        <p>
          The second surprise is sweetness. It is faint, but it is why fruit works so reliably with
          duck — cherry, plum, orange — and why a sauce with sugar in it never fights the meat. That
          is the logic behind{" "}
          <a
            href="/cook/best-sauces-for-duck-breast"
            className="text-primary underline underline-offset-4"
          >
            the classic duck sauces
          </a>
          , not tradition for tradition's sake.
        </p>
      </Section>

      <Section id="by-cut" heading="What each cut tastes like">
        <DataTable
          caption="Flavour and texture by cut"
          columns={["Cut", "Tastes like", "Texture when cooked well"]}
          rows={[
            [
              "Breast, skin on",
              "Rich, dark, faintly sweet — a lean steak with a savoury crust",
              "Firm and juicy at 130–135°F (54–57°C), with brittle, glassy skin",
            ],
            [
              "Leg and thigh",
              "Deeper and more savoury than breast, closer to braised beef short rib",
              "Silky and pull-apart after slow cooking; never rosy",
            ],
            [
              "Skin",
              "Pure savoury — the single best-tasting part of the bird",
              "Thin and crisp only when the fat beneath it is fully rendered",
            ],
            [
              "Rendered fat",
              "Mild, clean, faintly sweet; far less assertive than lard",
              "Solid and silky when cold, liquid gold when warm",
            ],
          ]}
        />
        <Callout label="If it tasted greasy">
          That is a rendering problem, not the bird. Fat left under the skin has nowhere to go and
          coats everything it touches — the diagnosis and the fix are in{" "}
          <a
            href="/learn/why-duck-skin-isnt-crispy"
            className="text-primary underline underline-offset-4"
          >
            why duck skin isn't crispy
          </a>
          .
        </Callout>
      </Section>

      <Section id="farmed-vs-wild" heading="Farmed duck versus wild duck">
        <p>
          Almost every duck in an American supermarket is farmed Pekin: mild, buttery, with a
          generous fat cap. It is the version most people mean when they say duck tastes rich but
          not gamey. Moulard and Muscovy are meatier and more assertive; Pekin is the friendly
          default.
        </p>
        <p>
          Wild duck is a genuinely different flavour. Lean, dark, and livery, with the diet of the
          bird showing up in the meat — puddle ducks like mallard taste far cleaner than fish-eating
          divers. It also has almost no fat cap, so the slow render that makes farmed breast great
          will simply dry it out. The differences that matter for cooking are laid out in{" "}
          <a
            href="/learn/wild-duck-vs-farmed-duck"
            className="text-primary underline underline-offset-4"
          >
            wild duck versus farmed duck
          </a>
          .
        </p>
      </Section>

      <Section id="doneness-and-flavour" heading="Doneness changes the flavour more than seasoning does">
        <p>
          Duck breast tastes best at a rosy medium-rare, which is why restaurants serve it that way
          and why the pink centre is not a mistake. Taken to the poultry safety minimum of 165°F
          (74°C) it turns firmer, drier, and noticeably more livery.
          <SourceMark to="sources" /> Both are legitimate choices — the trade-offs, carryover, and
          probe placement are covered in{" "}
          <a
            href="/learn/duck-breast-temperature-doneness"
            className="text-primary underline underline-offset-4"
          >
            duck breast temperature and doneness
          </a>
          .
        </p>
        <p>
          Legs go the other direction. They need long, gentle cooking to break down connective
          tissue, and only then do they taste the way duck leg should — which is the whole point of{" "}
          <a href="/cook/duck-leg-confit" className="text-primary underline underline-offset-4">
            confit
          </a>
          .
        </p>
      </Section>

      <Section id="first-time" heading="If this is your first duck">
        <p>
          Start with a single skin-on breast in a cold pan. It is the fastest route to the flavour
          everything else on this site builds on, it costs less than a whole bird, and it hands you
          a jar of rendered fat as a bonus. The method is in{" "}
          <a
            href="/recipes/pan-seared-duck-breast"
            className="text-primary underline underline-offset-4"
          >
            our pan-seared duck breast
          </a>
          , and if you would rather understand the technique first, read{" "}
          <a
            href="/cook/how-to-cook-duck-breast"
            className="text-primary underline underline-offset-4"
          >
            how to cook duck breast
          </a>
          .
        </p>
      </Section>

      <FaqList items={FAQ} />

      <ConversionPaths
        sourcePath="/learn/what-does-duck-taste-like"
        eyebrow="Ready to try it"
        heading="Where to buy a first duck breast"
      />

      <SourceNotes ids={["usdaPoultryTemp", "usdaPoultryPrep", "fdcDuckMeat"]} />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
