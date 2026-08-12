import { createFileRoute } from "@tanstack/react-router";
import { ArticleShell, FaqList, Section, StepList } from "@/components/site/ArticleShell";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { UseTheWholeDuck } from "@/components/site/UseTheWholeDuck";
import { guideByPath } from "@/data/guides";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

const GUIDE = guideByPath("/learn/how-to-carve-a-duck")!;

export const Route = createFileRoute("/learn/how-to-carve-a-duck")({
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
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: HowToCarveADuckPage,
});

const FAQ = [
    {
      q: "Should I carve at the table or in the kitchen?",
      a: "Kitchen carving is easier to control for a whole duck because of the fat runoff; bring the platter to the table once it's plated.",
    },
    {
      q: "Do I need a special carving knife?",
      a: "A sharp chef's knife or a slim boning knife both work well; length matters less than a thin, controllable tip for following the keel bone.",
    },
    {
      q: "Why is my duck harder to carve than a chicken?",
      a: "Duck has a narrower ribcage relative to its breast meat and a thicker fat layer, both of which make the knife's path along the bone less obvious than on a chicken.",
    },
  ];

function HowToCarveADuckPage() {
  return (
    <ArticleShell
      eyebrow="Learn · Whole duck"
      title={GUIDE.title}
      intro="Duck carves differently from chicken — the bone structure is smaller and the joints sit in slightly different places. Work in this order and the skin stays intact."
      trail={[
        { name: "Learn", to: "/learn" },
        { name: GUIDE.title, to: GUIDE.path },
      ]}
      meta={`${GUIDE.minutes} min read`}
    >
      <Section id="rest" heading="Rest first, and why it matters">
        <p>
          Carve too soon and juices that should stay in the meat run straight onto the board
          instead. A whole duck needs 15–20 minutes loosely tented with foil after it comes out of
          the oven — this is long enough for the temperature to equalise and the muscle fibres to
          relax, without the bird going cold. Use the rest to set up your board.
        </p>
      </Section>

      <Section id="board-setup" heading="Board setup and fat containment">
        <p>
          Duck releases more fat and juice onto the board than chicken does. Use a board with a
          juice groove if you have one, or set a rimmed sheet pan under a flat board to catch
          runoff. Have a warmed serving platter ready so slices don't sit cooling on a cold plate
          while you finish carving, and keep a small bowl nearby for the trimmings that go to
          stock.
        </p>
      </Section>

      <StepList
        steps={[
          {
            title: "Remove the legs at the hip joint",
            body: "Pull each leg gently away from the body and cut through the skin where the leg meets the breast. Continue until you find the hip joint, then cut through the joint itself rather than sawing through bone — it should pop apart with the knife tip guiding it.",
            watchFor: "Cutting too close to the backbone, which leaves meat behind on the carcass instead of on the leg.",
          },
          {
            title: "Separate drumstick and thigh",
            body: "Lay the leg skin-side down, find the thin line of fat marking the joint between drumstick and thigh, and cut straight through it. This is optional if you're serving whole legs, but it gives cleaner portions for a plated meal.",
          },
          {
            title: "Remove each breast along the keel bone",
            body: "Run the knife tip down one side of the raised breastbone (the keel) from front to back, keeping the blade angled against the bone. Follow the ribcage curve outward and down until the whole breast lobe releases in one piece, skin attached.",
            watchFor: "Sawing motions that shred the skin — use long, single strokes and let the knife follow the bone.",
          },
          {
            title: "Slice across the grain",
            body: "Set each breast skin-side up and slice on a slight diagonal, across the direction the muscle fibres run, into pieces about 1 cm (0.4 in) thick. This shortens the fibres in each bite and keeps slices tender.",
          },
          {
            title: "Take the wings and the oysters",
            body: "Cut the wings off where they join the body. Don't forget the two small, rich rounds of meat — the oysters — set into shallow hollows on either side of the backbone; a spoon or the knife tip lifts them out cleanly.",
          },
          {
            title: "Send the carcass to stock",
            body: "Once the meat is off, break the carcass down and add it, along with wing tips and any trimmings, to a stockpot with aromatics rather than the bin.",
          },
        ]}
      />

      <Section id="troubleshooting" heading="If it fights you">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">The leg won't separate at the joint.</span>{" "}
            You're probably cutting into bone rather than the joint itself. Bend the leg away from
            the body first to make the joint pop up and visible, then cut there.
          </li>
          <li>
            <span className="font-semibold text-foreground">The breast is tearing instead of releasing in one piece.</span>{" "}
            The knife has likely drifted away from the bone. Reset at the top of the keel and start
            again, keeping the blade angled inward against the ribcage as you go.
          </li>
          <li>
            <span className="font-semibold text-foreground">Skin is slipping off the meat as you slice.</span>{" "}
            The bird may have rested too long, or the skin didn't crisp fully during roasting. Slice
            more gently and lay the skin back over each portion rather than trying to keep it fused.
          </li>
        </ul>
      </Section>

      <UseTheWholeDuck
        items={[
          {
            part: "Carcass, wing tips and trimmings",
            use: "Simmer with onion, carrot, celery and a bay leaf for 3–4 hours for a rich, fatty stock worth freezing in portions.",
          },
          {
            part: "Rendered fat left in the roasting tray",
            use: "Strain and refrigerate — it's the same fat you'd buy in a jar, at no extra cost.",
            to: "/learn/how-to-render-duck-fat",
            linkLabel: "How to render and store duck fat",
          },
        ]}
      />

      <FaqList items={FAQ} />

      <RelatedGuides paths={GUIDE.related} />
    </ArticleShell>
  );
}
