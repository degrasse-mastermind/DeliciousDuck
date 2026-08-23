import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { HubOrientation } from "@/components/site/HubOrientation";
import { HUB_SECTION_DIVIDER } from "@/components/site/HubDivider";
import { HubSectionMark } from "@/components/site/HubSectionMark";
import { GuideGrid } from "@/components/site/GuideGrid";
import { ConversionPaths } from "@/components/site/ConversionPaths";
import { SourceNotes } from "@/components/site/SourceNotes";
import { guidesByPillar } from "@/data/guides";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

const GEAR_GUIDES = guidesByPillar("gear");

const SKIP = [
  "Single-purpose duck presses and speciality gadgets.",
  "Non-stick pans for searing breast: they sear less well and leave nothing to deglaze.",
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
        <HubSectionMark mark="gear-guides" />
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
        <HubOrientation
          heading={"What you actually need"}
          paragraphs={[
            "Three things decide duck: a pan that holds steady heat, an instant-read thermometer you trust, and a heatproof container for the fat you pour off. That is the whole essential list. Duck asks less of a kitchen than most centrepiece cooking because the bird supplies its own cooking fat.",
            "Where equipment does matter, it is usually fit rather than brand. A confit needs a vessel that holds the legs snugly enough to submerge them in a sensible amount of fat, which is often a pot you already own. A roasting pan needs to be deep enough to hold rendered fat without it spitting over the oven floor.",
            "The guides below work at the level of category and material, compare named products on published specifications, and say plainly who each option suits. If a cheaper piece of kit does the job for duck, that is what we say.",
          ]}
          sections={[
            {
              heading: "The best pan for duck breast",
              paragraphs: [
                "A heavy stainless or carbon-steel skillet is our default recommendation. Both hold steady heat through a long slow render and both build the browned residue a pan sauce is made from. Cast iron works and retains heat beautifully, though it is slower to respond when you need to back the heat off. A good non-stick pan will render and cook a breast perfectly well; what it gives up is browning at higher heat and the fond you would otherwise deglaze, and manufacturers usually cap it below the temperatures a final sear likes. If non-stick is what you own, use it and make the sauce separately.",
                "Size matters more than material. Choose a pan where the breasts sit with space between them; crowded duck steams in its own rendering fat instead of crisping. If you cook two large magrets, that usually means a 12-inch skillet rather than a 10-inch one.",
              ],
              links: [
                { label: "Best pan for duck breast", to: "/gear/best-pan-for-duck-breast" },
                { label: "Best sauces for duck breast", to: "/cook/best-sauces-for-duck-breast" },
              ],
            },
            {
              heading: "Thermometers, roasting pans, and fat storage",
              paragraphs: [
                "An instant-read thermometer is the one piece of equipment that changes outcomes rather than convenience. USDA's safe minimum internal temperature for duck is 165°F (74°C), a whole bird's thigh wants 175–180°F (79–82°C) for tender connective tissue, and the pink 130–135°F (54–57°C) window some kitchens use for breast sits below that guidance — you cannot navigate any of it by timing intuition. Fast read time and a thin tip are worth paying for; app connectivity generally is not, for duck.",
                "For roasting, a pan with sides deep enough to hold several cups of rendered fat, plus a rack to lift the bird clear of it, prevents both a smoking oven and a poached underside. For the fat itself, a wide-mouth glass jar and a fine strainer are enough: strain it while warm, refrigerate it sealed, freeze it if you are keeping it well beyond a few weeks, and smell it before use rather than trusting a date.",
              ],
              links: [
                { label: "Best thermometer for duck", to: "/gear/best-thermometer-for-duck" },
                { label: "Best roasting pan for duck", to: "/gear/best-roasting-pan-for-duck" },
                { label: "How to render duck fat", to: "/learn/how-to-render-duck-fat" },
              ],
            },
            {
              heading: "What to buy for duck confit",
              paragraphs: [
                "Confit needs a vessel that fits the legs snugly in a single layer so a reasonable amount of fat covers them. That is a fit problem, not a premium-cookware problem — a 3.5- to 5-quart Dutch oven or a deep braiser you already own will usually do it, and a smaller pot beats a larger one because it needs less fat to submerge the same legs. Enamelled cast iron is ideal for oven stability; a straight-sided stainless brasier is a close second.",
                "The rest of the list is short: a rack or plate for salting the legs overnight, a container to store them under their fat, and a skillet to crisp the skin at serving time. If a cheaper piece of kit does the job for duck, that is what we say — the guides below compare categories and named products on published specifications and state plainly who each option suits.",
              ],
              links: [
                { label: "Best Dutch oven for confit", to: "/gear/best-dutch-oven-for-duck-confit" },
                { label: "Duck leg confit recipe", to: "/cook/duck-leg-confit" },
                { label: "Best knife for scoring duck", to: "/gear/best-knife-for-scoring-duck" },
              ],
            },
          ]}

        />

        <SourceNotes ids={["usdaPoultryTemp", "usdaPoultryPrep"]} />

      </section>
    </>
  );
}
