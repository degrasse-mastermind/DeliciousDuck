# Production analytics verification runbook (internal)

No synthetic events have been fired and no canary has been run. This document
exists so a human can verify each revenue-critical event on the live site after
a deploy. Nothing below has been "confirmed passing" by automation.

## Emission rules the code enforces

Production GA4 and PostHog emit only when **both** hold:

- Host is exactly `deliciousduck.com` or `www.deliciousduck.com`
  (preview hosts, Lovable editor/project/preview domains, `localhost`, and any
  other host emit nothing — the gtag tag is not even requested).
- Path is not under `/internal/` or `/api/`. This is re-checked on every SPA
  navigation, and **both** analytics stacks are suspended on a blocked route:
  - GA4 via the documented kill switch `window["ga-disable-G-E15CFY209D"]`,
    which stops all measurement for the property — including gtag's own
    enhanced-measurement browser-history pageviews. The flag is set before
    gtag.js is requested and re-synced from wrapped `pushState`/`replaceState`
    plus `popstate`/`hashchange` listeners, so GA cannot beat the guard.
  - PostHog autocapture, page-leave capture and session recording.

  Returning to a public route in the same session restores both. No persistent
  opt-out or consent state is written in either case.

### Sessions that start on a blocked route

A direct load of `/internal/*` or `/api/*` requests neither SDK — zero
analytics network calls. Both stacks then initialize **lazily, exactly once**
the first time that session navigates to a public route (e.g. clicking the
DeliciousDuck wordmark home), and that route emits exactly one pageview:

- GA4: the inline bootstrap installs a one-shot `window.__ddLoadGtag()` loader.
  `ensureGtagLoaded()` runs on every navigation; on the load call the tag's own
  `config` sends the path-only `page_view`, so the router deliberately skips
  `trackPageView` for that navigation — no duplicate script, no double count.
- PostHog: `initPostHog(pathname)` is called per navigation and no-ops until the
  path is allowed, then initializes once; the manual pageview is unchanged.
- The router's pathname is authoritative. On some client-side navigations the
  browser's `location.pathname` still reads the previous (internal) path when the
  router effect runs, so `ensureGtagLoaded()` passes the router path into the
  loader — `window.__ddLoadGtag('/some/path')`. Without that, the loader declined
  the load and GA stayed dark for the rest of the session. The same path is used
  for the first `config` pageview, so it can never be stamped with `/internal/*`.
  A declined load now reports `blocked`, never `already`.


Implemented in `src/lib/analytics-gate.ts` (`syncGaRoutePolicy`,
`ensureGtagLoaded`, `gtagBootstrapScript`); enforced in `trackEvent`,
`trackPageView` (`src/lib/analytics.ts`), the gtag bootstrap and the
per-navigation sync in `src/routes/__root.tsx`, and `initPostHog` /
`captureEvent` / `capturePostHogPageView` / `syncPostHogRoutePolicy`
(`src/lib/posthog.ts`). Regression coverage:
`src/lib/__tests__/ga-lazy-init.test.ts` and
`src/lib/__tests__/posthog-lazy-init.test.ts`.



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
| 1 | Click an Amazon gear CTA on `/gear/best-roasting-pan-for-duck` (link ids `amazon-roasting-pan-rack`, `amazon-sheet-pan-rack`) | `affiliate_click` (GA4 + PostHog) | `merchant`, `merchant_id`, `merchant_domain`, `placement`, `link_type`, `destination_type`, `affiliate`, `content_type`, `content_slug`, `page_path`/`source_path`, `link_text`, `email_attributed`, `email_campaign`. Destination must keep `tag=deliciousduck-20` and a placement-specific `ascsubtag`. |
| 2 | Click the US Wellness duck-fat CTA on `/buy/duck-fat-buying-guide` | `affiliate_click` | same as above; destination keeps `subId1` / `sharedid` |
| 3 | Submit the newsletter form | `newsletter_intent` on interaction, then `newsletter_signup` after persistence succeeds (GA4 + PostHog) | `placement`, `source`, `interest`, `page_path`/`source_path`, `content_slug` — **never** the email address |
| 4 | Click the Starter Guide / field-guide download (`/guides/duck-cooking-starter-guide`, asset `/downloads/duck-fundamentals-field-guide.pdf`) | `lead_magnet_download` | `asset_id` (`duck-fundamentals-field-guide`), `asset_format` (`pdf` — the file extension, never the asset path), `placement`, `source_path`, `content_slug` |
| 5 | Welcome email received after signup | no browser event; verify delivery in the email provider log and, on click-through, `email_landing_view` with `email_campaign`, `email_slot`, `page_path` | campaign/slot labels only |
| 6 | Unsubscribe via a real mailbox link | unsubscribe succeeds; page is `noindex`; **no** analytics request may contain the `t=` token. A pageview here carries `pathname` only | `page_path` (no query string) |

## Negative checks

- Browse the preview host and any Lovable editor/preview domain: zero requests
  to `googletagmanager.com`, `google-analytics.com`, or `us.i.posthog.com`.
- Browse `/internal/growth-dashboard` on production: no pageview, no
  autocapture, no session recording, no commercial events.
- Confirm no automated Amazon/US Wellness request is issued on page load — the
  affiliate request must only follow a real click.

## Automated browser verification and PostHog bot filtering

PostHog's client SDK suppresses **all** ingestion when it detects an automated
browser (`navigator.webdriver === true`, headless user agents). `posthog.capture()`
still returns normally, so a Playwright run can show "no analytics requests" while
the app code is completely correct.

When verifying PostHog end to end with Playwright, use a real desktop user agent
and hide the automation flag:

```python
ctx = await browser.new_context(user_agent="Mozilla/5.0 ... Chrome/131.0.0.0 Safari/537.36")
await ctx.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false})")
```

GA4 has no equivalent filter, so gtag `/g/collect` hits appear either way.

Verified with this setup on `/gear/best-roasting-pan-for-duck`: one `$pageview`
on load, and clicking the first Amazon CTA emits `affiliate_click` to both
`/g/collect` (GA4) and `us.i.posthog.com/i/v0/e/` (PostHog).
