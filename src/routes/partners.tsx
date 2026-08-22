import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeader } from "@/components/site/SectionHeader";
import { SKETCH } from "@/lib/sketch-art";
import { SketchFigure } from "@/components/site/SketchFigure";
import { CTA, COMMERCE_PANEL } from "@/lib/cta";
import { breadcrumbSchema, ldScript, pageMeta } from "@/lib/seo";
import { trackPartnerInquiryClick } from "@/lib/analytics";
import type { PartnerPlacement } from "@/lib/partner-events";

export const Route = createFileRoute("/partners")({
  head: () => ({
    ...pageMeta({
      title: "Partner With DeliciousDuck",
      description:
        "Sponsor useful, permanent duck content: one founding content partnership at $750, with a feature, supplier profile, video scripts, newsletter placement, and an asset pack.",
      path: "/partners",
      ogType: "website",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Partner With Us", item: "/partners" },
        ]),
      ),
    ],
  }),
  component: PartnersPage,
});

const EMAIL = "hello@deliciousduck.com";

const INQUIRY_BODY = [
  "Brand / company:",
  "Product or products involved:",
  "Website:",
  "Desired timing:",
  "What you want this campaign to accomplish:",
  "",
  "Anything else we should know:",
].join("\n");

function inquiryMailto(): string {
  const subject = encodeURIComponent("Founding Partnership Inquiry — [Brand Name]");
  const body = encodeURIComponent(INQUIRY_BODY);
  return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
}

function InquiryCta({
  placement,
  label,
  variant = "primary",
}: {
  placement: PartnerPlacement;
  label: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <a
      href={inquiryMailto()}
      className={variant === "primary" ? CTA.primary : CTA.secondary}
      onClick={() => trackPartnerInquiryClick({ placement })}
    >
      {label}
    </a>
  );
}

function EmailFallback() {
  return (
    <p className="text-sm text-muted-foreground">
      Or write to us directly:{" "}
      <span className="font-semibold text-foreground">{EMAIL}</span>. You&rsquo;ll receive a fit
      and availability response within two business days.
    </p>
  );
}

const SAMPLE_FORMATS: { format: string; title: string; body: string; detail: string }[] = [
  {
    format: "Sample format — recipe or tutorial",
    title: "Seared duck breast with a producer’s cherry preserve",
    body: "A full method page written the way our cooking guides are written: timing, pan temperature, doneness, and where your product genuinely belongs in the process.",
    detail: "Structured for search and for a cook standing at the stove.",
  },
  {
    format: "Sample format — partner profile",
    title: "How this farm raises and finishes its ducks",
    body: "A permanent page explaining what a partner actually does, which cuts they sell, and what a home cook should expect when the box arrives.",
    detail: "Useful to readers, and reusable by your own sales team.",
  },
  {
    format: "Sample format — social content system",
    title: "Three vertical scripts from one feature",
    body: "Short-form concepts and finished, edit-ready scripts drawn from the same feature: the hook, the beats, the on-screen text, and the closing line.",
    detail: "Scripts and concepts, ready for your production team to shoot.",
  },
];

const DELIVERABLES: string[] = [
  "One permanent sponsored recipe, tutorial, or buying-guide feature, with the topic agreed in advance",
  "One permanent partner or supplier profile",
  "Three short-form vertical video concepts with finished, edit-ready scripts",
  "One newsletter feature in the next relevant edition",
  "A partner-ready image and copy asset pack derived from the feature, with defined reuse rights",
  "A concise 30-day performance summary covering available pageviews, clicks, and engagement signals",
];

const TERMS: string[] = [
  "$750, paid before production begins",
  "One reasonable revision round",
  "Typical delivery target: 10 business days after assets, product information, and approvals are received",
  "Sponsorship is clearly disclosed on the page",
  "No guaranteed traffic, rankings, or sales",
  "Only three founding positions are available at this price",
  "Subject to editorial fit and acceptance",
];

const REUSE_FLOW: { label: string; body: string }[] = [
  { label: "Search", body: "The feature answers a question cooks already type into Google." },
  { label: "Email", body: "The same work carries a newsletter feature to a duck-focused list." },
  { label: "Social", body: "Three vertical scripts come out of the feature, not out of thin air." },
  { label: "Sales", body: "Your team can send one credible page instead of explaining duck twice." },
  { label: "Your channels", body: "The asset pack ships with defined reuse rights for your own site and feeds." },
];

const GOOD_FIT: string[] = [
  "Duck producers, farms, and specialty-meat suppliers",
  "Specialty-food brands whose products belong beside duck: preserves, vinegars, fats, spice blends, wine and cider",
  "Cookware, knife, and thermometer companies whose gear genuinely helps with duck",
  "Brands that want content they can keep using rather than a one-week burst",
  "Partners comfortable with honest limitations stated in writing",
];

const NOT_FIT: string[] = [
  "Anyone who wants to buy a ranking, a rating, or a predetermined conclusion",
  "Products with no real connection to duck or duck cooking",
  "Campaigns that need guaranteed traffic, sales, or performance numbers",
  "Brands looking for a claim that we have personally tested their product",
  "Anyone needing filmed video production rather than concepts and scripts",
];

