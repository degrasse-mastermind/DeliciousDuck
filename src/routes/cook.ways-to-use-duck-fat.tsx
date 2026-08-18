import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Callout, FaqList, Section } from "@/components/site/ArticleShell";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { ConversionPaths } from "@/components/site/ConversionPaths";

const GUIDE = guideByPath("/cook/ways-to-use-duck-fat")!;

export const Route = createFileRoute("/cook/ways-to-use-duck-fat")({
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
          { name: "Cook", item: "/cook" },
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
  component: WaysToUsePage,
});

const FAQ = [
    {
      q: "Can I substitute duck fat 1:1 for butter or oil?",
      a: "Mostly yes by volume, but duck fat has no water content, so baked goods relying on butter's moisture may need a small adjustment. Use the substitution calculator to check specific swaps.",
    },
    {
      q: "Does duck fat need to be melted before measuring?",
      a: "For accuracy, yes — it's solid below about 68°F (20°C), and solid tablespoons pack differently than liquid ones.",
    },
  ];

interface Use {
  name: string;
  does: string;
  amount: string;
  pitfall: string;
}

function UseGroup({ heading, id, uses }: { heading: string; id: string; uses: Use[] }) {
  return (
    <Section id={id} heading={heading}>
      <ul className="space-y-5">
        {uses.map((u) => (
          <li key={u.name} className="border-t border-border pt-4">
            <h3 className="font-display text-lg text-foreground">{u.name}</h3>
            <p className="mt-1"><span className="font-semibold text-foreground">What it does: </span>{u.does}</p>
            <p className="mt-1"><span className="font-semibold text-foreground">Amount: </span>{u.amount}</p>
            <p className="mt-1 text-sm text-muted-foreground"><span className="font-semibold uppercase tracking-[0.1em] text-primary">Pitfall — </span>{u.pitfall}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function WaysToUsePage() {
  return (
    <ArticleShell
      eyebrow="Cook · Duck fat"
      title={GUIDE.title}
      intro="Duck fat isn't a novelty swap for butter or oil — it changes texture and flavour in specific, predictable ways. Here's where it earns its place, grouped by what it's actually doing in the pan."
      trail={[
        { name: "Cook", to: "/cook" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read · Reference`}
    >
      <Section id="why" heading="Why duck fat behaves differently">
        <p>
          Duck fat is almost entirely fat with very little water, unlike butter, which is roughly
          15–18% water and milk solids. That means it doesn't spatter or foam the way butter does at
          searing temperatures, and it carries a savoury, faintly meaty flavour that neutral oils
          don't. Its published smoke point is commonly cited around 375°F (190°C), but that number
          shifts with how well the fat was rendered and strained — treat any smoke-point figure you
          see, including this one, as approximate rather than a lab-verified constant for the jar in
          your fridge.
        </p>
      </Section>

      <UseGroup
        id="potatoes"
        heading="Potatoes and root vegetables"
        uses={[
          {
            name: "1. Roast potatoes",
            does: "Coats the surface for a shatter-crisp crust while the interior stays fluffy — the classic use case people buy duck fat for.",
            amount: "2–3 tbsp (28–42 g) melted fat per 500 g potatoes, tossed after parboiling.",
            pitfall: "Overcrowding the pan steams the potatoes instead of roasting them; use a pan wide enough for a single layer.",
          },
          {
            name: "2. Confit-style root vegetables",
            does: "Low, slow submersion in fat cooks carrots, parsnips or celeriac to a tender, almost custardy texture without browning.",
            amount: "Enough fat to fully submerge the vegetables, typically 300–500 g for a small batch.",
            pitfall: "Running the oven too hot turns confit into fried vegetables — keep it around 200–225°F (93–107°C).",
          },
          {
            name: "3. Hash",
            does: "Gives diced potato a savoury crust that plain oil doesn't, especially good under a fried egg.",
            amount: "1–2 tbsp (14–28 g) per two servings.",
            pitfall: "Using cold fat straight from the fridge cools the pan and stalls browning — melt it first.",
          },
          {
            name: "4. Duck-fat fries",
            does: "A double-fry finished in duck fat picks up flavour a neutral-oil fry can't.",
            amount: "Reserve duck fat for the final short fry only; a full deep fryer of it is expensive and unnecessary.",
            pitfall: "Duck fat solidifies as it cools, so fries can turn greasy-feeling if not drained and served hot.",
          },
        ]}
      />

      <UseGroup
        id="eggs"
        heading="Eggs and brunch"
        uses={[
          {
            name: "5. Fried eggs",
            does: "Crisps the edges of the white while keeping the yolk gently cooked, with a rounder flavour than oil.",
            amount: "1 tsp (about 5 g) per egg, just enough to coat the pan.",
            pitfall: "Too much fat turns a fried egg into a shallow-fried one — the edges go tough and lacy rather than lightly crisp.",
          },
          {
            name: "6. Scrambled eggs and omelettes",
            does: "Adds richness without the milk solids in butter that can catch and brown too fast.",
            amount: "1 tsp per two eggs.",
            pitfall: "Because it has no water content, it heats faster than butter — have eggs ready to go in before it starts to smoke.",
          },
          {
            name: "7. Toasted brioche or bread for brunch plates",
            does: "Gives a savoury crust that plays well against sweeter brunch components like fruit or maple.",
            amount: "A thin brushed layer, about ½ tsp per slice.",
            pitfall: "Too much soaks into the bread and turns it greasy instead of crisp.",
          },
        ]}
      />

      <UseGroup
        id="grains"
        heading="Grains and legumes"
        uses={[
          {
            name: "8. Rice pilaf",
            does: "Toasting rice in duck fat before adding liquid gives a savoury base note that plain oil doesn't provide.",
            amount: "1–2 tbsp per cup of raw rice.",
            pitfall: "Burnt duck fat solids from a previous batch left in the jar will scorch and taste bitter when reheated — use clean, well-strained fat.",
          },
          {
            name: "9. Polenta finishing",
            does: "Stirred in at the end, it adds gloss and savoury depth as an alternative to butter and cheese.",
            amount: "1–2 tbsp per serving.",
            pitfall: "Adding it too early, before the polenta thickens, dilutes rather than enriches.",
          },
          {
            name: "10. Braised beans and lentils",
            does: "A spoonful stirred in at the end rounds out the dish the way a ham hock or bacon fat would.",
            amount: "1 tbsp per 2–3 servings.",
            pitfall: "It reads as heavy in a dish that's already fatty from other pork or sausage additions — use it as the only added fat, not a topper.",
          },
          {
            name: "11. Croutons",
            does: "Tossing bread cubes in duck fat before baking gives a savoury crunch superior to most oils.",
            amount: "2 tbsp melted fat per 2 cups bread cubes.",
            pitfall: "Fat that solidifies as the croutons cool can make them feel greasy; serve them warm or re-crisp briefly before serving.",
          },
        ]}
      />

      <UseGroup
        id="searing"
        heading="Searing and sautéing"
        uses={[
          {
            name: "12. Searing steak or other meats",
            does: "High smoke-point tolerance and no milk solids mean it can take a hard sear without burning as fast as butter.",
            amount: "1–2 tbsp per pan, enough to coat.",
            pitfall: "Even duck fat has a ceiling — a pan left on high heat too long past searing will still smoke and turn acrid.",
          },
          {
            name: "13. Sautéing mushrooms or greens",
            does: "Adds a savoury backbone that stands up to earthy vegetables better than neutral oil.",
            amount: "1 tbsp per 2 cups vegetables.",
            pitfall: "Overpowers genuinely delicate vegetables like young spinach or pea shoots — save it for sturdier ones.",
          },
        ]}
      />

      <UseGroup
        id="confit"
        heading="Confit and slow cooking"
        uses={[
          {
            name: "14. Confit duck legs and other slow-poached meats",
            does: "Low, fully submerged cooking in fat protects lean meat from drying out over long cook times.",
            amount: "Enough to fully submerge the meat — typically 500 g–1 kg for a batch of legs.",
            pitfall: "Reused confit fat degrades in flavour after several rounds of high-protein contact; strain and taste it before reusing again.",
          },
        ]}
      />

      <UseGroup
        id="pastry"
        heading="Savoury pastry and enriched dough"
        uses={[
          {
            name: "15. Savoury pie crusts and enriched flatbreads",
            does: "Solid at room temperature like a shortening, it produces a flaky, savoury crust that plain oil can't and that butter makes sweeter.",
            amount: "Substitute up to half the fat in a savoury pastry recipe for duck fat; use a cold, solid state as you would cold butter.",
            pitfall: "Its stronger flavour is wrong for sweet pastry — reserve it for savoury pies, tarts and crackers.",
          },
        ]}
      />

      <Section id="not-worth-it" heading="Where duck fat is not worth it">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Delicate fish.</strong> Duck fat's savoury flavour overwhelms mild fish like sole
            or flounder; a neutral oil or plain butter lets the fish speak.
          </li>
          <li>
            <strong>High-temperature deep frying beyond its comfort zone.</strong> Held for extended
            periods at aggressive deep-fry temperatures, duck fat degrades faster than refined
            vegetable oils bred specifically for that job, and it's far more expensive to keep topping
            up a fryer with.
          </li>
          <li>
            <strong>Most sweet baking.</strong> Its savoury, meaty character clashes with sugar-forward
            bakes like cakes and cookies — this is butter's job, not duck fat's.
          </li>
        </ul>
        <Callout label="On smoke-point numbers">
          Any duck fat smoke point you see quoted, including the one on this page, depends on how the
          fat was rendered and how pure it is. Treat published figures as a rough guide, not a
          guarantee for the specific jar you're using.
        </Callout>
      </Section>

      <ConversionPaths
        sourcePath="/cook/ways-to-use-duck-fat"
        eyebrow="Restocking"
        heading="Buying more duck fat"
      />

      <FaqList items={FAQ} />

      <p className="mt-8">
        For exact swap ratios, use the{" "}
        <Link to="/tools/duck-fat-substitution-calculator" className="text-primary underline underline-offset-4">
          duck-fat substitution calculator
        </Link>
        . To make your own supply, see{" "}
        <Link to="/learn/how-to-render-duck-fat" className="text-primary underline underline-offset-4">
          how to render duck fat
        </Link>
        , or if you'd rather buy it ready-made, check the{" "}
        <Link to="/buy/duck-fat-buying-guide" className="text-primary underline underline-offset-4">
          duck fat buying guide
        </Link>
        .
      </p>

      <div className="mt-14">
        <NewsletterSignup id="field-guide" interest="duck-fat" />
      </div>

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
