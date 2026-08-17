import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section } from "@/components/site/ArticleShell";
import { ConversionPaths } from "@/components/site/ConversionPaths";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SourceNotes } from "@/components/site/SourceNotes";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
import { SourceMark } from "@/components/site/SourceMark";

const GUIDE = guideByPath("/learn/how-to-thaw-duck")!;

export const Route = createFileRoute("/learn/how-to-thaw-duck")({
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
  component: HowToThawDuckPage,
});

const FAQ = [
    {
      q: "Can I cook a duck from frozen?",
      a: "It's possible in an oven with roughly 50% more time, but uneven cooking and difficulty verifying internal temperature make it a poor default — thaw first whenever you can plan ahead.",
    },
    {
      q: "Is a little pink ice inside the cavity a problem after thawing?",
      a: "Small ice remnants near the cavity are common on a large bird and aren't a safety issue as long as the rest of the duck has thawed under refrigeration; give it more time before cooking.",
    },
    {
      q: "Does thawing in the wrapper versus unwrapped matter?",
      a: "Keep it wrapped. The packaging contains drip and limits surface exposure until you're ready to season and cook.",
    },
  ];

function HowToThawDuckPage() {
  return (
    <ArticleShell
      eyebrow="Learn · Whole duck"
      title={GUIDE.title}
      intro="Frozen duck needs a plan, not a countertop. Refrigerator thawing is the default method — everything else exists for when you didn't plan far enough ahead."
      trail={[
        { name: "Learn", to: "/learn" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <Section id="fridge-first" heading="Refrigerator-first: the default method">
        <p>
          Thaw in the refrigerator, at or below 40°F (4.4°C). It is the recommended method
          because the duck never leaves the safe range while it thaws.
          <SourceMark to="sources" /> The trade-off is time — a whole bird needs a full day or more depending
          on its weight. Plan backward from your cooking date rather than discovering the duck is
          still icy the morning you meant to roast it.
        </p>
        <DataTable
          caption="Refrigerator thawing time by weight and cut"
          columns={["Item", "Weight", "Refrigerator thaw time"]}
          rows={[
            ["Whole duck", "1.8–2.0 kg (4–4.5 lb)", "24–36 hours"],
            ["Whole duck", "2.3–2.7 kg (5–6 lb)", "36–48 hours"],
            ["Whole duck", "2.9–3.2 kg (6.5–7 lb)", "48–60 hours"],
            ["Duck breasts", "170–225 g (6–8 oz) each", "12–24 hours"],
            ["Duck legs", "225–340 g (8–12 oz) each", "18–24 hours"],
          ]}
        />
        <p>
          Keep the duck in its original wrapping and set it on a rimmed tray or plate on the
          lowest fridge shelf so any drip cannot reach or drop onto other food. Once thawed, a
          whole duck keeps safely in the refrigerator for an additional 1–2 days before cooking;
          treat that window as a buffer, not a target.
        </p>
      </Section>

      <Section id="cold-water" heading="Cold-water method, done correctly">
        <p>
          If you're thawing faster than the fridge allows, cold water works, but only inside a
          fully sealed leak-proof bag or its original airtight packaging — submerging duck
          directly in water lets bacteria in and washes flavour and texture out. Submerge the
          sealed bird in cold tap water and change the water every 30 minutes to keep it cold as
          it draws heat from the duck. A whole duck typically thaws this way in 3–6 hours depending
          on weight; breasts and legs take under an hour. The critical rule: anything thawed in
          cold water must be cooked immediately afterward, not returned to the fridge for later.
        </p>
      </Section>

      <Section id="microwave" heading="Microwave thawing caveats">
        <p>
          A microwave's defrost setting can thaw duck pieces quickly, but it thaws unevenly and
          often begins cooking the edges before the centre is thawed — which is why it is a last
          resort, and a poor one for a whole bird.
          <SourceMark to="sources" /> If you do use it, cook the duck
          immediately afterward — never let microwave-thawed poultry sit before cooking.
        </p>
      </Section>

      <Section id="never-do" heading="What never to do">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">Never thaw on the counter.</span> Room
            temperature lets the outer layers of the duck sit in the 40–140°F (4–60°C) danger zone
            for hours before the centre is even thawed.
          </li>
          <li>
            <span className="font-semibold text-foreground">Never thaw in hot water.</span> It
            speeds surface warming into unsafe territory long before the inside catches up.
          </li>
          <li>
            <span className="font-semibold text-foreground">Never thaw in a warm garage, porch or car.</span>{" "}
            These spaces are rarely a controlled cold temperature and vary with the weather outside.
          </li>
        </ul>
      </Section>

      <Section id="refreezing" heading="Refreezing rules">
        <p>
          Duck thawed in the refrigerator can be safely refrozen raw, though texture suffers a
          little with each freeze-thaw cycle. Duck thawed by the cold-water or microwave method
          must be cooked before it is refrozen, since those methods bring parts of the bird into
          the danger-zone temperature range and refreezing raw afterward is not considered safe.
        </p>
      </Section>

      <Section id="how-long-keeps" heading="How long thawed duck keeps">
        <p>
          Once fully thawed in the refrigerator, raw duck keeps for 1–2 days before it should be
          cooked. Cooked duck, once cooled and refrigerated, keeps for 3–4 days. If you won't cook
          a thawed bird within that window, it's safer to cook and then refrigerate or freeze the
          cooked meat than to hold it raw any longer.
        </p>
      </Section>

      <Section id="mail-order" heading="If the duck is arriving by post">
        <p>
          A mail-order bird makes the thaw a scheduling problem rather than a same-day one, because
          the delivery date is not the cooking date. Build the calendar backward: cooking date, minus
          the refrigerator thaw time above, minus the seller's stated transit window, minus one
          buffer day for a courier that runs late. That last date is when you order.
        </p>
        <p>
          Do not start counting thaw time from the moment the box arrives — count from the moment the
          bird is actually in your refrigerator at 40°F (4.4°C) or below. For what to check on arrival
          before any of this applies, see{" "}
          <Link to="/buy/fresh-vs-frozen-duck" className="text-primary underline underline-offset-4">
            fresh versus frozen duck
          </Link>
          , which covers receiving a cold-chain delivery.
        </p>
      </Section>


      <Callout label="Planning shortcut">
        <p>
          Work backward from your roast date using{" "}
          <Link to="/tools/duck-cooking-time-planner" className="text-primary underline underline-offset-4">
            the cooking-time planner
          </Link>{" "}
          for the roast itself, and add the refrigerator thaw time above before that. For a 2.7 kg
          (6 lb) bird, that means starting the thaw roughly two days before you plan to cook it.
        </p>
      </Callout>

      <FaqList items={FAQ} />

      <SourceNotes ids={["usdaThawing", "usdaDangerZone", "usdaPoultryPrep"]} />

      <ConversionPaths
        sourcePath="/learn/how-to-thaw-duck"
        eyebrow="Before the thaw"
        intro="How the bird reached you shapes the thaw plan."
      />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
