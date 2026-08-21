alter table public.newsletter_subscribers
  add column if not exists game_plan_email_at timestamptz;

comment on column public.newsletter_subscribers.game_plan_email_at is
  'Last time a Duck Game Plan email was requested for this address. Server-side cooldown control only; never exposed to the browser.';