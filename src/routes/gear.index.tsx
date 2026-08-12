import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import {
  AffiliateCallout,
  AffiliateDisclosureNote,
} from "@/components/site/AffiliateCallout";
import { KITCHEN_GEAR } from "@/data/products";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

const SKIP = [
  "Single-purpose duck presses and speciality gadgets.",
  "Non-stick pans, which cannot take the heat a fat cap needs.",
  "Dial thermometers that lag behind the actual temperature.",
];

export const Route = createFileRoute("/gear/")({
  head: () => ({
    ...pageMeta({
      title: "The Duck Kitchen: Gear That Actually Helps | DeliciousDuck",
      description:
        "A short list of equipment for cooking duck well — thermometer, heavy skillet, roasting setup, fat storage — plus what you can safely skip.",
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
          "The duck kitchen",
          KITCHEN_GEAR.map((g) => ({ name: g.name, url: "/gear" })),
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
        <div className="max-w-3xl">
          <AffiliateDisclosureNote />
        </div>

        <h2 className="mt-14 font-display text-3xl text-foreground">What earns its place</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {KITCHEN_GEAR.map((item) => (
            <AffiliateCallout key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="rule-gold font-display text-3xl text-foreground">What to skip</h2>
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
              We describe what a tool does and why it matters for duck specifically. We do not
              publish star ratings, review counts, or prices until we have hands-on testing and a
              verified merchant source for each item.
            </p>
            <Link
              to="/affiliate-disclosure"
              className="mt-5 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-primary underline-offset-4 hover:underline"
            >
              Our affiliate disclosure
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