function PartnersPage() {
  return (
    <>
      <PageHeader
        eyebrow="DeliciousDuck Partnerships"
        title="Put your brand inside the answer duck cooks are already looking for"
        intro="DeliciousDuck is a focused editorial site helping home cooks buy, prepare, and enjoy duck with confidence. Partners sponsor useful, permanent content in that category — written to our standards, and yours to keep using."
        trail={[{ name: "Partner With Us", to: "/partners" }]}
        art={SKETCH.ducksFlight}
      />

      <section className="mx-auto max-w-7xl px-5 pt-12 lg:px-8 lg:pt-16">
        <div className="flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-center">
          <InquiryCta placement="partners_hero" label="Request a Founding Partner Slot" />
          <EmailFallback />
        </div>
      </section>

      {/* What we create */}
      <section
        aria-labelledby="what-we-create"
        className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24"
      >
        <SectionHeader
          id="what-we-create"
          eyebrow="What we create"
          title="Three formats, one piece of useful work"
          intro="Illustrative sample formats — not completed campaigns or past client work. Every topic is agreed with you before production begins."
        />

        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {SAMPLE_FORMATS.map((card) => (
            <li key={card.format} className="flex flex-col rounded-sm border border-border bg-card p-6">
              <p className="eyebrow text-primary">{card.format}</p>
              <h3 className="mt-3 font-display text-xl leading-snug text-foreground">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
              <p className="mt-4 border-t border-border pt-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {card.detail}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* The offer */}
      <section aria-labelledby="founding-offer" className="bg-cream">
        <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
          <div className={`${COMMERCE_PANEL} bg-background/80`}>
            <p className="eyebrow text-primary">Founding content partnership</p>
            <h2
              id="founding-offer"
              className="mt-3 font-display text-3xl leading-tight text-foreground lg:text-[2.5rem]"
            >
              $750
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              Built for brands that want credible, useful duck-focused content they can keep using.
            </p>

            <h3 className="mt-8 font-display text-xl text-foreground">What&rsquo;s included</h3>
            <ol className="mt-4 space-y-3">
              {DELIVERABLES.map((item, i) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span aria-hidden="true" className="font-display text-base text-accent">
                    {i + 1}.
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>

            <h3 className="mt-8 font-display text-xl text-foreground">Terms</h3>
            <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
              {TERMS.map((term) => (
                <li key={term} className="border-t border-border pt-2">
                  {term}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <InquiryCta placement="partners_offer" label="Request a Founding Partner Slot" />
              <EmailFallback />
            </div>
          </div>
        </div>
      </section>

      {/* Why this model */}
      <section
        aria-labelledby="why-this-model"
        className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,38%)]">
          <div>
            <SectionHeader
              id="why-this-model"
              eyebrow="Why this model"
              title="One good feature does five jobs"
              intro="Most sponsorships end when the campaign does. A useful feature keeps working, because it answers a question that keeps being asked."
            />
            <ol className="mt-8 divide-y divide-border border-y border-border">
              {REUSE_FLOW.map((step, i) => (
                <li key={step.label} className="flex gap-4 py-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 font-display text-sm text-accent"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-display text-lg text-foreground">{step.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="order-first lg:order-none">
            <SketchFigure art={SKETCH.toolsDesk} />
          </div>
        </div>
      </section>

      {/* Fit */}
      <section aria-labelledby="fit" className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <SectionHeader id="fit" eyebrow="Fit" title="A good fit, and not a fit" />
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="font-display text-xl text-foreground">A good fit</h3>
              <ul className="mt-4 space-y-3">
                {GOOD_FIT.map((item) => (
                  <li
                    key={item}
                    className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">Not a fit</h3>
              <ul className="mt-4 space-y-3">
                {NOT_FIT.map((item) => (
                  <li
                    key={item}
                    className="border-l-2 border-border pl-4 text-sm leading-relaxed text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial independence */}
      <section
        aria-labelledby="independence"
        className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24"
      >
        <h2 id="independence" className="font-display text-3xl text-foreground">
          Where sponsorship stops
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            Partners can sponsor content. Partners cannot buy rankings, reviews, ratings, or a
            favourable conclusion. Recommendations in our buying and gear guides are decided
            editorially, and a partnership does not change what those pages say.
          </p>
          <p>
            Sponsored work is labelled as sponsored. We describe what a product is and where it
            fits, and we do not claim hands-on testing that has not happened. If the honest version
            of a feature would not help a cook, we will say so before you pay rather than after.
          </p>
          <p>
            Our{" "}
            <Link to="/editorial-standards" className="text-primary underline underline-offset-4">
              editorial standards
            </Link>{" "}
            and{" "}
            <Link
              to="/affiliate-disclosure"
              className="text-primary underline underline-offset-4"
            >
              affiliate disclosure
            </Link>{" "}
            set out those limits in full, and they apply to partner work without exception.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section aria-labelledby="final-cta" className="bg-forest-deep text-forest-foreground">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center lg:px-8 lg:py-20">
          <h2
            id="final-cta"
            className="font-display text-3xl leading-tight lg:text-[2.5rem]"
          >
            Request a Founding Partner Slot
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-forest-foreground/80">
            Tell us the brand, the product, and what you want the campaign to accomplish. Three
            founding positions are available at this price, subject to editorial fit.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <InquiryCta placement="partners_final" label="Request a Founding Partner Slot" />
            <p className="text-sm text-forest-foreground/75">
              Or write to us directly:{" "}
              <span className="font-semibold text-forest-foreground">{EMAIL}</span>. You&rsquo;ll
              receive a fit and availability response within two business days.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
