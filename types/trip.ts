import type { TripRow } from "@/types/database"

export type TripInput = {
  destination: string
  origin?: string | null
  status?: string
  starts_at?: string | null
  ends_at?: string | null
  summary?: string | null
  client_id?: string | null
}

export type TripResponse = TripRow
