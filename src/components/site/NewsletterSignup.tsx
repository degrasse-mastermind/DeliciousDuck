import { useRef, useState } from "react";
import { ArrowRight, Check, Clock, Download } from "lucide-react";
import {
  trackNewsletterFormError,
  trackNewsletterFormStart,
  trackNewsletterIntent,
  trackNewsletterOfferView,
  trackNewsletterPostsignupClick,
  trackNewsletterSignup,
} from "@/lib/analytics";
import { useModuleImpression } from "@/hooks/useModuleImpression";
import {
  isNewsletterEnabled,
  subscribeToNewsletter,
  type SubscribeInput,
  type SubscribeResult,
} from "@/lib/newsletter";
import { FIELD_GUIDE, STARTER_GUIDE } from "@/data/starter-guide";
import { interestForPath, newsletterContext } from "@/data/newsletter-contexts";
import type { NewsletterInterest } from "@/data/newsletter-contexts";

import { NEWSLETTER_CONSENT } from "@/lib/newsletter-consent";
import { CTA } from "@/lib/cta";
import { LeadMagnetDownloadLink } from "@/components/site/TrackedLinks";

/**
 * Honest-by-default signup, with contextual promises.
 *
 * One component, one data model, one real lead magnet: the Field Guide PDF.
 * The `interest` prop selects a cluster-specific promise and post-signup link
 * set from `@/data/newsletter-contexts` — it never changes what subscribers
 * actually receive.
 *
 * The backend is owned by `src/lib/newsletter.ts`. Validation runs client-side
 * first, then the server function validates again, rate-limits, checks the
 * honeypot, and durably upserts the subscriber into the project database (the
 * source of truth) before best-effort syncing to Resend for delivery. The
 * success state and the GA4 `newsletter_signup` conversion only fire after
 * durable storage succeeds; any failure keeps the form open.
 *
 * Funnel measurement (GA4 + PostHog, both non-PII): `newsletter_offer_view`
 * once the module is meaningfully visible, `newsletter_form_start` on the first
 * real interaction with the field, `newsletter_form_error` with a categorical
 * `error_type` when an attempt fails, and the existing `newsletter_signup` on
 * success. Together they give offer view -> start -> error -> signup, with the
 * view event deduped per session so a scroll back up cannot inflate it.
 *
 * GA4: `newsletter_intent` covers interaction either way; `newsletter_signup`
 * is emitted once per successful subscription and never on mount;
 * `newsletter_postsignup_click` covers the "Start here" module. No event ever
 * carries the email address.
 */
/**
 * Maps a thrown failure onto the closed `error_type` allowlist. Anything we
 * cannot confidently classify becomes `unknown` rather than leaking detail.
 */
function classifyFailure(cause: unknown): "network" | "server" | "unknown" {
  const message = cause instanceof Error ? cause.message.toLowerCase() : "";
  if (!message) return "unknown";
  if (message.includes("fetch") || message.includes("network") || message.includes("offline")) {
    return "network";
  }
  if (/\b(4\d\d|5\d\d)\b/.test(message) || message.includes("server")) return "server";
  return "unknown";
}

