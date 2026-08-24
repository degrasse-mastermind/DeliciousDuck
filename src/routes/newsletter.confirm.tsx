import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { confirmSubscriptionFn } from "@/lib/newsletter-confirmation.functions";
import { CONFIRM_TOKEN_PARAM } from "@/lib/newsletter-confirmation";
import { trackNewsletterConfirmed } from "@/lib/analytics";
import { FIELD_GUIDE, STARTER_GUIDE } from "@/data/starter-guide";

/**
 * Double opt-in confirmation page.
 *
 * Read-only on GET, deliberately: email security scanners and link previewers
 * fetch every URL in a message, so a GET that confirmed would subscribe people
 * who never pressed anything — which is exactly what double opt-in exists to
 * prevent. The subscription is only activated when the reader presses the
 * button, which issues a POST.
 *
 * The page never shows an email address and never reveals anything about a list
 * other than the outcome of the reader's own emailed link. noindex/nofollow
 * because the URL carries a one-time token.
 */
export const Route = createFileRoute("/newsletter/confirm")({
  validateSearch: (search: Record<string, unknown>) => ({
    [CONFIRM_TOKEN_PARAM]:
      typeof search[CONFIRM_TOKEN_PARAM] === "string"
        ? (search[CONFIRM_TOKEN_PARAM] as string)
        : "",
  }),
  head: () => ({
    meta: [
      { title: "Confirm your DeliciousDuck subscription | DeliciousDuck" },
      {
        name: "description",
        content:
          "Confirm your email address to receive your Duck Game Plan, the printable field guide and The Duck Drop.",
      },
      { property: "og:title", content: "Confirm your DeliciousDuck subscription" },
      {
        property: "og:description",
        content: "One press confirms your email and sends your duck game plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: ConfirmPage,
});

type State = "idle" | "working" | "confirmed" | "already" | "invalid" | "error";

function ConfirmPage() {
  const search = Route.useSearch();
  const token = search[CONFIRM_TOKEN_PARAM];
  const confirm = useServerFn(confirmSubscriptionFn);
  const [state, setState] = useState<State>("idle");

  async function onConfirm() {
    setState("working");
    try {
      const { result } = await confirm({ data: { token } });
      if (result === "confirmed") {
        // The genuine acquisition conversion: a proven, deliverable mailbox.
        trackNewsletterConfirmed({ placement: "newsletter_confirm" });
      }
      setState(result === "confirmed" ? "confirmed" : result === "already" ? "already" : "invalid");
    } catch {
      setState("error");
    }
  }

  const settled = state === "confirmed" || state === "already";

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 lg:py-24">
      <span className="eyebrow block text-primary">The Duck Drop</span>
      <h1 className="mt-3 font-display text-3xl leading-tight text-foreground lg:text-4xl">
        {settled ? "You're confirmed" : "Confirm your email"}
      </h1>

      {settled ? (
        <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            {state === "confirmed"
              ? "Thanks — your address is confirmed. If you built a duck game plan, it's on its way to your inbox now, along with the printable field guide and The Duck Drop."
              : "This address was already confirmed, so there was nothing left to do. Your emails come from hello@deliciousduck.com."}
          </p>
          <p>
            Nothing on the site is gated: you can read the{" "}
            <Link to={STARTER_GUIDE.path} className="font-medium text-primary underline">
              Duck Cooking Starter Guide
            </Link>{" "}
            and download the {FIELD_GUIDE.pages}-page{" "}
            <a href={FIELD_GUIDE.path} className="font-medium text-primary underline">
              field guide
            </a>{" "}
            right now.
          </p>
          <Link to="/" className="inline-block font-medium text-primary underline">
            Back to DeliciousDuck
          </Link>
        </div>
      ) : state === "invalid" ? (
        <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            This link can&apos;t be used. It may have been copied incompletely, or it may belong to
            an address that has since opted out. Nothing has changed.
          </p>
          <p>
            You can sign up again from the{" "}
            <Link to="/tools/duck-game-plan" className="font-medium text-primary underline">
              Duck Game Plan
            </Link>{" "}
            and we&apos;ll send a fresh confirmation email.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>
            Nothing has been sent yet. Press the button below to confirm that this mailbox asked for
            DeliciousDuck email. We confirm every address first, so nobody can be signed up by
            someone else.
          </p>
          <p>
            Once confirmed you get your duck game plan (if you built one), the printable{" "}
            {FIELD_GUIDE.pages}-page field guide, and The Duck Drop. You can unsubscribe from any
            email in one click.
          </p>
          <button
            type="button"
            onClick={onConfirm}
            disabled={state === "working"}
            className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground disabled:opacity-60"
          >
            {state === "working" ? "Confirming…" : "Confirm my email"}
          </button>
          {state === "error" ? (
            <p role="alert" className="text-sm text-destructive">
              Something went wrong on our side. Please try again in a moment.
            </p>
          ) : null}
        </div>
      )}
    </main>
  );
}
