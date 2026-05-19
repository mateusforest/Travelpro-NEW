import type { CatalogItemRow } from "@/types/database"

export type CatalogItemInput = {
  title: string
  description?: string | null
  status?: string
  price?: number | null
  match_enabled?: boolean
}

export type CatalogItemResponse = CatalogItemRow
