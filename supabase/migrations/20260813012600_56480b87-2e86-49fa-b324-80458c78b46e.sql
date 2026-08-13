ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS interest text,
  ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS source_path text,
  ADD COLUMN IF NOT EXISTS signup_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_signup_at timestamp with time zone NOT NULL DEFAULT now();