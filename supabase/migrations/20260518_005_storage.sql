insert into storage.buckets (id, name, public)
values
  ('documents', 'documents', false),
  ('contracts', 'contracts', false),
  ('vouchers', 'vouchers', false),
  ('itineraries', 'itineraries', false),
  ('avatars', 'avatars', false),
  ('catalog', 'catalog', false),
  ('temp', 'temp', false)
on conflict (id) do nothing;

create or replace function public.storage_path_agency_id(path text)
returns uuid
language sql
stable
as $$
  select nullif((storage.foldername(path))[1], '')::uuid
$$;

create or replace function public.storage_path_profile_id(path text)
returns uuid
language sql
stable
as $$
  select nullif((storage.foldername(path))[3], '')::uuid
$$;

drop policy if exists "master_full_storage_access" on storage.objects;
create policy "master_full_storage_access" on storage.objects
for all using (public.is_master())
with check (public.is_master());

drop policy if exists "agency_storage_access" on storage.objects;
create policy "agency_storage_access" on storage.objects
for all using (
  bucket_id in ('documents', 'contracts', 'vouchers', 'itineraries', 'avatars', 'catalog', 'temp')
  and (
    public.is_master()
    or (public.is_agency_member() and public.storage_path_agency_id(name) = public.current_agency_id())
  )
)
with check (
  bucket_id in ('documents', 'contracts', 'vouchers', 'itineraries', 'avatars', 'catalog', 'temp')
  and (
    public.is_master()
    or (public.is_agency_member() and public.storage_path_agency_id(name) = public.current_agency_id())
  )
);

drop policy if exists "client_storage_read_access" on storage.objects;
create policy "client_storage_read_access" on storage.objects
for select using (
  bucket_id in ('documents', 'contracts', 'vouchers', 'itineraries', 'avatars')
  and public.is_client()
  and public.storage_path_profile_id(name) = public.current_profile_id()
);
