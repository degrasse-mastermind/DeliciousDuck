import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Callout, DataTable, FaqList, Section } from "@/components/site/ArticleShell";
import { AnswerFirst, ArticleBasis, ArticleByline } from "@/components/site/AcquisitionArticle";
import { DecisionNextSteps } from "@/components/site/DecisionGuide";
import { VerdictChoice } from "@/components/site/VerdictChoice";
import { SketchSlot } from "@/components/site/SketchSlot";
import { SKETCH } from "@/lib/sketch-art";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SafetyNote } from "@/components/site/SafetyNote";
import { SourceMark } from "@/components/site/SourceMark";
import { SourceNotes } from "@/components/site/SourceNotes";
import { acquisitionPage } from "@/data/acquisition-cluster";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
import { ConversionPaths } from "@/components/site/ConversionPaths";
import { ThanksgivingHubLink } from "@/components/site/ThanksgivingPlan";
import { THANKSGIVING_INBOUND_PLACEMENTS } from "@/data/thanksgiving-hub";

const GUIDE = guideByPath("/learn/duck-vs-turkey-thanksgiving")!;
const PAGE = acquisitionPage("/learn/duck-vs-turkey-thanksgiving")!;

export const Route = createFileRoute("/learn/duck-vs-turkey-thanksgiving")({
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
          updated: PAGE.updated,
        }),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: Page,
});

const FAQ = [
  {
    q: "How many people does one duck feed at Thanksgiving?",
    a: "Fewer than a turkey of the same weight, because more of a duck is fat and frame. We will not put a fixed ratio on it: give your guest count to our whole-duck serving calculator, which shows the planning assumptions behind its answer and returns the number of birds and the raw weight to order. Turkey is the easier maths — the official allowance from USDA is 1 lb of turkey per person.",
  },
  {
    q: "Which takes longer in the oven, a whole duck or a whole turkey?",
    a: "The turkey, almost always, because it is a much heavier bird. For planning, a whole duckling of 4 to 6 lb sits at roughly 30 to 35 min/lb in a 350°F oven; an unstuffed turkey at 325°F runs approximately 2¾ to 3 hours at 8 to 12 pounds and approximately 4½ to 5 hours at 20 to 24 pounds. Use those to pick a serving time only. The bird is done at 165°F (73.9°C) on a thermometer, whatever the clock says.",
  },
  {
    q: "Can I cook duck and turkey in the same oven?",
    a: "You can, but not comfortably at the same time. Both birds want air around them, the two planning charts assume different oven settings, and a duck sheds a lot of fat that has to go somewhere. If you want both, time the duck so its 20-minute rest lands inside the turkey's last stretch of cooking or its own rest, and carve the duck last. If the two schedules will not meet there, use a second oven or serve portioned duck — breasts or confit legs — rather than leaving a whole cooked duck standing for a long wait.",
  },
  {
    q: "Does duck need a different internal temperature than turkey?",
    a: "No. All poultry, duck and turkey alike, has the same safe minimum internal temperature: 165°F (73.9°C), read with a thermometer in the thickest part of the meat and away from bone. The lower numbers you see quoted for duck breast are a culinary convention rather than a safety figure, and they are a separate question from a whole holiday bird.",
  },
  {
    q: "Is duck harder to carve than turkey?",
    a: "A different shape, not a harder job. A duck is narrower and its breast sits close to the frame, so you take the legs off at the joint and lift each breast off in one piece rather than carving broad slices off a standing bird. Our carving guide has the order that keeps the skin intact. Either bird carves better rested — a 20-minute stand is the standard advice for a whole turkey, and duck likes the same pause.",
  },
  {
    q: "Can you make gravy from duck drippings?",
    a: "Yes, but the drippings behave differently. Most of what collects in a duck pan is clear rendered fat, which you pour off and keep rather than thicken; the gravy comes from the smaller layer of browned juices underneath, loosened with stock or wine. A turkey pan gives you far more of that juice-to-fat ratio, which is why turkey gravy is the easier default. With duck we would build a sauce around acidity or tart fruit rather than chase a thick roux gravy.",
  },
  {
    q: "Can I stuff the cavity of a duck or a turkey?",
    a: "Cook it separately if you can. USDA recommends cooking stuffing separately, in a casserole, for optimal safety and more even doneness, and the duck planning chart says not to stuff a whole duckling at all. If you do stuff a bird, pack it loosely just before it goes in, and check that the center of the stuffing itself reaches 165°F (73.9°C) — not only the meat. Stuffing below that when the bird is done needs more cooking.",
  },
  {
    q: "Is duck harder to cook than turkey?",
    a: "Different, not harder. Duck is forgiving about moisture, because the fat layer bastes the meat as it renders, and demanding about logistics: score the skin, drain the fat as it collects, dry the skin a day ahead if you want it crisp. Turkey is the reverse — easy to manage, easy to overcook.",
  },
  {
    q: "Which gives better leftovers?",
    a: "Turkey gives more of them. Duck gives fewer but arguably better ones, plus two by-products a turkey does not: a jar of rendered fat for roast potatoes and a carcass that makes a deeply savoury stock. Either way, cooked poultry keeps three to four days in the refrigerator and is reheated to 165°F (73.9°C).",
  },
  {
    q: "When should I order a duck for Thanksgiving?",
    a: "Earlier than feels necessary. Holiday duck usually ships frozen, and thawing lands on your calendar rather than the seller's. Count backwards from the meal: allow approximately 24 hours of refrigerator thawing for every 4 to 5 lb of bird, then the transit window your seller quotes, then a spare day in case it slips.",
  },
];


