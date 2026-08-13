# The Duck Drop — Activation-Readiness Audit (read-only)

Head audited: `30872b0ed0c24aab2eb5328185ae769b84ff7000`. No code was changed, nothing was deployed, no secret was created or revealed, no webhook registered, no Resend template/automation/event touched, no email or event sent, no migration added, no subscriber or provider row mutated. The only network calls made were two unauthenticated HTTP HEAD reads of the public guide PDF.

## Traced path (evidence)

1. Form: `src/components/site/NewsletterSignup.tsx` — submits email, derived `interest` (line 87), `sourcePath`, and `consentVersion` (line 90) through `subscribeToNewsletter`.
2. Server fn: `src/lib/newsletter.functions.ts:14` `subscribeToNewsletterFn` — Zod validation, honeypot, per-IP in-memory rate limit (line 23), then `persistSubscriber`, then the constant public response (line 30).
3. Persist: `src/lib/newsletter.server.ts:166` `persistSubscriber` — reads the existing row (line ~180), `decideSignup` + `providerPlan`, blocks suppressed addresses with no writes (line 212), then insert or guarded update (line ~275).
4. Provider contact: `pushToResend` (line 84) → `createProviderContact` in `src/lib/newsletter-provider-contact.ts` → `POST https://api.resend.com/contacts`, email-only body.
5. Segment: `syncInterestSegment` (line 54) → `POST /segments/{DUCK_DROP.breastSegmentId}/contacts`, only for `primary_interest === "duck-breast"`, best-effort.
6. Welcome: `sendWelcomeEvent` (line 100) → `POST /events/send` with `event: "newsletter.subscribed"` and data `{ guide_url, interest, source_path }`; auto-registers the event definition on 404/422 (line 128).
7. Guide URL: `src/data/starter-guide.ts:38` `FIELD_GUIDE_URL` = `https://deliciousduck.com/downloads/duck-fundamentals-field-guide.pdf`.
8. Opt-out/preferences: `src/lib/newsletter-links.ts` builds absolute token URLs; routes `src/routes/newsletter.unsubscribe.tsx` and `newsletter.preferences.tsx` exist; `src/lib/newsletter-preferences.server.ts:33` `loadByToken` resolves the token.

## Answers

**1. Does the welcome event carry the preference token / absolute links? No.** `sendWelcomeEvent` (`newsletter.server.ts:100-148`) sends only `guide_url`, `interest`, `source_path`. It receives `email`, `apiKey`, `meta` — no token argument exists, and `mailboxLinks()` in `newsletter-links.ts:34` has zero call sites in the send path. So the welcome email cannot currently render a working unsubscribe or preferences link. This is the single blocking gap.

**2. Does the DB read/insert return `preference_token`? No — but the value exists.** The post-write selection is `const selection = "id, welcome_event_status, primary_interest"` (`newsletter.server.ts:274`); the pre-read selection also omits it. The column is `preference_token uuid NOT NULL DEFAULT gen_random_uuid()`, so every new row already has a token — it is simply never selected into the code path that would email it. A UUID also passes the `isPlausibleToken` gate (`newsletter-links.ts:43`, 16–64 of `[A-Za-z0-9-]`).

**3. Can the event payload/schema accept the link fields? Only after the schema is widened — and failure would be silent-ish.** The self-registration body declares `schema: { guide_url, interest, source_path }` (line 133). Registration is attempted only on a 404/422 first response; for an event that already exists in the owner's Resend workspace, extra `data` keys are sent against the previously registered schema. Whether Resend accepts, ignores, or rejects unknown keys depends on the registered definition, and the template will simply render an empty variable if the key never arrives — a silent failure in the recipient's inbox. Additionally the existing automation/template must reference the new variables; code alone cannot change that (owner action).

**4. Is the PDF production-safe? Yes.** `public/downloads/duck-fundamentals-field-guide.pdf` (118 KB) is a static public asset; `https://deliciousduck.com/downloads/duck-fundamentals-field-guide.pdf` returns `200 application/pdf` and localhost returns 200. `public/robots.txt` does not disallow `/downloads`. The URL is absolute and origin-pinned via `SITE_URL` (`src/data/site.ts:9`), so it is not preview-host dependent.