export function NewsletterSignup({
  id = "starter-guide",
  interest = "general",
  onSubscribe = subscribeToNewsletter,
}: {
  id?: string;
  /** Page-cluster context. Same asset, cluster-specific promise. */
  interest?: NewsletterInterest;
  onSubscribe?: ((input: SubscribeInput) => Promise<SubscribeResult | void>) | undefined;
}) {
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [intentSent, setIntentSent] = useState(false);
  const [signupSent, setSignupSent] = useState(false);

  const [startSent, setStartSent] = useState(false);
  /**
   * Focus target after a failed submission: the field the reader must correct.
   * The error paragraph is already linked with `aria-describedby`, so moving
   * focus here announces the message with the field's own name and state.
   */
  const emailRef = useRef<HTMLInputElement | null>(null);

  const enabled = typeof onSubscribe === "function" && isNewsletterEnabled();
  const context = newsletterContext(interest);

  /**
   * One offer impression per session per placement, emitted when the module is
   * actually visible rather than merely mounted below the fold.
   */
  const offerRef = useModuleImpression<HTMLElement>(() =>
    trackNewsletterOfferView({ placement: id }),
  );

  /** First meaningful interaction with the form — focus or typing, once. */
  function signalFormStart() {
    if (startSent) return;
    setStartSent(true);
    trackNewsletterFormStart({ placement: id });
  }

  /** One intent event per component instance — no double-firing. */
  function signalIntent(source: string) {
    if (intentSent) return;
    setIntentSent(true);
    trackNewsletterIntent({ placement: id, source, interest, listOpen: enabled });
  }

  const valid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  /**
   * Shows a failure and returns focus to the field the reader must fix. The
   * message text is ours, never the server's — no raw message is rendered.
   */
  function failWith(message: string) {
    setError(message);
    emailRef.current?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!onSubscribe || pending) return;
    const cleaned = email.trim().toLowerCase();
    if (!cleaned) {
      failWith("Please enter your email address.");
      trackNewsletterFormError({ placement: id, errorType: "required" });
      return;
    }
    if (!valid(cleaned) || cleaned.length > 255) {
      failWith("Please enter a valid email address.");
      // Category only — never the typed value.
      trackNewsletterFormError({ placement: id, errorType: "invalid_format" });
      return;
    }
    setError(null);
    setPending(true);
    // Path only, never the query string — no PII leaves the page.
    const sourcePath = typeof window === "undefined" ? undefined : window.location.pathname;
    try {
      await onSubscribe({
        email: cleaned,
        source: "newsletter_form",
        placement: id,
        interest: interest === "general" ? interestForPath(sourcePath) : interest,
        ...(sourcePath ? { sourcePath } : {}),
        // Exact version of the consent text rendered below the submit button.
        consentVersion: NEWSLETTER_CONSENT.version,
        trap,
      });
      // The server returns one constant shape for every accepted signup, so this
      // panel never states or implies email/list state. The download link below
      // is a static path and works regardless.
      // Success transition only — never on mount, never on a failed submit.
      // No email or other PII is sent to analytics.
      if (!signupSent) {
        setSignupSent(true);
        trackNewsletterSignup({ placement: id, source: "newsletter_form", interest });
      }
      setDone(true);
    } catch (cause) {
      failWith("We couldn't sign you up just now. Please try again in a moment.");
      // Coarse classification only: the raw message, response body and stack
      // trace never reach analytics.
      trackNewsletterFormError({ placement: id, errorType: classifyFailure(cause) });
    } finally {
      setPending(false);
    }
  }


  return (
    <section
      ref={offerRef}
      id={id}
      data-placement={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-24 overflow-hidden rounded-sm bg-forest text-forest-foreground"
    >
      <div className="grid gap-10 p-8 lg:grid-cols-2 lg:items-center lg:p-14">
        <div>
          <span className="eyebrow text-accent">{context.eyebrow}</span>
          <h2
            id={`${id}-heading`}
            className="mt-3 font-display text-3xl leading-tight lg:text-[2.75rem]"
          >
            Cooking duck tonight? Don&apos;t guess.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-forest-foreground/80">
            {context.promise} Tell us what you&apos;re cooking in the{" "}
            <a href="/tools/duck-game-plan" className="underline underline-offset-4">
              Duck Game Plan
            </a>{" "}
            and we&apos;ll build your temperature, timing, crispy-skin and serving plan. Subscribers
            also get the printable {FIELD_GUIDE.pages}-page {FIELD_GUIDE.title}, a short welcome
            series, and occasional DeliciousDuck recipes and guides.
          </p>


          <ul className="mt-6 space-y-2 text-sm text-forest-foreground/80">
            {context.bullets.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-forest-foreground/70">
            You can also read our companion article, the{" "}
            <a href={STARTER_GUIDE.path} className="underline underline-offset-4">
              Duck Cooking Starter Guide
            </a>
            , plus the{" "}
            <a
              href="/learn/duck-breast-temperature-doneness"
              className="underline underline-offset-4"
            >
              temperature and doneness guide
            </a>{" "}
            and the{" "}
            <a href="/tools" className="underline underline-offset-4">
              calculators
            </a>
            , right now.
          </p>
        </div>

        <div className="rounded-sm bg-background/95 p-6 text-foreground lg:p-8">
          {!enabled ? (
            <div>
              <span
                aria-hidden="true"
                className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary"
              >
                <Clock className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-2xl">Not open yet</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The list isn&apos;t open yet. Email delivery isn&apos;t connected, so
                we&apos;re not collecting addresses — there is no form here because signing up
                would go nowhere. When the guide and the list are ready, the form appears here.
              </p>
              <p
                className="mt-4 text-sm leading-relaxed text-muted-foreground"
                onClick={() => signalIntent("closed_list_panel")}
              >
                In the meantime, everything the guide covers is already on the site: start with{" "}
                <a
                  href="/learn/duck-breast-temperature-doneness"
                  className="text-primary underline underline-offset-4"
                >
                  temperature and doneness
                </a>{" "}
                and the{" "}
                <a href="/tools" className="text-primary underline underline-offset-4">
                  calculators
                </a>
                .
              </p>
            </div>
          ) : done ? (
            <div role="status">
              <div className="text-center">
                <span
                  aria-hidden="true"
                  className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary"
                >
                  <Check className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-2xl">
                  You&apos;re on the DeliciousDuck list
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You&apos;re subscribed. You can download the field guide right now:
                </p>

                {/*
                  Download surface for the one first-party lead magnet. The
                  shared tracked link emits `lead_magnet_download` on the real
                  click only — no email, token, or query string.
                */}
                <LeadMagnetDownloadLink
                  placement={`${id}_postsignup`}
                  target="_blank"
                  rel="noopener"
                  aria-label={`Download your field guide: ${FIELD_GUIDE.title} (PDF, 16 pages, opens in a new tab)`}
                  className={`mt-4 w-full ${CTA.primary}`}
                >
                  <Download aria-hidden="true" className="size-4" />
                  Download your field guide
                </LeadMagnetDownloadLink>
                <p className="mt-3 text-xs text-muted-foreground">
                  Printable PDF, 16 pages — yours right now, no email needed. Any emails come
                  from hello@deliciousduck.com.

                </p>
              </div>

              {/* Deepen the session honestly: on-site reading, not a claim about email. */}
              <div className="mt-6 border-t border-border pt-5">
                <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                  Start here while you wait
                </h4>
                <ul className="mt-3 space-y-2.5">
                  {context.startHere.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={() =>
                          trackNewsletterPostsignupClick({
                            placement: id,
                            interest,
                            linkUrl: link.href,
                            linkText: link.label,
                          })
                        }
                        className="group flex items-start justify-between gap-3 text-sm"
                      >
                        <span>
                          <span className="font-semibold text-primary underline-offset-4 group-hover:underline">
                            {link.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {link.note}
                          </span>
                        </span>
                        <ArrowRight
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/*
                The in-session interest selector was removed on purpose. It only
                appeared for first-time subscribers, which made "new" visibly
                different from "already subscribed" — anyone could have used this
                panel to test whether an address was on the list. Interest is
                still recorded from the page cluster the visitor signed up on.
                Explicit preference editing belongs on a future emailed,
                token-linked preference page, where the emailed link itself is
                proof of mailbox ownership.
              */}

            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor={`${id}-email`}
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
                >
                  Email address
                </label>
                <input
                  ref={emailRef}
                  id={`${id}-email`}
                  type="email"
                  name="email"
                  autoComplete="email"
                  // Native semantics preserved: `type="email"` plus `required`
                  // make the required/invalid state programmatically
                  // determinable, while `noValidate` on the form keeps our own
                  // accessible messaging (and the categorical error events).
                  required
                  aria-required="true"
                  maxLength={255}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    signalFormStart();
                  }}
                  onFocus={() => {
                    signalIntent("newsletter_form");
                    signalFormStart();
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                  placeholder="you@example.com"
                  className="mt-2 h-12 w-full rounded-sm border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground"
                />
                {error && (
                  <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>
              {/* Bot trap: hidden from users and assistive tech; must stay empty. */}
              <div aria-hidden="true" className="hidden">
                <label htmlFor={`${id}-company`}>Company</label>
                <input
                  id={`${id}-company`}
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={trap}
                  onChange={(e) => setTrap(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                aria-describedby={`${id}-consent`}
                className={`w-full ${CTA.primary} disabled:opacity-70`}
              >
                {pending ? "Signing you up…" : "Get the field guide"}
              </button>
              {/*
                Consent language. Rendered verbatim from the shared module that
                also versions the server-side consent record, so the wording a
                subscriber saw and the evidence we store cannot diverge.
              */}
              <p
                id={`${id}-consent`}
                data-consent-version={NEWSLETTER_CONSENT.version}
                className="text-xs leading-relaxed text-muted-foreground"
              >
                {NEWSLETTER_CONSENT.text}{" "}
                <a
                  href={NEWSLETTER_CONSENT.privacyPolicyPath}
                  className="text-primary underline underline-offset-4"
                >
                  Privacy
                </a>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
