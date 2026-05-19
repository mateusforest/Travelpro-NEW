import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, LeadRow } from "@/types/database"
import type { LeadInput } from "@/types/lead"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

export async function listLeads(context: AgencyAccessContext) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as LeadRow[]
}

export async function getLeadById(context: AgencyAccessContext, id: string) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("leads").select("*").eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return (data as LeadRow | null) ?? null
}

export async function createLead(context: AgencyAccessContext, input: LeadInput) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("leads")
    .insert({
      agency_id: context.agencyId,
      user_id: context.userId,
      client_id: input.client_id ?? null,
      name: input.name,
      origin: input.origin ?? null,
      destination: input.destination ?? null,
      status: input.status ?? "Novo lead",
      temperature: input.temperature ?? "Morno",
    })
    .select("*")
    .single()
  if (error) throw error
  return data as LeadRow
}

export async function updateLead(context: AgencyAccessContext, id: string, input: Partial<LeadInput>) {
  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from("leads")
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.origin !== undefined ? { origin: input.origin } : {}),
      ...(input.destination !== undefined ? { destination: input.destination } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
      ...(input.client_id !== undefined ? { client_id: input.client_id } : {}),
    })
    .eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.select("*").single()
  if (error) throw error
  return data as LeadRow
}

export async function deleteLead(context: AgencyAccessContext, id: string) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("leads").delete().eq("id", id)
  query = withAgencyScope(query, context)
  const { error } = await query
  if (error) throw error
  return { success: true }
}
