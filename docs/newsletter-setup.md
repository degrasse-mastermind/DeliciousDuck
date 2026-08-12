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

- No Starter Guide PDF exists yet. Copy promises the guide **when released**.
- No welcome/confirmation email is sent (no broadcast or automation wired).
- No double opt-in. Add it in Resend before heavy acquisition if desired.

## Analytics contract

- `newsletter_intent` — genuine interaction with a signup surface (field focus).
  Not a conversion. Deduped once per component instance.
- `newsletter_signup` — fires ONLY after durable database persistence succeeds,
  even if Resend sync is `pending`. Mark this one as the conversion in GA4.
