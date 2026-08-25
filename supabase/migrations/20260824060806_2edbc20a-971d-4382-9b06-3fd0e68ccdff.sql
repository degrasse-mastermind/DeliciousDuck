alter table public.newsletter_subscribers
  add column if not exists confirmation_status text not null default 'pending',
  add column if not exists confirmation_token uuid not null default gen_random_uuid(),
  add column if not exists confirmation_sent_at timestamp with time zone,
  add column if not exists confirmed_at timestamp with time zone,
  add column if not exists confirmation_sent_count integer not null default 0;

alter table public.newsletter_subscribers
  drop constraint if exists newsletter_subscribers_confirmation_status_check;

alter table public.newsletter_subscribers
  add constraint newsletter_subscribers_confirmation_status_check
  check (confirmation_status = any (array['pending'::text, 'confirmed'::text]));

-- Everyone already on the list opted in under the previous single-step flow and
-- keeps their subscription: they are treated as confirmed, never re-prompted.
update public.newsletter_subscribers
set confirmation_status = 'confirmed',
    confirmed_at = coalesce(confirmed_at, consented_at, subscribed_at)
where confirmation_status <> 'confirmed';

create unique index if not exists newsletter_subscribers_confirmation_token_key
  on public.newsletter_subscribers (confirmation_token);

create index if not exists newsletter_subscribers_confirmation_status_idx
  on public.newsletter_subscribers (confirmation_status);

-- Delivery outcomes are logged alongside the existing suppression events so
-- delivery rate is measurable from recorded provider facts.
alter table public.newsletter_provider_events
  drop constraint if exists newsletter_provider_events_type_check;

alter table public.newsletter_provider_events
  add constraint newsletter_provider_events_type_check
  check (event_type = any (array[
    'unsubscribed'::text,
    'bounced'::text,
    'complained'::text,
    'suppressed'::text,
    'sent'::text,
    'delivered'::text,
    'delivery_delayed'::text
  ]));

grant all on public.newsletter_subscribers to service_role;
grant all on public.newsletter_provider_events to service_role;