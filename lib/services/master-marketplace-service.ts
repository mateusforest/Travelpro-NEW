import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyRow, CatalogItemRow, Json } from "@/types/database"
import type { MasterMarketplaceItem, MasterMarketplaceOverview } from "@/types/master"

function parseMetadata(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, Json | undefined>
}

function normalize(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function isPublished(status: string) {
  const normalized = normalize(status)
  return normalized.includes("public") || normalized.includes("ativo")
}

function formatPriceLabel(row: CatalogItemRow) {
  const metadata = parseMetadata(row.metadata)
  const explicit = typeof metadata.price_label === "string" ? metadata.price_label : null
  if (explicit) return explicit
  if (typeof row.price === "number") {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: row.currency || "BRL" }).format(row.price)
  }
  return null
}

function mapItem(row: CatalogItemRow, agenciesById: Map<string, AgencyRow>): MasterMarketplaceItem {
  const metadata = parseMetadata(row.metadata)
  return {
    id: row.id,
    agency_id: row.agency_id,
    agency_name: agenciesById.get(row.agency_id)?.name ?? null,
    agency_slug: agenciesById.get(row.agency_id)?.slug ?? null,
    title: row.title,
    status: row.status,
    price_label: formatPriceLabel(row),
    category: typeof metadata.category === "string" ? metadata.category : null,
    destination: typeof metadata.destination === "string" ? metadata.destination : null,
    public_slug: row.public_slug,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function getMasterMarketplaceOverview(): Promise<MasterMarketplaceOverview> {
  const supabase = getSupabaseAdminClient()
  const [itemsResult, agenciesResult] = await Promise.all([
    supabase.from("catalog_items").select("*").order("created_at", { ascending: false }),
    supabase.from("agencies").select("*"),
  ])

  if (itemsResult.error) throw itemsResult.error
  if (agenciesResult.error) throw agenciesResult.error

  const items = (itemsResult.data ?? []) as CatalogItemRow[]
  const agencies = (agenciesResult.data ?? []) as AgencyRow[]
  const agenciesById = new Map(agencies.map((agency) => [agency.id, agency]))
  const mapped = items.map((item) => mapItem(item, agenciesById))

  return {
    summary: {
      agencies_with_packages: new Set(mapped.map((item) => item.agency_id)).size,
      published_packages: mapped.filter((item) => isPublished(item.status)).length,
      draft_packages: mapped.filter((item) => !isPublished(item.status)).length,
      public_showcases: new Set(mapped.filter((item) => item.agency_slug).map((item) => item.agency_slug)).size,
    },
    items: mapped,
  }
}
