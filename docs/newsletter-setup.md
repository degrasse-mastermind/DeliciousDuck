# Newsletter activation checklist (internal)

This file is documentation only. It is not served to visitors, not linked from
the site, and contains no secrets.

Current state: **not connected**. `src/lib/newsletter.ts` exports
`subscribeToNewsletter = undefined`, so every signup surface renders the
"list isn't open yet" panel. No email addresses are collected or stored.

## What is still required from the owner

1. **Choose a provider.** Resend (with an Audience), Buttondown, or
   Cloud-only storage with manual sending.
2. **Provide credentials.** The provider API key must be added as a project
   secret (Project Settings → Secrets), never in code. Expected name:
   `RESEND_API_KEY` (or the equivalent for the chosen provider).
3. **Verify a sending domain** with the provider (DNS records on
   deliciousduck.com) before any mail is sent.
4. **Finish the lead magnet.** The signup copy promises "The Duck Cooking
   Starter Guide" PDF — the file needs to exist and be hosted.
5. **Decide double opt-in.** Recommended for deliverability and for the
   consent language already in `/privacy`.

## Engineering steps once the above exists

1. Enable Lovable Cloud and create `newsletter_subscribers`
   (`id`, `email` unique, `created_at`, `source`, `confirmed_at`) with
   grants + RLS: inserts through a server function only, no public select.
2. Create `src/lib/newsletter.functions.ts` with a `createServerFn` that
   zod-validates the email (trim, `.email()`, max 255), inserts the row, then
   calls the provider API using the secret read inside `.handler()`.
   It must throw on any failure.
3. In `src/lib/newsletter.ts`: set `provider`, set
   `status: "configured"`, and assign the server function to
   `subscribeToNewsletter`.
4. No UI change is needed. `NewsletterSignup` switches to the real form
   automatically, and only then can the GA4 `newsletter_signup` conversion
   fire (intent is already tracked as `newsletter_intent`).
5. Update `/privacy` if the provider stores data outside the current
   description.

## Analytics contract

- `newsletter_intent` — fires on genuine interaction with a signup surface
  (field focus, or clicking the reminder link while the list is closed).
  Not a conversion.
- `newsletter_signup` — fires ONLY after `subscribeToNewsletter` resolves.
  Mark this one as the conversion in GA4. It never fires while the list is
  closed.
