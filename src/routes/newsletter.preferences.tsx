import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { setInterestByTokenFn } from "@/lib/newsletter-preferences.functions";
import { TOKEN_PARAM } from "@/lib/newsletter-links";
import { NEWSLETTER_INTERESTS, type NewsletterInterest } from "@/data/newsletter-contexts";

/**
 * Mailbox-token preference page.
 *
 * Read-only on GET (scanners follow email links), so choosing an interest only
 * takes effect on the explicit POST. The page shows no email address and no
 * membership state: an unknown, rotated or unsubscribed token gets the same
 * confirmation as a valid one.
 */
export const Route = createFileRoute("/newsletter/preferences")({
  validateSearch: (search: Record<string, unknown>) => ({
    [TOKEN_PARAM]: typeof search[TOKEN_PARAM] === "string" ? (search[TOKEN_PARAM] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Email preferences | DeliciousDuck" },
      {
        name: "description",
        content: "Choose which kind of duck cooking email you want from DeliciousDuck.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: PreferencesPage,
});

const LABELS: Record<NewsletterInterest, string> = {
  "duck-breast": "Duck breast — searing, scoring, temperature",
  "whole-duck": "Whole duck — roasting, timing, carving",
  "duck-fat": "Duck fat — rendering, storing, cooking with it",
  sourcing: "Buying duck — where to order, what to pay",
  "wild-duck": "Wild duck — lean birds and game handling",
  general: "A bit of everything",
};

function PreferencesPage() {
  const search = Route.useSearch();
  const token = search[TOKEN_PARAM];
  const save = useServerFn(setInterestByTokenFn);
  const [choice, setChoice] = useState<NewsletterInterest>("general");
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");

  async function onSave() {
    setState("working");
    try {
      await save({ data: { token, interest: choice } });
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 lg:py-24">
      <span className="eyebrow block text-primary">The Duck Drop</span>
      <h1 className="mt-3 font-display text-3xl leading-tight text-foreground lg:text-4xl">
        {state === "done" ? "Preference saved" : "What should we send you?"}
      </h1>

      {state === "done" ? (
        <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            Thanks — if this link belonged to a current subscription, future emails will lean toward
            that topic. You can change it again from any email.
          </p>
          <Link to="/" className="inline-block font-medium text-primary underline">
            Back to DeliciousDuck
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          <p className="text-base leading-relaxed text-muted-foreground">
            Nothing changes until you press save. Pick the topic you want most.
          </p>
          <fieldset className="space-y-3">
            <legend className="sr-only">Email topic</legend>
            {NEWSLETTER_INTERESTS.map((interest) => (
              <label
                key={interest}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4"
              >
                <input
                  type="radio"
                  name="interest"
                  value={interest}
                  checked={choice === interest}
                  onChange={() => setChoice(interest)}
                  className="mt-1"
                />
                <span className="text-sm text-foreground">{LABELS[interest]}</span>
              </label>
            ))}
          </fieldset>
          <button
            type="button"
            onClick={onSave}
            disabled={state === "working"}
            className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground disabled:opacity-60"
          >
            {state === "working" ? "Saving…" : "Save preference"}
          </button>
          {state === "error" ? (
            <p role="alert" className="text-sm text-destructive">
              Something went wrong on our side. Please try again in a moment.
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Would rather stop entirely?{" "}
            <Link
              to="/newsletter/unsubscribe"
              search={{ t: token }}
              className="font-medium text-primary underline"
            >
              Unsubscribe
            </Link>
            .
          </p>
        </div>
      )}
    </main>
  );
}
