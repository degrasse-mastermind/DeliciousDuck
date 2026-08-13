# Duck Drop: provider webhook + mailbox-token opt-out

Status: implemented in code, **not activated**. No Resend webhook exists, no secret
is stored, no template links to these pages yet, and nothing here has been deployed.

## 1. Webhook receiver

`POST /api/webhooks/resend` — the only method implemented. A GET cannot mutate
anything because no GET handler exists.

Order of operations (load-bearing):

1. Read the raw body untouched (`request.text()`). No JSON parsing first.
2. Require `svix-id`, `svix-timestamp`, `svix-signature`. Missing any → `400`.
3. Missing `RESEND_WEBHOOK_SECRET` → `503 unavailable`, nothing read, nothing
   written (fail closed; the endpoint is unconfigured, not faulted, and Svix
   retries `503`).
4. Verify with Svix (`new Webhook(secret).verify(raw, headers)`), the scheme Resend
   signs with. Invalid signature → `401`, zero mutation, nothing logged about the body.
5. Map the verified event. Irrelevant/unknown → `200` and no write at all.
6. Apply the subscriber transition as **one atomic conditional UPDATE**.
7. Only then insert into `newsletter_provider_events` (`verified = true`, short
   `detail` classification only, never the raw payload).

### Why the transition precedes the event log

An earlier revision inserted the event first. That had a retry hole: if the
insert succeeded and the subscriber update then failed, the redelivery matched
the unique event id, was classified as a replay, and returned `200` **without
ever applying the suppression** — a permanently logged-but-unapplied event.

The order is now inverted, and correctness no longer depends on the event log
acting as a lock. It depends on the update being idempotent:

- Update fails → `500`, and **no event row is written**, so the redelivery
  re-runs the entire path from scratch.
- Update succeeds, event insert fails → `500`; the row is already in the correct
  suppressed state, and the redelivery re-runs the guarded update (which matches
  nothing and reports `unchanged`) and then persists the event.

### Monotonic suppression, enforced in the write

Severity ladder: `subscribed(0) < unsubscribed(1) < suppressed(2) < bounced(3) < complained(4)`.

The transition is a single statement guarded on the stored status:
`UPDATE ... WHERE id = $1 AND status IN (<every status strictly weaker than the
target>)`, via `.eq("id", id).in("status", fromStatuses).select("id")`. Postgres
re-evaluates that predicate against the current row, so:

- No webhook input can return an address to `subscribed`.
- No weaker signal can clear a stronger one (an unsubscribe never overwrites a
  bounce or a complaint).
- A row that changed between our lookup and our write — a concurrent delivery
  winning the race — matches nothing and is reported as `unchanged`, never
  downgraded. There is no read-then-write window; the earlier `findSubscriber`
  read is only a fast path, not the guard.

`weakerStatuses(target)` derives the guard set from the ladder, so the set cannot
drift from the severity order. On a matched write we set `status`,
`suppressed_at`, `suppression_reason`, `provider_last_event`,
`provider_last_event_at`, `updated_at`, plus `unsubscribed_at` for the
unsubscribe case.

### Replay idempotency

`provider_event_id` is the verified `svix-id`. The existing partial unique index
on `(provider, provider_event_id)` makes reinsertion a `23505`, which the handler
reads as `duplicate` and answers `200`. By then the guarded update has already
run and refused (the row holds an equal or stronger status), so acknowledging a
replay cannot leave a transition unapplied. Resend retries and replays are safe.

### No local match

The verified event is still stored with `subscriber_id = null`. A subscriber is
never created from provider input.


## 2. Mailbox-token unsubscribe / preferences

- `/newsletter/unsubscribe?t=<opaque token>` and `/newsletter/preferences?t=<opaque token>`.
- The token is the existing `preference_token` (a UUID). It reached the mailbox,
  so possessing it is the proof of ownership.
- **GET is read-only.** Email security scanners fetch every link, so nothing
  changes until the reader presses the button (a POST server function).
- Both pages are `noindex, nofollow, noarchive` with `referrer: no-referrer`.

### Exact privacy boundary of the token

Stated precisely, because the looser claim is false:

