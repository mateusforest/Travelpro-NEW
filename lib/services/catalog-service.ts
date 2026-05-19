import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, CatalogItemRow } from "@/types/database"
import type { CatalogItemInput } from "@/types/catalog"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

export async function listCatalogItems(context: AgencyAccessContext) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("catalog_items").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as CatalogItemRow[]
}

export async function getCatalogItemById(context: AgencyAccessContext, id: string) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("catalog_items").select("*").eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return (data as CatalogItemRow | null) ?? null
}

export async function createCatalogItem(context: AgencyAccessContext, input: CatalogItemInput) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("catalog_items")
    .insert({
      agency_id: context.agencyId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? "Rascunho",
      price: input.price ?? null,
      match_enabled: input.match_enabled ?? false,
    })
    .select("*")
    .single()
  if (error) throw error
  return data as CatalogItemRow
}

export async function updateCatalogItem(context: AgencyAccessContext, id: string, input: Partial<CatalogItemInput>) {
  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from("catalog_items")
    .update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.match_enabled !== undefined ? { match_enabled: input.match_enabled } : {}),
    })
    .eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.select("*").single()
  if (error) throw error
  return data as CatalogItemRow
}

export async function deleteCatalogItem(context: AgencyAccessContext, id: string) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("catalog_items").delete().eq("id", id)
  query = withAgencyScope(query, context)
  const { error } = await query
  if (error) throw error
  return { success: true }
}
