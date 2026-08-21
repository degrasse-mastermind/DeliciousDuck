import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Flame, RotateCcw, Thermometer } from "lucide-react";

import {
  CONCERN_LABELS,
  CUT_LABELS,
  GAME_PLAN_CONCERNS,
  GAME_PLAN_CUTS,
  GAME_PLAN_PARTY_SIZES,
  METHOD_LABELS,
  PARTY_SIZE_LABELS,
  isCompleteSelection,
  methodsForCut,
  resolveGamePlan,
  type DuckGamePlan,
  type GamePlanConcern,
  type GamePlanCut,
  type GamePlanMethod,
  type GamePlanPartySize,
  type GamePlanSelection,
  type PartialSelection,
  type PlanLink,
} from "@/data/duck-game-plan";
import {
  clearStoredSelection,
  readStoredSelection,
  writeStoredSelection,
} from "@/lib/game-plan-storage";
import {
  trackGamePlanInternalClick,
  trackGamePlanResultView,
  trackGamePlanSignup,
  trackGamePlanStart,
  trackGamePlanStepComplete,
  trackNewsletterFormError,
  trackNewsletterFormStart,
  trackNewsletterSignup,
} from "@/lib/analytics";
import {
  isNewsletterEnabled,
  subscribeToNewsletter,
  type SubscribeInput,
  type SubscribeResult,
} from "@/lib/newsletter";
import { NEWSLETTER_CONSENT } from "@/lib/newsletter-consent";
import { DUCK_DROP } from "@/data/duck-drop";
import { SafetyNote } from "@/components/site/SafetyNote";
import { cn } from "@/lib/utils";

/**
 * The Duck Game Plan — the site's primary acquisition utility.
 *
 * Four finite questions, then the email exchange, then a kitchen card built
 * entirely from `@/data/duck-game-plan`. Nothing here invents a temperature, a
 * time, or a claim: every string comes from that table, which in turn points at
 * existing verified pages rather than restating them.
 *
 * Privacy shape: the four selections live in `sessionStorage` so a refresh still
 * shows the plan; the address is submitted through the existing newsletter
 * boundary and is never stored locally, never placed in the URL, and never
 * passed to analytics. Every event carries enum members and paths only.
 */

type Step = "cut" | "method" | "concern" | "party_size" | "email";

const STEP_ORDER: readonly Step[] = ["cut", "method", "concern", "party_size", "email"];

const QUESTIONS: Record<Exclude<Step, "email">, string> = {
  cut: "What are you cooking?",
  method: "How are you cooking it?",
  concern: "What are you most worried about?",
  party_size: "How many people are you feeding?",
};

function classifyFailure(cause: unknown): "network" | "server" | "unknown" {
  const message = cause instanceof Error ? cause.message.toLowerCase() : "";
  if (!message) return "unknown";
  if (message.includes("fetch") || message.includes("network") || message.includes("offline")) {
    return "network";
  }
  if (/\b(4\d\d|5\d\d)\b/.test(message) || message.includes("server")) return "server";
  return "unknown";
}

/** One large, obvious choice. Radio semantics so arrow keys work as expected. */
function ChoiceButton({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex min-h-14 w-full items-center justify-between gap-3 rounded-sm border px-4 py-3.5 text-left text-[0.95rem] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-secondary font-medium text-foreground"
          : "border-border bg-background hover:border-primary/50 hover:bg-secondary/40",
      )}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
      >
        {selected && <Check className="size-3" />}
      </span>
    </button>
  );
}

/** A link inside a rendered plan. Tracked once per destination per burst. */
function PlanAnchor({
  link,
  plan,
  placement,
  className,
}: {
  link: PlanLink;
  plan: DuckGamePlan;
  placement: string;
  className?: string;
}) {
  return (
    <a
      href={link.href}
      className={cn("text-primary underline underline-offset-4", className)}
      onClick={() =>
        trackGamePlanInternalClick({
          placement,
          destinationPath: link.href,
          recommendationId: plan.recommendationId,
          resultType: plan.resultType,
        })
      }
    >
      {link.label}
    </a>
  );
}

/** One labelled row of the kitchen card. */
function PlanRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border/70 py-4 first:border-t-0 first:pt-0 sm:grid sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-foreground/90 sm:mt-0">{children}</dd>
    </div>
  );
}

