# Newsletter / email status note (internal — not served, not linked, no secrets)

Last updated: August 2026

## Architecture

**The project database (`public.newsletter_subscribers`) is the source of truth.
Resend is the downstream email-delivery sync layer.** A signup succeeds the
moment the row is durably stored; Resend sync is tracked separately per row and
is retryable.

| Item | Value |
| --- | --- |
| Durable store | `public.newsletter_subscribers` (RLS on, no browser access) |
| Delivery provider | Resend |
| Sending domain | deliciousduck.com — **verified in Resend** |
| Sender identity | DeliciousDuck &lt;hello@deliciousduck.com&gt; |
| Segment / audience | DeliciousDuck Subscribers |
| Segment ID | `0a4c8912-f401-400b-b230-2a993f0ec516` |
| Secret for delivery | `RESEND_API_KEY` (server-side only) |
| Secret for resync endpoint | `NEWSLETTER_ADMIN_TOKEN` (server-side only) |
| Capture operational | **Yes** — independent of `RESEND_API_KEY` |
| Delivery sync operational | **Only once `RESEND_API_KEY` is set** |

No secret value is stored in code, docs, logs, or client bundles. Both secrets
are read inside server-only code via `process.env`.

## Columns that matter

- `email` / `email_normalized` — the normalized lowercase column carries the
  unique index, so duplicates are impossible regardless of casing.
- `status` — `subscribed` | `unsubscribed`.
- `resend_sync_status` — `pending` | `synced` | `error`.
- `resend_contact_id`, `last_resend_sync_at` — set on a sync attempt.

### Status semantics

| Value | Meaning |
| --- | --- |
| `pending` | Stored durably, not yet pushed to Resend (usually no API key set). |
| `synced` | Resend accepted the contact (201 created, or 200/409 already present). |
| `error` | Resend rejected the push. Still a valid subscriber; retry later. |

## Security posture

- RLS enabled and no table grants to `anon` / `authenticated` — the browser
  cannot read or write subscriber rows at all.
- All writes go through server-only code using the service-role client, imported
  inside handlers (`src/lib/newsletter.server.ts`).
- Server-side zod validation (trim, lowercase, email, max 255), hidden honeypot
  field, and a best-effort per-instance rate limit of 5 submissions/minute/IP.
- The client only ever receives success or a generic failure.

## How it works

- UI: `src/components/site/NewsletterSignup.tsx` — client validation, hidden
  honeypot, success state only after the server call resolves.
- Boundary: `src/lib/newsletter.ts` — `NEWSLETTER_CONFIG`, `subscribeToNewsletter`.
- Server fns: `src/lib/newsletter.functions.ts` — `subscribeToNewsletterFn` and
  the internal `resyncNewsletterFn`.
- Server-only logic: `src/lib/newsletter.server.ts` — upsert on
  `email_normalized`, then best-effort Resend push.

Duplicate signup: the upsert keeps the existing row, re-sets
`status = 'subscribed'`, clears `unsubscribed_at`, and updates
`source`/`placement` only when new values are supplied. Always a success.

## Retrying pending / error rows

`resyncNewsletterFn` re-pushes up to 200 `pending`/`error` subscribers per call
and returns counts only — never emails. It requires the
`NEWSLETTER_ADMIN_TOKEN` secret plus a matching token in the call payload, and
is not linked in any navigation. Without `RESEND_API_KEY` it returns
`{ skipped: 'no_api_key' }` and changes nothing.

No-code check of what is outstanding:

```sql
select resend_sync_status, count(*)
from public.newsletter_subscribers
group by 1;
```

## Not yet true — do not claim otherwise in copy

- No welcome/confirmation email is sent (no broadcast or automation wired).
- No double opt-in. Add it in Resend before heavy acquisition if desired.

## Analytics contract

- `newsletter_intent` — genuine interaction with a signup surface (field focus).
  Not a conversion. Deduped once per component instance.
- `newsletter_signup` — fires ONLY after durable database persistence succeeds,
  even if Resend sync is `pending`. Mark this one as the conversion in GA4. The same
  event is mirrored to PostHog with an allowlisted payload (`placement`, `source`,
  `interest`, `source_path` as a normalized path) and never any PII.
  Accepted semantics: a duplicate submission from an address already on the list can
  still count as a conversion, because the client cannot be told membership state
  without turning the form into an address-membership oracle. Existing subscribers
  get the same generic success UI, but no Resend contact/event call and no repeated
  welcome email.

