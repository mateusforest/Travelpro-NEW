# Supabase schema checklist

## Migrations

Apply in this order:

1. `migrations/20260518_001_tables.sql`
2. `migrations/20260518_002_indexes.sql`
3. `migrations/20260518_003_triggers.sql`
4. `migrations/20260518_004_policies.sql`
5. `migrations/20260518_005_storage.sql`

`init.sql` is a consolidated snapshot for fresh environments.

## Validation checklist

- Auth session still resolves `profiles.user_id`
- `handle_new_user()` creates `profiles` automatically
- `agency_admin` signup creates `agencies` + `agency_members`
- Agency users only read/write rows with their own `agency_id`
- Clients only read their own `trips`, `documents` and `itineraries`
- Master can read all scoped tables
- Audit triggers write to `audit_logs` for core business tables
- Storage buckets exist: `documents`, `contracts`, `vouchers`, `itineraries`, `avatars`, `catalog`, `temp`
- Storage object path starts with `agency_id`
- Client-readable files use path shape: `{agency_id}/clients/{profile_id}/...`
- No table stays public without RLS unless intentionally managed only by service role
