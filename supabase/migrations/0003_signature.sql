-- ============================================================================
-- Adds a reusable signature per employee: uploaded once in Settings, applied
-- automatically to every report they submit (with explicit consent), so the
-- Observation sign-off block is never left blank.
-- ============================================================================

alter table public.profiles
  add column if not exists signature_path text,
  add column if not exists signature_consent boolean not null default false;

insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', false)
on conflict (id) do nothing;

create policy "signatures_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'signatures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "signatures_select"
  on storage.objects for select
  using (
    bucket_id = 'signatures'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- Employees re-uploading a signature (same path each time) need update rights too.
create policy "signatures_update_own_folder"
  on storage.objects for update
  using (
    bucket_id = 'signatures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
