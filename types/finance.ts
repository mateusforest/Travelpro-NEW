import type { FinancialRecordRow } from "@/types/database"

export type FinancialRecordInput = {
  type: string
  amount: number
  status?: string
  description?: string | null
  category?: string | null
}

export type FinancialRecordResponse = FinancialRecordRow
