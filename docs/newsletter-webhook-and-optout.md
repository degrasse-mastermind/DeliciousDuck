# Duck Drop: provider webhook + mailbox-token opt-out

Status: implemented in code, **not activated**. No Resend webhook exists, no secret
is stored, no template links to these pages yet, and nothing here has been deployed.

## 1. Webhook receiver

`POST /api/webhooks/resend` — the only method implemented. A GET cannot mutate
anything because no GET handler exists.

Order of operations (load-bearing):

1. Read the raw body untouched (`request.text()`). No JSON parsing first.
2. Require `svix-id`, `svix-timestamp`, `svix-signature`. Missing any → `400`.
3. Missing `RESEND_WEBHOOK_SECRET` → `500`, nothing read, nothing written (fail closed).
4. Verify with Svix (`new Webhook(secret).verify(raw, headers)`), the scheme Resend
   signs with. Invalid signature → `401`, zero mutation, nothing logged about the body.
5. Map the verified event. Irrelevant/unknown → `200` and no write at all.
6. Insert into `newsletter_provider_events` (`verified = true`, short `detail`
   classification only, never the raw payload).
7. Only then apply the subscriber transition.

### Event → status rules

| Verified Resend event | Local status |
| --- | --- |
| `email.bounced` | `bounced` |
| `email.complained` | `complained` |
| `email.suppressed`, `suppression.created`, `suppression.added` | `suppressed` |
| `contact.updated` **with `data.unsubscribed === true`** | `unsubscribed` |
| `email.sent` / `delivered` / `delivery_delayed` / `opened` / `clicked`, `contact.created`, `contact.deleted`, `domain.*`, anything unknown | ignored (acknowledged, no row written) |

Recipient extraction is field-specific: `email.*` reads `data.to` (string or
array), `suppression.*`/`contact.*` read `data.email`. No other field is ever
used, so an unrecognised shape yields "no email" instead of suppressing the
wrong address.

### Monotonic suppression

Severity ladder: `subscribed(0) < unsubscribed(1) < suppressed(2) < bounced(3) < complained(4)`.
A verified event writes only if it moves the row **up** the ladder. Therefore no
webhook input can return an address to `subscribed`, and no weaker signal can
clear a stronger one. On a write we set `status`, `suppressed_at`,
`suppression_reason`, `provider_last_event`, `provider_last_event_at`,
`updated_at`, plus `unsubscribed_at` for the unsubscribe case.

### Replay idempotency

`provider_event_id` is the verified `svix-id`. The existing partial unique index
on `(provider, provider_event_id)` makes reinsertion a `23505`, which the handler
reads as `duplicate` and returns `200` **before** any status transition. Resend
retries and replays are therefore safe.

### No local match

The verified event is still stored with `subscriber_id = null`. A subscriber is
never created from provider input.

## 2. Mailbox-token unsubscribe / preferences

- `/newsletter/unsubscribe?t=<opaque token>` and `/newsletter/preferences?t=<opaque token>`.
- The token is the existing `preference_token` (a UUID). It reached the mailbox,
  so possessing it is the proof of ownership. No email address appears in a URL,
  in page HTML, in analytics, or in logs.
- **GET is read-only.** Email security scanners fetch every link, so nothing
  changes until the reader presses the button (a POST server function).
- Both pages are `noindex, nofollow, noarchive` with `referrer: no-referrer`.
- Analytics never receives query strings: the GA config and `trackPageView` send
  `origin + pathname` only.

### Unsubscribe POST

Valid, invalid, expired/rotated, and already-unsubscribed tokens all return the
same `{ ok: true }`, so the page cannot be used to test whether an address is on
the list. For a row still `subscribed`: status → `unsubscribed`,
`unsubscribed_at`/`suppressed_at` set, `suppression_reason = mailbox_token_unsubscribe`,
and **the token is rotated** so the link is single-use. Only after that local
write do we best-effort `PATCH` the Resend contact to `unsubscribed: true`; a
failure records `resend_sync_status` internally and leaves local suppression
intact. Rows already suppressed are never rewritten (monotonic).

### Preference POST

Token-gated and allowed only while `status = 'subscribed'`, so a preference write
can never resurrect a suppressed address. Accepts only the controlled interest
enum. Updates `primary_interest`/`interest`/`interests` locally; the single
supported Resend segment (duck breast) is synced best-effort. Same generic
response for every outcome.

## 3. Link helpers for future templates

`src/lib/newsletter-links.ts` builds absolute `unsubscribeUrl` / `preferencesUrl`
containing only the opaque token. No Resend template or automation was created or
changed in this sprint.

## 4. Migration

None. `newsletter_provider_events`, the unique `(provider, provider_event_id)`
index, `preference_token`, and the suppression columns already exist.

## 5. Known limitations

- Until the webhook is registered in Resend, provider-side unsubscribes and
  bounces are still invisible locally.
- Signature verification is only as good as the stored secret; there is no
  IP allowlist.
- Provider opt-out sync is best-effort and not retried by a scheduled job yet.
- A rotated token cannot be re-issued to the reader from the site; a new emailed
  link is required.

## 6. Activation steps (owner-controlled, none performed)

1. In Resend, create a webhook endpoint pointing at
   `https://deliciousduck.com/api/webhooks/resend` and subscribe to
   `email.bounced`, `email.complained`, `email.suppressed`, `suppression.*`, and
   `contact.updated`.
2. Copy the signing secret Resend shows and store it as `RESEND_WEBHOOK_SECRET`
   in project secrets. Until it exists the endpoint intentionally returns 500.
3. Deploy, then send Resend's test event and confirm a `200`; replay the same
   event and confirm a second `200` with no additional status change.
4. Update the welcome/broadcast template footer to the absolute URLs from
   `mailboxLinks()` with each subscriber's token.
5. Re-check `/newsletter/unsubscribe?t=...` from a real email to confirm the
   read-only GET and the single-use behaviour after confirming.
