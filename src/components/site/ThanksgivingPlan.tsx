import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, ListChecks, Printer, Users } from "lucide-react";
import {
  THANKSGIVING_CHECKLIST,
  THANKSGIVING_HUB_PATH,
  THANKSGIVING_LEFTOVERS,
  THANKSGIVING_PRINT_PLACEMENT,
  THANKSGIVING_STAGE_LABELS,
  THANKSGIVING_TABLE_CHOICES,
  thanksgivingStep,
  thanksgivingStepsFor,
  thanksgivingStepsIn,
  type ThanksgivingPlanStep,
  type ThanksgivingStage,
} from "@/data/thanksgiving-hub";
import { SITE } from "@/data/site";
import { absUrl } from "@/lib/seo";
import { trackConversionPathClick, trackPlanPrint } from "@/lib/analytics";
import type { ConversionIntent } from "@/data/conversion-paths";

const STAGES: ThanksgivingStage[] = ["decide", "order", "cook", "serve"];

const KIND_LABEL: Record<NonNullable<ThanksgivingPlanStep["kind"]>, string> = {
  recipe: "Recipe",
  technique: "Technique",
  tool: "Calculator",
  guide: "Guide",
};

/**
 * One tracked internal link. Every Thanksgiving-hub hand-off — in the plan, in
 * the commercial module, in the leftovers section, and inbound from other
 * pages — goes through this so each destination has exactly one measured
 * appearance and the payload shape never drifts.
 */
