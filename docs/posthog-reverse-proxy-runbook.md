# PostHog managed reverse proxy — runbook

Status on 2026-08-18: **DNS/TLS-valid and code-activated in preview.** The app now
defaults to the first-party proxy `https://e.deliciousduck.com` for PostHog ingestion.
Publication and production verification are still pending.

## How the code is wired

- `src/lib/posthog.ts` defines:
  - `POSTHOG_PROXY_HOST` = `https://e.deliciousduck.com` — the current default.
  - `POSTHOG_DIRECT_HOST` = `https://us.i.posthog.com` — the one-line rollback target.
  - `POSTHOG_UI_HOST` = `https://us.posthog.com` — always the real PostHog app.
- `postHogApiHost()` returns `POSTHOG_PROXY_HOST` unless the optional public build-time
  variable `VITE_POSTHOG_API_HOST` is set to a valid absolute HTTPS origin.
- `resolvePostHogApiHost()` validates any override conservatively and falls back to
  `POSTHOG_PROXY_HOST` on empty, malformed, or unsafe values:
  - `https:` only (no `http:`, no scheme-relative, no `javascript:`)
  - no username/password
  - no query string, no hash
  - origin only — a path other than `/` is rejected
- `ui_host` stays `https://us.posthog.com` so links out of the SDK and toolbar keep
  resolving to the real PostHog app even when ingestion is proxied.
- Everything else is unchanged: host/path gating still lives in `src/lib/analytics-gate.ts`,
  pageviews are still manual and path-only, and no event names or properties changed.

## Why the environment variable is not used

This Lovable project does not expose a usable public environment-variable field, so
`VITE_POSTHOG_API_HOST` cannot be configured through the owner UI. The proxy is therefore
activated in code by changing the default host constant. The override path is preserved
for future flexibility and remains safe because any malformed override falls back to
the proxy default rather than breaking analytics.

## Rollback

To revert to direct PostHog ingestion, change one constant in `src/lib/posthog.ts`:

```ts
export const POSTHOG_PROXY_HOST = "https://us.i.posthog.com"; // was https://e.deliciousduck.com
```

Then redeploy. There is no DNS or environment-variable step.

## Verification after publication

On the canonical production host, with an ad blocker disabled:

1. **Proxy in use** — in PostHog, open a fresh event and confirm the property
   `$lib_custom_api_host` equals `https://e.deliciousduck.com`. Network tab: requests go to
   `https://e.deliciousduck.com/i/v0/e/` (or `/e/`), not `us.i.posthog.com`.
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
