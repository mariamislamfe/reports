-- ============================================================================
-- Violation Reports — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'employee' check (role in ('admin', 'employee')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'employee'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- projects
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,
  location text,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_active_idx on public.projects (is_active);
create index if not exists projects_name_idx on public.projects using gin (to_tsvector('simple', name));

-- ----------------------------------------------------------------------------
-- violation_types
-- `fields` holds the dynamic form schema for this violation, e.g.:
-- [
--   { "key": "location_detail", "label": "Exact Location", "type": "text", "required": true },
--   { "key": "corrective_action", "label": "Corrective Action Required", "type": "textarea", "required": true },
--   { "key": "severity", "label": "Severity", "type": "select", "required": true,
--     "options": ["Low", "Medium", "High", "Critical"] }
-- ]
-- ----------------------------------------------------------------------------
create table if not exists public.violation_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  fields jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists violation_types_active_idx on public.violation_types (is_active);

-- ----------------------------------------------------------------------------
-- reports
-- Snapshots (project_snapshot / violation_snapshot / employee_snapshot) freeze
-- the data as it existed at creation time, so editing a project/violation later
-- never changes historical reports.
-- ----------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  report_number text not null unique
    default ('VR-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))),

  project_id uuid references public.projects (id) on delete set null,
  project_snapshot jsonb not null,

  violation_type_id uuid references public.violation_types (id) on delete set null,
  violation_snapshot jsonb not null,

  employee_id uuid not null references public.profiles (id),
  employee_snapshot jsonb not null,

  photo_path text,
  field_values jsonb not null default '{}'::jsonb,
  notes text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewed')),

  created_at timestamptz not null default now()
);

create index if not exists reports_employee_idx on public.reports (employee_id);
create index if not exists reports_project_idx on public.reports (project_id);
create index if not exists reports_created_at_idx on public.reports (created_at desc);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.violation_types enable row level security;
alter table public.reports enable row level security;

-- profiles: everyone can read profiles (needed to show "reported by" names);
-- users may only update their own row; role changes are admin-only via the
-- service role / SQL editor, not exposed through the app.
create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- projects: any authenticated user can read active projects; admins can read
-- everything and manage everything.
create policy "projects_select" on public.projects
  for select using (is_active or public.is_admin());

create policy "projects_insert_admin" on public.projects
  for insert with check (public.is_admin());

create policy "projects_update_admin" on public.projects
  for update using (public.is_admin());

create policy "projects_delete_admin" on public.projects
  for delete using (public.is_admin());

-- violation_types: same pattern as projects.
create policy "violation_types_select" on public.violation_types
  for select using (is_active or public.is_admin());

create policy "violation_types_insert_admin" on public.violation_types
  for insert with check (public.is_admin());

create policy "violation_types_update_admin" on public.violation_types
  for update using (public.is_admin());

create policy "violation_types_delete_admin" on public.violation_types
  for delete using (public.is_admin());

-- reports: employees can create their own reports and read their own;
-- admins can read (and update the status of) all reports. No deletes from
-- the app — reports are a permanent record.
create policy "reports_select_own_or_admin" on public.reports
  for select using (employee_id = auth.uid() or public.is_admin());

create policy "reports_insert_own" on public.reports
  for insert with check (employee_id = auth.uid());

create policy "reports_update_admin" on public.reports
  for update using (public.is_admin());

-- ----------------------------------------------------------------------------
-- Storage: violation photos
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('violation-photos', 'violation-photos', false)
on conflict (id) do nothing;

create policy "violation_photos_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'violation-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "violation_photos_select"
  on storage.objects for select
  using (
    bucket_id = 'violation-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- ----------------------------------------------------------------------------
-- Bootstrap: promote your first admin after signing up once, e.g.:
--   update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000000';
-- ----------------------------------------------------------------------------
