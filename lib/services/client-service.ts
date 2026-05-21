import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, ClientRow } from "@/types/database"
import type { ClientInput } from "@/types/client"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

function normalizeClientInput(input: Partial<ClientInput>) {
  return {
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.email !== undefined ? { email: input.email?.trim() || null } : {}),
    ...(input.phone !== undefined ? { phone: input.phone?.trim() || null } : {}),
    ...(input.document_number !== undefined ? { document_number: input.document_number?.trim() || null } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.traveler_profile !== undefined ? { traveler_profile: input.traveler_profile ?? {} } : {}),
  }
}

export async function listClients(context: AgencyAccessContext, options?: { search?: string }) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("clients").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const search = options?.search?.trim()
  if (search) {
    const escaped = search.replace(/[%_,]/g, "")
    query = query.or(`name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%,document_number.ilike.%${escaped}%`)
  }
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
  const payload = normalizeClientInput(input)
  const { data, error } = await supabase
    .from("clients")
    .insert({
      agency_id: context.agencyId,
      owner_user_id: context.userId,
      name: payload.name,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      document_number: payload.document_number ?? null,
      traveler_profile: payload.traveler_profile ?? {},
      status: payload.status ?? "Ativo",
    })
    .select("*")
    .single()

  if (error) throw error
  return data as ClientRow
}

export async function updateClient(context: AgencyAccessContext, id: string, input: Partial<ClientInput>) {
  const supabase = getSupabaseAdminClient()
  const payload = normalizeClientInput(input)
  let query = supabase
    .from("clients")
    .update(payload)
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
