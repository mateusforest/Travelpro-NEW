import type { AgencyRow, CatalogItemRow, Json } from "@/types/database"

export type CatalogItemInput = {
  title: string
  description?: string | null
  status?: string
  price?: number | null
  currency?: string
  public_slug?: string | null
  match_enabled?: boolean
  metadata?: Json
}

export type CatalogItemResponse = CatalogItemRow

export type CatalogAgencyProfile = {
  agency: AgencyRow | null
  display_name: string
  slug: string
  public_url: string
  phone: string | null
  city: string | null
  visual_style: string | null
  primary_color: string | null
  description: string | null
  logo_url: string | null
  banner_url: string | null
  cta_label: string | null
}

export type PublicCatalogData = {
  agency: CatalogAgencyProfile
  packages: CatalogItemRow[]
}
