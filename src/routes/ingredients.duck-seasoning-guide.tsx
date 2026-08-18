import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, Section, DataTable, Callout, FaqList } from "@/components/site/ArticleShell";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { SafetyNote } from "@/components/site/SafetyNote";
import { SourceNotes } from "@/components/site/SourceNotes";
import { ingredientByPath } from "@/data/ingredients";
import { articleSchema, breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const PAGE = ingredientByPath("/ingredients/duck-seasoning-guide")!;

const FAQ = [
  {
    q: "Should I salt duck the day before or just before cooking?",
    a: "Both work, but they do different things. Salting well ahead and leaving the duck uncovered in the fridge seasons deeper and dries the skin surface, which helps browning. Salting immediately before cooking seasons the surface only and leaves more moisture on the skin. What you should avoid is the middle ground of salting ten minutes ahead, where salt has drawn moisture to the surface but has not had time to be reabsorbed.",
  },
  {
    q: "Do I need to season under the skin?",
    a: "On a whole bird it is worth loosening the skin over the breast and salting the flesh directly, because salt does not travel through a thick fat layer quickly. On a duck breast, salting the flesh side and the skin side separately achieves the same thing with less handling.",
  },
  {
    q: "Does sugar in a rub help the skin brown?",
    a: "It browns faster, which is not the same as better. Duck renders a lot of fat over a long cook, and sugar sitting in that fat can darken past the point you want well before the bird is done. Save sweet elements for a glaze applied in the final stretch, or for the sauce.",
  },
];

export const Route = createFileRoute("/ingredients/duck-seasoning-guide")({
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
      title="How to Season Duck: Salt, Timing & Flavor Layers"
      intro={PAGE.description}
      trail={[
        { name: "Ingredients", to: "/ingredients" },
        { name: PAGE.title, to: PAGE.path },
      ]}
      meta={`${PAGE.minutes} min read · Technique reference`}
      sidebar={<SafetyNote />}
    >
      <Section id="layers" heading="Seasoning duck is six different decisions, not one">
        <p>
          Most seasoning confusion comes from treating "season the duck" as a single step. In
          practice there are six distinct layers, each with its own purpose and its own timing.
          Choosing two or three of them deliberately produces a better result than piling on all
          six.
        </p>
        <DataTable
          caption="The six seasoning layers, what each is for, and when it goes on"
          columns={["Layer", "What it is for", "When it goes on"]}
          rows={[
            [
              "Surface seasoning",
              "Basic salt and pepper on the outside; the minimum viable seasoning",
              "Just before cooking",
            ],
            [
              "Dry brine",
              "Seasons deeper into the meat and dries the skin surface",
              "Hours to a day ahead, uncovered in the fridge",
            ],
            [
              "Cure-style seasoning",
              "Salt plus aromatics for confit and smoked duck; firms texture and perfumes throughout",
              "Overnight or longer, per the method's own guidance",
            ],
            [
              "Finishing salt",
              "Texture and a bright hit of salinity on the cut surface",
              "After resting, at the moment of serving",
            ],
            [
              "Glaze",
              "Colour, gloss and sweetness on skin",
              "Final stretch of cooking only",
            ],
            [
              "Aromatic rub",
              "Flavour direction — herbs, warm spice, pepper",
              "With the salt if dry, or on the flesh side only if oily",
            ],
          ]}
        />
      </Section>

      <Section id="salt" heading="Salt is the decision that matters most">
        <p>
          Everything else on this page is optional; salt is not. Duck's dark muscle needs more
          seasoning than white poultry meat to taste fully seasoned rather than merely rich, and
          under-salted duck reads as flat and greasy even when the cooking was perfect.
        </p>
        <p>
          Two practical points. First, salt by weight rather than by spoon if you can — salt crystal
          sizes vary enormously between fine sea salt, kosher flakes and coarse rock salt, so a
          "teaspoon" is not a stable unit. Second, remember that a whole duck has a lot of skin and
          fat that will render away, and seasoning that sits only on the skin largely leaves with
          the fat. Get salt onto flesh where you can.
        </p>
        <Callout label="If you only change one thing">
          <p>
            Salt earlier and less nervously. Salting a duck breast on both sides and leaving it
            uncovered on a rack in the fridge for a few hours does more for the finished dish than
            any rub you can buy.
          </p>
        </Callout>
      </Section>

      <Section id="timing" heading="Timing: why the skin needs to be dry">
        <p>
          Browning and crisping cannot begin in earnest while there is free water on the surface —
          the energy goes into evaporating that water instead. Salt initially draws moisture out of
          the meat and onto the surface, then, given time, that brine is reabsorbed and the surface
          dries out again, especially in the moving air of a fridge.
        </p>
        <p>
          That gives you two good windows and one bad one: salt well ahead and let the surface dry,
          or salt immediately before cooking and pat the skin thoroughly dry first. The window to
          avoid is a short wait of a few minutes to an hour, where you have wet skin and no
          reabsorption benefit. For the full mechanics of dry-drying and cut-by-cut planning ranges,
          see the{" "}
          <a href="/ingredients/dry-brine-duck" className="text-primary underline underline-offset-4">
            dry brine guide
          </a>
          .
        </p>
      </Section>

      <Section id="wet-rubs" heading="Why wet rubs and pastes sabotage crisp skin">
        <p>
          An oil- or liquid-bound paste does three unhelpful things to skin. It adds water that must
          be driven off before browning starts; it adds a layer that insulates the skin from direct
          contact with the hot pan or oven air; and if it contains sugar, garlic or ground paprika,
          those solids sit in rendering fat at high heat and scorch long before the skin is properly
          rendered.
        </p>
        <p>
          The fix is not to abandon the flavour but to move it. Put pastes and marinades on the flesh
          side, into the cavity, or into the sauce; keep the skin side to dry salt and, if you like,
          dry spice. If a recipe genuinely requires a wet coat on the skin, accept that you are
          trading crispness for flavour, and choose knowingly. For diagnosis when skin has already
          gone wrong, see{" "}
          <a href="/learn/why-duck-skin-isnt-crispy" className="text-primary underline underline-offset-4">
            why duck skin won't crisp
          </a>
          .
        </p>
      </Section>

      <Section id="cure-vs-season" heading="Cure-style seasoning versus ordinary seasoning">
        <p>
          Confit and smoked duck use salt differently: not just to season but to firm the texture and
          season all the way through over a long contact time, usually with aromatics like thyme,
          bay, garlic and peppercorn in the salt. That is a method-specific process, and the salt
          quantity and contact time belong to the method rather than to general seasoning practice —
          follow the{" "}
          <a href="/cook/duck-leg-confit" className="text-primary underline underline-offset-4">
            confit guide
          </a>{" "}
          rather than improvising ratios.
        </p>
        <p>
          The practical distinction to hold onto: ordinary seasoning is forgiving and reversible in
          effect; a cure is a process with a duration, and over-curing produces meat that is
          genuinely too salty to serve. Weigh your salt for cures.
        </p>
      </Section>

      <Section id="glaze" heading="Glazes and finishing salt">
        <p>
          A glaze — honey, maple, hoisin, fruit reduction — belongs in the last part of the cook, and
          it needs watching. Applied at the start of a whole-duck roast it will be dark and bitter
          long before the bird is finished. Applied in the final stretch, it sets into gloss.
        </p>
        <p>
          Finishing salt is the cheapest upgrade available. A flaky salt scattered on sliced duck
          after resting gives crunch and an immediate hit of salinity that seasoning inside the meat
          cannot replicate. Do it after slicing, not before, or it dissolves and disappears.
        </p>
      </Section>

      <Section id="order" heading="A default order of operations">
        <p>
          For a duck breast: pat dry, salt both sides, rest uncovered in the fridge, cook from a cold
          pan, pepper and finishing salt after resting, sauce on the plate rather than over the skin.
          For a whole bird: dry, salt inside and out, aromatics in the cavity, uncovered fridge time,
          roast, glaze late if using, rest, carve, finishing salt. Neither list contains a wet rub,
          and neither needs one.
        </p>
        <p>
          Where sauce goes matters as much as seasoning: pool it under or beside the duck rather than
          over the skin, so the surface you worked for stays crisp until it is eaten. The{" "}
          <a href="/cook/whole-roast-duck" className="text-primary underline underline-offset-4">
            whole roast duck guide
          </a>{" "}
          and the{" "}
          <a href="/learn/how-to-score-duck-breast" className="text-primary underline underline-offset-4">
            scoring guide
          </a>{" "}
          cover the mechanical side of the same goal.
        </p>
      </Section>

      <FaqList items={FAQ} />

      <SourceNotes ids={["usdaPoultryTemp", "usdaPoultryPrep"]} />

      <RelatedGuides paths={PAGE.related} />
    </ArticleShell>
  );
}
