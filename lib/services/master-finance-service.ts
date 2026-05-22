import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyRow, CreditTransactionRow, PaymentRow, SubscriptionRow } from "@/types/database"
import type { MasterFinanceOverview, MasterFinancePaymentItem } from "@/types/master"

function signedCreditAmount(row: CreditTransactionRow) {
  const normalizedType = row.type.toLowerCase()
  if (normalizedType.includes("grant") || normalizedType.includes("bonus") || normalizedType.includes("credit") || normalizedType.includes("entrada")) return Number(row.amount || 0)
  if (normalizedType.includes("consumo") || normalizedType.includes("debit") || normalizedType.includes("uso")) return Number(row.amount || 0) * -1
  return Number(row.amount || 0)
}

function isPaidStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("paid") || normalized.includes("pago") || normalized.includes("approved") || normalized.includes("conclu")
}

function isActiveSubscriptionStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized === "active" || normalized === "ativa" || normalized === "ativo"
}

function isPendingStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("pending") || normalized.includes("pend") || normalized.includes("processing")
}

function isOverdueStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("overdue") || normalized.includes("late") || normalized.includes("atras")
}

export async function getMasterFinanceOverview(): Promise<MasterFinanceOverview> {
  const supabase = getSupabaseAdminClient()
  const [paymentsResult, subscriptionsResult, creditsResult, agenciesResult] = await Promise.all([
    supabase.from("payments").select("*").order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("*"),
    supabase.from("credit_transactions").select("*"),
    supabase.from("agencies").select("*"),
  ])

  if (paymentsResult.error) throw paymentsResult.error
  if (subscriptionsResult.error) throw subscriptionsResult.error
  if (creditsResult.error) throw creditsResult.error
  if (agenciesResult.error) throw agenciesResult.error

  const payments = (paymentsResult.data ?? []) as PaymentRow[]
  const subscriptions = (subscriptionsResult.data ?? []) as SubscriptionRow[]
  const credits = (creditsResult.data ?? []) as CreditTransactionRow[]
  const agencies = (agenciesResult.data ?? []) as AgencyRow[]
  const agenciesById = new Map(agencies.map((agency) => [agency.id, agency]))
  const subscriptionsById = new Map(subscriptions.map((subscription) => [subscription.id, subscription]))

  const recentPayments: MasterFinancePaymentItem[] = payments.slice(0, 12).map((payment) => ({
    ...payment,
    agency_name: agenciesById.get(payment.agency_id)?.name ?? null,
    plan_code: payment.subscription_id ? subscriptionsById.get(payment.subscription_id)?.plan_code ?? null : null,
  }))

  return {
    totals: {
      payments_count: payments.length,
      payments_total: payments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      paid_total: payments.filter((item) => isPaidStatus(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
      active_subscriptions: subscriptions.filter((item) => isActiveSubscriptionStatus(item.status)).length,
      // Master billing must stay isolated from tenant operational finance.
      revenue_records_total: 0,
      expense_records_total: 0,
      credits_sold: credits.reduce((sum, item) => {
        const signed = signedCreditAmount(item)
        return signed > 0 ? sum + signed : sum
      }, 0),
      credits_consumed: credits.reduce((sum, item) => {
        const signed = signedCreditAmount(item)
        return signed < 0 ? sum + Math.abs(signed) : sum
      }, 0),
    },
    billing_status: {
      paid: payments.filter((item) => isPaidStatus(item.status)).length,
      pending: payments.filter((item) => isPendingStatus(item.status)).length,
      overdue: payments.filter((item) => isOverdueStatus(item.status)).length,
      other: payments.filter((item) => !isPaidStatus(item.status) && !isPendingStatus(item.status) && !isOverdueStatus(item.status)).length,
    },
    recent_payments: recentPayments,
  }
}
