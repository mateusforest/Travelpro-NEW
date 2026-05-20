-- TravelPro Supabase bootstrap snapshot
-- This file mirrors the ordered migrations in supabase/migrations/.
-- Apply on a fresh Supabase project when you need a full bootstrap in one step.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  owner_name text,
  owner_email text,
  phone text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete set null,
  email text not null,
  full_name text,
  phone text,
  avatar_path text,
  role text not null default 'client',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.agency_members (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  role text not null default 'agency_user',
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (agency_id, user_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  owner_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  phone text,
  document_number text,
  traveler_profile jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  email text,
  phone text,
  origin text,
  destination text,
  status text not null default 'new',
  temperature text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  destination text not null,
  origin text,
  status text not null default 'planning',
  starts_at timestamptz,
  ends_at timestamptz,
  summary text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  day_index integer not null default 1,
  title text not null,
  description text,
  activity_time text,
  status text not null default 'planned',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  trip_id uuid references public.trips(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  type text not null,
  status text not null default 'draft',
  storage_bucket text,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'draft',
  price numeric(12, 2),
  currency text not null default 'BRL',
  public_slug text,
  match_enabled boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  role text not null,
  scope text,
  modules text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.financial_records (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  trip_id uuid references public.trips(id) on delete set null,
  type text not null,
  amount numeric(12, 2) not null default 0,
  status text not null default 'pending',
  description text,
  category text,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  plan_code text not null,
  status text not null default 'trialing',
  price numeric(12, 2),
  renews_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount numeric(12, 2) not null default 0,
  status text not null default 'pending',
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  type text not null,
  feature text,
  amount integer not null,
  source text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type text not null default 'info',
  status text not null default 'unread',
  action_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  trip_id uuid references public.trips(id) on delete set null,
  title text not null,
  description text,
  priority text not null default 'medium',
  status text not null default 'open',
  due_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  type text not null,
  status text not null default 'draft',
  filters jsonb not null default '{}'::jsonb,
  result_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  status text not null default 'info',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists agencies_status_idx on public.agencies(status);
create index if not exists profiles_agency_id_idx on public.profiles(agency_id);
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists agency_members_agency_id_idx on public.agency_members(agency_id);
create index if not exists agency_members_profile_id_idx on public.agency_members(profile_id);
create index if not exists clients_agency_id_idx on public.clients(agency_id);
create index if not exists clients_profile_id_idx on public.clients(profile_id);
create index if not exists leads_agency_id_idx on public.leads(agency_id);
create index if not exists leads_client_id_idx on public.leads(client_id);
create index if not exists trips_agency_id_idx on public.trips(agency_id);
create index if not exists trips_client_id_idx on public.trips(client_id);
create index if not exists itineraries_agency_id_idx on public.itineraries(agency_id);
create index if not exists itineraries_trip_id_idx on public.itineraries(trip_id);
create index if not exists documents_agency_id_idx on public.documents(agency_id);
create index if not exists documents_trip_id_idx on public.documents(trip_id);
create index if not exists catalog_items_agency_id_idx on public.catalog_items(agency_id);
create index if not exists team_members_agency_id_idx on public.team_members(agency_id);
create index if not exists financial_records_agency_id_idx on public.financial_records(agency_id);
create index if not exists financial_records_occurred_at_idx on public.financial_records(occurred_at desc);
create index if not exists subscriptions_agency_id_idx on public.subscriptions(agency_id);
create index if not exists payments_agency_id_idx on public.payments(agency_id);
create index if not exists credit_transactions_agency_id_idx on public.credit_transactions(agency_id);
create index if not exists notifications_agency_id_idx on public.notifications(agency_id);
create index if not exists notifications_profile_id_idx on public.notifications(profile_id);
create index if not exists tasks_agency_id_idx on public.tasks(agency_id);
create index if not exists reports_agency_id_idx on public.reports(agency_id);
create index if not exists audit_logs_agency_id_idx on public.audit_logs(agency_id);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity, entity_id);

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select id from public.profiles where user_id = auth.uid() limit 1
$$;

create or replace function public.current_profile_role()
returns text
language sql
stable
as $$
  select role from public.profiles where user_id = auth.uid() limit 1
$$;

create or replace function public.current_agency_id()
returns uuid
language sql
stable
as $$
  select agency_id from public.profiles where user_id = auth.uid() limit 1
$$;

create or replace function public.is_master()
returns boolean
language sql
stable
as $$
  select public.current_profile_role() = 'master'
$$;

create or replace function public.is_agency_member()
returns boolean
language sql
stable
as $$
  select public.current_profile_role() in ('agency_admin', 'agency_user')
$$;

create or replace function public.is_client()
returns boolean
language sql
stable
as $$
  select public.current_profile_role() = 'client'
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

alter table public.agencies enable row level security;
alter table public.profiles enable row level security;
alter table public.agency_members enable row level security;
alter table public.clients enable row level security;
alter table public.leads enable row level security;
alter table public.trips enable row level security;
alter table public.itineraries enable row level security;
alter table public.documents enable row level security;
alter table public.catalog_items enable row level security;
alter table public.team_members enable row level security;
alter table public.financial_records enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.tasks enable row level security;
alter table public.reports enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "profiles_self_or_master_select" on public.profiles;
create policy "profiles_self_or_master_select" on public.profiles
for select using (
  public.is_master()
  or user_id = auth.uid()
  or (public.is_agency_member() and agency_id = public.current_agency_id())
);

drop policy if exists "profiles_self_or_master_update" on public.profiles;
create policy "profiles_self_or_master_update" on public.profiles
for update using (
  public.is_master() or user_id = auth.uid()
)
with check (
  public.is_master() or user_id = auth.uid()
);

drop policy if exists "agencies_select" on public.agencies;
create policy "agencies_select" on public.agencies
for select using (
  public.is_master() or id = public.current_agency_id()
);

drop policy if exists "agencies_update" on public.agencies;
create policy "agencies_update" on public.agencies
for update using (
  public.is_master() or id = public.current_agency_id()
)
with check (
  public.is_master() or id = public.current_agency_id()
);

drop policy if exists "agency_members_manage" on public.agency_members;
create policy "agency_members_manage" on public.agency_members
for all using (
  public.is_master() or agency_id = public.current_agency_id()
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "clients_manage" on public.clients;
create policy "clients_manage" on public.clients
for all using (
  public.is_master()
  or agency_id = public.current_agency_id()
  or (public.is_client() and profile_id = public.current_profile_id())
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "leads_manage" on public.leads;
create policy "leads_manage" on public.leads
for all using (
  public.is_master() or agency_id = public.current_agency_id()
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "trips_manage" on public.trips;
create policy "trips_manage" on public.trips
for all using (
  public.is_master()
  or agency_id = public.current_agency_id()
  or (
    public.is_client()
    and client_id in (
      select c.id from public.clients c where c.profile_id = public.current_profile_id()
    )
  )
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "itineraries_manage" on public.itineraries;
create policy "itineraries_manage" on public.itineraries
for all using (
  public.is_master()
  or agency_id = public.current_agency_id()
  or (
    public.is_client()
    and client_id in (
      select c.id from public.clients c where c.profile_id = public.current_profile_id()
    )
  )
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "documents_manage" on public.documents;
create policy "documents_manage" on public.documents
for all using (
  public.is_master()
  or agency_id = public.current_agency_id()
  or (
    public.is_client()
    and client_id in (
      select c.id from public.clients c where c.profile_id = public.current_profile_id()
    )
  )
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "catalog_items_manage" on public.catalog_items;
create policy "catalog_items_manage" on public.catalog_items
for all using (
  public.is_master() or agency_id = public.current_agency_id()
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "team_members_manage" on public.team_members;
create policy "team_members_manage" on public.team_members
for all using (
  public.is_master() or agency_id = public.current_agency_id()
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "financial_records_manage" on public.financial_records;
create policy "financial_records_manage" on public.financial_records
for all using (
  public.is_master() or agency_id = public.current_agency_id()
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "subscriptions_manage" on public.subscriptions;
create policy "subscriptions_manage" on public.subscriptions
for all using (
  public.is_master() or agency_id = public.current_agency_id()
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "payments_manage" on public.payments;
create policy "payments_manage" on public.payments
for all using (
  public.is_master() or agency_id = public.current_agency_id()
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "credit_transactions_manage" on public.credit_transactions;
create policy "credit_transactions_manage" on public.credit_transactions
for all using (
  public.is_master() or agency_id = public.current_agency_id()
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "notifications_manage" on public.notifications;
create policy "notifications_manage" on public.notifications
for all using (
  public.is_master()
  or agency_id = public.current_agency_id()
  or profile_id = public.current_profile_id()
  or user_id = auth.uid()
)
with check (
  public.is_master()
  or agency_id = public.current_agency_id()
  or profile_id = public.current_profile_id()
  or user_id = auth.uid()
);

drop policy if exists "tasks_manage" on public.tasks;
create policy "tasks_manage" on public.tasks
for all using (
  public.is_master() or agency_id = public.current_agency_id()
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "reports_manage" on public.reports;
create policy "reports_manage" on public.reports
for all using (
  public.is_master() or agency_id = public.current_agency_id()
)
with check (
  public.is_master() or agency_id = public.current_agency_id()
);

drop policy if exists "audit_logs_manage" on public.audit_logs;
create policy "audit_logs_manage" on public.audit_logs
for select using (
  public.is_master() or agency_id = public.current_agency_id()
);

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
