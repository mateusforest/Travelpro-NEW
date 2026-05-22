drop trigger if exists set_updated_at_trip_share_links on public.trip_share_links;
create trigger set_updated_at_trip_share_links before update on public.trip_share_links for each row execute function public.set_updated_at();
