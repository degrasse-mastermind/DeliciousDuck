import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { HUB_SECTION_DIVIDER } from "@/components/site/HubDivider";
import { HubSectionMark } from "@/components/site/HubSectionMark";
import { GuideGrid } from "@/components/site/GuideGrid";
import { ConversionPaths } from "@/components/site/ConversionPaths";
import { guidesByPillar } from "@/data/guides";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

const GEAR_GUIDES = guidesByPillar("gear");

const SKIP = [
  "Single-purpose duck presses and speciality gadgets.",
  "Non-stick pans, which cannot take the heat a fat cap needs.",
  "Dial thermometers that lag behind the actual temperature.",
];

export const Route = createFileRoute("/gear/")({
  head: () => ({
    ...pageMeta({
      title: "The Duck Kitchen: Thermometers, Pans & Knives | DeliciousDuck",
      description:
        "Equipment guides for cooking duck: choosing a thermometer, the right skillet for rendering a fat cap, a knife that scores skin cleanly — and what to skip.",
      path: "/gear",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Gear", item: "/gear" },
        ]),
      ),
      ldScript(
        itemListSchema(
          "Duck kitchen equipment guides",
          GEAR_GUIDES.map((g) => ({ name: g.title, url: g.path })),
        ),
      ),
    ],
  }),
  component: GearPage,
});

function GearPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gear"
        title="The Duck Kitchen"
        intro="Duck asks very little of your kitchen: heat control, a reliable temperature reading, and somewhere to put the fat. This is the short list, and the honest list of what to skip."
        trail={[{ name: "Gear", to: "/gear" }]}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <h2 className="font-display text-3xl text-foreground">Equipment guides</h2>
        <GuideGrid guides={GEAR_GUIDES} />

        <ConversionPaths
          sourcePath="/gear"
          eyebrow="Most-asked gear question"
          heading="Confit is a fit problem, not a brand problem"
          intro="Before you shop, work out whether the pot in your cupboard already does the job."
        />


        <div className={`${HUB_SECTION_DIVIDER} grid gap-10 lg:grid-cols-2`}>
          <div>
            <HubSectionMark mark="gear-skip" />
            <h2 className="font-display text-3xl text-foreground">What to skip</h2>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {SKIP.map((s) => (
                <li key={s} className="border-l-2 border-border pl-4">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-sm bg-cream p-6 lg:p-8">
            <h2 className="font-display text-2xl text-foreground">How we assess gear</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We describe what a tool does and why it matters for duck specifically. Named brands
              are compared using published specifications, and the guides work at the level of
              category and material, which is where most duck-cooking decisions are actually made.
            </p>
            <Link
              to="/editorial-standards"
              className="mt-5 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-primary underline-offset-4 hover:underline"
            >
              Our editorial standards
            </Link>
          </div>
        </div>

        <p className="mt-16 text-sm text-muted-foreground">
          Not sure which problem you're solving?{" "}
          <Link
            to="/learn/why-duck-skin-isnt-crispy"
            className="text-primary underline underline-offset-4"
          >
            Start with why the skin isn't crisping
          </Link>{" "}
          — most gear questions about duck are really technique questions.
        </p>
      </section>
    </>
  );
}
