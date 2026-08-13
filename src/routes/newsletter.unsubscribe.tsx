import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { unsubscribeByTokenFn } from "@/lib/newsletter-preferences.functions";
import { TOKEN_PARAM } from "@/lib/newsletter-links";

/**
 * Mailbox-token unsubscribe page.
 *
 * Read-only on GET, by design: email security scanners and link previewers fetch
 * every URL in a message, so a GET that unsubscribed would opt people out
 * without them ever clicking. The change happens only when the reader presses
 * the button, which issues a POST.
 *
 * The page never shows an email address, never says whether the token is valid,
 * and never reveals list membership. noindex/nofollow because the URL carries a
 * one-time token.
 */
export const Route = createFileRoute("/newsletter/unsubscribe")({
  validateSearch: (search: Record<string, unknown>) => ({
    [TOKEN_PARAM]: typeof search[TOKEN_PARAM] === "string" ? (search[TOKEN_PARAM] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Unsubscribe from The Duck Drop | DeliciousDuck" },
      {
        name: "description",
        content: "Confirm that you want to stop receiving DeliciousDuck emails.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const search = Route.useSearch();
  const token = search[TOKEN_PARAM];
  const unsubscribe = useServerFn(unsubscribeByTokenFn);
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");

  async function onConfirm() {
    setState("working");
    try {
      await unsubscribe({ data: { token } });
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 lg:py-24">
      <span className="eyebrow block text-primary">The Duck Drop</span>
      <h1 className="mt-3 font-display text-3xl leading-tight text-foreground lg:text-4xl">
        {state === "done" ? "You're unsubscribed" : "Unsubscribe from DeliciousDuck emails"}
      </h1>

      {state === "done" ? (
        <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            If this link belonged to a current subscription, it has been ended. You will not receive
            further Duck Drop emails at that address.
          </p>
          <p>
            This link is now used up. Everything on the site stays free and open — no email needed.
          </p>
          <Link to="/" className="inline-block font-medium text-primary underline">
            Back to DeliciousDuck
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>
            Nothing has changed yet. Press the button below to stop all Duck Drop emails. We keep a
            record that this address opted out, so we do not email it again.
          </p>
          <p>
            Prefer fewer, more relevant emails instead?{" "}
            <Link
              to="/newsletter/preferences"
              search={{ t: token }}
              className="font-medium text-primary underline"
            >
              Update what you get
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={onConfirm}
            disabled={state === "working"}
            className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground disabled:opacity-60"
          >
            {state === "working" ? "Working…" : "Confirm unsubscribe"}
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
