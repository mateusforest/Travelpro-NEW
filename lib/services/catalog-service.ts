import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, AgencyRow, CatalogItemRow, Json } from "@/types/database"
import type { CatalogAgencyProfile, CatalogItemInput, PublicCatalogData } from "@/types/catalog"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

function ensureAgencyContext(context: AgencyAccessContext) {
  if (!context.isMaster && !context.agencyId) {
    throw new Error("Agency context is required for catalog operations")
  }
}

function parseMetadata(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, Json | undefined>
}

export function slugifyCatalogValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function isCatalogItemPublished(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("public") || normalized.includes("publicad") || normalized.includes("ativo")
}

function buildCatalogAgencyProfile(agency: AgencyRow | null): CatalogAgencyProfile {
  const metadata = parseMetadata(agency?.metadata)
  const displayName =
    (typeof metadata.catalog_name === "string" && metadata.catalog_name.trim()) ||
    agency?.name ||
    "Agência TravelPro"
  const slug =
    agency?.slug ||
    slugifyCatalogValue(displayName)
  const description =
    typeof metadata.catalog_description === "string" && metadata.catalog_description.trim()
      ? metadata.catalog_description
      : null

  return {
    agency,
    display_name: displayName,
    slug,
    public_url: `/catalogo/${slug}`,
    phone:
      (typeof metadata.catalog_phone === "string" && metadata.catalog_phone.trim()) ||
      agency?.phone ||
      null,
    city: typeof metadata.catalog_city === "string" && metadata.catalog_city.trim() ? metadata.catalog_city : null,
    visual_style: typeof metadata.catalog_visual_style === "string" && metadata.catalog_visual_style.trim() ? metadata.catalog_visual_style : null,
    primary_color: typeof metadata.catalog_primary_color === "string" && metadata.catalog_primary_color.trim() ? metadata.catalog_primary_color : null,
    description,
    logo_url: typeof metadata.catalog_logo_url === "string" && metadata.catalog_logo_url.trim() ? metadata.catalog_logo_url : null,
    banner_url: typeof metadata.catalog_banner_url === "string" && metadata.catalog_banner_url.trim() ? metadata.catalog_banner_url : null,
    cta_label: typeof metadata.catalog_cta_label === "string" && metadata.catalog_cta_label.trim() ? metadata.catalog_cta_label : null,
  }
}

export async function listCatalogItems(context: AgencyAccessContext, options?: { search?: string; status?: string }) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("catalog_items").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)

  if (options?.search?.trim()) {
    query = query.ilike("title", `%${options.search.trim()}%`)
  }

  if (options?.status?.trim() && options.status !== "Todos") {
    query = query.eq("status", options.status.trim())
  }

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
  ensureAgencyContext(context)

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("catalog_items")
    .insert({
      agency_id: context.agencyId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? "Rascunho",
      price: input.price ?? null,
      currency: input.currency ?? "BRL",
      public_slug: input.public_slug ?? slugifyCatalogValue(input.title),
      match_enabled: input.match_enabled ?? false,
      metadata: input.metadata ?? {},
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
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      ...(input.public_slug !== undefined ? { public_slug: input.public_slug } : {}),
      ...(input.match_enabled !== undefined ? { match_enabled: input.match_enabled } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
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

export async function getCatalogAgencyProfile(context: AgencyAccessContext) {
  ensureAgencyContext(context)

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.from("agencies").select("*").eq("id", context.agencyId).maybeSingle()
  if (error) throw error
  return buildCatalogAgencyProfile((data as AgencyRow | null) ?? null)
}

export async function updateCatalogAgencyProfile(
  context: AgencyAccessContext,
  input: {
    display_name?: string | null
    phone?: string | null
    city?: string | null
    visual_style?: string | null
    primary_color?: string | null
    description?: string | null
    logo_url?: string | null
    banner_url?: string | null
    cta_label?: string | null
  },
) {
  ensureAgencyContext(context)

  const supabase = getSupabaseAdminClient()
  const { data: currentAgency, error: currentError } = await supabase.from("agencies").select("*").eq("id", context.agencyId).single()
  if (currentError) throw currentError

  const metadata = parseMetadata(currentAgency.metadata)
  const nextMetadata = {
    ...metadata,
    ...(input.display_name !== undefined ? { catalog_name: input.display_name } : {}),
    ...(input.phone !== undefined ? { catalog_phone: input.phone } : {}),
    ...(input.city !== undefined ? { catalog_city: input.city } : {}),
    ...(input.visual_style !== undefined ? { catalog_visual_style: input.visual_style } : {}),
    ...(input.primary_color !== undefined ? { catalog_primary_color: input.primary_color } : {}),
    ...(input.description !== undefined ? { catalog_description: input.description } : {}),
    ...(input.logo_url !== undefined ? { catalog_logo_url: input.logo_url } : {}),
    ...(input.banner_url !== undefined ? { catalog_banner_url: input.banner_url } : {}),
    ...(input.cta_label !== undefined ? { catalog_cta_label: input.cta_label } : {}),
  }

  const { data, error } = await supabase
    .from("agencies")
    .update({ metadata: nextMetadata })
    .eq("id", context.agencyId)
    .select("*")
    .single()

  if (error) throw error
  return buildCatalogAgencyProfile(data as AgencyRow)
}

export async function getPublicCatalogBySlug(slug: string): Promise<PublicCatalogData> {
  const supabase = getSupabaseAdminClient()
  const normalizedSlug = slugifyCatalogValue(slug)

  let agency: AgencyRow | null = null
  const directAgency = await supabase.from("agencies").select("*").eq("slug", normalizedSlug).maybeSingle()
  if (directAgency.error) throw directAgency.error
  agency = (directAgency.data as AgencyRow | null) ?? null

  if (!agency) {
    const allAgencies = await supabase.from("agencies").select("*")
    if (allAgencies.error) throw allAgencies.error
    agency =
      ((allAgencies.data as AgencyRow[] | null) ?? []).find((item) => slugifyCatalogValue(item.slug || item.name) === normalizedSlug) ??
      null
  }

  const profile = buildCatalogAgencyProfile(agency)

  if (!agency) {
    return {
      agency: {
        ...profile,
        slug: normalizedSlug,
        public_url: `/catalogo/${normalizedSlug}`,
      },
      packages: [],
    }
  }

  const { data: packages, error: packagesError } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("agency_id", agency.id)
    .order("created_at", { ascending: false })

  if (packagesError) throw packagesError

  return {
    agency: profile,
    packages: ((packages ?? []) as CatalogItemRow[]).filter((item) => isCatalogItemPublished(item.status)),
  }
}