- **No email address** appears in the URL, in rendered UI, or in server logs.
- **The opaque token is in the URL**, and because it is part of the route's
  validated search state it may also be serialized into SSR/hydration state in
  the page HTML. This has not been eliminated and must not be described as
  eliminated. It is accepted for this sprint, mitigated by `no-referrer`,
  `noindex`, single-use rotation on unsubscribe, and the token being an opaque
  UUID that identifies no address by itself.
- **Query strings never reach analytics.** The GA config and `trackPageView`
  send `origin + pathname` only, so neither the token nor any other parameter is
  transmitted to GA4.

Anyone who can read the URL (browser history, a shared screenshot, a forwarded
email) can therefore act on that subscription. That is the same trust level as
any mailbox-link opt-out, and it is why the link is single-use.

### Unsubscribe POST

Valid, invalid, expired/rotated, and already-unsubscribed tokens all return the
same `{ ok: true }`, so the page cannot be used to test whether an address is on
the list. For a row still `subscribed`: status → `unsubscribed`,
`unsubscribed_at`/`suppressed_at` set, `suppression_reason = mailbox_token_unsubscribe`,
and **the token is rotated** so the link is single-use. Only after that local
write do we best-effort sync the opt-out to Resend; a failure records
`resend_sync_status` internally and leaves local suppression intact. Rows
already suppressed are never rewritten (monotonic).

#### Provider opt-out request shape (verified against the official API)

Resend audiences are deprecated. A global unsubscribe uses the Update Contact
route:

```http
PATCH https://api.resend.com/contacts/{id-or-email}
authorization: Bearer <RESEND_API_KEY>
content-type: application/json

{"unsubscribed":true}
```

The implementation lives in `src/lib/newsletter-provider-optout.ts`, kept pure so
the URL and body are unit-testable with no network or credentials:

- The path identifier is the stored `resend_contact_id` when present (it survives
  an address change and keeps the address out of the URL), otherwise the
  normalized email. A blank/whitespace contact id falls back to the email.
- The identifier is `encodeURIComponent`-encoded, so `+` tags, `@`, and any `/`
  cannot alter the path.
- The body carries **only** `{"unsubscribed":true}` — no address, and no
  consent-bearing field that could be silently rewritten.
- The deprecated `/audiences/<id>/contacts` collection route is not used here.

#### Contact creation request shape (verified against the official API)

No deprecated audience route remains in any active newsletter contact
create/update flow. Signup and internal resync both create the contact with:

```http
POST https://api.resend.com/contacts
authorization: Bearer <RESEND_API_KEY>
content-type: application/json

{"email":"<normalized address>"}
```

The implementation lives in `src/lib/newsletter-provider-contact.ts`, kept pure
with an injectable fetch seam so tests make no network calls:

- The body carries **email only**. `unsubscribed: false` is never sent, because
  that would reactivate a contact the provider has already suppressed.
- A `409` conflict is an idempotent success: no follow-up update, no
  reactivation. If the conflict body cannot safely supply an id we return `null`
  and preserve the local record (resyncable later).
- Provider failures surface a status classification only
  (`provider_unauthorized`, `provider_rate_limited`, `provider_unavailable`, …).
  The raw provider body, the API key, and the address never reach a log or a
  thrown error.
- Only genuinely new local rows reach the provider; existing, duplicate, or
  suppressed form submissions make zero provider calls.
- The duck-breast interest segment sync stays separate and best-effort on the
  current segment-contact route.

Behaviour is unchanged: local-first (the suppression row is already committed
when this runs), best-effort, never throwing, and logging only a status code —
never the address.




### Preference POST

Token-gated and allowed only while `status = 'subscribed'`, so a preference write
can never resurrect a suppressed address. Accepts only the controlled interest
enum. Updates `primary_interest`/`interest`/`interests` locally; the single
supported Resend segment (duck breast) is synced best-effort. Same generic
response for every outcome.

## 3. Mailbox links in the welcome event

`src/lib/newsletter-links.ts` builds absolute `unsubscribeUrl` / `preferencesUrl`
containing only the opaque token — never the address.

