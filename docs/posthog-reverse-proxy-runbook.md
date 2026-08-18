# PostHog managed reverse proxy — readiness runbook

Status on 2026-08-18: **ready, not activated.** The app still ingests directly to
`https://us.i.posthog.com`. No proxy hostname exists, no DNS record was created,
and no environment variable is set.

## How the code is wired

- `src/lib/posthog.ts` reads one public build-time variable,
  `VITE_POSTHOG_API_HOST`, through `postHogApiHost()`.
- `resolvePostHogApiHost()` validates it conservatively and falls back to the
  direct US host on anything questionable:
  - `https:` only (no `http:`, no scheme-relative, no `javascript:`)
  - no username/password
  - no query string, no hash
  - origin only — a path other than `/` is rejected
- `ui_host` stays `https://us.posthog.com` so links out of the SDK and toolbar
  keep resolving to the real PostHog app even when ingestion is proxied.
- Everything else is unchanged: host/path gating still lives in
  `src/lib/analytics-gate.ts`, pageviews are still manual and path-only.

The intended future value is a first-party ingestion subdomain — for example
`https://e.deliciousduck.com`. It is deliberately not hardcoded anywhere.

## Activation steps (no code change required)

1. In PostHog: **Settings → Project → Managed reverse proxy**, create a proxy for
   the chosen subdomain. PostHog shows a CNAME target.
2. In the DNS provider for `deliciousduck.com`, add the CNAME PostHog specifies
   (e.g. `e` → PostHog's target). Wait for PostHog to report the proxy healthy
   and certificate issued.
3. In Lovable project settings, set `VITE_POSTHOG_API_HOST` to
   `https://<subdomain>.deliciousduck.com` (origin only, no trailing path).
4. Rebuild/redeploy so the public build picks up the variable.

Rollback is the reverse and equally code-free: unset the variable and redeploy;
the default direct host returns.

## Verification after activation

On the canonical production host, with an ad blocker disabled:

1. **Proxy in use** — in PostHog, open a fresh event and confirm the property
   `$lib_custom_api_host` equals the proxy origin. Network tab: requests go to
   `https://<subdomain>.deliciousduck.com/i/v0/e/` (or `/e/`), not `us.i.posthog.com`.
2. **Pageviews** — navigate `/` → `/recipes` → `/gear`. Exactly one `$pageview`
   per navigation, `$pathname` path-only, no query strings.
3. **affiliate_click** — click the Amazon roasting-pan CTA and the US Wellness
   duck-fat CTA. One `affiliate_click` each, with placement/merchant properties
   and no destination query strings.
4. **newsletter_signup** — submit a signup you own. Exactly one PostHog
   `newsletter_signup` with only `placement`, `source`, `interest`, `source_path`,
   and exactly one GA4 `newsletter_signup`.
5. **Blocked internal routes** — direct-load `/internal/growth-dashboard`: zero
   PostHog requests. Navigate to `/` from there: the SDK initializes once and
   emits one pageview. Navigate back into `/internal/*`: capture goes silent
   again, with no persisted opt-out.
6. **No duplicate SDK loading** — in the Network tab, `array.js`/`posthog.js`
   loads once per session; `window.posthog.__loaded` is true and
   `posthog.init` is not re-invoked on navigation (see
   `src/lib/__tests__/posthog-lazy-init.test.ts` for the same invariant).
