import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, AuditLogRow } from "@/types/database"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

export async function listAuditLogs(context: AgencyAccessContext) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("audit_logs").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as AuditLogRow[]
}