Those links are now part of the first-time welcome event. `src/lib/newsletter-welcome-event.ts`
holds the pure builders (no network, no credentials, no database):

```http
POST https://api.resend.com/events/send
{"event":"newsletter.subscribed","email":"<address>","data":{
  "guide_url":"…/downloads/duck-fundamentals-field-guide.pdf",
  "interest":"…","source_path":"…",
  "unsubscribe_url":"https://deliciousduck.com/newsletter/unsubscribe?t=<token>",
  "preferences_url":"https://deliciousduck.com/newsletter/preferences?t=<token>"}}
```

- `persistSubscriber` selects `preference_token` with the written row, so the
  token exists server-side for exactly the send that needs it. It is never
  returned to the browser.
- If the row yields no plausible token, the event is **not** sent and
  `welcome_event_status` stays `pending`, rather than mailing dead links.
- The event definition registration (`POST /events`, retried once on 404/422)
  declares `unsubscribe_url` and `preferences_url` as `string`, so the provider
  cannot drop them silently.
- Failures throw a status classification (`welcome_event_unauthorized`,
  `welcome_event_rate_limited`, …). The provider's response body is never read
  into a log or error, because it can echo the submitted address.
### Owner-controlled, still REQUIRED before deployment

Nothing in this sprint touched the live Resend event definition, template, or
automation. Before the welcome email can render working links, the owner must:

1. Update the existing `newsletter.subscribed` **event definition** to accept
   `unsubscribe_url` and `preferences_url` as strings (the code's fallback
   registration only fires on a 404/422 dispatch and was never called in testing).
2. Add `{{unsubscribe_url}}` and `{{preferences_url}}` to the welcome
   **template** footer, alongside the existing `{{guide_url}}`.
3. Only then deploy and run the staged single-address test.

Until step 1 is done, a dispatch may be rejected; the row is recorded
`welcome_event_status = "error"` and the subscriber is still durably stored.

### No deprecated audience route remains

Every active newsletter contact create/update flow uses the current
`/contacts` API: creation via `POST /contacts` (`newsletter-provider-contact.ts`)
and global opt-out via `PATCH /contacts/{id-or-email}`
(`newsletter-provider-optout.ts`). The one remaining collection write is the
supported segment route `POST /segments/{id}/contacts`, kept separate and
best-effort.

## 4. Migration

None. `newsletter_provider_events`, the unique `(provider, provider_event_id)`
index, `preference_token`, and the suppression columns already exist.

## 5. Known limitations

- Until the webhook is registered in Resend, provider-side unsubscribes and
  bounces are still invisible locally.
- Signature verification is only as good as the stored secret; there is no
  IP allowlist.
- Provider opt-out sync is best-effort and has **no scheduled retry job**. A
  failure is recorded as `resend_sync_status` and nothing re-attempts it, so a
  contact can remain subscribed at Resend while locally suppressed. Local
  suppression is what gates sending, so this cannot cause an unwanted send from
  this app.

- The opaque token is present in the URL and may appear in framework hydration
  state; see the privacy boundary above.
- A rotated token cannot be re-issued to the reader from the site; a new emailed
  link is required.
- The transition/event-log pair is not one transaction. The failure mode is now a
  correctly suppressed row with a missing event row, resolved by the retry —
  never an unapplied suppression.

## 6. Activation steps (owner-controlled, none performed)

1. In Resend, create a webhook endpoint pointing at
   `https://deliciousduck.com/api/webhooks/resend` and subscribe to
   `email.bounced`, `email.complained`, `email.suppressed`, `suppression.*`, and
   `contact.updated`.
2. Copy the signing secret Resend shows and store it as `RESEND_WEBHOOK_SECRET`
   in project secrets. Until it exists the endpoint intentionally returns 503.

3. Deploy, then send Resend's test event and confirm a `200`; replay the same
   event and confirm a second `200` with no additional status change.
4. Update the welcome/broadcast template footer to the absolute URLs from
   `mailboxLinks()` with each subscriber's token.
5. Re-check `/newsletter/unsubscribe?t=...` from a real email to confirm the
   read-only GET and the single-use behaviour after confirming.
