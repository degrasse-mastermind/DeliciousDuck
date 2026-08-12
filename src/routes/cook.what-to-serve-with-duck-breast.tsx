import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Section, DataTable } from "@/components/site/ArticleShell";
import { DuckMatchmaker } from "@/components/site/DuckMatchmaker";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/cook/what-to-serve-with-duck-breast")!;

export const Route = createFileRoute("/cook/what-to-serve-with-duck-breast")({
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
      <Section id="the-logic" heading="Building a plate: starch, vegetable, acid">
        <p>
          A duck breast plate that works reliably has three parts doing three different jobs: a
          starch that carries fat and sauce, a vegetable that adds structure and often bitterness
          or freshness, and an acid element that resets the palate against the fat. Once the sauce
          family for the duck is decided — see{" "}
          <a href="/cook/best-sauces-for-duck-breast" className="text-primary underline underline-offset-4">
            best sauces for duck breast
          </a>{" "}
          — the sides should either echo or contrast the sauce, not fight it or duplicate it
          exactly.
        </p>
      </Section>

      <Section id="fat-cooking" heading="Cook sides in the rendered fat, if you have it">
        <p>
          Duck breast leaves behind a small but genuinely useful amount of rendered fat in the pan.
          Potatoes, in particular, take to it well — roasted or pan-fried potatoes finished in
          duck fat pick up a savoury depth that oil or butter alone doesn't give. Root vegetables
          and hearty greens sautéed briefly in the fat work the same way. There usually isn't
          enough fat from a single breast to fry a full batch of anything from scratch; treat it as
          a finishing addition to something already mostly cooked, or supplement with fat saved
          from a previous cook. See{" "}
          <a href="/cook/ways-to-use-duck-fat" className="text-primary underline underline-offset-4">
            15 ways to use duck fat
          </a>{" "}
          for specific applications and amounts.
        </p>
      </Section>

      <Section id="pairing-matrix" heading="Pairing matrix by sauce, season and occasion">
        <DataTable
          caption="Starch, vegetable and acid choices keyed to sauce family, season and occasion"
          columns={["Sauce family", "Season", "Occasion", "Starch", "Vegetable", "Acid element"]}
          rows={[
            [
              "Fruit & acid",
              "Autumn / winter",
              "Holiday",
              "Roasted fingerling potatoes (finish in duck fat)",
              "Braised red cabbage or roasted squash",
              "The sauce itself carries the acid",
            ],
            [
              "Wine reduction",
              "Autumn / winter",
              "Dinner party",
              "Potato gratin or pommes purée",
              "Braised greens or roasted mushrooms",
              "A sharp side salad with vinaigrette",
            ],
            [
              "Savoury / umami",
              "Any",
              "Weeknight",
              "Steamed rice or soba noodles",
              "Stir-fried or roasted mushrooms",
              "Pickled vegetables on the side",
            ],
            [
              "Pepper & spice",
              "Any",
              "Casual entertaining",
              "Steamed jasmine rice",
              "Quick-charred greens or bok choy",
              "A citrus or vinegar-dressed slaw",
            ],
            [
              "Bright & herbal",
              "Spring / summer",
              "Warm-weather weeknight",
              "Boiled new potatoes tossed in duck fat",
              "Grilled or raw seasonal vegetables",
              "Lemon or vinegar in the herb sauce itself",
            ],
          ]}
        />
      </Section>

      <Section id="weeknight-vs-holiday" heading="Weeknight, dinner party, holiday: what changes">
        <p>
          On a weeknight, favour sides that cook in the same window as the duck breast itself —
          roughly 15–20 minutes total — so rice, quick-sautéed greens, or pan-fried potatoes that
          were parboiled ahead make sense, while anything needing a long braise doesn't. For a
          dinner party, a gratin or a slow-braised vegetable can go in the oven well before the
          duck goes in the pan, freeing your attention for the sear at the end. For a holiday
          table, lean toward make-ahead sides that reheat well, since a whole roast duck or several
          seared breasts already demand full attention right before serving; see{" "}
          <a href="/cook/whole-roast-duck" className="text-primary underline underline-offset-4">
            whole roast duck
          </a>{" "}
          if the occasion calls for a whole bird instead of individual breasts.
        </p>
      </Section>

      <DuckMatchmaker
        startingLabel="Occasion"
        intro="A quick starting point for full plates by occasion, assuming the sauce family is already chosen."
        rows={[
          {
            starting: "Weeknight",
            sauce: "Savoury/umami or bright/herbal — quickest to build",
            sides: "Steamed rice or quick-cooked greens",
            occasion: "20 minutes or less alongside the duck",
          },
          {
            starting: "Dinner party",
            sauce: "Wine reduction or fruit & acid",
            sides: "Gratin or braised greens made ahead",
            occasion: "Sides finish in the oven while duck rests",
          },
          {
            starting: "Holiday",
            sauce: "Fruit & acid, built from pan fond or roasting juices",
            sides: "Make-ahead roasted roots, braised cabbage",
            occasion: "Reheats well alongside a whole roast bird",
          },
        ]}
      />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
