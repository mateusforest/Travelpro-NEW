import type { LeadRow } from "@/types/database"

export type LeadInput = {
  name: string
  origin?: string | null
  destination?: string | null
  status?: string
  temperature?: string | null
  client_id?: string | null
}

export type LeadResponse = LeadRow
