import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section, StepList } from "@/components/site/ArticleShell";
import { QuackFix } from "@/components/site/QuackFix";
import { UseTheWholeDuck } from "@/components/site/UseTheWholeDuck";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SourceNotes } from "@/components/site/SourceNotes";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
import { ConversionPaths } from "@/components/site/ConversionPaths";

const GUIDE = guideByPath("/learn/how-to-render-duck-fat")!;

export const Route = createFileRoute("/learn/how-to-render-duck-fat")({
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
  component: RenderFatPage,
});

const FAQ = [
    {
      q: "Can I render fat from raw skin without any trim?",
      a: "Yes, though skin renders more slowly since it's a mix of fat and connective tissue. Cut it small and expect the cook to run toward the longer end of the range.",
    },
    {
      q: "Do I need to add water every time?",
      a: "No — it's a safety margin for anyone still learning how their stove behaves at low settings, not a required step.",
    },
  ];

function RenderFatPage() {
  return (
    <ArticleShell
      eyebrow="Learn · Duck fat"
      title={GUIDE.title}
      intro="Duck fat is the reward you get for saving trim instead of throwing it away. Rendering it cleanly is a slow, low-heat job — rush it and you trade a jar of gold for a jar of bitterness."
      trail={[
        { name: "Learn", to: "/learn" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read · Technique`}
    >
      <Section id="sources" heading="Where the fat comes from">
        <p>
          You don't need to buy a bag of duck fat to have plenty on hand. Every duck you break down
          leaves behind three sources worth keeping:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Trim fat</strong> — the visible pads around the cavity opening, neck, and tail.
            This is the cleanest source and renders the palest fat.
          </li>
          <li>
            <strong>Skin offcuts</strong> — trimmed skin from breasts you're squaring off, or skin
            left on a carcass after carving. It renders more slowly than pure fat because it's mostly
            connective tissue and moisture until the fat separates out.
          </li>
          <li>
            <strong>Roasting-pan drippings</strong> — the fat and juice left after roasting a whole
            duck. This fat has already been through heat once and carries roasted flavour, but it's
            mixed with meat juices that need separating out before storage.
          </li>
        </ul>
        <p>
          A single 2.2–2.7 kg (5–6 lb) whole duck typically gives up 200–400 g (about 1–1.75 cups) of
          rendered fat between trim and pan drippings, depending on breed and how closely it was
          trimmed. Freeze trim in a bag until you have enough to make a render worthwhile — under
          about 150 g it's barely worth heating a pan for.
        </p>
      </Section>

      <Section id="small-pieces" heading="Why cutting it small matters">
        <p>
          Fat renders from the outside in. A pea-sized cube of fat has far more surface area relative
          to its volume than a walnut-sized chunk, so it releases its fat faster and more evenly. Cut
          trim into roughly 1 cm (½ in) pieces before it goes in the pan. Pieces cut smaller than that
          scorch before the fat next to the pan surface has fully rendered; pieces left larger can take
          twice as long and leave a stubborn, half-rendered core that you end up discarding.
        </p>
        <p>
          If the fat is very cold or half-frozen, it cuts more cleanly — a warm, soft pad slides under
          the knife instead of separating.
        </p>
      </Section>

      <Section id="methods" heading="Water-start versus dry low-heat rendering">
        <p>
          Two methods produce clean fat. They differ mainly in how forgiving they are of an
          inattentive cook.
        </p>
        <DataTable
          caption="Water-start vs dry low-heat rendering"
          columns={["", "Water-start method", "Dry low-heat method"]}
          rows={[
            [
              "How it works",
              "Cover cut fat with about 1 cm of water in a heavy pot, then simmer. Water boils off as fat renders, and the water buffers the pan from scorching until it's gone.",
              "Cut fat goes straight into a dry, heavy pan over the lowest possible burner setting, sometimes with a splash of water at the very start to protect against a fast heat spike.",
            ],
            [
              "Forgiveness",
              "More forgiving — the boiling water keeps the pan below scorching temperature for most of the cook.",
              "Less forgiving. There's nothing between the fat and the pan once it starts rendering; a moment of too-high heat browns the solids.",
            ],
            [
              "Time",
              "Often 20–30 minutes longer, since energy goes into evaporating water first.",
              "Faster once it gets going, but needs closer attention throughout.",
            ],
            [
              "Best for",
              "Beginners, or rendering a large batch you can't stand over the whole time.",
              "Small batches, or once you've done it enough times to judge the smell and sound.",
            ],
          ]}
        />
        <p>
          Both methods finish the same way: fat clarifies from cloudy white to clear gold, and the
          solid bits (cracklings) shrink, darken, and start to float rather than sink.
        </p>
      </Section>

      <Section id="temperature" heading="Target pan temperature and why you stay below smoking">
        <p>
          Keep the fat in a gentle range of roughly 200–225°F (93–107°C) — a lazy simmer with small,
          intermittent bubbles, not a rolling boil or a shimmer. Duck fat's smoke point is commonly
          cited around 375°F (190°C), but that figure varies with how much moisture and protein is
          still suspended in it, so treat it as a ceiling to stay well clear of, not a target to
          approach. Past the smoke point the fat breaks down, turns acrid, and the flavour doesn't
          recover — you can't cook a burnt taste back out.
        </p>
        <Callout label="Read the pan, not just the clock">
          Fine, steady bubbling with a mild simmering sound means you're in range. Fast, aggressive
          bubbling or the fat suddenly starting to shimmer and smell sharp means the burner is too
          high — pull it down immediately.
        </Callout>
      </Section>

      <Section id="time-and-doneness" heading="How long it takes, and when it's done">
        <p>
          For a batch of 300–500 g of cut trim, expect 45–90 minutes at low heat, longer with the
          water-start method. Cracklings tell you more reliably than a clock: they go from pale and
          soft to golden-brown and noticeably firm, and they start floating to the surface instead of
          clumping at the bottom. Fat itself turns from cloudy and pale to clear and light gold. Once
          both signs show up, pull the pan off the heat — cracklings continue browning in residual
          heat, and can go from perfect to burnt within a minute or two of sitting in hot fat.
        </p>
      </Section>

      <StepList
        steps={[
          {
            title: "Cut and chill the fat",
            body: "Trim visible fat and skin into roughly 1 cm pieces. Chilling firms it up for cleaner cutting.",
          },
          {
            title: "Choose your method and start low",
            body: "Water-start for a forgiving first attempt, dry pan once you're confident. Either way, start the burner on its lowest setting.",
            watchFor: "A hard boil or visible shimmer in the first ten minutes — turn the heat down.",
          },
          {
            title: "Render slowly, stirring occasionally",
            body: "Stir every 10–15 minutes so pieces render evenly and nothing sticks and scorches at the bottom.",
          },
          {
            title: "Watch the cracklings, not the clock",
            body: "Pull the pan once cracklings are golden-brown, firm, and floating, and the fat runs clear.",
          },
          {
            title: "Strain hot, through fine mesh",
            body: "Pour through a fine-mesh sieve into a heatproof jar while the fat is still liquid. For the clearest fat, line the sieve with a layer of cheesecloth or a clean cotton cloth for a second pass.",
          },
          {
            title: "Separate any meat juice",
            body: "If you're rendering pan drippings, chill the strained liquid uncovered until the fat solidifies on top. Lift the fat cap off and discard or refrigerate the jellied juice underneath separately — juice mixed into stored fat shortens its shelf life sharply.",
          },
        ]}
      />

      <Section id="storage" heading="Storage windows, stated honestly">
        <p>
          Clean, well-strained duck fat with no meat juice mixed in keeps refrigerated for about
          2–3 months in a sealed container, and up to about 6 months in the freezer. Fat that still
          carries some meat juice or wasn't fully strained will turn much sooner — treat it more like
          3–5 days in the fridge, similar to cooked meat drippings, unless you use it quickly.
        </p>
        <p>
          Keep it in a sealed glass jar away from light, and don't leave it at room temperature for
          extended prep sessions — pull only what you need and return the jar to the fridge. Once
          you have a jar, the{" "}
          <a href="/cook/ways-to-use-duck-fat" className="text-primary underline underline-offset-4">
            ways to use duck fat
          </a>{" "}
          guide covers what it is genuinely better at than butter or oil, and the{" "}
          <a href="/buy/duck-fat-buying-guide" className="text-primary underline underline-offset-4">
            duck fat buying guide
          </a>{" "}
          covers what to look for if you would rather buy it rendered.
        </p>
      </Section>

      <Section id="spoilage" heading="Signs it has gone off">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Smell</strong> — a sharp, sour, or paint-like odour instead of a clean, faintly savoury one is the clearest sign. Trust your nose over the calendar date.</li>
          <li><strong>Colour</strong> — fresh rendered fat is pale gold to ivory when solid. Grey, yellowing, or darkening patches suggest oxidation.</li>
          <li><strong>Cloudiness after storage</strong> — some cloudiness on melting can be trace moisture and is not automatically spoilage, but persistent cloudiness combined with an off smell is.</li>
          <li><strong>Off flavours when cooked</strong> — a bitter or "cardboard" aftertaste when you fry with it means the fat has oxidised even if it still looks fine cold.</li>
        </ul>
        <p>When in doubt, throw it out — rendered fat is cheap to make again, and a spoiled batch will flavour everything you cook in it.</p>
      </Section>

      <UseTheWholeDuck
        intro="Rendering fat is itself a way to use trim you'd otherwise bin — and the fat you get out has its own second life."
        items={[
          {
            part: "Rendered duck fat",
            use: "Roast potatoes, confit legs, or fry eggs in it once it's clean and strained.",
            to: "/cook/ways-to-use-duck-fat",
            linkLabel: "15 ways to use duck fat",
          },
          {
            part: "Cracklings",
            use: "Salt them while warm and scatter over salads, mashed potatoes, or grain bowls for crunch.",
          },
          {
            part: "Jellied meat juice",
            use: "Separated from the fat cap, this makes a concentrated base for pan sauces or gravy.",
          },
          {
            part: "Leg meat and carcass",
            use: "If you're rendering pan drippings from a whole roast, the carcass still owes you stock.",
            to: "/learn/how-to-carve-a-duck",
            linkLabel: "Carving guide",
          },
        ]}
      />

      <QuackFix
        title="Quack Fix: rendering problems"
        items={[
          {
            symptom: "Fat tastes burnt or bitter",
            cause: "Heat spiked above a gentle simmer at some point, scorching solids in contact with the pan.",
            fixNow: "There's no rescuing burnt fat — strain out what you can and start a fresh batch at lower heat.",
            prevent: "Use the water-start method until you trust your burner's lowest setting, and stir every 10–15 minutes.",
          },
          {
            symptom: "Fat turns cloudy or spoils fast",
            cause: "Meat juice or fine solids weren't fully strained out before storage.",
            fixNow: "Re-strain through cloth-lined mesh and use the batch within a few days rather than the full storage window.",
            prevent: "Chill drippings first and lift the solid fat cap off the jellied juice before jarring.",
          },
          {
            symptom: "Low yield from a good amount of trim",
            cause: "Pieces were cut too large, or the render was pulled before fat fully separated from connective tissue.",
            fixNow: "Return under-rendered cracklings to low heat for another 10–15 minutes.",
            prevent: "Cut trim to about 1 cm pieces and judge doneness by the cracklings, not a fixed time.",
          },
          {
            symptom: "Kitchen fills with smoke",
            cause: "Pan temperature exceeded the fat's smoke point, or fat spattered onto a hot burner element.",
            fixNow: "Remove the pan from heat immediately and let it cool before deciding whether the batch is salvageable.",
            prevent: "Keep the burner low, use a heavy pot that holds heat evenly, and never leave rendering fat unattended.",
          },
        ]}
      />

      <ConversionPaths
        sourcePath="/learn/how-to-render-duck-fat"
        eyebrow="If you would rather buy it"
        heading="Buying rendered duck fat instead"
      />

      <FaqList items={FAQ} />

      <RelatedGuides paths={GUIDE.related} />
      <SourceNotes ids={["fdaColdStorage", "usdaPoultryPrep"]} />
    </ArticleShell>
  );
}
