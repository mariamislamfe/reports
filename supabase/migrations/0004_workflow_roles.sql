-- ============================================================================
-- Digitizes the full 3-stage HSE Observation Record lifecycle:
--   1) Observer raises the observation (already built).
--   2) Contractor submits the close-out request (their evidence + sign-off).
--   3) Observer performs the final close-out (their sign-off).
--
-- Adds a `report_role` per employee (observer | contractor) that controls
-- which stage they can act on, an admin-facing Users page to assign it, and
-- the columns needed to store stages 2 and 3.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: email (for the admin Users list) + report_role
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists email text,
  add column if not exists report_role text check (report_role in ('observer', 'contractor'));

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- Admins need to set report_role (and could correct a name/position) on
-- other people's profiles from the Users page.
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    'employee'
  );
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- reports: expand status lifecycle + add stage 2 / stage 3 data
-- ----------------------------------------------------------------------------
alter table public.reports drop constraint if exists reports_status_check;

update public.reports set status = 'pending_contractor' where status = 'submitted';
update public.reports set status = 'closed' where status = 'reviewed';

alter table public.reports
  add constraint reports_status_check
  check (status in ('pending_contractor', 'pending_closeout', 'closed'));

alter table public.reports alter column status set default 'pending_contractor';

alter table public.reports
  add column if not exists contractor_description text,
  add column if not exists contractor_photo_path text,
  add column if not exists contractor_snapshot jsonb,
  add column if not exists contractor_submitted_at timestamptz,
  add column if not exists closeout_comments text,
  add column if not exists closeout_snapshot jsonb,
  add column if not exists closeout_submitted_at timestamptz;

-- ----------------------------------------------------------------------------
-- Role helpers
-- ----------------------------------------------------------------------------
create or replace function public.get_report_role()
returns text
language sql
security definer set search_path = public
stable
as $$
  select report_role from public.profiles where id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- RLS: reports
-- All employees can read all reports (contractors/observers both need to see
-- reports created by other people to act on their stage). Writes stay gated
-- by stage + role; the app only ever sends the fields for the caller's stage,
-- and these policies are the enforced backstop.
-- ----------------------------------------------------------------------------
drop policy if exists "reports_select_own_or_admin" on public.reports;
create policy "reports_select_all" on public.reports
  for select using (true);

drop policy if exists "reports_update_admin" on public.reports;
create policy "reports_update_admin" on public.reports
  for update using (public.is_admin());

create policy "reports_update_contractor_closeout" on public.reports
  for update
  using (status = 'pending_contractor' and public.get_report_role() = 'contractor')
  with check (status = 'pending_closeout' and public.get_report_role() = 'contractor');

create policy "reports_update_observer_finalize" on public.reports
  for update
  using (status = 'pending_closeout' and public.get_report_role() = 'observer')
  with check (status = 'closed' and public.get_report_role() = 'observer');

-- ----------------------------------------------------------------------------
-- reports_insert_own already restricts creation to the authenticated user;
-- additionally require the observer role (or admin) to raise new reports.
-- ----------------------------------------------------------------------------
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
  for insert
  with check (
    employee_id = auth.uid()
    and (public.get_report_role() = 'observer' or public.is_admin())
  );

-- ----------------------------------------------------------------------------
-- Storage: contractor "after" photos reuse the violation-photos bucket
-- policies already in place (per-user folder, admin can read all) — no
-- change needed there since any authenticated employee already has insert
-- rights to their own folder.
-- ----------------------------------------------------------------------------
