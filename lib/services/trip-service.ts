import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, TripRow } from "@/types/database"
import type { TripInput } from "@/types/trip"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

function ensureAgencyContext(context: AgencyAccessContext) {
  if (!context.isMaster && !context.agencyId) {
    throw new Error("Sua sessão não possui uma agência vinculada para operar viagens.")
  }
}

export async function listTrips(context: AgencyAccessContext) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("trips").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as TripRow[]
}

export async function getTripById(context: AgencyAccessContext, id: string) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("trips").select("*").eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return (data as TripRow | null) ?? null
}

export async function createTrip(context: AgencyAccessContext, input: TripInput) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("trips")
    .insert({
      agency_id: context.agencyId,
      user_id: context.userId,
      client_id: input.client_id ?? null,
      destination: input.destination,
      origin: input.origin ?? null,
      status: input.status ?? "Planejamento",
      starts_at: input.starts_at ?? null,
      ends_at: input.ends_at ?? null,
      summary: input.summary ?? null,
    })
    .select("*")
    .single()
  if (error) throw error
  return data as TripRow
}

export async function updateTrip(context: AgencyAccessContext, id: string, input: Partial<TripInput>) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from("trips")
    .update({
      ...(input.destination !== undefined ? { destination: input.destination } : {}),
      ...(input.origin !== undefined ? { origin: input.origin } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.starts_at !== undefined ? { starts_at: input.starts_at } : {}),
      ...(input.ends_at !== undefined ? { ends_at: input.ends_at } : {}),
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.client_id !== undefined ? { client_id: input.client_id } : {}),
    })
    .eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.select("*").single()
  if (error) throw error
  return data as TripRow
}

export async function deleteTrip(context: AgencyAccessContext, id: string) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("trips").delete().eq("id", id)
  query = withAgencyScope(query, context)
  const { error } = await query
  if (error) throw error
  return { success: true }
}
