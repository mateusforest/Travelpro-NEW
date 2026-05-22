create table if not exists public.trip_share_links (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  token text not null unique,
  is_active boolean not null default true,
  expires_at timestamptz,
  view_count integer not null default 0,
  last_viewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
