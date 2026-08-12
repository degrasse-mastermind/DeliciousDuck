import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageMeta({
      title: "Privacy Policy | DeliciousDuck",
      description:
        "How DeliciousDuck handles personal data, newsletter email addresses, analytics, and affiliate cookies.",
      path: "/privacy",
    }),
  component: PrivacyPage,
});

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "Who we are",
    body: (
      <p>
        DeliciousDuck.com is an independent editorial site about buying, preparing, and cooking
        duck. This policy explains what data the site handles, why, and what choices you have. If
        you have a question or a request about your data, contact us at{" "}
        <a href="mailto:privacy@deliciousduck.com" className="text-primary underline underline-offset-4">
          privacy@deliciousduck.com
        </a>
        .
      </p>
    ),
  },
  {
    heading: "What we collect",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="text-foreground">Nothing you type into our calculators.</strong> Every
          tool on the site runs entirely in your browser. Weights, guest counts, and temperatures
          are never transmitted to us or stored anywhere.
        </li>
        <li>
          <strong className="text-foreground">Search queries you submit</strong> appear in the page
          URL and may be recorded in ordinary web-server logs. They are not linked to an identity.
        </li>
        <li>
          <strong className="text-foreground">Email address</strong> — only if you submit the
          newsletter form. The address, the date you joined, and which page you signed up from are
          stored in DeliciousDuck&apos;s own database, which is our record of the list. The address
          is then passed to our email provider, Resend, so we can send the emails you asked for. We
          do not ask for your name and do not attach the address to your browsing.
        </li>

        <li>
          <strong className="text-foreground">Technical request data</strong> — IP address, browser
          user agent, referring page, and pages requested, kept in short-lived server logs for
          security and reliability.
        </li>
      </ul>
    ),
  },
  {
    heading: "Cookies and analytics",
    body: (
      <p>
        We do not use advertising or cross-site tracking cookies. If aggregate analytics are used,
        they measure which guides, recipes, and tools are useful — never individual profiles.
        Following an affiliate link may allow that retailer to set its own cookies under their
        privacy policy, which we do not control; see our{" "}
        <a href="/affiliate-disclosure" className="text-primary underline underline-offset-4">
          affiliate disclosure
        </a>
        .
      </p>
    ),
  },
  {
    heading: "How we use and share data",
    body: (
      <p>
        We use data only to operate and improve the site and, where you have opted in, to send the
        content you asked for. We do not sell personal data and do not share it with advertisers.
        Newsletter addresses are processed by Resend (resend.com), our email delivery and list
        provider, acting on our instructions; site hosting providers process ordinary request data.
        If those processors change, this page is updated before the change takes effect.
      </p>

    ),
  },
  {
    heading: "Retention",
    body: (
      <p>
        Server logs are retained for a short operational period and then discarded. Newsletter email
        addresses, once collected, are kept until you unsubscribe or ask us to delete them,
        whichever comes first. Every newsletter email will carry a one-click unsubscribe link.
      </p>
    ),
  },
  {
    heading: "Your rights",
    body: (
      <p>
        Depending on where you live, you may have the right to access, correct, export, or delete
        personal data we hold about you, to object to processing, and to withdraw consent. Email{" "}
        <a href="mailto:privacy@deliciousduck.com" className="text-primary underline underline-offset-4">
          privacy@deliciousduck.com
        </a>{" "}
        and we will respond within 30 days. Because we hold very little data, most requests can be
        answered quickly.
      </p>
    ),
  },
  {
    heading: "Children",
    body: (
      <p>
        The site is intended for a general adult audience. We do not knowingly collect personal data
        from children under 13 (or under 16 in the EEA/UK). If you believe a child has submitted
        data, contact us and we will delete it.
      </p>
    ),
  },
  {
    heading: "Changes to this policy",
    body: (
      <p>
        If we start collecting anything materially new — including switching the newsletter on — we
        will update this page and note the change here before that collection begins.
      </p>
    ),
  },
];

function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        intro="What data this site handles, why, and the choices you have. Our calculators run entirely in your browser and send us nothing."
        trail={[{ name: "Privacy", to: "/privacy" }]}
      />
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
        <p className="mb-10 text-sm uppercase tracking-widest text-muted-foreground">
          Last updated: August 2026 — informational, not attorney-reviewed
        </p>
        <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
          {SECTIONS.map((s) => (
            <div key={s.heading} className="space-y-3">
              <h2 className="font-display text-2xl text-foreground">{s.heading}</h2>
              {s.body}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
