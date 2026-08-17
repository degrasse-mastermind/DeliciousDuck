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
import { SourceNotes } from "@/components/site/SourceNotes";
import { acquisitionPage } from "@/data/acquisition-cluster";
import { guideByPath } from "@/data/guides";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

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
    a: "Fewer than a turkey of similar size, because a duck carries more fat and bone relative to edible meat. We do not publish that as a fixed ratio: put your guest count and appetite into our whole-duck serving calculator, which shows the planning assumptions it uses and returns the number of birds and the raw weight to order. USDA's own turkey guide, by contrast, gives a planning allowance of 1 lb of turkey per person.",
  },
  {
    q: "Which takes longer in the oven, a whole duck or a whole turkey?",
    a: "The turkey, in almost every real holiday scenario, because it is a much heavier bird. USDA's approximate planning chart for duck lists a whole duckling of 4 to 6 lb at roughly 30 to 35 min/lb in a 350°F oven. USDA's turkey chart, at an oven set no lower than 325°F, lists an unstuffed bird of 8 to 12 pounds at approximately 2¾ to 3 hours and one of 20 to 24 pounds at approximately 4½ to 5 hours. Both charts are for meal planning only — doneness is a thermometer reading of 165°F (73.9°C), not a clock.",
  },
  {
    q: "Can I cook duck and turkey in the same oven?",
    a: "You can, but not comfortably at the same time. Both want space around them, the two USDA planning charts assume different oven settings, and a duck sheds a lot of rendering fat that has to go somewhere. If you want both birds, roast the duck first, rest it while the turkey finishes, and carve the duck last.",
  },
  {
    q: "Does duck need a different internal temperature than turkey?",
    a: "No. USDA guidance puts all poultry, duck and turkey alike, at a minimum internal temperature of 165°F (73.9°C), measured with a food thermometer in the thickest part and away from bone. The lower temperatures you see for duck breast are a culinary convention, not a safety recommendation, and they are a separate question from a whole roasted holiday bird.",
  },
  {
    q: "Is duck harder to carve than turkey?",
    a: "It is a different shape rather than a harder job. A duck is narrower and its breast sits closer to the frame, so you take the legs off at the joint and lift each breast off the bone in one piece instead of carving broad slices off a standing bird. Our carving guide walks through the order that keeps the skin intact; either bird carves better after a rest, and USDA's turkey guide asks for a 20-minute stand before carving for quality.",
  },
  {
    q: "Can you make gravy from duck drippings?",
    a: "Yes, but the drippings behave differently. Most of what collects in a duck pan is clear rendered fat, which you pour off and keep rather than thicken; the gravy comes from the smaller layer of browned juices underneath, loosened with stock or wine. A turkey pan gives you far more of that juice-to-fat ratio, which is why turkey gravy is the easier default. Editorially, we would build a duck sauce around acidity or tart fruit instead of chasing a thick roux gravy.",
  },
  {
    q: "Is it safe to stuff the cavity of a duck or a turkey?",
    a: "USDA recommends cooking stuffing separately, in a casserole, for optimal safety and more uniform doneness — and its duck planning chart says not to stuff a whole duckling. If you do stuff a bird, stuff it loosely just before roasting, and use a food thermometer to confirm that the center of the stuffing itself reaches 165°F (73.9°C), not only the meat. Stuffing that has not reached that temperature when the bird is done needs more cooking.",
  },
  {
    q: "Is duck harder to cook than turkey?",
    a: "It is different rather than harder. Duck is forgiving on moisture, because the fat layer bastes the meat as it renders, and unforgiving on logistics: you have to prick or score the skin, drain fat during the roast, and dry the skin ahead of time if you want it crisp. Turkey is the reverse — simple to manage in the oven, easy to overcook dry.",
  },
  {
    q: "Which gives better leftovers?",
    a: "Turkey gives more of them. Duck gives fewer but arguably better ones, plus two by-products a turkey does not: a jar of rendered fat for roast potatoes and a carcass that makes a deeply savoury stock. Either way, USDA guidance is that cooked poultry keeps three to four days in the refrigerator and should be reheated to 165°F (73.9°C).",
  },
  {
    q: "When should I order a duck for Thanksgiving?",
    a: "Earlier than you think, because holiday duck usually ships frozen and thawing is on your calendar, not the seller's. Work backward from the cooking date: USDA allows approximately 24 hours of refrigerator thawing for every 4 to 5 lb, then add the seller's stated transit window and a buffer day.",
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
          The practical difference is how the two scale. Turkey scales by weight — you buy a heavier
          bird for a bigger table, and USDA's consumer guide gives a planning allowance of 1 lb of
          turkey per person to do it with. Duck scales by count: a duck carries less edible meat
          relative to its weight, and there is no USDA planning allowance for it, so more guests
          means more birds, more rack space and more pan capacity rather than a bigger single bird.
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
              "Higher. USDA's turkey guide gives a planning allowance of 1 lb of turkey per person, so one large bird covers a big table.",
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
          For turkey there is an official planning number to lean on — USDA's consumer guide allows
          1 lb of turkey per person. There is no equivalent USDA allowance for duck, and we are not
          going to invent one. Instead, put your guest count and appetite into the{" "}
          <Link
            to="/tools/whole-duck-serving-calculator"
            className="text-primary underline underline-offset-4"
          >
            whole-duck serving calculator
          </Link>
          , which states the planning assumptions it uses and returns the number of birds and the
          raw weight to order. If you are weighing a whole bird against portioned cuts, our{" "}
          <Link to="/buy/how-much-duck-per-person" className="text-primary underline underline-offset-4">
            how much duck per person
          </Link>{" "}
          guide sets out the same assumptions in prose. Treat both as our planning estimates rather
          than established fact.
        </p>

        <Callout label="Two birds, one oven">
          <p>
            Two ducks roast happily side by side if air can circulate between them and the fat has
            somewhere to go. What they cannot do is share the oven with a turkey and three trays of
            sides at the same temperature.
          </p>
        </Callout>
      </Section>

      <Section id="timing" heading="Oven time and oven space, using USDA's own planning ranges">
        <p>
          Both USDA guides publish approximate roasting ranges for meal planning. They are planning
          numbers, not doneness rules: in every case the bird is done when a food thermometer reads
          165°F (73.9°C) in the thickest part of the meat, away from bone.
        </p>
        <DataTable
          caption="Approximate USDA planning ranges for whole birds — for scheduling only, subordinate to a thermometer reading"
          columns={["Bird", "Oven", "Approximate range (USDA)"]}
          rows={[
            [
              "Whole duckling, 4 to 6 lb",
              "350°F",
              "Approximately 30 to 35 min/lb. USDA's duck chart also says not to stuff a whole duckling.",
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
          Read across those rows and the scaling difference becomes an oven problem rather than a
          taste one. A bigger turkey mostly costs you time in the same pan. A bigger duck dinner costs
          you hardware: a second bird needs its own space for air to circulate, its own share of the
          rack, and somewhere for its rendering fat to collect. Before you commit to duck for a large
          group, measure the rack and count the roasting pans you actually own.
        </p>
        <SourceNotes
          ids={["usdaPoultryPrep", "usdaTurkeyRoasting"]}
          id="timing-sources"
          heading="Timing references"
        />
      </Section>

      <Section id="method" heading="Our two-stage roast versus USDA's single-temperature chart">
        <p>
          The range above comes from USDA's single-temperature planning chart. Our own{" "}
          <Link to="/cook/whole-roast-duck" className="text-primary underline underline-offset-4">
            whole roast duck
          </Link>{" "}
          method is two-stage: a gentler first stretch to render the fat cap without setting the
          skin, then a hot finish to crisp it. That is a recipe-method preference for texture — not a
          safety alternative and not a claim that USDA's chart is wrong.
        </p>
        <p>
          Because the oven temperature changes partway through, a two-stage roast will not track the
          single-temperature range minute for minute. Use the chart to pick a serving time, then let
          the thermometer decide when the bird comes out; our{" "}
          <Link to="/learn/whole-duck-cooking-time" className="text-primary underline underline-offset-4">
            whole duck cooking time
          </Link>{" "}
          guide explains where weight-based planning and temperature-based doneness diverge.
        </p>
      </Section>

      <Section id="menu" heading="What each bird does to the rest of the menu">
        <p>
          This part is editorial pairing guidance from our kitchen, not USDA fact. Turkey is a canvas:
          mild enough that gravy, stuffing, brine and herbs supply most of the flavour, which is
          exactly why the classic Thanksgiving table is built the way it is. Duck arrives with its own
          flavour already loud — darker, richer, closer to red meat — so the sides have a different
          job.
        </p>
        <p>
          What we reach for with duck is contrast rather than more richness: acidity, tart fruit,
          bitter or peppery greens, and sweetness kept deliberately restrained so the plate does not
          tip into dessert. Our{" "}
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
          </Link>{" "}
          set out the combinations we actually cook. A traditional gravy-and-stuffing spread can still
          work around a duck, but it will taste like two competing dinners unless something on the
          plate cuts through.
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
            <Link to="/recipes/roasted-whole-duck" className="text-primary underline underline-offset-4">
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
          Whichever plan you pick, settle the quantity before the shopping: turkey against USDA's per
          person allowance, duck through the{" "}
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
            USDA lists three safe methods — refrigerator, cold water and microwave — and allows
            approximately 24 hours of refrigerator thawing for every 4 to 5 lb of bird. Our{" "}
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
            carve better after a rest. USDA's turkey guide asks for a 20-minute stand before
            carving, for quality rather than safety, so the juices set; for duck, our{" "}
            <Link to="/learn/how-to-carve-a-duck" className="text-primary underline underline-offset-4">
              carving guide
            </Link>{" "}
            takes it apart in the order that keeps the skin intact.
          </li>
        </ul>
      </Section>

      <Section id="safety" heading="The safety numbers, and where they come from">
        <p>
          Species does not change the target. Whichever bird you roast, doneness is a thermometer
          reading in the thickest part of the meat, away from bone, and not a colour or a timing.
        </p>
        <SafetyNote>
          <p>
            USDA puts all poultry, duck and turkey alike, at a minimum internal temperature of 165°F
            (73.9°C). For turkey-specific figures — the 1 lb per person allowance, refrigerator
            thawing at approximately 24 hours per 4 to 5 lb, and the 20-minute stand — follow USDA's
            own consumer guide rather than any timing of ours. Every source is listed below.
          </p>
        </SafetyNote>
        <p>
          Two more rules travel with a holiday meal regardless of species: perishable food should not
          sit between 40°F and 140°F (4.4°C and 60°C) for more than two hours — one hour if the room
          is above 90°F (32.2°C) — and cooked poultry keeps three to four days in the refrigerator,
          reheated to 165°F (73.9°C).
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
          Cool and refrigerate leftovers promptly rather than leaving the platter out through the
          evening, keep them three to four days, and reheat to 165°F (73.9°C). Freeze anything you
          will not get through in that window.
        </p>
      </Section>

      <Section id="tradeoffs" heading="The honest tradeoffs">
        <p>
          Duck's weaknesses are real. It feeds fewer people per bird, it usually has to be ordered
          in advance and thawed on schedule, it asks more of you during the roast, and a small
          number of guests genuinely do not want a rich, dark-meat centrepiece at this particular
          meal. Turkey's weaknesses are equally real: a lean breast that punishes inattention, a
          long oven occupation, and a flavour that depends almost entirely on what you put around
          it.
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
      </Section>

      <ArticleBasis page={PAGE} />

      <DecisionNextSteps
        heading="Next steps"
        intro="Settle the number of birds first, then the workflow, then the order date."
        items={PAGE.funnel}
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
