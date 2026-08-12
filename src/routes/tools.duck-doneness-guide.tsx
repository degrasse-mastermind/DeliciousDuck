import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SourceNotes } from "@/components/site/SourceNotes";
import { FaqList } from "@/components/site/ArticleShell";
import { DonenessGuide } from "@/components/tools/DonenessGuide";
import { breadcrumbSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/tools/duck-doneness-guide")({
  head: () => ({
    ...pageMeta({
      title: "Interactive Duck Doneness Guide | DeliciousDuck",
      description:
        "Probe placement, pull temperature, carryover and rest by cut and method — with USDA safety guidance kept clearly separate from culinary convention.",
      path: "/tools/duck-doneness-guide",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Tools", item: "/tools" },
          { name: "Interactive Duck Doneness Guide", item: "/tools/duck-doneness-guide" },
        ]),
      ),
    ],
  }),
  component: Page,
});

const FAQ = [
  {
    q: "Why does breast doneness differ from USDA guidance?",
    a: "USDA sets one minimum safe temperature — 165°F (73.9°C) — for all poultry. A widely used culinary convention cooks duck breast rosier than that for texture. That convention is a choice, not a safety endorsement.",
  },
  {
    q: "What is carryover cooking?",
    a: "Meat keeps cooking after it leaves the heat as residual warmth moves toward the centre. A well-rendered duck breast can rise 5–10°F (3–5°C) during rest.",
  },
  {
    q: "Do legs need a thermometer if I'm going by texture?",
    a: "A thermometer still helps confirm you're in a safe and tender range, but legs are unusually forgiving — texture is a reliable secondary check.",
  },
];

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Tool"
        title="Interactive Duck Doneness Guide"
        intro="Choose your cut, method, and desired outcome to see probe placement, pull temperature, carryover, and rest — with USDA guidance always shown separately."
        trail={[
          { name: "Tools", to: "/tools" },
          { name: "Interactive Duck Doneness Guide", to: "/tools/duck-doneness-guide" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <DonenessGuide />

        <div className="mt-16 max-w-3xl">
          <h2 className="font-display text-3xl text-foreground">How to read the result</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Every combination returns four things: where to place the probe, a pull temperature,
            how much the meat will keep cooking after it comes off heat, and how long to rest it.
            Where the pull temperature sits below the USDA minimum, that is flagged explicitly as a
            culinary convention rather than a safety recommendation — the two are never blended
            into one number.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Texture cues are included alongside temperature because a single point reading can miss
            uneven cooking, especially on the grill or in a hot pan where surface heat is uneven.
          </p>
        </div>

        <FaqList items={FAQ} />
        <SourceNotes ids={["usdaPoultryTemp", "usdaPoultryPrep"]} />
        <RelatedGuides
          paths={[
            "/learn/duck-breast-temperature-doneness",
            "/cook/how-to-cook-duck-breast",
            "/cook/duck-leg-confit",
          ]}
        />
      </section>
    </>
  );
}
