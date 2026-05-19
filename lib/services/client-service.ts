import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, ClientRow } from "@/types/database"
import type { ClientInput } from "@/types/client"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

export async function listClients(context: AgencyAccessContext) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("clients").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ClientRow[]
}

export async function getClientById(context: AgencyAccessContext, id: string) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("clients").select("*").eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return (data as ClientRow | null) ?? null
}

export async function createClient(context: AgencyAccessContext, input: ClientInput) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("clients")
    .insert({
      agency_id: context.agencyId,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      status: input.status ?? "Ativo",
    })
    .select("*")
    .single()

  if (error) throw error
  return data as ClientRow
}

export async function updateClient(context: AgencyAccessContext, id: string, input: Partial<ClientInput>) {
  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from("clients")
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    })
    .eq("id", id)

  query = withAgencyScope(query, context)
  const { data, error } = await query.select("*").single()
  if (error) throw error
  return data as ClientRow
}

export async function deleteClient(context: AgencyAccessContext, id: string) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("clients").delete().eq("id", id)
  query = withAgencyScope(query, context)
  const { error } = await query
  if (error) throw error
  return { success: true }
}
