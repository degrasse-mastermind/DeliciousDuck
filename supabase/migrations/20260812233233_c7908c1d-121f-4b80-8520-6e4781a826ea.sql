ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS welcome_event_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS welcome_event_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.newsletter_subscribers
  DROP CONSTRAINT IF EXISTS newsletter_subscribers_welcome_event_status_check;

ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_welcome_event_status_check
  CHECK (welcome_event_status IN ('pending', 'sent', 'error', 'skipped'));