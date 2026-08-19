import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArticleShell,
  Callout,
  DataTable,
  FaqList,
  Section,
} from "@/components/site/ArticleShell";
import { AnswerFirst, ArticleBasis, ArticleByline } from "@/components/site/AcquisitionArticle";
import { DecisionNextSteps } from "@/components/site/DecisionGuide";
import {
  ThanksgivingCommercialModule,
  ThanksgivingLeftovers,
  ThanksgivingPlan,
  ThanksgivingPrintablePlan,
  ThanksgivingTableChoice,
} from "@/components/site/ThanksgivingPlan";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SafetyNote } from "@/components/site/SafetyNote";
import { SourceNotes } from "@/components/site/SourceNotes";
import { SKETCH } from "@/lib/sketch-art";
import { acquisitionPage } from "@/data/acquisition-cluster";
import { guideByPath } from "@/data/guides";
import { THANKSGIVING_HUB_PATH } from "@/data/thanksgiving-hub";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/learn/thanksgiving-duck-dinner")!;
const PAGE = acquisitionPage("/learn/thanksgiving-duck-dinner")!;

/**
 * Social preview image. The hub's own colored-pencil hero lives at a stable
 * project asset filename, and `pageMeta`/`articleSchema` route it through
 * `absUrl`, so og:image and twitter:image resolve to a durable production URL
 * rather than a preview-host screenshot.
 */
const SOCIAL_IMAGE = SKETCH.thanksgivingPlan.src;

const FAQ = [
  {
    q: "How far ahead should I order duck for Thanksgiving?",
    a: "Give yourself two to three weeks. That is long enough to check what a seller actually has in the size you want, confirm whether it arrives fresh or frozen, pick a delivery date you will be home for, and still leave two or three days of refrigerator thawing if it lands frozen. Aim for the delivery date and the cooking date to fall in different weeks, not different mornings.",
  },
  {
    q: "How many ducks do I need for Thanksgiving dinner?",
    a: "More birds than the same weight of turkey would suggest, because more of a duck is fat and frame. We will not put a fixed ratio on it: put your guest count into our whole-duck serving calculator, which shows the planning assumptions behind its answer and returns the number of birds and the raw weight to order. Tables of six and up usually mean two ducks, or one duck plus extra legs.",
  },
  {
    q: "What temperature is a whole Thanksgiving duck done at?",
    a: "165°F (73.9°C) in the thickest part of the thigh, away from bone — the safe minimum internal temperature for all poultry. For planning only, a whole duckling of 4 to 6 lb runs roughly 30 to 35 min/lb in a 350°F oven, and a whole duckling should not be stuffed. Cook the stuffing separately in a casserole.",
  },
  {
    q: "Can I roast a duck and a turkey in the same oven?",
    a: "You can, but not comfortably at once. Both birds want air around them, the two planning ranges assume different oven settings, and a duck sheds a lot of fat that needs somewhere to go. If you want both, roast the duck first, rest it while the turkey finishes, and carve the duck last.",
  },
  {
    q: "What do I serve with a Thanksgiving duck?",
    a: "Build the plate against the richness. Something tart — cranberry, cherry, or an orange-led sauce — plus a bitter green like chicory or braised greens, potatoes roasted in the fat you poured off the bird, and one savoury, briny accent such as pickles or olives. Keep the sweet dishes restrained; duck does not need candied everything the way a lean turkey breast does.",
  },
  {
    q: "How do I handle all the rendered fat?",
    a: "Pour it off as it collects rather than letting the bird sit in it, and keep it. Strained into a clean jar and refrigerated, it is the best roasting fat in your kitchen. For the holiday itself, roast the potatoes in duck fat earlier in the day — saved fat from an earlier bird, or a jar bought for the purpose — and re-crisp them uncovered while the duck rests. Fresh potatoes take most of an hour and will not cook in a 20-minute rest.",
  },
  {
    q: "How long can Thanksgiving duck sit out, and how long do leftovers keep?",
    a: "Perishable food should not sit between 40°F and 140°F (4.4°C and 60°C) for more than two hours — one hour if the room is above 90°F (32.2°C). Refrigerate cooked duck within that window; it keeps three to four days, reheated to 165°F (73.9°C).",
  },
  {
    q: "Should I dry-brine the duck the night before?",
    a: "Yes, if you want the skin to crisp. A salted bird, uncovered on a rack in the refrigerator overnight, dries the skin surface while it seasons the meat — and a dry surface is most of the crisping battle. It also removes one job from the morning, which on this particular day matters more than it sounds.",
  },
];

