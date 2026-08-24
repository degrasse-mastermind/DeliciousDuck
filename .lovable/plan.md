# Duck Game Plan email: confirmation, measurement, and deliverability

Five asks, split into what needs building and what is already in place.

## What I found first (read-only)

- **Delivery path is live and correct in code.** A Game Plan request stores the
  subscriber, then sends the plan email directly through the provider (not an
  automation), with an HTML + plain-text body, a `List-Unsubscribe` header, and a
  10-minute per-address cooldown. The sending credential is present.
- **One real deliverability defect, and it is in DNS, not the app.** The sending
  domain publishes DKIM for the provider, but its SPF record is
  `v=spf1 include:secureserver.net -all` — the provider is not listed, so SPF
  fails on every send. Mail still authenticates via DKIM (the domain's DMARC
  policy uses relaxed alignment), but a hard-fail SPF plus `p=quarantine` is
  exactly the combination that pushes mail to spam at Gmail and Outlook.
  This needs a DNS change at the registrar — I cannot make it from here. The plan
  below includes the exact record change to apply and a verification step.
- **Items 4 and 5 are largely already done.** The planner's email step already has
  a real `<label>`, `type=email`, `autoComplete`, `aria-required`, `aria-invalid`,
  `aria-describedby`, a `role="alert"` error, a honeypot, per-step focus movement,
  and typed error analytics (`required`, `invalid_format`, failure classification).
  Remaining gaps are narrow and listed below rather than rebuilt.

## 1. Double opt-in for Game Plan signups

New behaviour: an address that has never confirmed gets a confirmation email, not
the guide. The plan itself still renders on screen immediately — nothing about the
on-site experience regresses.

- Migration adds to `newsletter_subscribers`: `confirmation_status`
  (`pending` | `confirmed`), `confirmation_token`, `confirmation_sent_at`,
  `confirmed_at`, `confirmation_resend_count`. Existing rows are backfilled to
  `confirmed` so no current subscriber is asked to re-opt-in.
- Pending rows are never pushed to the provider contact list and never receive the
  welcome or plan email. The pending row keeps the four finite plan selections it
  already stores, so confirming delivers the right plan.
- A new confirmation email carries a single tokenised link to a new route
  `/newsletter/confirm`. Confirming marks the row confirmed, syncs the provider
  contact, and then dispatches the plan email plus the one-time welcome.
- Confirmation attempts are token-only, single-purpose, and idempotent: a second
  click shows the same confirmed state and sends nothing again. An unknown or
  expired token shows a neutral "request a new link" state — never a statement
  about whether an address is on the list.
- Already-confirmed subscribers keep today's behaviour: the plan email goes out
  immediately, subject to suppression and cooldown.
- The browser keeps receiving the one constant accepted response, so nothing new
  becomes probe-able.

## 2. Conversion tracking: view, submit, success, delivery

- Client stages, added to the existing Game Plan event contract with the same
  closed property allowlist (no address, no free text): offer view, submit
  attempt, accepted submission, and a distinct confirmation-required stage so the
  funnel separates "signed up" from "confirmed".
- The confirm route emits a confirmation-completed event on load.
- **Delivery** is a provider fact, not a browser fact. The existing provider
  webhook is extended to record `email.sent` / `email.delivered` /
  `email.delivery_delayed` outcomes for plan and confirmation mail, so delivery
  rate is measurable from data instead of inferred. Bounce/complaint/suppression
  handling stays exactly as it is.
- The internal growth dashboard gains a small funnel row: signups, pending
  confirmations, confirmed, plan emails sent, delivered, bounced.

## 3. Validation, error handling, retry UX

- Server-side: distinguish rate-limit rejection from a storage failure so the
  client can say "too many attempts, try again in a minute" instead of a generic
  failure. Rate-limit responses stay uniform across addresses.
- Client-side: inline validation on blur as well as submit, a typo hint for common
  domain misspellings, an explicit **Try again** control after a failure that
  preserves the entered address, and a disabled-with-countdown state on rate limit.
- Error copy stays plain and non-alarming, and never reveals list state.

## 4. Accessibility finishing pass

- Give the pending/submitting state an accessible busy announcement.
- Announce validation failures once, without duplicating the alert text.
- Ensure the new confirm route has a focusable heading, one `h1`, and a keyboard
  path to the guide and planner.
- Verify the whole email step by keyboard only, plus focus-visible contrast.

## 5. End-to-end delivery verification

- Run one real submission from the preview build to a mailbox I can inspect via
  the provider's own logs, and confirm: accepted by provider, `email.sent`, and
  the confirmation link resolves and confirms.
- Then verify the confirmed row receives the plan email.
- Report authentication results (SPF / DKIM / DMARC) as the provider records them,
  and re-check after the SPF record is corrected.
- Clean up any test rows afterwards.

## Technical notes

- Migration includes GRANTs; the table stays server-only (no browser access).
- All new server work goes in existing server-only modules with the current
  pure-core / injected-side-effect split, so decisions stay unit-testable.
- New regression tests: pending rows never trigger provider sends, confirmation is
  idempotent, tokens are single-purpose, event payloads carry no address, and the
  confirm route's states render correctly.
- Nothing is published; verification runs against preview.

## What needs you

The SPF record on the sending domain must list the email provider (or the site
should send from a dedicated subdomain that has its own SPF). I will give you the
exact record value to paste at your DNS host once the code work is in.
