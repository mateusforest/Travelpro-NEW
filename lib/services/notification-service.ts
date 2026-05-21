import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, NotificationRow } from "@/types/database"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

export async function listNotifications(context: AgencyAccessContext) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("notifications").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as NotificationRow[]
}