export const Route = createFileRoute("/learn/thanksgiving-duck-dinner")({
  head: () => ({
    ...pageMeta({
      title: GUIDE.seoTitle,
      description: GUIDE.description,
      path: GUIDE.path,
      ogType: "article",
      image: SOCIAL_IMAGE,
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
          updated: PAGE.updated,
          image: SOCIAL_IMAGE,
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
      eyebrow="Holiday planning"
      title={GUIDE.title}
      intro={GUIDE.teaser}
      trail={[
        { name: "Learn", to: "/learn" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <AnswerFirst page={PAGE} />
      <ArticleByline page={PAGE} />

      <ThanksgivingTableChoice />

      <Section id="countdown" heading="The countdown, working backward from dinner">
        <p>
          A duck holiday is easier than a turkey one in the oven and harder in the calendar. The bird
          arrives frozen, thaws slowly, and roasts fast — so the only part that goes wrong is the part
          you leave to the week itself. Fix the dates first and the day looks after itself.
        </p>
        <DataTable
          caption="Thanksgiving duck countdown"
          columns={["When", "What you do", "Why it sits here"]}
          rows={[
            [
              "Three weeks out",
              "Settle guest count and bird count",
              "Everything downstream — order size, oven space, thaw time — depends on this number",
            ],
            [
              "Two to three weeks out",
              "Order the duck",
              "Ordering early is what lets you verify size, format and delivery date instead of hoping",
            ],
            [
              "One week out",
              "Confirm pan, rack and fridge space",
              "A thawing bird and a loaded roasting pan both need room you may not have",
            ],
            [
              "Two to three days out",
              "Move the duck to the refrigerator",
              "Refrigerator thawing runs about 24 hours per 4 to 5 lb, and it cannot be rushed safely",
            ],
            [
              "The night before",
              "Salt the bird, uncovered on a rack",
              "A dry, seasoned skin surface is most of what makes it crisp",
            ],
            [
              "Roasting day, morning",
              "Back-time the oven from your serving hour",
              "Include the rest — carving into a bird straight from the oven costs you juice",
            ],
          ]}
        />
        <Callout label="One number to settle first">
          <p>
            Duck yields less meat per pound than turkey, so the guest count is a real decision rather
            than a formality. Settle it in <em>Choose your table first</em> above, where the
            calculator returns raw weight to order rather than a vague reassurance.
          </p>
        </Callout>
      </Section>

      <Section id="oven" heading="One oven, several dishes, a lot of fat">
        <p>
          The duck is not the hard part of the schedule; the sides are. A whole duckling of 4 to 6 lb
          runs roughly 30 to 35 min/lb at 350°F as a planning figure, which is short enough that the
          bird can go in after the dishes that need a hot oven and still land on time. Keep it on a
          rack so it is never sitting in what it renders, and pour that fat off into a heatproof jar
          as it collects.
        </p>
        <DataTable
          caption="A single-oven holiday order of play"
          columns={["Slot", "What's in the oven", "What you're doing meanwhile"]}
          rows={[
            [
              "Morning",
              "Potatoes: parboiled, then roasted in duck fat until nearly done",
              "Bird stays covered in the refrigerator; prep vegetables and make the sauce base",
            ],
            [
              "Mid-afternoon",
              "Anything else that bakes hot and holds",
              "Set the table, chill the drinks, pull the potatoes out and leave them on their tray",
            ],
            [
              "Two to three hours out",
              "The duck, on a rack",
              "Pour off fat as it collects, baste nothing",
            ],
            [
              "Final 30 minutes",
              "Duck, oven turned up to finish the skin",
              "Thermometer in the thigh, sauce finished",
            ],
            [
              "Rest, 20 minutes",
              "Potatoes back in, uncovered, for 10 to 12 minutes to re-crisp",
              "Carve at the end of the rest, not the start",
            ],
          ]}
        />
        <Callout label="The one honest catch about the potatoes">
          <p>
            Potatoes roasted in duck fat need most of an hour, so they cannot be started from raw
            during a 20-minute rest. Roast them earlier in the day and re-crisp them uncovered while
            the bird rests — that reheating window is the recipe's own. Doing it that way means using
            fat you saved from an earlier bird or a jar you bought, because <em>this</em> bird's fat
            only appears once it is in the oven. If you would rather use the fat from the duck in
            front of you, the honest options are to serve the potatoes fifteen or twenty minutes
            after the duck, or to pick a quicker side and save the fat for the weekend.
          </p>
        </Callout>
        <Callout label="Don't stuff a whole duckling">
          <p>
            Cook the stuffing separately in a casserole. A duck cavity is small, the bird cooks fast,
            and stuffing inside it finishes late and unevenly — which is the one part of this meal
            worth being strict about.
          </p>
        </Callout>
      </Section>

      <Section id="menu" heading="A menu built against the richness">
        <p>
          A turkey table needs flavour added to it. A duck table needs flavour set against it. That
          one difference rewrites the menu: less butter and cream, more acidity, tart fruit, bitter
          leaves, and something briny somewhere on the plate.
        </p>
        <DataTable
          caption="What earns its place next to duck"
          columns={["Role on the plate", "What to serve", "Why it works"]}
          rows={[
            [
              "The acid",
              "Cranberry with real tartness, sour cherry, or an orange-led sauce",
              "Cuts the fat and resets the palate between bites",
            ],
            [
              "The bitter",
              "Chicory, radicchio, braised greens, shaved fennel",
              "Bitterness reads as relief next to dark, rich meat",
            ],
            [
              "The starch",
              "Potatoes roasted in the fat you poured off the bird",
              "The best use of the by-product, and the dish guests remember",
            ],
            [
              "The savoury accent",
              "Pickles, olives, capers in a dressing, mustard on the side",
              "Salt and brine keep a rich plate from going flat",
            ],
            [
              "Restrained sweetness",
              "One sweet dish, not four",
              "Duck already reads luxurious; candied everything buries it",
            ],
          ]}
        />
        <p>
          If you want the sauce decided rather than debated, our{" "}
          <Link
            to="/ingredients/orange-with-duck"
            className="text-primary underline underline-offset-4"
          >
            orange-with-duck guide
          </Link>{" "}
          covers the gastrique route that keeps it tart, and{" "}
          <Link
            to="/ingredients/best-acid-for-duck"
            className="text-primary underline underline-offset-4"
          >
            best acid for duck
          </Link>{" "}
          is the short version for everything else.
        </p>
      </Section>

      <Section id="safety" heading="The numbers that are not negotiable">
        <p>
          Two of them decide the day: the thawing schedule and the finished temperature. Everything
          else on this page is planning.
        </p>
        <SafetyNote>
          <p>
            All poultry has a safe minimum internal temperature of 165°F (73.9°C), read in the
            thickest part of the thigh away from bone. Thaw in the refrigerator — about 24 hours per 4
            to 5 lb — never on the counter. Do not stuff a whole duckling. Perishable food should not
            sit between 40°F and 140°F (4.4°C and 60°C) for more than two hours, or one hour above
            90°F (32.2°C), and cooked duck keeps three to four days refrigerated, reheated to 165°F
            (73.9°C). Full references are below.
          </p>
        </SafetyNote>
        <p>
          The lower pull temperatures you see quoted for duck are a restaurant convention for a
          seared, pink <em>breast</em>, and they are a separate question from a whole holiday bird.
          For a centrepiece you are serving to a table of guests, use the thigh reading above and see{" "}
          <Link
            to="/learn/duck-breast-temperature-doneness"
            className="text-primary underline underline-offset-4"
          >
            duck breast temperature and doneness
          </Link>{" "}
          for where the two diverge.
        </p>
        <SourceNotes
          ids={PAGE.sourceIds}
          id="safety-sources"
          heading="Safety references"
        />
      </Section>

      <Section id="what-goes-wrong" heading="What actually goes wrong on the day">
        <p>
          Four failures account for nearly every disappointing holiday duck, and all four are
          scheduling problems wearing a cooking costume.
        </p>
        <DataTable
          caption="Holiday duck failures and their fixes"
          columns={["What happens", "Why", "The fix"]}
          rows={[
            [
              "Still frozen at the centre",
              "The thaw started a day too late",
              "Count back from dinner at roughly 24 hours per 4 to 5 lb, and add a buffer day",
            ],
            [
              "Soft, pale skin",
              "A wet surface went into the oven",
              "Salt uncovered on a rack overnight, pat dry, and finish hot",
            ],
            [
              "Smoking oven, greasy pan",
              "The bird sat in its own rendered fat",
              "Use a rack and pour the fat off into a jar as it collects",
            ],
            [
              "Dry breast, underdone legs",
              "Carved to the clock instead of a thermometer",
              "Read the thigh, rest 20 minutes, and take the legs off first when you carve",
            ],
          ]}
        />
      </Section>

      <Section id="duck-or-turkey" heading="Still deciding between duck and turkey?">
        <p>
          This page assumes you have chosen duck. If you have not, that is a genuinely different
          question — serving capacity, leftovers, guest expectations, and how much of your attention
          the oven gets. Our{" "}
          <Link
            to="/learn/duck-vs-turkey-thanksgiving"
            className="text-primary underline underline-offset-4"
          >
            duck versus turkey comparison
          </Link>{" "}
          settles it honestly, then sends you back here to plan.
        </p>
      </Section>

      <ThanksgivingPlan sourcePath={THANKSGIVING_HUB_PATH} />

      <ThanksgivingCommercialModule />

      <ThanksgivingLeftovers />

      <ThanksgivingPrintablePlan />

      <ArticleBasis page={PAGE} />

      <div data-print-hide>
        <DecisionNextSteps
        heading="Next steps"
        intro="Bird count first, then the order date, then the oven."
          items={PAGE.funnel}
        />
      </div>

      <FaqList items={FAQ} />

      <SourceNotes ids={PAGE.sourceIds} />

      <div data-print-hide className="mt-16">
        <NewsletterSignup id="thanksgiving_duck_dinner_hub" interest="whole-duck" />
      </div>

      <div data-print-hide>
        <RelatedGuides paths={GUIDE.related} />
      </div>
    </ArticleShell>
  );
}
