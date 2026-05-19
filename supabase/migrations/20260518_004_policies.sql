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
