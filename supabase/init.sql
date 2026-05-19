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
  role text not null default 'client',
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.agency_members (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'agency_user',
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (agency_id, user_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  phone text,
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
  origin text,
  destination text,
  status text not null default 'new',
  temperature text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  destination text not null,
  status text not null default 'planning',
  starts_at timestamptz,
  ends_at timestamptz,
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
  storage_path text,
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
  match_enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
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
  type text not null,
  amount numeric(12, 2) not null default 0,
  status text not null default 'pending',
  description text,
  category text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  type text not null,
  amount integer not null,
  source text,
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
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount numeric(12, 2) not null default 0,
  status text not null default 'pending',
  paid_at timestamptz,
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

alter table public.agencies enable row level security;
alter table public.profiles enable row level security;
alter table public.agency_members enable row level security;
alter table public.clients enable row level security;
alter table public.leads enable row level security;
alter table public.trips enable row level security;
alter table public.documents enable row level security;
alter table public.catalog_items enable row level security;
alter table public.team_members enable row level security;
alter table public.financial_records enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;

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

create policy "profiles self or master"
on public.profiles
for select
using (
  auth.uid() = user_id
  or public.current_profile_role() = 'master'
);

create policy "profiles self update"
on public.profiles
for update
using (
  auth.uid() = user_id
  or public.current_profile_role() = 'master'
)
with check (
  auth.uid() = user_id
  or public.current_profile_role() = 'master'
);

create policy "agencies own or master"
on public.agencies
for select
using (
  public.current_profile_role() = 'master'
  or id = public.current_agency_id()
);

create policy "agency members own or master"
on public.agency_members
for select
using (
  public.current_profile_role() = 'master'
  or agency_id = public.current_agency_id()
);

create policy "agency scoped clients"
on public.clients
for select
using (
  public.current_profile_role() = 'master'
  or agency_id = public.current_agency_id()
  or profile_id in (select id from public.profiles where user_id = auth.uid())
);

create policy "agency scoped leads"
on public.leads
for select
using (
  public.current_profile_role() = 'master'
  or agency_id = public.current_agency_id()
);

create policy "agency scoped trips"
on public.trips
for select
using (
  public.current_profile_role() = 'master'
  or agency_id = public.current_agency_id()
  or client_id in (
    select c.id
    from public.clients c
    join public.profiles p on p.id = c.profile_id
    where p.user_id = auth.uid()
  )
);

create policy "agency scoped documents"
on public.documents
for select
using (
  public.current_profile_role() = 'master'
  or agency_id = public.current_agency_id()
  or client_id in (
    select c.id
    from public.clients c
    join public.profiles p on p.id = c.profile_id
    where p.user_id = auth.uid()
  )
);

create policy "agency scoped catalog items"
on public.catalog_items
for select
using (
  public.current_profile_role() = 'master'
  or agency_id = public.current_agency_id()
);

create policy "agency scoped team members"
on public.team_members
for select
using (
  public.current_profile_role() = 'master'
  or agency_id = public.current_agency_id()
);

create policy "agency scoped financial records"
on public.financial_records
for select
using (
  public.current_profile_role() = 'master'
  or agency_id = public.current_agency_id()
);

create policy "agency scoped credit transactions"
on public.credit_transactions
for select
using (
  public.current_profile_role() = 'master'
  or agency_id = public.current_agency_id()
);

create policy "agency scoped subscriptions"
on public.subscriptions
for select
using (
  public.current_profile_role() = 'master'
  or agency_id = public.current_agency_id()
);

create policy "agency scoped payments"
on public.payments
for select
using (
  public.current_profile_role() = 'master'
  or agency_id = public.current_agency_id()
);

create policy "agency scoped audit logs"
on public.audit_logs
for select
using (
  public.current_profile_role() = 'master'
  or agency_id = public.current_agency_id()
);
