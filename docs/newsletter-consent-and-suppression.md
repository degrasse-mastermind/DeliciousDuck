# Newsletter consent & suppression safety

Scope: The Duck Drop signup path only (`NewsletterSignup` → `newsletter.functions.ts` →
`newsletter.server.ts` → `public.newsletter_subscribers`). No email is sent by anything
described here beyond the pre-existing `newsletter.subscribed` Resend event.

## Consent fields and versioning

Single source of truth: `src/lib/newsletter-consent.ts`.

- `NEWSLETTER_CONSENT.text` is rendered verbatim beside the submit button
  (`aria-describedby` links the button to it).
- `NEWSLETTER_CONSENT.version` is submitted by the browser and validated by
  `subscribeSchema` as a `z.literal`. A stale or missing version is rejected, so the
  wording shown and the evidence stored cannot diverge.
- **Changing the wording requires bumping `version`** and appending the old id to
  `KNOWN_CONSENT_VERSIONS`. Never edit shipped text in place.

Stored per accepted signup (`newsletter_subscribers`):

| Column | Source |
| --- | --- |
| `consented_at` | server clock at acceptance (never client-supplied) |
| `consent_text_version` | validated consent version |
| `consent_source_path` | same-origin path, query string stripped |
| `privacy_policy_version` | `NEWSLETTER_CONSENT.privacyPolicyVersion` |
| `privacy_policy_url` | absolute `${SITE.baseUrl}/privacy` |
| `consent_record` | `explicit` |

Also retained (pre-existing): `interest`, `interests`, `primary_interest`, `source`,
`placement`, `source_path`, `first_content_path`, `signup_count`, `last_signup_at`.

**No IP address is stored.** Abuse protection is a per-worker-instance in-memory counter
keyed on the request IP (`rateLimited`), never persisted, never logged, never returned.
That is the deliberate privacy-preserving choice: no network identifier reaches durable
storage. If durable abuse signals are ever needed, the intended approach is a salted,
truncated, rotating-salt hash — not raw IP — and it is not implemented today.

Legacy rows: every row that existed before this change carries
`consent_record = 'unknown_legacy'` with all consent columns NULL. Nothing was backfilled;
no historical row is represented as consented. If such a subscriber submits the form again
while still `subscribed`, that new submission *is* a fresh consent act and is recorded
(`consent_record` becomes `explicit`, timestamped at that submission).

## Allowed statuses and transitions

`status` is constrained by a CHECK to states the app can verify:

`subscribed` · `unsubscribed` · `bounced` · `complained` · `suppressed`

Suppressed set (`SUPPRESSED_STATUSES`): `unsubscribed`, `bounced`, `complained`,
`suppressed`.

Form signup transitions (`decideSignup` in `src/lib/newsletter-status.ts`), with provider
effects from `providerPlan` in the same module:

| Current state | Action | Local writes | Resend contact / segment | Welcome event |
| --- | --- | --- | --- | --- |
| no row | `create` | insert row, `status = subscribed`, consent evidence | yes (contact + segment) | eligible, once |
| `subscribed`, consent `explicit` (active duplicate) | `refresh` | update same row: attribution, merged interests, `signup_count + 1`, fresh consent evidence | **none** | **never** |
| `subscribed`, consent `unknown_legacy` (legacy duplicate) | `refresh` | same as above, and `consent_record` becomes `explicit` | **none** | **never** |
| `unsubscribed` / `bounced` / `complained` / `suppressed` | `blocked` | **nothing at all** | **none** | never |
| unrecognised status | `blocked` (fail closed) | nothing | **none** | never |

### Provider idempotency

Only a genuinely new local row may call Resend. Any submission against an existing row
performs zero provider calls — no contact upsert, no segment write, no custom event —
even when that row never received a welcome.

Why: no authenticated Resend webhook exists yet, so local `status` can be stale relative to
the provider. The contact upsert sends `unsubscribed: false`, which would silently re-enable
a contact the subscriber had already opted out of at Resend. A duplicate website form
submission is not strong enough evidence to change provider contact state.

