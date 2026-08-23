ALTER TABLE public.indexing_coverage_snapshots
  ADD COLUMN IF NOT EXISTS monitored_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unresolved_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_complete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS incomplete_reason text;

UPDATE public.indexing_coverage_snapshots
  SET unresolved_count = failed_count
  WHERE unresolved_count = 0 AND failed_count > 0;

ALTER TABLE public.indexing_url_coverage
  ADD COLUMN IF NOT EXISTS index_state text NOT NULL DEFAULT 'unresolved';

UPDATE public.indexing_url_coverage
  SET index_state = CASE
    WHEN inspect_error IS NOT NULL THEN 'unresolved'
    WHEN is_indexed THEN 'indexed'
    WHEN verdict IS NULL THEN 'unresolved'
    ELSE 'not_indexed'
  END
  WHERE index_state = 'unresolved';

ALTER TABLE public.indexing_url_coverage
  DROP CONSTRAINT IF EXISTS indexing_url_coverage_index_state_check;
ALTER TABLE public.indexing_url_coverage
  ADD CONSTRAINT indexing_url_coverage_index_state_check
  CHECK (index_state IN ('indexed', 'not_indexed', 'unresolved'));

CREATE INDEX IF NOT EXISTS indexing_coverage_snapshots_complete_idx
  ON public.indexing_coverage_snapshots (is_complete, captured_at DESC);