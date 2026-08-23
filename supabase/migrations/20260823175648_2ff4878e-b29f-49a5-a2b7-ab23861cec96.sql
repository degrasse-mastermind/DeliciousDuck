CREATE TABLE public.indexing_coverage_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  captured_at timestamptz NOT NULL DEFAULT now(),
  site_url text NOT NULL,
  source text NOT NULL DEFAULT 'cron',
  checked_count integer NOT NULL DEFAULT 0,
  indexed_count integer NOT NULL DEFAULT 0,
  not_indexed_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.indexing_url_coverage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_id uuid REFERENCES public.indexing_coverage_snapshots(id) ON DELETE CASCADE,
  captured_at timestamptz NOT NULL DEFAULT now(),
  site_url text NOT NULL,
  url text NOT NULL,
  is_indexed boolean NOT NULL DEFAULT false,
  verdict text,
  coverage_state text,
  robots_txt_state text,
  indexing_state text,
  page_fetch_state text,
  google_canonical text,
  last_crawl_time timestamptz,
  inspect_error text
);

CREATE INDEX idx_coverage_snapshots_captured_at ON public.indexing_coverage_snapshots (captured_at DESC);
CREATE INDEX idx_url_coverage_snapshot ON public.indexing_url_coverage (snapshot_id);

GRANT ALL ON public.indexing_coverage_snapshots TO service_role;
GRANT ALL ON public.indexing_url_coverage TO service_role;

ALTER TABLE public.indexing_coverage_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indexing_url_coverage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No client access to coverage snapshots" ON public.indexing_coverage_snapshots FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client access to url coverage" ON public.indexing_url_coverage FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);