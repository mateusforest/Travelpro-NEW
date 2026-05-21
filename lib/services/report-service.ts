import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, ReportRow } from "@/types/database"
import type { ReportInput } from "@/types/report"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

function ensureAgencyContext(context: AgencyAccessContext) {
  if (!context.isMaster && !context.agencyId) {
    throw new Error("Sua sessão não possui uma agência vinculada para operar relatórios.")
  }
}

export async function listReports(context: AgencyAccessContext) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("reports").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ReportRow[]
}

export async function getReportById(context: AgencyAccessContext, id: string) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("reports").select("*").eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return (data as ReportRow | null) ?? null
}

export async function createReport(context: AgencyAccessContext, input: ReportInput) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("reports")
    .insert({
      agency_id: context.agencyId,
      user_id: context.userId,
      name: input.name,
      type: input.type,
      status: input.status ?? "Pronto",
      filters: input.filters ?? {},
      result_path: input.result_path ?? null,
    })
    .select("*")
    .single()
  if (error) throw error
  return data as ReportRow
}

export async function updateReport(context: AgencyAccessContext, id: string, input: Partial<ReportInput>) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from("reports")
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.filters !== undefined ? { filters: input.filters } : {}),
      ...(input.result_path !== undefined ? { result_path: input.result_path } : {}),
    })
    .eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.select("*").single()
  if (error) throw error
  return data as ReportRow
}

export async function deleteReport(context: AgencyAccessContext, id: string) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("reports").delete().eq("id", id)
  query = withAgencyScope(query, context)
  const { error } = await query
  if (error) throw error
  return { success: true }
}
