CREATE TABLE IF NOT EXISTS public.indexing_cron_credential (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  token text NOT NULL,
  rotated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.indexing_cron_credential TO service_role;

ALTER TABLE public.indexing_cron_credential ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.indexing_cron_credential IS 'Single-row rotating bearer token used by the scheduled indexing snapshot job. No anon/authenticated access; readable by the scheduler (postgres) and service role only.';