function Page() {
  return (
    <ArticleShell
      eyebrow="Learn · Whole duck"
      title={GUIDE.title}
      intro="Duck is not a smaller turkey. It is a different centrepiece for a different table and a different menu — so this compares them on the things you can actually observe in a kitchen: how each one eats, how it scales, what it does to your oven, and what you are left with on Friday."
      trail={[
        { name: "Learn", to: "/learn" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
      /* This page sequences its own art: the header carries the duck-and-turkey
         comparison drawing, and the only in-body illustration is the
         thermometer, placed with the safety section. Blind block-index
         auto-placement would drop unrelated art (scoring, ducks in flight)
         into a comparison argument. */
      autoSketch={false}
    >
      <AnswerFirst page={PAGE} />

      <ArticleByline page={PAGE} />

      <Section id="verdict" heading="The verdict, before the detail">
        <p>
          Start by dropping the word “substitute”. A duck does not do a turkey's job in a smaller
          package: it is a darker, richer, fattier bird that changes the sauce, the sides and the
          shape of the meal around it. Treat it as its own centrepiece and it is a genuinely good
          holiday dinner. Treat it as a turkey stand-in and you will spend the day comparing it with
          something it was never trying to be.
        </p>
        <p>
          The practical difference is how they scale. Turkey scales by weight: bigger table, heavier
          bird, and an official allowance from USDA of 1 lb of turkey per person to shop with.
          <SourceMark to="timing-sources" /> Duck scales by count. It carries less edible meat for
          its weight and has no equivalent published allowance, so a bigger table means another
          bird — another share of the rack, another pan, another place for fat to go.
        </p>

        <Callout label="Choose duck if">
          <p>
            The table is small enough to be fed comfortably by the birds your oven can hold, you want
            a centrepiece that eats like a restaurant dish rather than a tradition, and the words
            “crisp skin and rendered fat” sound like a feature rather than a chore.
          </p>
        </Callout>
        <Callout label="Choose turkey if" tone="gold">
          <p>
            The table is large, some guests would notice and mind if the bird were not turkey, you
            want sandwiches for days, or your oven and your side dishes are already fighting for
            space.
          </p>
        </Callout>
        <p>
          There is also a middle route that we like more than either extreme: keep a turkey as the
          anchor if the crowd came for the ritual, and add duck as a portioned course — seared breast
          or made-ahead legs — rather than a second whole bird. It is the version of this decision
          that upsets the fewest people.
        </p>
      </Section>


      <VerdictChoice
        id="verdict-next-step"
        heading="Made the call? Start here"
        options={[
          {
            label: "Going with duck",
            summary:
              "Settle the number of birds first, then follow the holiday roast through from dry skin to carving.",
            links: [
              {
                placement: "duck-vs-turkey-verdict-serving-calculator",
                to: "/tools/whole-duck-serving-calculator",
                intent: "technique_validation",
                anchor: "Whole-duck serving calculator",
                why: "Guest count in, number of birds and raw weight out, with the assumptions shown.",
              },
              {
                placement: "duck-vs-turkey-verdict-whole-roast-duck",
                to: "/cook/whole-roast-duck",
                intent: "technique_validation",
                anchor: "How to roast a whole duck",
                why: "The full holiday workflow, including what to do with the rendering fat.",
              },
            ],
          },
          {
            label: "Larger or mixed table",
            summary:
              "Turkey stays the practical centrepiece when the table is big or the guests came for the ritual — duck can still join it as a second bird or a portioned cut.",
            tone: "muted",
            links: [
              {
                placement: "duck-vs-turkey-verdict-duck-breast",
                to: "/cook/how-to-cook-duck-breast",
                intent: "technique_validation",
                anchor: "Duck breast, cooked to order",
                why: "A portioned duck course alongside the turkey, finished in minutes on the stove.",
              },
              {
                placement: "duck-vs-turkey-verdict-duck-legs",
                to: "/cook/duck-leg-confit",
                intent: "technique_validation",
                anchor: "Duck legs, made ahead",
                why: "Confit legs can be cooked days early and crisped while the turkey rests.",
              },
            ],
          },
        ]}
      />

      <Section id="compare" heading="Side by side, honestly">
        <DataTable
          caption="Duck and turkey compared on the factors a home cook actually feels"
          columns={["Factor", "Duck", "Turkey"]}
          rows={[
            [
              "Flavour",
              "Dark, rich, faintly gamey; closer to red meat than to chicken. Stands up to fruit, acid and warm spice.",
              "Mild and neutral. Carries gravy, brine and stuffing rather than competing with them.",
            ],
            [
              "Texture",
              "Two textures in one bird: firm breast meat and soft, silky leg meat, under skin that can be genuinely crisp.",
              "Uniform and lean, with breast and leg finishing at different moments — the classic dry-breast problem.",
            ],
            [
              "Serving yield",
              "Lower. More fat and frame relative to edible meat, so plan the count with our serving calculator rather than by bird size.",
              "Higher, and easier to shop for: the official allowance is a pound of turkey per person, so one large bird covers a big table.",
            ],

            [
              "Oven and logistics",
              "Sheds a great deal of fat that must be drained or managed; wants dry skin and a rack. Rewards attention.",
              "Long, mostly unattended roast, but occupies the oven for hours and dominates the schedule.",
            ],
            [
              "Cost and availability",
              "Often a speciality order, frequently frozen and shipped. We publish no prices — check your own sellers.",
              "Widely stocked in season. Again, we publish no prices.",
            ],
            [
              "Leftovers",
              "Fewer, plus two by-products: rendered fat and a carcass for stock.",
              "Plenty, and they carry well into sandwiches, soup and hash.",
            ],
            [
              "Guest familiarity",
              "Unexpected. Delightful to most, a hard no for a few — ask first if the group is fixed on tradition.",
              "Expected. Nobody has to be talked into it.",
            ],
            [
              "Who should choose it",
              "Small tables, confident cooks, anyone who cares more about the eating than the volume.",
              "Large tables, first-time hosts, and anyone cooking for guests who came for the ritual.",
            ],
          ]}
        />
      </Section>

      <Section id="yield" heading="Serving capacity is the decision, not the flavour">
        <p>
          Most duck Thanksgivings go wrong at the shopping stage. A whole duck looks like a small
          turkey and behaves like a large chicken with a fat layer: the frame is heavy and the fat
          cap is substantial, so a duck simply carries less edible meat than a turkey that weighs
          about the same. Buy for the meat you will actually carve, not for the number on the label.
        </p>
        <p>
          Turkey has an official number to lean on: 1 lb of turkey per person, from USDA's consumer
          guide.<SourceMark to="timing-sources" /> Duck has no published equivalent, and we are not
          going to invent one. Put your guest count and appetite into the{" "}
          <Link
            to="/tools/whole-duck-serving-calculator"
            className="text-primary underline underline-offset-4"
          >
            whole-duck serving calculator
          </Link>
          instead: it states the planning assumptions behind its answer and returns the number of
          birds and the raw weight to order. If you are weighing a whole bird against portioned
          cuts, our{" "}
          <Link to="/buy/how-much-duck-per-person" className="text-primary underline underline-offset-4">
            how much duck per person
          </Link>{" "}
          guide sets the same assumptions out in prose. Both are our planning estimates, not
          established fact.
        </p>

        <Callout label="Two birds, one oven">
          <p>
            Two ducks roast happily side by side if air can circulate between them and the fat has
            somewhere to go. What they cannot do is share the oven with a turkey and three trays of
            sides at the same temperature.
          </p>
        </Callout>
      </Section>

      <Section id="timing" heading="Oven time, and the space each bird needs">
        <p>
          Here is what each bird asks of your afternoon. These are planning numbers, not doneness
          rules: either bird is done when a thermometer reads 165°F (73.9°C) in the thickest part of
          the meat, away from bone.<SourceMark to="timing-sources" />
        </p>
        <DataTable
          caption="Approximate planning ranges for whole birds — scheduling only"
          columns={["Bird", "Oven", "Approximate range"]}
          rows={[
            [
              "Whole duckling, 4 to 6 lb",
              "350°F",
              "Approximately 30 to 35 min/lb. Do not stuff a whole duckling.",
            ],
            [
              "Unstuffed turkey, 8 to 12 pounds",
              "325°F or higher",
              "Approximately 2¾ to 3 hours.",
            ],
            [
              "Unstuffed turkey, 20 to 24 pounds",
              "325°F or higher",
              "Approximately 4½ to 5 hours.",
            ],
          ]}
        />
        <p>
          Read across the rows and the real difference shows up: scaling a turkey costs time in the
          same pan, while scaling a duck dinner costs hardware. Before you promise duck to a big
          table, measure your rack and count the roasting pans you actually own.
        </p>
        <SourceNotes
          ids={["usdaPoultryPrep", "usdaTurkeyRoasting"]}
          id="timing-sources"
          heading="Timing references"
        />
      </Section>

      <Section id="method" heading="Why our roast runs in two stages">
        <p>
          The range above assumes one oven temperature start to finish. Our own{" "}
          <Link to="/cook/whole-roast-duck" className="text-primary underline underline-offset-4">
            whole roast duck
          </Link>{" "}
          method runs in two: a gentler stretch to render the fat cap without setting the skin, then
          a hot finish to crisp it. That is a texture preference, a recipe method — not a safety
          alternative to the planning chart, which is right about what it measures.
        </p>
        <p>
          Change the oven temperature partway and the clock stops matching the chart. Use the range
          to choose a serving time, then let the thermometer say when the bird comes out; our{" "}
          <Link to="/learn/whole-duck-cooking-time" className="text-primary underline underline-offset-4">
            whole duck cooking time
          </Link>{" "}
          guide explains where weight-based planning and temperature-based doneness diverge.
        </p>
      </Section>

      <Section id="menu" heading="Choosing duck changes the whole plate">
        <p>
          Turkey is a canvas. It is mild enough that the gravy, the stuffing, the brine and the herbs
          carry the flavour, which is precisely why the classic Thanksgiving plate looks the way it
          does. Duck turns up already loud, and the sides have a different job: not more richness,
          but something to cut it.
        </p>
        <p>
          This is editorial pairing guidance rather than food-safety advice. Reach for tart citrus, a
          vinegar-dressed vegetable, bitter or peppery greens, a briny or savoury condiment on the
          side, and keep any sweetness restrained so the plate does not tip into dessert. Then use
          the bird twice: the fat you pour off mid-roast is the best thing that can happen to a tray
          of potatoes. Start with our{" "}

          <Link
            to="/ingredients/best-acid-for-duck"
            className="text-primary underline underline-offset-4"
          >
            acid pairing guide
          </Link>
          ,{" "}
          <Link
            to="/cook/best-sauces-for-duck-breast"
            className="text-primary underline underline-offset-4"
          >
            duck sauces
          </Link>{" "}
          and{" "}
          <Link
            to="/cook/what-to-serve-with-duck-breast"
            className="text-primary underline underline-offset-4"
          >
            what to serve with duck
          </Link>
          . These guides offer practical combinations for building the rest of the plate. A

          gravy-and-stuffing spread can still work around a duck, but it will read as two competing
          dinners unless something sharp lands on the plate.

        </p>
        <p>
          Duck can feel every bit as celebratory as turkey without imitating the turkey plate. Design
          the meal around the bird you chose — a smaller centrepiece, brighter sides, potatoes cooked
          in duck fat — and nobody spends the afternoon looking for the gravy boat.
        </p>
        <SourceNotes
          ids={["fwTurkeyAlternatives", "epicuriousCrispRoastDuck"]}
          id="menu-reading"
          heading="Culinary reading"
        />
      </Section>

      <Section id="sides" heading="Two holiday sides that carry a duck dinner">
        <p>
          If you build only two things around the bird, build these. Between them they use the fat
          the duck gives you and supply the sharpness it needs, which is most of what a duck menu
          asks for.
        </p>
        <ul className="mt-4 list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">Duck-fat roast potatoes.</span> Pour the
            clear rendered fat off the pan mid-roast, parboil floury potatoes until the edges just
            turn fluffy, rough them up in the colander, then roast them hard in that fat until the
            crust shatters. Salt at the end. It is the one side guests remember, and it costs you
            nothing but the fat you already collected — see{" "}
            <Link
              to="/learn/how-to-render-duck-fat"
              className="text-primary underline underline-offset-4"
            >
              how to render duck fat
            </Link>{" "}
            and{" "}
            <Link
              to="/cook/ways-to-use-duck-fat"
              className="text-primary underline underline-offset-4"
            >
              more ways to use it
            </Link>
            .
          </li>
          <li>
            <span className="font-semibold text-foreground">Vinegar-forward greens.</span> Bitter or
            peppery leaves — chicory, kale, escarole, shredded sprouts — wilted briefly or served
            raw, dressed while still warm with a dressing that leans further into acid than you
            normally would. Sherry or cider vinegar, a little mustard, restrained oil. Against rich
            duck a polite vinaigrette disappears, so make it bracing; our{" "}
            <Link
              to="/ingredients/best-acid-for-duck"
              className="text-primary underline underline-offset-4"
            >
              acid pairing guide
            </Link>{" "}
            covers which vinegars and citrus hold up.
          </li>
        </ul>
        <p className="mt-4">
          Keep the rest of the table simple around them: something tart with fruit if you want a
          third dish, and one savoury or briny accent. For a fuller spread,{" "}
          <Link
            to="/cook/what-to-serve-with-duck-breast"
            className="text-primary underline underline-offset-4"
          >
            what to serve with duck
          </Link>{" "}
          runs through the combinations we cook most often.
        </p>
      </Section>


      <Section id="alternatives" heading="You do not have to roast a whole bird">
        <p>
          A whole bird is the default holiday image, not a requirement. If the table is small, the
          oven is already full, or you simply do not want to manage a whole roast on the day, duck
          gives you two escapes a turkey does not offer as neatly.
        </p>
        <ul className="mt-4 list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">Duck breast, portioned.</span> Cooked on
            the stovetop and finished to your preferred doneness, it frees the oven entirely and is
            served in slices rather than carved at the table. See{" "}
            <Link
              to="/cook/how-to-cook-duck-breast"
              className="text-primary underline underline-offset-4"
            >
              how to cook duck breast
            </Link>{" "}
            and the{" "}
            <Link
              to="/recipes/$slug"
              params={{ slug: "pan-seared-duck-breast" }}
              className="text-primary underline underline-offset-4"
            >
              pan-seared duck breast recipe
            </Link>
            .
          </li>
          <li>
            <span className="font-semibold text-foreground">Legs, made ahead.</span> Confit legs can
            be cooked days in advance and crisped while everything else rests, which turns the
            centrepiece into a reheating job on the day. See{" "}
            <Link to="/cook/duck-leg-confit" className="text-primary underline underline-offset-4">
              duck leg confit
            </Link>{" "}
            and the{" "}
            <Link
              to="/recipes/$slug"
              params={{ slug: "duck-leg-confit" }}
              className="text-primary underline underline-offset-4"
            >
              confit recipe
            </Link>
            .
          </li>
          <li>
            <span className="font-semibold text-foreground">Or the whole bird anyway.</span> If the
            presentation is the point, our{" "}
            <Link
              to="/recipes/$slug"
              params={{ slug: "roasted-whole-duck" }}
              className="text-primary underline underline-offset-4"
            >
              roasted whole duck recipe
            </Link>{" "}
            is the version we cook.
          </li>
        </ul>
        <p>
          Turkey has portioned routes too — a breast joint, or legs braised separately — so this is
          not a case of one bird being flexible and the other not. What differs is that duck's
          portioned cuts are the ones most home cooks are already comfortable buying and cooking.
        </p>
      </Section>

      <Section id="framework" heading="Duck alongside turkey, or duck instead of turkey">
        <p>
          Most hosts asking this question are really choosing between three plans, and the deciding
          factors are your kitchen and your guests rather than any number we could publish.
        </p>
        <ul className="mt-4 list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">Turkey, as the anchor.</span> One oven, a
            large or tradition-minded crowd, and a menu already built around gravy and stuffing.
            Adding a duck here mostly costs you oven space you do not have.
          </li>
          <li>
            <span className="font-semibold text-foreground">Duck, instead.</span> A smaller or
            adventurous table, or more than one oven, plus a willingness to rethink the sides. This is
            where duck stops being a novelty and becomes the better dinner.
          </li>
          <li>
            <span className="font-semibold text-foreground">Both, unevenly.</span> A mixed table is
            best served by a turkey anchor plus duck breast or legs — not a second whole bird. You get
            the ritual and the interesting plate without doubling the roasting hardware.
          </li>
        </ul>
        <p>
          Whichever plan you pick, settle the quantity before you shop: turkey against the per person
          allowance above, duck through the{" "}
          <Link
            to="/tools/whole-duck-serving-calculator"
            className="text-primary underline underline-offset-4"
          >
            serving calculator
          </Link>{" "}
          and its stated assumptions.
        </p>
      </Section>



      <Section id="logistics" heading="What each bird does to your day">
        <p>
          Turkey is a scheduling problem: it is large, it is slow, and it owns the oven. Duck is an
          attention problem: it needs its skin dried in advance, its fat drained during the roast,
          and a rest before carving. Neither is harder in the abstract — they simply demand
          different things from you.
        </p>
        <ul className="mt-4 list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">Thawing is calendar, not cooking.</span>{" "}
            Three methods are considered safe — refrigerator, cold water and microwave — and the
            fridge needs approximately 24 hours of refrigerator thawing for every 4 to 5 lb of bird.
            <SourceMark to="safety-sources" /> Our{" "}
            <Link to="/learn/how-to-thaw-duck" className="text-primary underline underline-offset-4">
              thawing guide
            </Link>{" "}
            has the weight-based times and the cold-water fallback.
          </li>

          <li>
            <span className="font-semibold text-foreground">Dry skin beats any basting trick.</span>{" "}
            An uncovered day in the refrigerator does more for duck skin than anything you can do in
            the oven. The full method is on our{" "}
            <Link to="/cook/whole-roast-duck" className="text-primary underline underline-offset-4">
              whole roast duck
            </Link>{" "}
            page.
          </li>
          <li>
            <span className="font-semibold text-foreground">Plan for the fat.</span> Rendered duck
            fat is a prize, not a mess, but it needs a heatproof container and a plan for when you
            pour it off mid-roast.
          </li>
          <li>
            <span className="font-semibold text-foreground">Finish by thermometer, not by clock.</span>{" "}
            Weight-based ranges are for planning only; see{" "}
            <Link
              to="/learn/whole-duck-cooking-time"
              className="text-primary underline underline-offset-4"
            >
              whole duck cooking time
            </Link>{" "}
            for the ranges and{" "}
            <Link
              to="/gear/best-thermometer-for-duck"
              className="text-primary underline underline-offset-4"
            >
              choosing a thermometer
            </Link>{" "}
            for the one tool this decision genuinely requires.
          </li>
          <li>
            <span className="font-semibold text-foreground">Rest, then carve.</span> Both birds
            carve better rested; a 20-minute stand before carving is the standard for a whole
            turkey, for quality rather than safety, and duck benefits from the same pause. Our{" "}
            <Link to="/learn/how-to-carve-a-duck" className="text-primary underline underline-offset-4">
              carving guide
            </Link>{" "}
            takes it apart in the order that keeps the skin intact.
          </li>
          <li>
            <span className="font-semibold text-foreground">Order early, then buffer.</span> Holiday
            duck is usually a speciality order that ships frozen, so the seller's stated transit
            window is part of your timeline, not an afterthought. Add a spare day for a late delivery
            before you count backwards from the meal.
          </li>
          <li>
            <span className="font-semibold text-foreground">Check the refrigerator, not just the
            oven.</span> A thawing bird needs a tray on a low shelf for a day or more, and a duck you
            are drying wants to sit uncovered. Two ducks take up roughly twice that space, at exactly
            the time of year the refrigerator is fullest.
          </li>
          <li>
            <span className="font-semibold text-foreground">Count your pans.</span> Each bird needs a
            pan deep enough to hold the fat it renders and a rack that keeps it out of that fat. This
            is the practical ceiling on a duck holiday: hardware, not appetite.
          </li>
        </ul>

        <Callout label="Plan backwards from the meal">
          <p>
            Serving time, then: rest before carving; roast, using the approximate ranges above only to
            pick a start time; final skin-drying in the refrigerator if you are roasting duck;
            refrigerator thawing at approximately 24 hours per 4 to 5 lb; delivery, plus the transit
            window your seller quotes; and a buffer day before that. Order on the date that falls out
            of the bottom of that list, not the date that feels early enough.
          </p>
        </Callout>
      </Section>

      <Section id="constraints" heading="Choose by constraint">
        <p>
          If the comparison table did not settle it, work down your own constraints instead. This is
          our editorial read of the tradeoffs, not a scoring system.
        </p>
        <DataTable
          caption="Which bird each constraint points towards"
          columns={["Constraint", "Points to duck", "Points to turkey"]}
          rows={[
            [
              "Guest familiarity",
              "Guests who enjoy being surprised, or a table you cook for often enough to experiment with.",
              "A fixed crowd that came for the tradition, or guests who would quietly mind the change.",
            ],
            [
              "Oven capacity",
              "A second oven, or a table small enough for the birds and pans you already own.",
              "One oven that also has to handle the sides — a single larger bird is the simpler occupant.",
            ],
            [
              "Desired leftovers",
              "You would rather have a jar of rendered fat and a stock carcass than a stack of cold slices.",
              "Sandwiches and soup for the rest of the week are part of the point of the holiday.",
            ],
            [
              "Menu richness",
              "You are happy to build sides around acidity, tart fruit and bitter greens.",
              "You want the classic gravy-and-stuffing spread to stay exactly as it is.",
            ],
            [
              "Presentation",
              "A compact, restaurant-looking centrepiece, or elegant slices plated in the kitchen.",
              "The big carve-at-the-table moment, which a heavier bird simply does better.",
            ],
            [
              "Cooking methods available",
              "Stovetop searing or make-ahead confit can take the centrepiece off the oven entirely.",
              "A long, mostly unattended roast fits a day where you cannot stand over the stove.",
            ],
          ]}
        />
      </Section>



      <Section id="safety" heading="The numbers worth being strict about">
        <p>
          Species does not move the target. Whichever bird you roast, doneness is a thermometer
          reading in the thickest part of the meat, away from bone — never a colour or a clock.
        </p>
        <SafetyNote>
          <p>
            All poultry, duck and turkey alike, has a safe minimum internal temperature of 165°F
            (73.9°C). The turkey-specific figures on this page — the 1 lb of turkey per person
            allowance, refrigerator thawing at approximately 24 hours per 4 to 5 lb, and the
            20-minute stand — come from USDA's consumer guide, not from a timing of ours. Full
            references are below.
          </p>
        </SafetyNote>
        <p>
          Two more rules travel with any holiday meal. Perishable food should not sit between 40°F
          and 140°F (4.4°C and 60°C) for longer than two hours — one hour if the room is above 90°F
          (32.2°C). And cooked poultry keeps three to four days in the refrigerator, reheated to
          165°F (73.9°C).
        </p>
        <SourceNotes ids={PAGE.sourceIds} id="safety-sources" heading="Safety references" />

        <SketchSlot
          art={SKETCH.thermometer}
          context="articleBreak"
          height="short"
          caption="Doneness is a thermometer reading in the thickest part of the meat, away from bone — the same target for either bird."
          className="mt-8"
        />
      </Section>

      <Section id="leftovers" heading="Friday, and what you actually want on it">
        <p>
          If leftovers are the point of the holiday for you, turkey wins on volume and that is not a
          close call. Duck answers differently: less cold meat, but shredded leg for a hash, a jar
          of fat that turns roast potatoes into the best thing on the table for a month, and a
          carcass worth simmering the same evening.
        </p>
        <p>
          Refrigerate leftovers promptly instead of leaving the platter out through the evening. They
          keep three to four days, reheated to 165°F (73.9°C); freeze whatever you will not finish in
          that window.
        </p>
      </Section>

      <Section id="tradeoffs" heading="The honest tradeoffs">
        <p>
          Duck's weaknesses are real. Fewer plates per bird, an order placed in advance, a thaw on
          schedule, more of your attention during the roast — and a few guests who simply do not want
          a rich dark-meat centrepiece at this particular meal. Turkey's are just as real: a lean
          breast that punishes inattention, hours of oven occupation, and a flavour that depends
          almost entirely on what you put around it.
        </p>
        <p>
          What we cannot tell you is which is cheaper or easier to find where you live. Duck pricing
          and holiday availability vary too much by region and season for us to publish a figure we
          have not verified, so treat cost as a question for your own sellers — our{" "}
          <Link
            to="/buy/where-to-buy-duck-online"
            className="text-primary underline underline-offset-4"
          >
            where to buy duck
          </Link>{" "}
          guide is a framework for judging them, not a price list.
        </p>
        <ThanksgivingHubLink placement={THANKSGIVING_INBOUND_PLACEMENTS.duckVsTurkey}>
          If duck is the call, the planning is a separate job: order date, thaw schedule, a
          single-oven order of play, a printable checklist and a menu built against the richness.
          That all lives in our
        </ThanksgivingHubLink>
      </Section>

      <ArticleBasis page={PAGE} />

      <DecisionNextSteps
        heading="Next steps"
        intro="Settle the number of birds first, then the workflow, then the order date."
        items={PAGE.funnel}
      />

      <ConversionPaths
        sourcePath="/learn/duck-vs-turkey-thanksgiving"
        eyebrow="Holiday planning"
        heading="Order the bird early enough to thaw"
        intro="Sourcing is the first item on a holiday timeline, not the last."
      />

      <FaqList items={FAQ} />

      <SourceNotes ids={PAGE.sourceIds} />

      <div className="mt-16">
        <NewsletterSignup id="duck-vs-turkey-thanksgiving" interest="whole-duck" />
      </div>

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
