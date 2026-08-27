import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { MODULE_PLACEMENTS } from "@/lib/impression-events";
import { trackPremiumWaitlistCtaClick } from "@/lib/analytics";
import type { NewsletterInterest } from "@/data/newsletter-contexts";

/**
 * Fake-door premium waitlist, shown under a generated Duck Game Plan.
 *
 * Deliberately secondary: plain type, no card, no colour block, below the
 * result and below the export actions. The free planner is unchanged and
 * unpaywalled — nothing here gates anything, and there is no checkout.
 *
 * Signups go through the existing newsletter capture (same component, same
 * backend, same interest enum). The only new thing is a distinct placement id,
 * `duck_game_plan_premium_waitlist`, so this demand signal can be reported
 * separately, plus one `premium_waitlist_cta_click` event on the CTA.
 */
export function GamePlanPremiumWaitlist({ interest }: { interest: NewsletterInterest }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div data-print-hide className="mt-8 border-t border-border/70 pt-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Want to save this plan and get a printable PDF of it? We&rsquo;re gauging interest in a
        premium version — the first 100 people on the waitlist get it for $9.
      </p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (!open) trackPremiumWaitlistCtaClick({ placement: MODULE_PLACEMENTS.gamePlanPremiumWaitlist });
          setOpen((value) => !value);
        }}
        className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {open ? "Hide the waitlist" : "Join the waitlist"}
        <ChevronDown
          aria-hidden="true"
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div id={panelId} className="mt-5">
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            Nothing is for sale yet. Joining adds you to The Duck Drop and tells us to email you
            first if we build it.
          </p>
          <NewsletterSignup
            id={MODULE_PLACEMENTS.gamePlanPremiumWaitlist}
            interest={interest}
          />
        </div>
      )}
    </div>
  );
}
