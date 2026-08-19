import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  FIELD_GUIDE_ANCHOR_ID,
  HOMEPAGE_COMMERCE_CARDS,
  HOMEPAGE_INTENT_ROUTES,
  type HomeIntentRoute,
} from "@/data/homepage-intent";
import { trackConversionPathClick } from "@/lib/analytics";
import { COMMERCE_PANEL, CTA, DECISION_LABELS } from "@/lib/cta";

/**
 * HomeIntentRouter — one question directly under the hero, four honest answers.
 *
 * Internal anchors only: no merchant links, prices, ratings or availability
 * claims. Clicks reuse the existing `internal_conversion_click` event through
 * the shared helper, with the stable placement ids from
 * `@/data/homepage-intent`. Tracking never blocks navigation.
 *
 * The Field Guide answer scrolls to the existing signup section and moves focus
 * into its email field. It records an internal conversion click only —
 * `newsletter_signup` still fires solely on a verified successful signup.
 */

function track(route: { to: string; intent: HomeIntentRoute["intent"]; placement: string }) {
  trackConversionPathClick({
    destination: route.to,
    intent: route.intent,
    placement: route.placement,
  });
}

function AnchorCta({ route }: { route: HomeIntentRoute }) {
  return (
    <a
      href={route.to}
      data-placement={route.placement}
      onClick={(event) => {
        track(route);
        const section = document.getElementById(FIELD_GUIDE_ANCHOR_ID);
        const field = document.getElementById(`${FIELD_GUIDE_ANCHOR_ID}-email`);
        if (!section) return;
        // Handled here so focus lands in the signup field; the plain href stays
        // as the no-JS fallback.
        event.preventDefault();
        const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        section.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        });
        // After the scroll is scheduled, so focus never fights it.
        requestAnimationFrame(() => {
          const target = field ?? section;
          target.focus?.({ preventScroll: true });
        });
      }}
      className={CTA.tertiarySmall}
    >
      {route.ctaLabel}
      <ArrowRight aria-hidden="true" className="size-3.5" />
    </a>
  );
}

export function HomeIntentRouter() {
  return (
    <section
      aria-labelledby="home-intent-heading"
      className="border-b border-border bg-card"
    >
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2
            id="home-intent-heading"
            className="font-display text-2xl leading-tight text-foreground lg:text-3xl"
          >
            What brings you to the duck?
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Four honest starting points. Pick the one that matches tonight.
          </p>
        </div>

        <ul className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {HOMEPAGE_INTENT_ROUTES.map((route) => (
            <li key={route.placement} className="border-t border-border pt-5">
              <h3 className="font-display text-lg leading-snug text-foreground">{route.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{route.blurb}</p>
              <div className="mt-4">
                {route.anchor ? (
                  <AnchorCta route={route} />
                ) : (
                  <Link
                    to={route.to}
                    data-placement={route.placement}
                    onClick={() => track(route)}
                    className={CTA.tertiarySmall}
                  >
                    {route.ctaLabel}
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * The lower homepage buying section: one editorial card per distinct decision,
 * each pointing once at the guide that settles it. Separate placement ids keep
 * it comparable with the above-the-fold router.
 */
export function HomeCommerceCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {HOMEPAGE_COMMERCE_CARDS.map((card) => (
        <article key={card.placement} className={`flex h-full flex-col ${COMMERCE_PANEL}`}>
          <span className="eyebrow text-primary">{card.decision}</span>
          <h3 className="mt-3 font-display text-2xl leading-snug text-foreground">
            {card.heading}
          </h3>
          <p className="mt-3 rounded-sm bg-card p-3 text-sm leading-relaxed text-foreground/85">
            <span className="font-semibold text-foreground">{DECISION_LABELS.bestFor}: </span>
            {card.bestFor}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/85">{card.why}</p>
          <div className="mt-auto pt-5">
            <Link
              to={card.to}
              data-placement={card.placement}
              onClick={() =>
                trackConversionPathClick({
                  destination: card.to,
                  intent: card.intent,
                  placement: card.placement,
                })
              }
              className={CTA.tertiarySmall}
            >
              {card.ctaLabel}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
