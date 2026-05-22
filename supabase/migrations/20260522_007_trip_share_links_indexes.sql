create index if not exists trip_share_links_agency_id_idx on public.trip_share_links(agency_id);
create index if not exists trip_share_links_trip_id_idx on public.trip_share_links(trip_id);
create index if not exists trip_share_links_token_idx on public.trip_share_links(token);
