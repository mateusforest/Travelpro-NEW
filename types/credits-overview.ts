import type { CreditTransactionRow } from "@/types/database"

export type CreditsOverviewData = {
  balance: number
  consumed: number
  added: number
  top_feature: string
  top_feature_amount: number
  history: CreditTransactionRow[]
  by_feature: Array<{ feature: string; amount: number }>
}
