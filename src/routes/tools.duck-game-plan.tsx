import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { ToolAssumptions } from "@/components/tools/ToolAssumptions";
import { DuckGamePlanFlow } from "@/components/tools/DuckGamePlanFlow";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

/**
 * The Duck Game Plan planner.
 *
 * Indexable on purpose: the page carries durable, non-personalized explanation
 * of what the tool decides and where its facts come from, and that content is
 * identical for every visitor. The personalized result renders in place, in the
 * same URL, so no quiz choice ever reaches the canonical URL, a query string, or
 * the sitemap. There is exactly one URL for this tool and one H1 on it.
 */
export const Route = createFileRoute("/tools/duck-game-plan")({
  head: () => ({
    ...pageMeta({
      title: "Duck Game Plan: Your Temperature and Timing Plan | DeliciousDuck",
      description:
        "Answer four questions about the duck you're cooking and get a plan: the real risk, the critical move, temperature, resting, timing and what to serve with it.",
      path: "/tools/duck-game-plan",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Tools", item: "/tools" },
          { name: "Duck Game Plan", item: "/tools/duck-game-plan" },
        ]),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: GamePlanPage,
});

const FAQ = [
  {
    q: "What does the Duck Game Plan actually give me?",
    a: "One kitchen card for the duck in front of you: the biggest risk for that cut and method, the single move that matters most, target temperatures, resting and timing guidance, the equipment that helps, roughly how much to buy for your table, and what to serve alongside. Each line links to the full guide behind it.",
  },
  {
    q: "Where do the temperatures come from?",
    a: "From the same pages the rest of the site uses. Duck breast carries a restaurant convention of cooking to medium-rare, which sits below the USDA minimum for poultry; the plan states both and keeps them clearly separate rather than blending them into one number.",
  },
  {
    q: "Do I have to sign up to use it?",
    a: "The plan is delivered when you sign up for The Duck Drop, so it lands in your inbox as well as on screen. Every guide it points to is free and open on the site, with no signup at all.",
  },
  {
    q: "What if my exact combination isn't covered?",
    a: "It says so plainly and routes you to the closest guide we stand behind. Sous vide and grilling, for example, get honest general guidance rather than invented times.",
  },
];

function GamePlanPage() {
  return (
    <>
      <PageHeader
        eyebrow="Duck the Fundamentals"
        title="Cooking duck tonight? Don't guess."
        intro="Tell us what you're cooking and how, and we'll build your temperature, timing, crispy-skin and serving plan — one card, in the order you'll actually need it."
        trail={[
          { name: "Tools", to: "/tools" },
          { name: "Duck Game Plan", to: "/tools/duck-game-plan" },
        ]}
      />

      <section className="mx-auto max-w-3xl px-5 py-14 lg:px-8 lg:py-20">
        <DuckGamePlanFlow placement="game-plan_tool" />

        {/* Durable, non-personalized content: identical for every visitor. */}
        <div className="mt-16">
          <h2 className="font-display text-2xl leading-tight">
            The four things that decide how duck turns out
          </h2>
          <p className="mt-4 text-[0.975rem] leading-relaxed text-foreground/90">
            Duck fails in predictable ways, and almost always for one of four reasons. The plan is
            built around them because they are the decisions you can still change.
          </p>
          <dl className="mt-7 space-y-6">
            <div>
              <dt className="font-medium">The cut sets the rules</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Breast is a fast, high-attention cook where doneness is the whole game. Legs and
                confit want long, gentle heat and are forgiving about time. A whole bird is really
                two problems at once — rendering the fat under the skin while the legs finish.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Skin is a moisture problem before it is a heat problem</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Dry skin crisps and wet skin steams. Most crispy-skin failures start in the fridge,
                not the pan, which is why the plan puts the drying step ahead of the searing step.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Doneness is measured, not guessed</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Duck breast moves through its window quickly, and colour is a poor guide through
                rendered fat. An instant-read thermometer is the difference between a decision and a
                hope.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Rendered fat is part of the yield</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                A duck sheds a usable amount of cooking fat. Keeping it is the cheapest upgrade to
                the next few meals you cook, so the plan flags it wherever it applies.
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-14">
          <h2 className="font-display text-2xl leading-tight">Questions about the plan</h2>
          <dl className="mt-6 space-y-6">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="font-medium">{item.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-14">
          <ToolAssumptions
            items={[
              {
                label: "Source of every number",
                value:
                  "Temperatures, resting windows and timing ranges come from the DeliciousDuck guide each line links to. The plan restates those pages; it adds no new numbers.",
              },
              {
                label: "Two reference points for breast",
                value:
                  "The widespread culinary convention of medium-rare, and the USDA minimum for poultry. Both are shown, and they are never merged into one figure.",
              },
              {
                label: "Portions",
                value:
                  "Follows the site's yield assumptions for whole birds and breasts. A planning estimate, not a promise about one specific bird.",
              },
              {
                label: "Combinations we don't cover",
                value:
                  "Where a cut-and-method pairing has no guide we stand behind, the plan says so and routes you to the nearest one rather than inventing precision.",
              },
            ]}
          />

        </div>
      </section>
    </>
  );
}
