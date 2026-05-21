import type { FinancialRecordRow } from "@/types/database"

export type FinancialRecordInput = {
  type: string
  amount: number
  status?: string
  client_id?: string | null
  trip_id?: string | null
  description?: string | null
  category?: string | null
  occurred_at?: string | null
}

export type FinancialRecordResponse = FinancialRecordRow
