# Duck Drop — Deploy & Staged Activation Sequence

All five runtime values are present and the current build passes tests, typecheck, and a production build. What remains is a controlled go-live plus a staged live verification using only the authorized address `degrassed@gmail.com`.

## S2 — Owner actions in Resend (before publishing)

These cannot be done from code:

1. Confirm the `newsletter.subscribed` event definition exists and accepts all five fields: `guide_url`, `interest`, `source_path`, `unsubscribe_url`, `preferences_url`.
2. In the welcome template/automation, reference `event.unsubscribe_url` and `event.preferences_url` as real links, and keep Resend's own unsubscribe footer.
3. Confirm the sending domain is still verified.

Tell me when these are done.

## S3 — Publish

I publish the current build. Frontend goes live at the published URL; backend logic is already live.

Then register the Resend webhook endpoint against the stored signing secret, pointing at the site's `/api/webhooks/resend` path (I will give you the exact absolute URL after publish).

## S4 — First real signup (one address only)

You submit the newsletter form on the live site with `degrassed@gmail.com`.

Expected, and what I verify read-only:
- Welcome email arrives.
- Field Guide link downloads the real PDF.
- Unsubscribe link opens the live unsubscribe route with the token.
- Preferences link opens the live preferences route with the token.
- The stored row shows `welcome_event_status = "sent"`, `resend_sync_status = "synced"`.

Precondition: the row must be absent, or `subscribed` with `welcome_event_status != "sent"`. I will not edit rows to force this.

## S5 — Duplicate, then opt-out

1. Submit the same address again: expect the same generic success UI, no second welcome email, zero provider calls.
2. Click the emailed unsubscribe link: expect local suppression, token rotation, and a provider opt-out.
3. Submit the form once more: expect blocked and silent — no reactivation, no provider call.

## Stop conditions

Halt and report if any of these occur:
- A welcome email with an empty or 404 link.
- Any subscriber address or raw provider body appearing in logs.
- A duplicate producing a second provider call or second email.
- A suppressed address reactivating.
- Repeated 401 or 429 from the provider.

## Rollback

No migration is involved, so there is no schema rollback. If something misbehaves after publish, clearing `RESEND_API_KEY` halts all provider traffic while signups stay durable in the database; the previous published build can also be re-published.

## Technical notes

- Publish uses the existing build; no code changes are part of this sequence.
- Verification is read-only: database reads and email/link inspection. No row edits, no forced statuses, no test-only bypasses.
- A security scan runs before publish; critical findings block the publish and I surface them instead of shipping.
