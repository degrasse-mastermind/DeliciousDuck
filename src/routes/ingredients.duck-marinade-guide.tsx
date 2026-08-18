import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Section, DataTable, Callout, FaqList } from "@/components/site/ArticleShell";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { ingredientByPath } from "@/data/ingredients";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const PAGE = ingredientByPath("/ingredients/duck-marinade-guide")!;

const FAQ = [
  {
    q: "Do marinades tenderise duck?",
    a: "Not in any meaningful way. Marinades flavour and season the outer layer and can help retain moisture through salt, but they do not soften the interior of the meat. Duck's texture is decided by the cut, the cooking method and the doneness, not by soaking.",
  },
  {
    q: "Can I marinate a duck breast with the skin on?",
    a: "You can, but keep the marinade on the flesh side and keep the skin dry. A wet skin surface has to lose that moisture before it can brown, and the result is usually pale, chewy skin.",
  },
  {
    q: "Does marinating wild duck remove the gamey flavour?",
    a: "It masks rather than removes it. Buttermilk or milk soaks are a traditional approach and many cooks find they soften the impression of strong flavour, but the flavour compounds are in the meat and the fat. Careful trimming, removing blood-heavy tissue, and pairing with acid and juniper does more than a long soak.",
  },
];

export const Route = createFileRoute("/ingredients/duck-marinade-guide")({
  head: () => ({
    ...pageMeta({
      title: PAGE.seoTitle,
      description: PAGE.description,
      path: PAGE.path,
      ogType: "article",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Ingredients", item: "/ingredients" },
          { name: PAGE.title, item: PAGE.path },
        ]),
      ),
      ldScript(
        articleSchema({
          headline: PAGE.title,
          description: PAGE.description,
          path: PAGE.path,
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
      eyebrow="Ingredients"
      title="Duck Marinades: What Helps, What Hurts & When to Use Them"
      intro={PAGE.description}
      trail={[
        { name: "Ingredients", to: "/ingredients" },
        { name: PAGE.title, to: PAGE.path },
      ]}
      meta={`${PAGE.minutes} min read · Technique reference`}
    >
      <Section id="what-they-do" heading="What a marinade can and cannot do">
        <p>
          A marinade is a flavoured liquid in contact with the surface of the meat. That physical
          reality sets the limits. Salt genuinely moves into meat over time. Sugars and acids
          concentrate at and just under the surface. Most aroma molecules from herbs, spices and
          aromatics barely penetrate at all — they sit on the outside and then either brown or burn.
        </p>
        <p>
          So a marinade is an excellent tool for the first few millimetres and a poor tool for the
          centre. That is not a criticism: the first few millimetres are where most of the perceived
          flavour of a piece of duck lives. It just means you should stop expecting a marinade to fix
          texture, and start using it to build a crust and a sauce base.
        </p>
        <DataTable
          caption="Realistic expectations for a duck marinade"
          columns={["Claim", "Reality"]}
          rows={[
            ["Tenderises the meat deeply", "No. Texture comes from cut, method and doneness."],
            ["Seasons throughout", "Only the salt does, and only with hours of contact."],
            ["Adds flavour", "Yes — to the surface, strongly and reliably."],
            ["Helps browning", "Sometimes. Sugars help colour; water hurts. Net effect depends on the recipe."],
            ["Removes gaminess in wild duck", "It masks it. Trimming and pairing do more."],
            ["Keeps the meat juicy", "Indirectly, via salt. Overcooking still dries it out."],
          ]}
        />
      </Section>

      <Section id="skin" heading="Skin-on versus skinless: the decisive question">
        <p>
          If skin is involved and you want it crisp, marinade is working against you on that surface.
          Rendering and crisping duck skin is a drying process; a marinade is a wetting process.
        </p>
        <p>
          Three workable resolutions. Marinate the flesh side only, then wipe and dry the skin
          thoroughly before cooking. Marinate skinless cuts — trimmed legs for a braise, breast
          strips for a stir-fry, thigh meat for skewers — where crispness is not the goal. Or skip the
          marinade and move the same flavours into a glaze applied late and a sauce served
          underneath, which is what most restaurant duck does.
        </p>
        <Callout label="Rule of thumb" tone="gold">
          <p>
            Wet on flesh, dry on skin. If you cannot keep the skin dry, choose a method where skin
            texture does not matter — braise, confit-style cook, stir-fry, or shredded.
          </p>
        </Callout>
      </Section>

      <Section id="wild-vs-farmed" heading="Wild versus farmed birds">
        <p>
          Farmed duck — Pekin, Moulard, Muscovy — is fatty, mild and already flatters simple
          seasoning; marinades are optional flavour direction, not rescue. Wild duck is leaner,
          darker and more strongly flavoured, has far less fat to render, and dries out quickly. It
          is the case where marinades earn the most, because you are usually not chasing crisp skin
          and you often are chasing moisture retention and flavour framing.
        </p>
        <p>
          For wild birds, the useful marinade is salt-forward with juniper, black pepper, bay and a
          modest amount of acid, and short rather than heroic in duration. Buttermilk or milk soaks
          are traditional and harmless; treat the claim that they neutralise strong flavour as folk
          practice rather than established fact. See the{" "}
          <a href="/cook/how-to-cook-wild-duck-breast" className="text-primary underline underline-offset-4">
            wild duck guide
          </a>{" "}
          for handling and cooking.
        </p>
      </Section>

      <Section id="components" heading="The four working parts of a marinade">
        <p>
          Compose rather than copy. Every good duck marinade is some balance of four roles, and
          knowing which role each ingredient plays lets you build one from whatever is in the
          cupboard.
        </p>
        <DataTable
          caption="What each marinade component actually contributes"
          columns={["Component", "Role", "Watch out for"]}
          rows={[
            [
              "Salt (or soy, fish sauce, miso)",
              "The only element that seasons below the surface. Also the main contributor to perceived juiciness.",
              "Salty liquids stack: soy plus miso plus added salt gets brutal fast.",
            ],
            [
              "Acid (vinegar, citrus, wine, yoghurt)",
              "Cuts richness and brightens the surface flavour; helps a sauce taste finished.",
              "Long soaks in strong acid make the outer layer pale, mushy and dull-textured.",
            ],
            [
              "Sugar (honey, maple, hoisin, fruit juice)",
              "Colour and gloss; balances acid; rounds out warm spices.",
              "Burns. Wipe most of it off before high heat, or move it to a late glaze.",
            ],
            [
              "Fat / oil, plus aromatics",
              "Carries fat-soluble aromatics from herbs and spices onto the meat and distributes them evenly.",
              "Insulates skin from the pan; garlic and ground spice in oil scorch readily.",
            ],
          ]}
        />
      </Section>

      <Section id="templates" heading="Five flavour templates">
        <p>
          These are directions, not recipes with tested proportions. Start salt-led, add acid until
          it tastes lively on a spoon, then sweeten and aromatise sparingly. Taste the marinade
          itself: if it is unpleasant to taste, it will not improve on the duck.
        </p>
        <DataTable
          caption="Marinade templates by flavour direction"
          columns={["Direction", "Salt element", "Acid", "Sweet", "Aromatics", "Best for"]}
          rows={[
            [
              "Five-spice and soy",
              "Soy sauce",
              "Rice vinegar",
              "A little honey",
              "Five-spice, ginger, garlic, spring onion",
              "Skinless thigh, stir-fry strips, shredded duck",
            ],
            [
              "Citrus and herb",
              "Salt",
              "Orange and lemon juice, zest",
              "Optional honey",
              "Thyme, bay, black pepper",
              "Flesh side of breast; legs for braising",
            ],
            [
              "Red wine and juniper",
              "Salt",
              "Red wine",
              "None",
              "Juniper, bay, thyme, peppercorn",
              "Wild duck; legs destined for a braise",
            ],
            [
              "Miso and mirin",
              "Miso",
              "Rice vinegar",
              "Mirin",
              "Ginger, sesame",
              "Skinless cuts; grilled skewers",
            ],
            [
              "Smoky chile",
              "Salt",
              "Cider vinegar",
              "Maple",
              "Smoked paprika, chipotle, cumin, oregano",
              "Legs, shredded duck for tacos",
            ],
          ]}
        />
      </Section>

      <Section id="practice" heading="Practical handling">
        <p>
          Use a bag or a snug container so the liquid covers with the smallest possible volume.
          Marinate in the fridge, never at room temperature, and treat raw duck and its marinade like
          any raw poultry: separate boards, wash hands and surfaces, and do not reuse the marinade
          raw as a sauce. If you want to use it, bring it to a full boil first and reduce it — that is
          the honest way to get the flavour onto the plate.
        </p>
        <p>
          Before cooking, drain and dry the surface you intend to brown. Wipe off solids that would
          burn. Then season with plain salt on that dried surface if it has been sitting in a
          low-salt marinade; a marinade is not a substitute for the seasoning discipline described in
          the{" "}
          <a href="/ingredients/duck-seasoning-guide" className="text-primary underline underline-offset-4">
            seasoning guide
          </a>
          .
        </p>
      </Section>

      <FaqList items={FAQ} />

      <RelatedGuides paths={PAGE.related} />
    </ArticleShell>
  );
}
