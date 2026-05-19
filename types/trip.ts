import type { TripRow } from "@/types/database"

export type TripInput = {
  destination: string
  status?: string
  starts_at?: string | null
  ends_at?: string | null
  client_id?: string | null
}

export type TripResponse = TripRow
