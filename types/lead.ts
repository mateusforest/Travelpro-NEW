import type { LeadRow } from "@/types/database"

export type LeadInput = {
  name: string
  email?: string | null
  phone?: string | null
  origin?: string | null
  destination?: string | null
  status?: string
  temperature?: string | null
  notes?: string | null
  client_id?: string | null
}

export type LeadResponse = LeadRow
