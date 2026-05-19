create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_role text;
  next_name text;
  next_phone text;
  next_email text;
  next_agency_name text;
  next_agency_slug text;
  created_agency_id uuid;
  existing_profile_id uuid;
begin
  next_role := coalesce(lower(new.raw_user_meta_data ->> 'role'), 'client');
  next_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')), '');
  next_phone := nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '');
  next_email := coalesce(new.email, '');
  next_agency_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'agency_name', '')), '');
  next_agency_slug := nullif(trim(coalesce(new.raw_user_meta_data ->> 'agency_slug', '')), '');

  select id into existing_profile_id
  from public.profiles
  where user_id = new.id
  limit 1;

  if existing_profile_id is not null then
    return new;
  end if;

  if next_role = 'agency_admin' then
    insert into public.agencies (name, slug, owner_name, owner_email, phone)
    values (
      coalesce(next_agency_name, coalesce(next_name, split_part(next_email, '@', 1) || ' Agência')),
      next_agency_slug,
      next_name,
      next_email,
      next_phone
    )
    returning id into created_agency_id;
  end if;

  insert into public.profiles (user_id, agency_id, email, full_name, phone, role)
  values (new.id, created_agency_id, next_email, next_name, next_phone, next_role)
  returning id into existing_profile_id;

  if created_agency_id is not null then
    insert into public.agency_members (agency_id, user_id, profile_id, role)
    values (created_agency_id, new.id, existing_profile_id, 'agency_admin')
    on conflict (agency_id, user_id) do update set
      profile_id = excluded.profile_id,
      role = excluded.role,
      updated_at = timezone('utc', now());
  end if;

  return new;
end;
$$;

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_id uuid;
  row_agency_id uuid;
begin
  if tg_op = 'DELETE' then
    row_id := old.id;
    row_agency_id := old.agency_id;
  else
    row_id := new.id;
    row_agency_id := new.agency_id;
  end if;

  insert into public.audit_logs (agency_id, user_id, action, entity, entity_id, status, metadata)
  values (
    row_agency_id,
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    row_id,
    'info',
    jsonb_build_object('trigger', tg_name)
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists set_updated_at_agencies on public.agencies;
create trigger set_updated_at_agencies before update on public.agencies for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_agency_members on public.agency_members;
create trigger set_updated_at_agency_members before update on public.agency_members for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_clients on public.clients;
create trigger set_updated_at_clients before update on public.clients for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_leads on public.leads;
create trigger set_updated_at_leads before update on public.leads for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_trips on public.trips;
create trigger set_updated_at_trips before update on public.trips for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_itineraries on public.itineraries;
create trigger set_updated_at_itineraries before update on public.itineraries for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_documents on public.documents;
create trigger set_updated_at_documents before update on public.documents for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_catalog_items on public.catalog_items;
create trigger set_updated_at_catalog_items before update on public.catalog_items for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_team_members on public.team_members;
create trigger set_updated_at_team_members before update on public.team_members for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_financial_records on public.financial_records;
create trigger set_updated_at_financial_records before update on public.financial_records for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_credit_transactions on public.credit_transactions;
create trigger set_updated_at_credit_transactions before update on public.credit_transactions for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_subscriptions on public.subscriptions;
create trigger set_updated_at_subscriptions before update on public.subscriptions for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_payments on public.payments;
create trigger set_updated_at_payments before update on public.payments for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_notifications on public.notifications;
create trigger set_updated_at_notifications before update on public.notifications for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_tasks on public.tasks;
create trigger set_updated_at_tasks before update on public.tasks for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_reports on public.reports;
create trigger set_updated_at_reports before update on public.reports for each row execute function public.set_updated_at();

drop trigger if exists audit_clients_changes on public.clients;
create trigger audit_clients_changes after insert or update or delete on public.clients for each row execute function public.write_audit_log();
drop trigger if exists audit_leads_changes on public.leads;
create trigger audit_leads_changes after insert or update or delete on public.leads for each row execute function public.write_audit_log();
drop trigger if exists audit_trips_changes on public.trips;
create trigger audit_trips_changes after insert or update or delete on public.trips for each row execute function public.write_audit_log();
drop trigger if exists audit_documents_changes on public.documents;
create trigger audit_documents_changes after insert or update or delete on public.documents for each row execute function public.write_audit_log();
drop trigger if exists audit_catalog_items_changes on public.catalog_items;
create trigger audit_catalog_items_changes after insert or update or delete on public.catalog_items for each row execute function public.write_audit_log();
drop trigger if exists audit_financial_records_changes on public.financial_records;
create trigger audit_financial_records_changes after insert or update or delete on public.financial_records for each row execute function public.write_audit_log();
drop trigger if exists audit_tasks_changes on public.tasks;
create trigger audit_tasks_changes after insert or update or delete on public.tasks for each row execute function public.write_audit_log();
drop trigger if exists audit_reports_changes on public.reports;
create trigger audit_reports_changes after insert or update or delete on public.reports for each row execute function public.write_audit_log();
