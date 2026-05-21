import type { CreditTransactionRow } from "@/types/database"

export type CreditTransactionInput = {
  type: string
  amount: number
  feature?: string | null
  source?: string | null
}

export type CreditTransactionResponse = CreditTransactionRow