export function TrackedHubLink({
  to,
  placement,
  intent,
  children,
  className = "",
}: {
  to: string;
  placement: string;
  intent: ConversionIntent;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      data-placement={placement}
      onClick={() => trackConversionPathClick({ destination: to, intent, placement })}
      className={
        className ||
        "group inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
      }
    >
      {children}
      <ArrowRight
        aria-hidden="true"
        className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/**
 * Contextual, tracked entry point into the planning hub, dropped once into a
 * related page. Deliberately a sentence rather than a module: the pages that
 * link here are already doing their own job.
 */
export function ThanksgivingHubLink({
  placement,
  children,
  className = "",
}: {
  placement: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-base leading-[1.75] text-foreground/85 ${className}`}>
      {children}{" "}
      <TrackedHubLink
        to={THANKSGIVING_HUB_PATH}
        placement={placement}
        intent="technique_validation"
      >
        Thanksgiving duck dinner plan
      </TrackedHubLink>
    </p>
  );
}

/**
 * Choose your table — the first real decision on the page.
 *
 * The three paths describe who they suit and what they cost you
 * operationally. Quantity is not promised here: the single tracked
 * serving-calculator hand-off owns that, and no other module on the page
 * offers the same destination.
 */
export function ThanksgivingTableChoice() {
  const calculator = thanksgivingStep("thanksgiving_hub_serving_calculator");
  return (
    <section
      aria-labelledby="choose-your-table"
      data-print-block
      className="mt-10 rounded-sm border border-primary/30 bg-cream p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5">
        <Users aria-hidden="true" className="size-4 shrink-0 text-primary" />
        <h2 id="choose-your-table" className="eyebrow text-primary">
          Choose your table first
        </h2>
      </div>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground/85">
        Almost every holiday duck problem starts as a table-size problem. Find your table below,
        then let the calculator set the quantity.
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {THANKSGIVING_TABLE_CHOICES.map((choice) => (
          <div key={choice.guests} data-print-block className="rounded-sm bg-card p-4 ring-1 ring-border">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {choice.guests}
            </p>
            <p className="mt-1.5 font-display text-base leading-snug text-foreground">
              {choice.headline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground/80">Suits: </span>
              {choice.suits}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground/80">Tradeoff: </span>
              {choice.tradeoff}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-relaxed text-foreground/85">
        Whichever row you are in, the number of birds comes from the same place — your guest count,
        run through the calculator, with its planning assumptions on show.
      </p>
      <div className="mt-2">
        <TrackedHubLink
          to={calculator.to}
          placement={calculator.placement}
          intent={calculator.intent}
        >
          {calculator.linkLabel}
        </TrackedHubLink>
      </div>
    </section>
  );
}

/**
 * The holiday plan, as a measured set of internal hand-offs.
 *
 * Editorial, not a storefront: each row is a dated task, and the rows whose
 * link belongs to another module on the page (the table-choice calculator and
 * the buyer guides) show the task without a second copy of the link.
 */
export function ThanksgivingPlan({
  sourcePath,
  heading = "The plan, from ordering to carving",
  intro = "Ten decisions in the order a holiday actually makes them. Each one links to the page that finishes it.",
}: {
  sourcePath: string;
  heading?: string;
  intro?: string;
}) {
  return (
    <section
      aria-labelledby="thanksgiving-plan"
      data-source-path={sourcePath}
      className="mt-12 rounded-sm border border-border bg-cream p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5">
        <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-primary" />
        <h2 id="thanksgiving-plan" className="eyebrow text-primary">
          {heading}
        </h2>
      </div>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground/85">{intro}</p>

      <div className="mt-6 space-y-7">
        {STAGES.map((stage) => (
          <div key={stage} data-print-block>
            <h3 className="font-display text-lg text-foreground">
              {THANKSGIVING_STAGE_LABELS[stage]}
            </h3>
            <ul className="mt-3 grid gap-4 sm:grid-cols-2">
              {thanksgivingStepsFor(stage).map((step) => (
                <li
                  key={step.placement}
                  className="flex flex-col rounded-sm bg-card p-4 ring-1 ring-border"
                >
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    {step.when}
                  </p>
                  <p className="mt-1.5 font-display text-base leading-snug text-foreground">
                    {step.task}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.why}</p>
                  {step.linkIn === "plan" ? (
                    <p className="mt-3">
                      <TrackedHubLink
                        to={step.to}
                        placement={step.placement}
                        intent={step.intent}
                      >
                        {step.kind ? `${KIND_LABEL[step.kind]}: ` : ""}
                        {step.linkLabel}
                      </TrackedHubLink>
                    </p>
                  ) : (
                    <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      {step.linkIn === "table"
                        ? "Linked once, under Choose your table"
                        : "Linked once, under Get the bird and essential tools"}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * The one commercial decision module on the page: three buyer guides, one
 * contextual tracked link each, and no merchant buttons. Disclosure stays
 * where it belongs — on the guides themselves, which carry the outbound links.
 */
export function ThanksgivingCommercialModule() {
  const steps = thanksgivingStepsIn("commercial");
  return (
    <section
      aria-labelledby="get-the-bird"
      data-print-hide
      className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-6"
    >
      <h2 id="get-the-bird" className="eyebrow text-primary">
        Get the bird and essential tools
      </h2>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground/85">
        Three decisions worth making before the week of the holiday. These are our own buyer
        guides, not checkout links — each explains what to look for, and any commercial
        relationships are disclosed on the guide itself.
      </p>
      <ul className="mt-5 space-y-4">
        {steps.map((step) => (
          <li key={step.placement} className="border-t border-border/70 pt-4">
            <p className="font-display text-base leading-snug text-foreground">{step.task}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.why}</p>
            <p className="mt-2">
              <TrackedHubLink to={step.to} placement={step.placement} intent={step.intent}>
                {step.linkLabel}
              </TrackedHubLink>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Friday: the fat, the carcass, and the rules for keeping any of it. */
export function ThanksgivingLeftovers() {
  return (
    <section aria-labelledby="friday" data-print-block className="mt-12">
      <h2
        id="friday"
        className="font-display text-[1.75rem] leading-tight text-foreground lg:text-4xl"
      >
        Nothing wasted on Friday
      </h2>
      <div className="mt-5 space-y-5 text-base leading-[1.75] text-foreground/85">
        <p>
          A duck leaves more behind than a turkey does, and most of it is worth keeping. Refrigerate
          the cooked meat within two hours of it leaving the oven — one hour if the kitchen is above
          90°F (32.2°C) — eat it within three to four days, and reheat it to 165°F (73.9°C). The
          carcass makes a good stock if you simmer it the same day or freeze it whole for later;
          picked meat is best warmed through gently in a little of the fat rather than blasted in a
          hot oven.
        </p>
        <ul className="space-y-4">
          {THANKSGIVING_LEFTOVERS.map((item) => (
            <li key={item.placement} className="border-t border-border/70 pt-4">
              <p className="font-display text-lg text-foreground">{item.heading}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              <p className="mt-2">
                <TrackedHubLink to={item.to} placement={item.placement} intent={item.intent}>
                  {item.linkLabel}
                </TrackedHubLink>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Printable plan: a visible print control and a real checklist.
 *
 * No email gate and no popup — the button fires the site's print event and
 * then `window.print()`. The boxes are real checkboxes on screen and print as
 * empty squares, and the print stylesheet strips navigation, the newsletter
 * form, commercial chrome and illustrations while keeping the title, the
 * canonical URL, the schedule, this checklist and the safety text.
 */
export function ThanksgivingPrintablePlan() {
  function handlePrint() {
    trackPlanPrint({ placement: THANKSGIVING_PRINT_PLACEMENT, path: THANKSGIVING_HUB_PATH });
    if (typeof window !== "undefined") window.print();
  }

  return (
    <section aria-labelledby="printable-plan" className="mt-12 rounded-sm border border-border p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <ListChecks aria-hidden="true" className="size-4 shrink-0 text-primary" />
        <h2 id="printable-plan" className="eyebrow text-primary">
          The printable plan
        </h2>
      </div>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground/85">
        Everything on this page that has a deadline, as a checklist you can put on the refrigerator
        door. No email required.
      </p>
      <div data-print-hide className="mt-4">
        <button
          type="button"
          data-placement={THANKSGIVING_PRINT_PLACEMENT}
          onClick={handlePrint}
          className="inline-flex h-11 items-center gap-2 rounded-sm bg-primary px-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-forest-deep"
        >
          <Printer aria-hidden="true" className="size-4" />
          Print the Thanksgiving plan
        </button>
      </div>

      <p className="mt-6 hidden text-sm print:block">
        {SITE.name} — {absUrl(THANKSGIVING_HUB_PATH)}
      </p>

      <div className="mt-6 space-y-6">
        {THANKSGIVING_CHECKLIST.map((group) => (
          <div key={group.heading} data-print-block>
            <h3 className="font-display text-lg text-foreground">{group.heading}</h3>
            <ul className="mt-2 space-y-2">
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/85">
                  <input
                    type="checkbox"
                    aria-label={item}
                    className="mt-1 size-4 shrink-0 rounded-none border border-foreground/40 accent-primary"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
