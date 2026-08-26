-- ============================================================================
-- Adds the fields needed to match the company's real "HSE Observation Record"
-- template (PMF-015-HSE-012). Run this after 0001_init.sql.
-- ============================================================================

-- Business unit / contractor / supervising consultant are effectively
-- constant per project, so they live on the project (set once by an admin)
-- and get pulled into every report's snapshot automatically.
alter table public.projects
  add column if not exists business_unit text,
  add column if not exists contractor text,
  add column if not exists sup_consultant text;

-- Shown in the report's sign-off block (Name / Position / Signature / Date).
alter table public.profiles
  add column if not exists position text;

-- The one field on the printed form that's genuinely per-report rather than
-- per-project or per-violation-type.
alter table public.reports
  add column if not exists observation_location text;
