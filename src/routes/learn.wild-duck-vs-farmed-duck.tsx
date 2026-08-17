import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section } from "@/components/site/ArticleShell";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SourceNotes } from "@/components/site/SourceNotes";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
import { SourceMark } from "@/components/site/SourceMark";

const GUIDE = guideByPath("/learn/wild-duck-vs-farmed-duck")!;

export const Route = createFileRoute("/learn/wild-duck-vs-farmed-duck")({
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
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: WildVsFarmedPage,
});

const FAQ = [
    {
      q: "Can I still use a duck-breast doneness chart written for farmed duck?",
      a: "Internal temperature targets themselves still apply — 165°F (73.9°C) is the USDA minimum regardless of source, and the same culinary-convention ranges below that are still what chefs use. What changes is the method to get there, since a lean breast overshoots those targets faster.",
    },
    {
      q: "Why does wild duck taste so different bird to bird?",
      a: "Diet, species, age and season all shift flavour and fat noticeably more in wild ducks than in farmed ones, which are raised on a controlled feed to a consistent slaughter age.",
    },
  ];

function WildVsFarmedPage() {
  return (
    <ArticleShell
      eyebrow="Learn · Wild duck"
      title={GUIDE.title}
      intro="A recipe written for a Pekin duck can fail badly on a wild mallard, and it's rarely the recipe's fault. The two birds differ in fat, muscle, size and consistency in ways that change how they should be cooked. This page is about cooking technique only — it has nothing to say about hunting regulations or licensing."
      trail={[
        { name: "Learn", to: "/learn" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read · Reference`}
    >
      <Section id="fat-cover" heading="Fat cover: the biggest difference">
        <p>
          Farmed breeds raised for the table — Pekin and Moulard chiefly — are selectively bred and
          fed to carry a thick, even subcutaneous fat cap under the skin, often 1 cm (nearly ½ in) or
          more over the breast. That fat layer is what makes the cold-pan searing method work: it
          gives the pan something to render slowly while the skin crisps.
        </p>
        <p>
          Wild ducks, by contrast, are working animals that fly long distances and forage for their
          own food. Many carry only a thin fat layer, and it varies enormously bird to bird depending
          on species, season, and how recently they'd been feeding heavily before being taken. Some
          wild ducks — particularly late-season birds that have been feeding on grain — can carry
          surprising amounts of fat; others carry almost none. Assume nothing and check the actual
          bird in front of you.
        </p>
      </Section>

      <Section id="muscle" heading="Muscle use and myoglobin">
        <p>
          Wild ducks use their breast muscles constantly for sustained flight, which builds far more
          myoglobin into the tissue than a farmed duck that walks short distances between feeders.
          Myoglobin is what gives meat its deep red colour and much of its iron-forward flavour — it's
          why wild duck breast reads as darker and more intensely "gamey" than a farmed one, even
          before any diet differences are considered. That dense, well-worked muscle is also
          proportionally leaner and can toughen faster if it's overcooked, since there's less
          intramuscular fat to buffer against dryness.
        </p>
      </Section>

      <Section id="species-diet" heading="Species and diet: expect variability">
        <p>
          "Wild duck" covers many species with real differences, and even within a species,
          individual birds vary with age, season and location. As a rough orientation only:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Dabbling ducks</strong> (mallard, teal, wigeon) feed at the surface and in fields,
            often on grain, seeds and aquatic plants. They tend toward milder flavour, though this
            varies with what's locally available to them.
          </li>
          <li>
            <strong>Diving ducks</strong> (scaup, canvasback, scoter) feed underwater on fish,
            molluscs and invertebrates more often, which tends to push flavour toward stronger and more
            mineral or "fishy" notes — again, with real variation by region and season.
          </li>
        </ul>
        <p>
          Treat any generalisation about a species as a starting expectation, not a guarantee. Diet
          shifts through the season, and two birds of the same species taken a month apart can taste
          noticeably different.
        </p>
      </Section>

      <Section id="size" heading="Size differences">
        <p>
          Farmed Pekin ducks are bred for size and typically dress out around 2.2–3 kg (5–6.5 lb).
          Moulard, bred for foie gras and confit, run larger still. Wild ducks vary widely by species:
          a teal might dress at well under 500 g, while a mallard commonly falls in the 900 g–1.3 kg
          (2–3 lb) range — smaller birds with proportionally smaller breast portions per bird, which
          changes how many you need to plan for a meal.
        </p>
      </Section>

      <DataTable
        caption="Wild duck vs farmed duck at a glance"
        columns={["Factor", "Farmed (Pekin/Moulard)", "Wild"]}
        rows={[
          ["Fat cover", "Thick, even subcutaneous cap", "Thin and highly variable, bird to bird"],
          ["Muscle character", "Lighter colour, less worked", "Darker, denser, more myoglobin"],
          ["Flavour", "Mild, consistent", "Ranges mild to strongly gamey by species and diet"],
          ["Typical dressed weight", "2.2–3+ kg (5–6.5+ lb)", "0.5–1.3 kg (1–3 lb), species-dependent"],
          ["Best breast method", "Cold-pan render, skin-on", "Hot-and-fast sear or careful skinless cooking"],
          ["Overcooking risk", "Moderate — fat buffers dryness", "High — little fat to compensate"],
        ]}
      />

      <Section id="what-transfers" heading="Which farmed techniques transfer">
        <p>
          Some habits from farmed duck cooking carry over cleanly, and some actively work against you
          on a wild bird.
        </p>
        <h3 className="font-display text-xl text-foreground mt-6">Transfers well</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Thermometer discipline.</strong> A leave-in or fast instant-read probe matters more
            on a lean wild breast, not less, because the margin between rare and dry is narrower.
          </li>
          <li>
            <strong>Resting.</strong> Letting the meat rest off heat before slicing still lets juices
            redistribute, and it still matters for a thin, quick-cooking cut.
          </li>
        </ul>
        <h3 className="font-display text-xl text-foreground mt-6">Fails on a wild bird</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Long cold-pan renders.</strong> The cold-pan method for farmed duck breast relies
            on a thick fat cap taking 8–10 minutes to render slowly. A wild breast with little or no
            fat cap will sit in a barely warm pan for that long and overcook from the inside before any
            useful rendering happens.
          </li>
          <li>
            <strong>Low-and-slow roasting of a whole lean bird.</strong> Farmed whole-duck roasting
            times assume a fat layer that bastes the meat as it renders. A lean wild bird roasted the
            same way for the same time will dry out well before it looks or reads as done by a farmed
            bird's visual cues.
          </li>
        </ul>
      </Section>

      <Section id="handling" heading="Handling and safety differences">
        <p>
          Wild-harvested birds carry handling considerations that farmed, inspected poultry does not.
          Field conditions, time between harvest and chilling, and the presence of shot mean wild birds
          should be cooled promptly, cleaned carefully, and checked for embedded shot before cooking.
          These are food-safety and handling questions, not questions about whether or how a bird may
          be taken — that's outside the scope of this guide. The safe minimum internal
          temperature, 165°F (73.9°C), applies to duck whatever its source.
          <SourceMark to="sources" />
        </p>
      </Section>

      <Callout label="Bottom line" tone="gold">
        Don't cook a wild duck by a farmed-duck recipe's clock or its visual cues. Check the actual
        bird's fat cover, choose a hot-and-fast or skinless approach for lean breasts, and lean
        harder on a thermometer than you would with a fattier farmed bird.
      </Callout>

      <FaqList items={FAQ} />

      <RelatedGuides paths={GUIDE.related} />
      <SourceNotes ids={["fsisWildGame", "usdaPoultryTemp"]} />
    </ArticleShell>
  );
}
