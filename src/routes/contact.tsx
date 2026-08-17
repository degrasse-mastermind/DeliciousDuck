import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { breadcrumbSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    ...pageMeta({
      title: "Contact DeliciousDuck",
      description:
        "How to reach DeliciousDuck: one email address for general questions, factual and food-safety corrections, privacy requests, and partnership enquiries.",
      path: "/contact",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Contact", item: "/contact" },
        ]),
      ),
    ],
  }),
  component: ContactPage,
});

const EMAIL = "hello@deliciousduck.com";

const REASONS: { heading: string; body: string; subject: string; cta: string }[] = [
  {
    heading: "General questions",
    body: "Something on the site unclear, or a duck question a guide didn't answer? Ask, and we will point you to the right page or write one.",
    subject: "General question",
    cta: "Email a general question",
  },
  {
    heading: "Factual or food-safety corrections",
    body: "If a temperature, time, or safety statement looks wrong, tell us what page it is on and what you believe is correct. Safety corrections are read first.",
    subject: "Correction",
    cta: "Report a correction",
  },
  {
    heading: "Privacy and data requests",
    body: "Access, correction, export, or deletion of personal data we hold, plus questions about our newsletter records. See the privacy policy for what we store.",
    subject: "Privacy request",
    cta: "Send a privacy request",
  },
  {
    heading: "Partnerships and commercial enquiries",
    body: "Producers, retailers, and brands can write to us. Our editorial standards and affiliate disclosure explain the limits we place on commercial relationships.",
    subject: "Partnership enquiry",
    cta: "Email about a partnership",
  },
];

function mailto(subject: string) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
}

function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Contact DeliciousDuck"
        intro="DeliciousDuck is an independent editorial site about buying, preparing, and cooking duck. One address reaches us for everything below."
        trail={[{ name: "Contact", to: "/contact" }]}
      />

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="border-l-2 border-accent pl-5">
          <p className="eyebrow text-primary">Email us</p>
          <p className="mt-2 font-display text-3xl text-foreground">
            <a
              href={mailto("DeliciousDuck enquiry")}
              className="underline decoration-accent underline-offset-4"
            >
              {EMAIL}
            </a>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This is our only verified contact address. Adding a short subject line from the
            suggestions below helps your message reach the right person.
          </p>
        </div>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-muted-foreground">
          {REASONS.map((r) => (
            <div key={r.heading} className="space-y-3">
              <h2 className="font-display text-2xl text-foreground">{r.heading}</h2>
              <p>{r.body}</p>
              <p>
                <a
                  href={mailto(r.subject)}
                  className="text-primary underline underline-offset-4"
                >
                  {r.cta}
                </a>{" "}
                <span className="text-sm">
                  (subject: &ldquo;{r.subject}&rdquo;)
                </span>
              </p>
            </div>
          ))}
        </div>

        <p className="mt-14 text-sm text-muted-foreground">
          Related:{" "}
          <Link to="/privacy" className="text-primary underline underline-offset-4">
            privacy policy
          </Link>
          ,{" "}
          <Link to="/terms" className="text-primary underline underline-offset-4">
            terms of use
          </Link>
          ,{" "}
          <Link to="/editorial-standards" className="text-primary underline underline-offset-4">
            editorial standards
          </Link>
          , and{" "}
          <Link to="/affiliate-disclosure" className="text-primary underline underline-offset-4">
            affiliate disclosure
          </Link>
          .
        </p>
      </section>
    </>
  );
}
