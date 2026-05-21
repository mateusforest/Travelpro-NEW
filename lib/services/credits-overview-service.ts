import type { AgencyAccessContext, CreditTransactionRow } from "@/types/database"
import type { CreditsOverviewData } from "@/types/credits-overview"
import { listCreditTransactions } from "@/lib/services/credit-service"

function signedAmount(row: CreditTransactionRow) {
  const normalized = row.type.toLowerCase()
  if (normalized.includes("grant") || normalized.includes("bonus") || normalized.includes("credit") || normalized.includes("entrada")) return Number(row.amount || 0)
  if (normalized.includes("consumo") || normalized.includes("debit") || normalized.includes("uso")) return Number(row.amount || 0) * -1
  return Number(row.amount || 0)
}

export async function getCreditsOverviewData(context: AgencyAccessContext): Promise<CreditsOverviewData> {
  const history = await listCreditTransactions(context)
  const balance = history.reduce((sum, item) => sum + signedAmount(item), 0)
  const consumed = history.filter((item) => signedAmount(item) < 0).reduce((sum, item) => sum + Math.abs(signedAmount(item)), 0)
  const added = history.filter((item) => signedAmount(item) > 0).reduce((sum, item) => sum + signedAmount(item), 0)

  const byFeatureMap = new Map<string, number>()
  history.forEach((item) => {
    const key = item.feature || item.source || "Operação geral"
    byFeatureMap.set(key, (byFeatureMap.get(key) ?? 0) + Math.abs(signedAmount(item)))
  })

  const byFeature = Array.from(byFeatureMap.entries())
    .map(([feature, amount]) => ({ feature, amount }))
    .sort((a, b) => b.amount - a.amount)

  return {
    balance,
    consumed,
    added,
    top_feature: byFeature[0]?.feature || "Sem consumo registrado",
    top_feature_amount: byFeature[0]?.amount || 0,
    history: history.slice(0, 20),
    by_feature: byFeature.slice(0, 8),
  }
}
