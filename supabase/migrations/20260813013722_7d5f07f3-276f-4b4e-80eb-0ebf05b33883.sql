ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS primary_interest text,
  ADD COLUMN IF NOT EXISTS first_content_path text,
  ADD COLUMN IF NOT EXISTS lifecycle_stage text NOT NULL DEFAULT 'welcome',
  ADD COLUMN IF NOT EXISTS last_engagement_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS preference_token uuid NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE public.newsletter_subscribers
  DROP CONSTRAINT IF EXISTS newsletter_subscribers_primary_interest_check;
ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_primary_interest_check
  CHECK (primary_interest IS NULL OR primary_interest IN
    ('duck-breast','whole-duck','duck-fat','sourcing','wild-duck','general'));

ALTER TABLE public.newsletter_subscribers
  DROP CONSTRAINT IF EXISTS newsletter_subscribers_lifecycle_stage_check;
ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_lifecycle_stage_check
  CHECK (lifecycle_stage IN ('welcome','active','reengage'));

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_preference_token_key
  ON public.newsletter_subscribers (preference_token);

UPDATE public.newsletter_subscribers
  SET primary_interest = interest
  WHERE primary_interest IS NULL
    AND interest IN ('duck-breast','whole-duck','duck-fat','sourcing','wild-duck','general');

UPDATE public.newsletter_subscribers
  SET first_content_path = source_path
  WHERE first_content_path IS NULL AND source_path IS NOT NULL;