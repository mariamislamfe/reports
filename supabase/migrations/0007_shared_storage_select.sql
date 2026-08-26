-- reports_select_all (0004) already lets every authenticated employee read
-- every report row (the whole point: a contractor/observer working a report
-- someone else raised needs to see it) — but the storage read policies for
-- the photos and signatures those reports embed were never widened to
-- match. They still only granted read access to the uploader's own folder
-- (or an admin), so a report's photos/signature silently failed to load
-- (both on the report page and in the generated PDF) for every other
-- viewer working that same report — they'd show only for whoever uploaded
-- them.
drop policy if exists "violation_photos_select" on storage.objects;
create policy "violation_photos_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'violation-photos');

drop policy if exists "signatures_select" on storage.objects;
create policy "signatures_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'signatures');