Consequence, stated plainly: an existing subscriber whose welcome event previously failed
(`welcome_event_status` of `pending` or `error`) will **not** be retried by them signing up
again. Recovering those rows needs a deliberate internal action; `resyncPendingSubscribers`
(admin-token gated) re-syncs contacts but does not send welcome events.

### Response indistinguishability

`publicSubscribeResponse` in `src/lib/newsletter-response.ts` is the only mapping to the
client, and it returns the constant `{ subscribed: true }` for every internal outcome:
`created`, `active_duplicate`, `legacy_active_duplicate`, `blocked_suppressed`. No welcome
state, stored interest, membership state, suppression state, or preference token crosses the
boundary. Hard failures still reject, so the form can show an error.

Additional guarantees:

- The refresh update is guarded with `.eq("status", "subscribed")`, so a concurrent
  suppression cannot be overwritten.
- `status = 'subscribed'` / `unsubscribed_at = null` is only ever written on the create and
  refresh paths — the blocked path returns before any write, so no signup can reactivate a
  suppressed address.
- Uniqueness on `email_normalized` is enforced by a unique index; one address is always one
  row, so duplicates never create a second contact or a second provider event.
- The blocked path logs a generic `"Newsletter signup ignored: address is not eligible for
  signup"` — never the stored status and never the address, because logs are a side channel
  that would reveal exactly the list state the response hides.

### Removed: in-session preference editor (tradeoff)

The success panel used to offer an interest selector, authorised by a `preference_token`
issued to first-time subscribers only. That made a new signup visibly different from a
duplicate one, so the panel itself could be used to test whether an address was already on
the list. It is removed: `applyInterestChoice`, `setNewsletterInterestFn`,
`setNewsletterInterest`, `interestChoiceSchema`, `trackNewsletterInterestSelected`, and the
UI fieldset are all gone.

Cost: subscribers can no longer change their interest immediately after signing up.
Interest is still recorded from the page cluster they signed up on, and every subscriber
receives the same weekly issue, so nothing is withheld. The replacement belongs on a future
emailed, token-linked preference page, where the emailed link itself proves mailbox
ownership. The `preference_token` column stays in the schema, unused, for that purpose.

The Field Guide download is unaffected: it is a static path
(`/downloads/duck-fundamentals-field-guide.pdf`) rendered on success, and never depended on
any response field.


## Provider event model (prepared, not active)

`public.newsletter_provider_events` exists for a future **authenticated, signature-verified**
Resend webhook: `email_normalized`, `subscriber_id`, `event_type`
(`unsubscribed|bounced|complained|suppressed|delivered`), `provider`, `provider_event_id`
(unique per provider), `occurred_at`, `received_at`, `verified`, `detail`.

RLS is on with a deny-all policy for `anon`/`authenticated`; only `service_role` is granted.
`PROVIDER_EVENT_STATUS` maps event types to statuses.

**Not implemented in this sprint:** no webhook route exists, no public mutation endpoint was
added, no signature verification exists, and nothing writes to this table yet.

## Still unimplemented / unproven

- Provider-side unsubscribe and suppression synchronisation. Resend-side opt-outs are **not**
  reflected in our database. Do not claim provider-side unsubscribe protection until a
  signed webhook is implemented, deployed, and observed in production.
- On-site unsubscribe/preference page.
- Resend welcome automation/broadcast (untouched by design).
- Resend open/click tracking remains off.

## Controlled end-to-end test plan (not executed)

1. Preview only, one address you own. Submit from `/` and confirm the row: `consent_record =
   explicit`, `consented_at` set, `consent_text_version` matches the shipped version,
   `consent_source_path = /`.
2. Submit the same address again from a different page. Expect: one row, `signup_count = 2`,
   merged `interests`, refreshed consent timestamp, and **no** second welcome event.
3. Manually set that row to `unsubscribed` in a controlled (non-production) row, submit again,
   and confirm: row untouched (`status` still `unsubscribed`, `signup_count` unchanged) and
   the UI shows the same generic success.
4. Confirm the consent paragraph is visible without scrolling past the button at 390px and
   1280px, and that the privacy policy link resolves.
5. Only after the above: implement the signed webhook, then re-test suppression sync.
