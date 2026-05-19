import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, TeamMemberRow } from "@/types/database"

export type TeamMemberInput = {
  name: string
  role: string
  scope?: string | null
  modules?: string | null
  status?: string
}

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

export async function listTeamMembers(context: AgencyAccessContext) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("team_members").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as TeamMemberRow[]
}

export async function getTeamMemberById(context: AgencyAccessContext, id: string) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("team_members").select("*").eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return (data as TeamMemberRow | null) ?? null
}

export async function createTeamMember(context: AgencyAccessContext, input: TeamMemberInput) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("team_members")
    .insert({
      agency_id: context.agencyId,
      name: input.name,
      role: input.role,
      scope: input.scope ?? null,
      modules: input.modules ?? null,
      status: input.status ?? "Ativo",
    })
    .select("*")
    .single()
  if (error) throw error
  return data as TeamMemberRow
}

export async function updateTeamMember(context: AgencyAccessContext, id: string, input: Partial<TeamMemberInput>) {
  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from("team_members")
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.scope !== undefined ? { scope: input.scope } : {}),
      ...(input.modules !== undefined ? { modules: input.modules } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    })
    .eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.select("*").single()
  if (error) throw error
  return data as TeamMemberRow
}

export async function deleteTeamMember(context: AgencyAccessContext, id: string) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("team_members").delete().eq("id", id)
  query = withAgencyScope(query, context)
  const { error } = await query
  if (error) throw error
  return { success: true }
}
