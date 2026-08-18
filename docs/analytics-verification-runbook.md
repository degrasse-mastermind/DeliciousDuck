# Production analytics verification runbook (internal)

No synthetic events have been fired and no canary has been run. This document
exists so a human can verify each revenue-critical event on the live site after
a deploy. Nothing below has been "confirmed passing" by automation.

## Emission rules the code enforces

Production GA4 and PostHog emit only when **both** hold:

- Host is exactly `deliciousduck.com` or `www.deliciousduck.com`
  (preview hosts, Lovable editor/project/preview domains, `localhost`, and any
  other host emit nothing — the gtag tag is not even requested).
- Path is not under `/internal/` or `/api/`.

Implemented in `src/lib/analytics-gate.ts`; enforced in `trackEvent`,
`trackPageView` (`src/lib/analytics.ts`), the gtag bootstrap in
`src/routes/__root.tsx`, and `initPostHog` / `captureEvent` /
`capturePostHogPageView` (`src/lib/posthog.ts`).

## Privacy invariants

Never sent to any analytics destination:

- email addresses, hashes, or subscriber identifiers
- mailbox tokens (`/newsletter/unsubscribe?t=...`)
- full query strings or `location.href`

Page parameters are always `origin + pathname`. Email attribution is
campaign-level only (`utm_campaign` / `utm_content`), session scoped.

## Manual checks (run on the live site, one browser session each)

Open DevTools → Network, filter `google-analytics.com/g/collect` and
`us.i.posthog.com`. Confirm the event fires **once** and that no request
payload contains an address, token, or full query string.

| # | Action | Expected event(s) | Allowed non-PII properties |
|---|--------|-------------------|-----------------------------|
| 1 | Click an Amazon gear CTA (e.g. `/gear/best-dutch-oven-for-duck-confit`) | `affiliate_click` (GA4 + PostHog) | `merchant`, `merchant_id`, `merchant_domain`, `placement`, `link_type`, `destination_type`, `affiliate`, `content_type`, `content_slug`, `page_path`/`source_path`, `link_text`, `email_attributed`, `email_campaign`. Destination must keep `tag=deliciousduck-20` and a placement-specific `ascsubtag`. |
| 2 | Click the US Wellness duck-fat CTA on `/buy/duck-fat-buying-guide` | `affiliate_click` | same as above; destination keeps `subId1` / `sharedid` |
| 3 | Submit the newsletter form | `newsletter_intent` on interaction, then `newsletter_signup` after persistence succeeds (GA4 + PostHog) | `placement`, `source`, `interest`, `page_path`/`source_path`, `content_slug` — **never** the email address |
| 4 | Click the Starter Guide / field-guide download | `lead_magnet_download` | `asset_id`, `asset_path`, `placement`, `source_path` |
| 5 | Welcome email received after signup | no browser event; verify delivery in the email provider log and, on click-through, `email_landing_view` with `email_campaign`, `email_slot`, `page_path` | campaign/slot labels only |
| 6 | Unsubscribe via a real mailbox link | unsubscribe succeeds; page is `noindex`; **no** analytics request may contain the `t=` token. A pageview here carries `pathname` only | `page_path` (no query string) |

## Negative checks

- Browse the preview host and any Lovable editor/preview domain: zero requests
  to `googletagmanager.com`, `google-analytics.com`, or `us.i.posthog.com`.
- Browse `/internal/growth-dashboard` on production: no pageview, no
  autocapture, no session recording, no commercial events.
- Confirm no automated Amazon/US Wellness request is issued on page load — the
  affiliate request must only follow a real click.
