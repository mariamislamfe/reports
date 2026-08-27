-- Replaces the "every contractor-role profile can see/act on every pending
-- report" model with explicit per-report assignment: the admin picks one or
-- more specific contractor(s) to send a report to, and only those people
-- (plus the admin) can see or act on it. The final close-out likewise
-- returns specifically to the observer who raised the report, not to any
-- observer-role profile. Report visibility narrows to match: admins see
-- everything, an observer sees only the reports they personally raised, and
-- a contractor sees only the reports assigned to them.
alter table public.reports
  add column if not exists assigned_contractor_ids uuid[] not null default '{}';

drop policy if exists "reports_select_all" on public.reports;
create policy "reports_select_own_or_assigned" on public.reports
  for select using (
    public.is_admin()
    or employee_id = auth.uid()
    or auth.uid() = any(assigned_contractor_ids)
  );

drop policy if exists "reports_update_contractor_closeout" on public.reports;
create policy "reports_update_contractor_closeout" on public.reports
  for update
  using (status = 'pending_contractor' and auth.uid() = any(assigned_contractor_ids))
  with check (status = 'pending_closeout' and auth.uid() = any(assigned_contractor_ids));

drop policy if exists "reports_update_observer_finalize" on public.reports;
create policy "reports_update_observer_finalize" on public.reports
  for update
  using (status = 'pending_closeout' and employee_id = auth.uid())
  with check (status = 'closed' and employee_id = auth.uid());
