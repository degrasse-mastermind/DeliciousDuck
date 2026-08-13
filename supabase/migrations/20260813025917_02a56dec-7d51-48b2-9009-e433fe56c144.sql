-- 1. Consent evidence (additive, nullable; legacy rows stay explicitly unknown)
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS consented_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS consent_text_version text,
  ADD COLUMN IF NOT EXISTS consent_source_path text,
  ADD COLUMN IF NOT EXISTS privacy_policy_version text,
  ADD COLUMN IF NOT EXISTS privacy_policy_url text,
  ADD COLUMN IF NOT EXISTS consent_record text NOT NULL DEFAULT 'unknown_legacy';

ALTER TABLE public.newsletter_subscribers
  DROP CONSTRAINT IF EXISTS newsletter_subscribers_consent_record_check;
ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_consent_record_check
  CHECK (consent_record IN ('explicit', 'unknown_legacy'));

-- 2. Suppression evidence
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS suppression_reason text,
  ADD COLUMN IF NOT EXISTS suppressed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS provider_last_event text,
  ADD COLUMN IF NOT EXISTS provider_last_event_at timestamp with time zone;

-- 3. Only statuses the app can actually verify
ALTER TABLE public.newsletter_subscribers
  DROP CONSTRAINT IF EXISTS newsletter_subscribers_status_check;
ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_status_check
  CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'complained', 'suppressed'));

-- 4. Preserve normalized-email uniqueness explicitly
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_normalized_key
  ON public.newsletter_subscribers (email_normalized);

-- 5. Webhook-ready provider event log (no public access in this sprint)
CREATE TABLE IF NOT EXISTS public.newsletter_provider_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_normalized text NOT NULL,
  subscriber_id uuid REFERENCES public.newsletter_subscribers(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  provider text NOT NULL DEFAULT 'resend',
  provider_event_id text,
  occurred_at timestamp with time zone,
  received_at timestamp with time zone NOT NULL DEFAULT now(),
  verified boolean NOT NULL DEFAULT false,
  detail text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_provider_events_type_check
    CHECK (event_type IN ('unsubscribed', 'bounced', 'complained', 'suppressed', 'delivered'))
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_provider_events_provider_event_id_key
  ON public.newsletter_provider_events (provider, provider_event_id)
  WHERE provider_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS newsletter_provider_events_email_idx
  ON public.newsletter_provider_events (email_normalized);

-- Trusted server code only: no anon/authenticated grants.
GRANT ALL ON public.newsletter_provider_events TO service_role;

ALTER TABLE public.newsletter_provider_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to newsletter provider events"
  ON public.newsletter_provider_events
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE TRIGGER update_newsletter_provider_events_updated_at
  BEFORE UPDATE ON public.newsletter_provider_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();