/**
 * The newsletter `interest` field is a fixed enum the server validates, so the
 * planner maps its cut selection onto that enum instead of inventing a value.
 */
const INTEREST_FOR_CUT: Record<GamePlanCut, NewsletterInterest> = {
  "duck-breast": "duck-breast",
  "whole-duck": "whole-duck",
  "duck-legs": "duck-fat",
  "duck-confit": "duck-fat",
  "not-bought-yet": "sourcing",
};

export function DuckGamePlanResult({
  selection,
  placement,
  onRestart,
}: {
  selection: GamePlanSelection;
  placement: string;
  onRestart?: () => void;
}) {
  const plan = useMemo(() => resolveGamePlan(selection), [selection]);
  const viewed = useRef<string | null>(null);

  useEffect(() => {
    if (viewed.current === plan.recommendationId) return;
    viewed.current = plan.recommendationId;
    trackGamePlanResultView({
      placement,
      selection,
      recommendationId: plan.recommendationId,
      resultType: plan.resultType,
    });
  }, [placement, plan.recommendationId, plan.resultType, selection]);

  return (
    <div data-placement={placement}>
      <div className="rounded-sm border border-border bg-background p-6 lg:p-8">
        <span className="eyebrow text-primary">Your Duck Game Plan</span>
        <h2 className="mt-3 font-display text-2xl leading-tight lg:text-3xl">{plan.headline}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>

        <dl className="mt-7">
          <PlanRow label="Biggest risk">{plan.risk}</PlanRow>
          <PlanRow label="Critical move">{plan.criticalMove}</PlanRow>
          <PlanRow label="Temperature">{plan.temperature}</PlanRow>
          {plan.rest && <PlanRow label="Rest">{plan.rest}</PlanRow>}
          <PlanRow label="Timing">{plan.timing}</PlanRow>
          <PlanRow label="Equipment">
            <PlanAnchor link={plan.equipment} plan={plan} placement={placement} />
            {plan.equipment.note && (
              <span className="block text-muted-foreground">{plan.equipment.note}</span>
            )}
          </PlanRow>
          <PlanRow label="How much">{plan.serving}</PlanRow>
          {plan.pairing.length > 0 && (
            <PlanRow label="What to serve">
              <ul className="space-y-1.5">
                {plan.pairing.map((link) => (
                  <li key={link.href}>
                    <PlanAnchor link={link} plan={plan} placement={placement} />
                    {link.note && <span className="block text-muted-foreground">{link.note}</span>}
                  </li>
                ))}
              </ul>
            </PlanRow>
          )}
          {plan.saveTheFat && <PlanRow label="Save the fat">{plan.saveTheFat}</PlanRow>}
        </dl>

        <div className="mt-7 rounded-sm bg-secondary/60 p-5">
          <span className="eyebrow text-primary">Start here</span>
          <p className="mt-2 text-sm leading-relaxed">
            <PlanAnchor
              link={plan.primary}
              plan={plan}
              placement={placement}
              className="font-medium"
            />
            {plan.primary.note && (
              <span className="block text-muted-foreground">{plan.primary.note}</span>
            )}
          </p>
        </div>

        {plan.secondary.length > 0 && (
          <div className="mt-6">
            <span className="eyebrow text-muted-foreground">If you want more detail</span>
            <ul className="mt-2.5 space-y-1.5 text-sm">
              {plan.secondary.map((link) => (
                <li key={link.href} className="flex items-start gap-2">
                  <ArrowRight aria-hidden="true" className="mt-1 size-3.5 shrink-0 text-accent" />
                  <PlanAnchor link={link} plan={plan} placement={placement} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {plan.commercial && (
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Still sourcing it?{" "}
            <PlanAnchor link={plan.commercial} plan={plan} placement={placement} />
            {plan.commercial.note ? ` — ${plan.commercial.note}` : ""}
          </p>
        )}

        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="mt-8 inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
            Build a plan for something else
          </button>
        )}
      </div>

      {plan.showSafetyNote && (
        <div className="mt-6">
          <SafetyNote heading="Food safety: the official minimum" />
        </div>
      )}
    </div>
  );
}

export function DuckGamePlanFlow({
  placement = "game-plan_tool",
  onSubscribe = subscribeToNewsletter,
}: {
  placement?: string;
  onSubscribe?: ((input: SubscribeInput) => Promise<SubscribeResult | void>) | undefined;
}) {
  const [selection, setSelection] = useState<PartialSelection>({});
  const [step, setStep] = useState<Step>("cut");
  const [confirmed, setConfirmed] = useState<GamePlanSelection | null>(null);
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [started, setStarted] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const restored = useRef(false);

  const enabled = typeof onSubscribe === "function" && isNewsletterEnabled();

  /** A plan already built this session survives a refresh. No PII is stored. */
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const stored = readStoredSelection();
    if (stored) {
      setSelection(stored);
      setConfirmed(stored);
    }
  }, []);

  const methods = methodsForCut(selection.cut);
  const stepIndex = STEP_ORDER.indexOf(step);

  function signalStart() {
    if (started) return;
    setStarted(true);
    trackGamePlanStart({ placement });
  }

  /** Records the answer, reports the completed step, and advances. */
  function choose<K extends keyof GamePlanSelection>(key: K, value: GamePlanSelection[K]) {
    signalStart();
    const next: PartialSelection = { ...selection, [key]: value };
    // Changing the cut can invalidate a previously chosen method.
    if (key === "cut" && next.method && !methodsForCut(next.cut).includes(next.method)) {
      delete next.method;
    }
    setSelection(next);
    setError(null);
    // The analytics step names are snake_case; only `partySize` differs.
    const current: Step = key === "partySize" ? "party_size" : (key as Step);
    trackGamePlanStepComplete({
      placement,
      step: current,
      cut: next.cut,
      method: next.method,
      concern: next.concern,
      partySize: next.partySize,
    });
    setStep(STEP_ORDER[STEP_ORDER.indexOf(current) + 1] ?? "email");

  }

  function back() {
    const previous = STEP_ORDER[Math.max(0, stepIndex - 1)];
    if (previous) setStep(previous);
    setError(null);
  }

  function restart() {
    clearStoredSelection();
    setConfirmed(null);
    setSelection({});
    setStep("cut");
    setEmail("");
    setError(null);
  }

  const valid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!onSubscribe || pending) return;
    if (!isCompleteSelection(selection)) {
      setStep("cut");
      return;
    }
    const cleaned = email.trim().toLowerCase();
    if (!cleaned) {
      setError("Please enter your email address.");
      emailRef.current?.focus();
      trackNewsletterFormError({ placement, errorType: "required" });
      return;
    }
    if (!valid(cleaned) || cleaned.length > 255) {
      setError("Please enter a valid email address.");
      emailRef.current?.focus();
      trackNewsletterFormError({ placement, errorType: "invalid_format" });
      return;
    }
    setError(null);
    setPending(true);
    const sourcePath = typeof window === "undefined" ? undefined : window.location.pathname;
    const plan = resolveGamePlan(selection);
    try {
      await onSubscribe({
        email: cleaned,
        source: "duck_game_plan",
        placement,
        interest: INTEREST_FOR_CUT[selection.cut],
        ...(sourcePath ? { sourcePath } : {}),
        consentVersion: NEWSLETTER_CONSENT.version,
        // Finite selections only — useful demand signal, no new personal data.
        acquisitionSource: "duck_game_plan",
        cut: selection.cut,
        method: selection.method,
        concern: selection.concern,
        partySizeBucket: selection.partySize,
        trap,
      });
      trackNewsletterSignup({
        placement,
        source: "duck_game_plan",
        interest: INTEREST_FOR_CUT[selection.cut],
      });
      trackGamePlanSignup({
        placement,
        selection,
        recommendationId: plan.recommendationId,
        resultType: plan.resultType,
      });
      writeStoredSelection(selection);
      setConfirmed(selection);
    } catch (cause) {
      setError("We couldn't save your plan just now. Please try again in a moment.");
      emailRef.current?.focus();
      trackNewsletterFormError({ placement, errorType: classifyFailure(cause) });
    } finally {
      setPending(false);
    }
  }

  if (confirmed) {
    return <DuckGamePlanResult selection={confirmed} placement={placement} onRestart={restart} />;
  }

  const progress = `Step ${Math.min(stepIndex + 1, STEP_ORDER.length)} of ${STEP_ORDER.length}`;

  return (
    <div
      data-placement={placement}
      className="rounded-sm border border-border bg-background p-6 lg:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="eyebrow text-primary">{progress}</span>
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-1.5 text-sm text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Back
          </button>
        )}
      </div>

      {/* Progress is decorative: the text above is the accessible statement. */}
      <div aria-hidden="true" className="mt-3 flex gap-1.5">
        {STEP_ORDER.map((name, index) => (
          <span
            key={name}
            className={cn(
              "h-1 flex-1 rounded-full",
              index <= stepIndex ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>

      {step !== "email" ? (
        <div className="mt-6">
          <h2 ref={headingRef} className="font-display text-2xl leading-tight">
            {QUESTIONS[step]}
          </h2>
          {step === "method" && selection.cut && (
            <p className="mt-2 text-sm text-muted-foreground">
              Options that make sense for {CUT_LABELS[selection.cut].toLowerCase()}.
            </p>
          )}
          <div role="radiogroup" aria-label={QUESTIONS[step]} className="mt-5 grid gap-2.5">
            {step === "cut" &&
              GAME_PLAN_CUTS.map((cut: GamePlanCut) => (
                <ChoiceButton
                  key={cut}
                  label={CUT_LABELS[cut]}
                  selected={selection.cut === cut}
                  onSelect={() => choose("cut", cut)}
                />
              ))}
            {step === "method" &&
              methods.map((method: GamePlanMethod) => (
                <ChoiceButton
                  key={method}
                  label={METHOD_LABELS[method]}
                  selected={selection.method === method}
                  onSelect={() => choose("method", method)}
                />
              ))}
            {step === "concern" &&
              GAME_PLAN_CONCERNS.map((concern: GamePlanConcern) => (
                <ChoiceButton
                  key={concern}
                  label={CONCERN_LABELS[concern]}
                  selected={selection.concern === concern}
                  onSelect={() => choose("concern", concern)}
                />
              ))}
            {step === "party_size" &&
              GAME_PLAN_PARTY_SIZES.map((size: GamePlanPartySize) => (
                <ChoiceButton
                  key={size}
                  label={PARTY_SIZE_LABELS[size]}
                  selected={selection.partySize === size}
                  onSelect={() => choose("partySize", size)}
                />
              ))}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary"
          >
            <Thermometer className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-2xl leading-tight">Where should we send it?</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            Your plan appears right here as soon as you sign up — no waiting on an email. We&apos;ll
            also send it to you so it&apos;s in your pocket at the stove, and start you on{" "}
            {DUCK_DROP.name}: six short emails on the fundamentals.
          </p>

          {!enabled ? (
            <p className="mt-5 rounded-sm bg-secondary/60 p-4 text-sm leading-relaxed">
              The list isn&apos;t open yet, so we&apos;re not collecting addresses. Everything your
              plan points at is already on the site — start with the{" "}
              <a
                href="/learn/duck-breast-temperature-doneness"
                className="text-primary underline underline-offset-4"
              >
                temperature and doneness guide
              </a>
              .
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5" noValidate>
              <label htmlFor={`${placement}-email`} className="block text-sm font-medium">
                Email address
              </label>
              <input
                ref={emailRef}
                id={`${placement}-email`}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${placement}-error` : `${placement}-consent`}
                value={email}
                onFocus={() => {
                  if (!formStarted) {
                    setFormStarted(true);
                    trackNewsletterFormStart({ placement });
                  }
                }}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 min-h-12 w-full rounded-sm border border-border bg-background px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />

              {/* Honeypot: positioned off-screen, never announced. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                aria-hidden="true"
                autoComplete="off"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
                className="pointer-events-none absolute size-0 opacity-0"
              />

              {error && (
                <p
                  id={`${placement}-error`}
                  role="alert"
                  className="mt-2.5 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 sm:w-auto"
              >
                <Flame aria-hidden="true" className="size-4" />
                {pending ? "Building your plan…" : "Show my Duck Game Plan"}
              </button>

              <p
                id={`${placement}-consent`}
                className="mt-3.5 text-xs leading-relaxed text-muted-foreground"
              >
                {NEWSLETTER_CONSENT.text}{" "}
                <a
                  href={NEWSLETTER_CONSENT.privacyPolicyPath}
                  className="underline underline-offset-4"
                >
                  Privacy policy
                </a>
                .
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
