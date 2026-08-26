-- ============================================================================
-- Supports multiple photos per report (both the initial observation and the
-- contractor's close-out evidence). The old single-path columns are kept so
-- existing reports keep working untouched; the app reads photo_paths (falling
-- back to the legacy single path) and always writes to photo_paths going
-- forward.
-- ============================================================================

alter table public.reports
  add column if not exists photo_paths text[] not null default '{}',
  add column if not exists contractor_photo_paths text[] not null default '{}';
