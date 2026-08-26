-- Allow admins to delete reports from the Reports page. Previously reports
-- had no delete policy at all ("permanent record" by design); the company
-- now wants admins able to remove a report (e.g. duplicates, test entries).
create policy "reports_delete_admin" on public.reports
  for delete using (public.is_admin());