## Lead magnet + welcome email (current behaviour)

- The lead magnet is a printable 28-page PDF, "Duck the Fundamentals — the no-panic
  playbook for cooking seriously good duck", served as a stable public asset at
  `/downloads/duck-the-fundamentals-playbook.pdf`, with the legacy path
  `/downloads/duck-fundamentals-field-guide.pdf` permanently serving byte-identical
  bytes (`FIELD_GUIDE` in `src/data/starter-guide.ts` — the symbol keeps its
  historical name so analytics ids, placements and consent plumbing stay stable). The web article
  `/guides/duck-cooking-starter-guide` stays as the free on-site companion.
  The download button appears only in the post-signup success state.
- After the subscriber row is durably stored and the Resend contact is synced, the
  server fires the Resend custom event `newsletter.subscribed` for that email with
  payload `{ guide_url: "https://deliciousduck.com/downloads/duck-fundamentals-field-guide.pdf" }`.
  The Resend automation sends the welcome email off that event; delivery was verified
  in production on 2026-08-18.
- Auditability lives on `newsletter_subscribers.welcome_event_status`
  (`pending` | `sent` | `error` | `skipped`) plus `welcome_event_at`.
  Send-on-first-subscribe: a row already marked `sent` is skipped, so repeat
  signups never trigger repeat welcome events.
- Failure isolation: a failed contact sync or failed event never undoes the
  subscription. The client only receives `{ subscribed, welcomeTriggered }`; when
  `welcomeTriggered` is false the UI links to the guide on-site instead of
  claiming an email was sent.
- `RESEND_API_KEY` is read inside server handlers only, never logged or returned.

## Double opt-in (current behaviour)

A stored row is **not** a subscriber until the mailbox confirms.

| Column | Meaning |
| --- | --- |
| `confirmation_status` | `pending` \| `confirmed` |
| `confirmation_token` | Opaque UUID, delivered only to the mailbox |
| `confirmation_sent_at` / `confirmation_sent_count` | Cooldown (10 min) and lifetime cap (5) |
| `confirmed_at` | When the link was pressed |

Flow:

1. Any signup (form or Duck Game Plan) stores/refreshes the row as usual, then
   sends exactly one kind of mail: the confirmation
   (`src/lib/newsletter-confirmation.ts` decides, `*.server.ts` dispatches).
2. While `pending` there is **no** provider contact, no segment write, no
   welcome email and no Game Plan email. Enforced in `persistSubscriber` and in
   `runGamePlanDelivery` (`skipped_unconfirmed`, fails closed when unknown).
3. `/newsletter/confirm?c=<token>` is read-only on GET — scanners must not be
   able to opt someone in. The POST runs `confirmSubscription`, which is
   idempotent, never revives a suppressed address, then activates the row:
   provider contact, interest segment, send-once welcome, and (for planner
   signups) the plan email built from the stored enum selections.
4. Existing subscribers were backfilled as `confirmed`, so nobody was re-prompted.

Responses stay indistinguishable: the browser always gets `{ subscribed: true }`,
so cooldown, suppression, membership and confirmation state cannot be probed.

## Delivery measurement

- `newsletter_confirm_required` — submission accepted, confirmation asked for.
- `newsletter_confirmed` — the emailed link was used. **Mark this one as the GA4
  conversion**; `newsletter_signup` is now an attempt, not an acquisition.
- Provider outcomes land in `newsletter_provider_events` via the verified Resend
  webhook: `sent`, `delivered`, `delivery_delayed` (logged only, never acted on)
  alongside the existing suppression events. `detail` carries our own send tag
  (`email.delivered:game_plan`, `:confirmation`) so each stream is separable.
  Engagement (`opened`, `clicked`) is still ignored on purpose.

## Outstanding action for the owner (DNS, not code)

`deliciousduck.com` SPF is currently `v=spf1 include:secureserver.net -all`,
which does not authorise Resend. DKIM passes, so mail is delivered, but the SPF
failure measurably raises spam placement. Add Resend's include to the existing
SPF record (one record only — never a second `v=spf1` TXT), and consider a
`p=none` DMARC record to start collecting reports.
