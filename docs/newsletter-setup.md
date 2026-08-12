# Newsletter / email status note (internal — not served, not linked, no secrets)

Last updated: August 2026

## Current configuration

| Item | Value |
| --- | --- |
| Provider | Resend |
| Sending domain | deliciousduck.com — **verified in Resend** |
| Sender identity | DeliciousDuck &lt;hello@deliciousduck.com&gt; |
| Segment / audience | DeliciousDuck Subscribers |
| Segment ID | `0a4c8912-f401-400b-b230-2a993f0ec516` |
| Server secret required | `RESEND_API_KEY` (server-side only) |
| Live subscription operational | **Only once `RESEND_API_KEY` is set** in Project Settings → Secrets |

The secret value is never stored in code, docs, logs, or client bundles. It is
read inside the server function handler via `process.env.RESEND_API_KEY`.

## How it works

- UI: `src/components/site/NewsletterSignup.tsx` — client-side validation,
  hidden honeypot field, success state only after the server call resolves.
- Boundary: `src/lib/newsletter.ts` — `NEWSLETTER_CONFIG` (provider `resend`,
  status `configured`) and `subscribeToNewsletter`.
- Server: `src/lib/newsletter.functions.ts` — zod validation (trim, lowercase,
  email, max 255), honeypot check, best-effort per-IP rate limit (5/min),
  then `POST https://api.resend.com/audiences/<segment>/contacts`.
  201 = new contact, 200/409 = already a member — both treated as success
  (idempotent). Anything else logs status + provider detail (never the key)
  and throws, so the UI shows an error and no GA4 conversion fires.

## Fail-closed behavior

If `RESEND_API_KEY` is absent, the handler throws `newsletter_not_configured`
before touching Resend. The visitor sees "We couldn't sign you up just now",
nothing is stored, and `newsletter_signup` does not fire.

## Not yet true — do not claim otherwise in copy

- No Starter Guide PDF exists yet. Copy promises the guide **when released**.
- No welcome/confirmation email is sent yet (no broadcast or automation wired).
- No double opt-in. Add it in Resend before heavy acquisition if desired.

## Analytics contract

- `newsletter_intent` — genuine interaction with a signup surface (field focus).
  Not a conversion. Deduped once per component instance.
- `newsletter_signup` — fires ONLY after the server function resolves
  successfully. Mark this one as the conversion in GA4.