**5. Do duplicates and suppressed submissions stay provider-silent? Yes.** `decideSignup` returns `blocked` for `unsubscribed | bounced | complained | suppressed` and for unknown statuses (fail closed) — `newsletter-status.ts:68-84` — and `persistSubscriber` returns before any write (line 212). For an existing `subscribed` row, `plan.syncContact` is false, so the function returns at `newsletter.server.ts:296-300` before contact create, segment sync, and event send. Contact creation itself sends email only, never `unsubscribed: false`, and treats 409 as an idempotent success with no follow-up update (`newsletter-provider-contact.ts`).

**6. Deprecated audience paths / raw provider-body logging.** No deprecated `/audiences/...` request remains in active code — the only matches are comments and test assertions. Contact create and contact opt-out both use `/contacts`. **One raw-body leak remains:** `sendWelcomeEvent` at `newsletter.server.ts:145-147` does `await response.text()` and embeds 300 characters of the provider response in a thrown `Error`, which is then logged. Resend error bodies commonly echo the submitted address, so this can put a subscriber email into logs. The contact-create and opt-out paths already use status-only classification; this one path was not migrated.

**7. Environment variables required.**
- `RESEND_API_KEY` — contact create, segment sync, welcome event, provider opt-out (`newsletter.server.ts:296,367`, `newsletter-preferences.server.ts:89,143`). Absent → subscribers still stored, `resend_sync_status = pending`.
- `RESEND_WEBHOOK_SECRET` — Svix verification (`newsletter-webhook.server.ts:14,22`). Absent → webhook route refuses (503).
- `NEWSLETTER_ADMIN_TOKEN` — gates resync and stats server fns (`newsletter.functions.ts:44,70`).
- Platform-managed and already present: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (admin client).

**8. Code changes vs owner dashboard actions.**

Code (a later build turn, on approval):
- Select `preference_token` in both the pre-read and the post-write selection in `persistSubscriber`.
- Pass the token into `sendWelcomeEvent` and add `unsubscribe_url` / `preferences_url` from `mailboxLinks(SITE.baseUrl, token)` to the event `data`, plus the same two keys in the registration `schema`.
- Replace the raw-body error at `newsletter.server.ts:145` with a status classification, reusing the `providerFailureReason` helper.
- Skip the event (leave `welcome_event_status = "pending"`) when no token was returned, rather than sending a link-less welcome.
- Deterministic tests for the event payload builder: exact `/events/send` URL, both absolute link fields present and token-encoded, schema includes the new keys, no email in thrown errors, no network with a missing key.

Owner-controlled (cannot be done from code):
- Confirm or update the `newsletter.subscribed` event definition in Resend so `unsubscribe_url` and `preferences_url` are accepted.
- Reference those two variables in the welcome template/automation, and keep Resend's own unsubscribe footer.
- Confirm `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `NEWSLETTER_ADMIN_TOKEN` exist in project settings; register the Resend webhook endpoint; publish.

**9. Staged activation and test plan** (authorized real address `degrassed@gmail.com` only).

- S0 — preview, zero provider traffic: run the test suite, typecheck, build. No key needed.
- S1 — preview payload proof: assert the built event body and links in unit tests only; no live Resend call.
- S2 — owner confirms the event schema and template variables in Resend, then publish.
- S3 — one production signup with `degrassed@gmail.com` (the row must first be absent or `subscribed` with `welcome_event_status != "sent"`; do not force this by editing rows). Verify: welcome email arrives, guide link downloads, unsubscribe and preferences links resolve to the real routes with the token.
- S4 — duplicate submission with the same address: expect the same generic UI response, no second welcome, no provider call.
- S5 — click the emailed unsubscribe link: expect local suppression, token rotation, provider opt-out. Then submit the form again: expect blocked, silent, no reactivation.
- Stop conditions: any welcome email with an empty or 404 link; any subscriber address appearing in logs; any duplicate producing a second provider call; any suppressed address reactivating; repeated 401/429 from Resend.
- Rollback: revert the build turn's commit (preview-only until S2 publish); optionally clear `RESEND_API_KEY` to halt all provider traffic while keeping signups durable. No migration is involved, so no schema rollback is needed.

## Verdict

Four of the five moving parts are activation-ready: contact creation is on the current API, duplicates and suppressed addresses are provider-silent, the guide PDF is publicly reachable, and the token-gated opt-out routes and server logic exist. Activation is blocked by two code gaps — the token is never selected or emailed, so welcome links cannot work — and one privacy gap in the welcome-event error path. Both are small, contained edits pending your approval.
