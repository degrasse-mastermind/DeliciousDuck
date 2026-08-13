import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell, Section, Callout, FaqList } from "@/components/site/ArticleShell";
import { DisclosureBanner, ComparisonCard, ComparisonTable, ShopThisGuide } from "@/components/site/Commerce";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { PANS, PAN_FACTORS } from "@/data/comparisons";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";
import { DuckBreastJourney } from "@/components/site/DuckBreastJourney";
import { decisionGuide } from "@/data/decision-guides";
import {
  BestForGrid,
  DecisionMatrixTable,
  EditorialByline,
  MethodologyPanel,
  QuickDecision,
} from "@/components/site/DecisionGuide";

const GUIDE = guideByPath("/gear/best-pan-for-duck-breast")!;
const DG = decisionGuide("/gear/best-pan-for-duck-breast")!;

export const Route = createFileRoute("/gear/best-pan-for-duck-breast")({
  head: () => ({
    ...pageMeta({ title: GUIDE.seoTitle, description: GUIDE.description, path: GUIDE.path, ogType: "article" }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Gear", item: "/gear" },
          { name: GUIDE.title, item: GUIDE.path },
        ]),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: Page,
});

const FAQ = [
  {
    q: "Is cast iron the best pan for duck breast?",
    a: "It's the best choice if maximum, even crisp matters more to you than being able to adjust the render quickly. It isn't a universal winner — its slow response and awkward pouring are real trade-offs.",
  },
  {
    q: "Why is non-stick a bad choice here?",
    a: "Two reasons: the coating isn't built for the sustained higher heat a good sear needs, and its whole purpose is to prevent the fond that a pan sauce depends on.",
  },
  {
    q: "Do I need a separate pan for the sauce?",
    a: "Not if you use stainless clad or carbon steel — both let you deglaze in the same pan. Cast iron's seasoning reacts poorly with acidic ingredients like wine or citrus, so a separate saucepan is often the more practical route.",
  },
  {
    q: "What size pan do I need for two duck breasts?",
    a: "A 10–11 inch (25–28 cm) pan is usually the minimum for two breasts without crowding. Crowding traps steam, which is one of the more common reasons skin stays soft.",
  },
];

function Page() {
  return (
    <ArticleShell
      eyebrow="Gear Guide"
      title={GUIDE.title}
      intro={GUIDE.description}
      trail={[
        { name: "Gear", to: "/gear" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <p>
        Duck breast is a slow, cold-start render followed by a hot finish, sometimes followed by a
        pan sauce built from the fond it leaves behind. That sequence rules out some pans outright
        and makes others genuinely better fits depending on how you cook. There is no single correct
        answer — there's a right pan for your method.
      </p>

      <EditorialByline guide={DG} />

      <QuickDecision guide={DG} />

      <DisclosureBanner />

      <MethodologyPanel guide={DG} />

      <Section id="framework" heading="The decision framework">
        <p>
          Before comparing specific pans, weigh these factors against how you actually cook a duck
          breast — see{" "}
          <Link to="/cook/how-to-cook-duck-breast" className="text-primary underline underline-offset-4">
            how to cook duck breast
          </Link>{" "}
          if you haven't settled on a method yet.
        </p>
      </Section>

      <Section id="mass" heading="Thermal mass vs. responsiveness during a long render">
        <p>
          A cold breast dropped into a pan pulls heat out fast. High-mass pans like cast iron barely
          notice and hold a steady render, but they're slow to respond if things start browning too
          quickly — turning the burner down takes minutes to show up at the surface. Lighter,
          more responsive pans (carbon steel, thinner stainless) let you correct course in seconds,
          at the cost of some evenness.
        </p>
      </Section>

      <Section id="fond" heading="Fond, and whether you're building a pan sauce">
        <p>
          If a sauce is part of the plan — see{" "}
          <Link to="/cook/best-sauces-for-duck-breast" className="text-primary underline underline-offset-4">
            best sauces for duck breast
          </Link>{" "}
          — the pan needs to hold on to browned bits without a coating designed to prevent exactly
          that. Stainless clad is the strongest option here because it's also acid-safe for wine or
          fruit reductions; carbon steel and cast iron work but their seasoning can react with
          acidic ingredients over time.
        </p>
      </Section>

      <Section id="pouring" heading="Pouring off hot fat safely">
        <p>
          Duck breast renders a genuine quantity of fat partway through cooking, and most methods
          call for pouring some of it off mid-cook. Weight and pan shape both matter here: a heavy
          pan with no pour spout, held one-handed over a jar of screaming-hot fat, is a real
          liability. Lighter pans with sloped sides make this step meaningfully safer and easier.
        </p>
      </Section>

      <Section id="diameter" heading="Diameter vs. number of breasts">
        <p>
          Overcrowding traps steam against the skin instead of letting it escape, which is one of
          the more common causes of skin that won't crisp — see{" "}
          <Link to="/learn/why-duck-skin-isnt-crispy" className="text-primary underline underline-offset-4">
            why duck skin isn't crispy
          </Link>
          . Give each breast room to sit without touching its neighbours; that usually means one
          pan per two breasts at most for a typical 10–11 inch skillet.
        </p>
      </Section>

      <Section id="weight" heading="Weight and oven transfer">
        <p>
          Many duck breast methods finish in the oven after searing. Confirm the handle is
          oven-safe to the temperature you need, and be honest about whether you can comfortably
          lift the pan one-handed with a towel — cast iron in particular gets heavy fast once
          you're moving it in and out of a hot oven repeatedly.
        </p>
      </Section>

      <Section id="cleanup" heading="Cleanup and seasoning maintenance">
        <p>
          Cast iron and carbon steel both need drying and a light re-oiling after washing to keep
          their seasoning intact — skip this step regularly and they'll start to stick and rust.
          Stainless clad tolerates a dishwasher and harsher cleaning, which matters if maintenance
          is the deciding factor for you.
        </p>
      </Section>

      <Section id="why-not-nonstick" heading="Why non-stick is the wrong tool here">
        <p>
          Two separate problems rule it out. First, most non-stick coatings aren't rated for the
          sustained higher heat that a proper duck-skin sear needs, and pushing them there shortens
          the coating's life. Second, and more fundamentally, the coating's entire purpose is to
          stop food from sticking — which also stops the fond from forming, and fond is most of
          the reason to build a pan sauce in the first place. If cleanup convenience is the appeal,
          carbon steel with proper seasoning gets most of the way there without either trade-off.
        </p>
      </Section>

      <Section id="profiles" heading="Three buyer profiles">
        <p>
          <strong>Choose cast iron if:</strong> maximum, even crisp is your top priority and you
          don't mind a slower response or an awkward pour.
        </p>
        <p>
          <strong>Choose carbon steel if:</strong> you want the best all-round compromise — fast
          response, good fond, and light enough to pour off fat without dread.
        </p>
        <p>
          <strong>Choose stainless clad if:</strong> a pan sauce with wine, citrus, or fruit is
          part of your regular routine and you want to build it in the same pan you seared in.
        </p>
      </Section>

      <Section id="matrix" heading="The decision matrix">
        <p>
          The whole sequence, material by material. Read down the column for the pan you already own
          to see which step it will fight you on.
        </p>
        <DecisionMatrixTable guide={DG} />
      </Section>

      <BestForGrid guide={DG} />

      <Section id="compare" heading="Compare the four categories">
        <ComparisonTable caption="Pan categories for duck breast" rows={PANS} factors={PAN_FACTORS} />
        <div className="mt-6 grid gap-6">
          {PANS.map((row) => (
            <ComparisonCard key={row.id} row={row} factors={PAN_FACTORS} />
          ))}
        </div>
        <Callout label="No hands-on testing" tone="gold">
          <p>
            None of the categories above reflects a hands-on test by DeliciousDuck, and no
            affiliate relationship is currently active with any manufacturer.
          </p>
        </Callout>
      </Section>

      <DuckBreastJourney
        id="cluster-technique-first"
        title="The technique this pan has to serve"
        intro="Buy for the method, not the other way round. These are the pages that define what the pan has to do."
        placement="pan_technique_first"
        groups={["before", "stove", "troubleshooting"]}
        excludePath="/gear/best-pan-for-duck-breast"
      />

      <ShopThisGuide
        items={[
          {
            label: "A pan that suits your method, not the category everyone recommends",
            why: "Match thermal behaviour to how you actually cook, then read the technique guide against it.",
            to: "/cook/how-to-cook-duck-breast",
            linkLabel: "See the cold-pan method",
          },
          {
            label: "A plan for the rendered fat",
            why: "A duck breast sear produces real fat — decide where it's going before you start.",
            to: "/learn/how-to-render-duck-fat",
            linkLabel: "See how to render and store it",
          },
        ]}
      />

      <FaqList items={FAQ} />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
