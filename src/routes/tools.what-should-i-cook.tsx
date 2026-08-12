import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { FaqList } from "@/components/site/ArticleShell";
import { MethodFinder } from "@/components/tools/MethodFinder";
import { breadcrumbSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/tools/what-should-i-cook")({
  head: () => ({
    ...pageMeta({
      title: "What Should I Cook? Duck Method Finder | DeliciousDuck",
      description:
        "Answer a few questions about your cut, time, and equipment to get transparent, rule-based duck cooking method suggestions.",
      path: "/tools/what-should-i-cook",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Tools", item: "/tools" },
          { name: "What Should I Cook?", item: "/tools/what-should-i-cook" },
        ]),
      ),
    ],
  }),
  component: Page,
});

const FAQ = [
  {
    q: "Is this powered by AI?",
    a: "No. The suggestions come from a small, fixed set of rules that match your answers — cut, provenance, time, and equipment — against a short list of methods. There's no model, and nothing you enter is collected or stored.",
  },
  {
    q: "Why do I sometimes see fewer than three suggestions?",
    a: "Only methods whose conditions match your exact combination of answers are shown, up to three. An unusual combination — say, wild duck legs with no oven or grill — may only match one rule, or fall back to a general starting point.",
  },
  {
    q: "What if none of the suggestions fit what I actually want to make?",
    a: "Treat the result as a starting point, not a verdict. Browse the full cooking guides directly, or change one answer at a time — cut, time available, or equipment — to see how the recommendation shifts.",
  },
];

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Tool"
        title="What Should I Cook?"
        intro="Answer a few questions about the cut, time, and equipment you have, and get a short, transparent list of suggested methods."
        trail={[
          { name: "Tools", to: "/tools" },
          { name: "What Should I Cook?", to: "/tools/what-should-i-cook" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <MethodFinder />

        <div className="mt-16 max-w-3xl">
          <h2 className="font-display text-3xl text-foreground">How this works</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            This finder runs on a small, fixed set of if-this-then-that rules, not a model or any
            kind of AI. Each rule looks at the cut you selected, whether it's wild or farmed, how
            much time you have, and what equipment you've checked off, and matches those answers
            against a short list of cooking methods. Nothing you enter leaves your browser or gets
            recorded anywhere — change an answer and the list updates instantly because it's all
            calculated on the page.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Each suggestion comes with a short "why you're seeing this" explanation tied directly
            to your answers, plus a key risk to watch for with that method. Reading both helps you
            judge the trade-offs rather than treating the top result as an automatic answer — a
            fast pan sear trades margin for error against a slow confit's forgiving cook, and which
            one suits you depends on more than just the clock.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            If none of the suggestions feel right, that's a sign the rule set is deliberately
            narrow rather than a dead end. Try adjusting one answer at a time — swapping "under 30
            minutes" for "30–90 minutes," for instance — to see how the recommendation changes, or
            skip straight to the full method guides linked below.
          </p>
        </div>

        <FaqList items={FAQ} />
        <RelatedGuides
          paths={[
            "/cook/how-to-cook-duck-breast",
            "/cook/whole-roast-duck",
            "/cook/duck-leg-confit",
            "/cook/how-to-cook-wild-duck-breast",
            "/learn/how-to-render-duck-fat",
          ]}
        />
      </section>
    </>
  );
}
