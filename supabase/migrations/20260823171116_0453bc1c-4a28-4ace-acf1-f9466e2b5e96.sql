CREATE TABLE public.indexing_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  captured_at timestamptz NOT NULL DEFAULT now(),
  site_url text NOT NULL,
  sitemap_url text NOT NULL,
  last_submitted timestamptz,
  last_downloaded timestamptz,
  is_pending boolean NOT NULL DEFAULT false,
  submitted_count integer NOT NULL DEFAULT 0,
  indexed_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  warning_count integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'cron'
);

CREATE INDEX indexing_snapshots_captured_at_idx
  ON public.indexing_snapshots (sitemap_url, captured_at DESC);

GRANT ALL ON public.indexing_snapshots TO service_role;

ALTER TABLE public.indexing_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No client access to indexing snapshots"
  ON public.indexing_snapshots FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);