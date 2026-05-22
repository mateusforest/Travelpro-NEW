import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type {
  AgencyRow,
  AuditLogRow,
  CreditTransactionRow,
  NotificationRow,
  ReportRow,
  SubscriptionRow,
} from "@/types/database"
import type {
  MasterAiCreditAgencyItem,
  MasterAiCreditLogItem,
  MasterAiCreditOverview,
} from "@/types/master"

function signedCreditAmount(row: CreditTransactionRow) {
  const normalizedType = row.type.toLowerCase()
  if (
    normalizedType.includes("grant") ||
    normalizedType.includes("bonus") ||
    normalizedType.includes("credit") ||
    normalizedType.includes("entrada")
  ) {
    return Number(row.amount || 0)
  }

  if (
    normalizedType.includes("consumo") ||
    normalizedType.includes("debit") ||
    normalizedType.includes("uso")
  ) {
    return Number(row.amount || 0) * -1
  }

  return Number(row.amount || 0)
}

function isCreditUsage(row: CreditTransactionRow) {
  return signedCreditAmount(row) < 0
}

function isAiFeature(value?: string | null) {
  const normalized = (value || "").toLowerCase()
  return (
    normalized.includes("ai") ||
    normalized.includes("ia") ||
    normalized.includes("agent") ||
    normalized.includes("advisor") ||
    normalized.includes("atlas")
  )
}

function buildAiLogs(
  agenciesById: Map<string, AgencyRow>,
  audits: AuditLogRow[],
  notifications: NotificationRow[],
  reports: ReportRow[],
): MasterAiCreditLogItem[] {
  const auditItems = audits
    .filter((item) => isAiFeature(item.action) || isAiFeature(item.entity))
    .map<MasterAiCreditLogItem>((item) => ({
      id: item.id,
      agency_id: item.agency_id,
      agency_name: item.agency_id ? agenciesById.get(item.agency_id)?.name ?? null : null,
      title: item.action,
      detail: item.entity,
      source: "audit",
      status: item.status,
      created_at: item.created_at,
    }))

  const notificationItems = notifications
    .filter((item) => isAiFeature(item.title) || isAiFeature(item.body || "") || isAiFeature(item.type))
    .map<MasterAiCreditLogItem>((item) => ({
      id: item.id,
      agency_id: item.agency_id,
      agency_name: item.agency_id ? agenciesById.get(item.agency_id)?.name ?? null : null,
      title: item.title,
      detail: item.body || item.type,
      source: "notification",
      status: item.status,
      created_at: item.created_at,
    }))

  const reportItems = reports
    .filter((item) => isAiFeature(item.name) || isAiFeature(item.type))
    .map<MasterAiCreditLogItem>((item) => ({
      id: item.id,
      agency_id: item.agency_id,
      agency_name: item.agency_id ? agenciesById.get(item.agency_id)?.name ?? null : null,
      title: item.name,
      detail: item.type,
      source: "report",
      status: item.status,
      created_at: item.created_at,
    }))

  return [...auditItems, ...notificationItems, ...reportItems]
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .slice(0, 24)
}

function buildAgencyRanking(
  agencies: AgencyRow[],
  credits: CreditTransactionRow[],
  subscriptions: SubscriptionRow[],
): MasterAiCreditAgencyItem[] {
  return agencies
    .map((agency) => {
      const agencyCredits = credits.filter((item) => item.agency_id === agency.id)
      const latestSubscription = subscriptions
        .filter((item) => item.agency_id === agency.id)
        .sort((left, right) => new Date(right.updated_at || right.created_at).getTime() - new Date(left.updated_at || left.created_at).getTime())[0]

      const featureUsage = new Map<string, number>()
      for (const item of agencyCredits.filter((entry) => isCreditUsage(entry))) {
        const feature = item.feature?.trim() || item.source?.trim() || "Operacao"
        featureUsage.set(feature, (featureUsage.get(feature) || 0) + Math.abs(signedCreditAmount(item)))
      }

      const topFeature = [...featureUsage.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null

      return {
        agency_id: agency.id,
        agency_name: agency.name,
        agency_status: agency.status,
        plan_code: latestSubscription?.plan_code ?? null,
        credit_balance: agencyCredits.reduce((sum, item) => sum + signedCreditAmount(item), 0),
        credits_granted: agencyCredits.reduce((sum, item) => {
          const signed = signedCreditAmount(item)
          return signed > 0 ? sum + signed : sum
        }, 0),
        credits_consumed: agencyCredits.reduce((sum, item) => {
          const signed = signedCreditAmount(item)
          return signed < 0 ? sum + Math.abs(signed) : sum
        }, 0),
        transactions_count: agencyCredits.length,
        last_transaction_at: agencyCredits
          .slice()
          .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())[0]?.created_at ?? null,
        top_feature: topFeature,
      }
    })
    .sort((left, right) => right.credits_consumed - left.credits_consumed)
}

export async function getMasterAiCreditOverview(): Promise<MasterAiCreditOverview> {
  const supabase = getSupabaseAdminClient()
  const [creditsResult, agenciesResult, subscriptionsResult, auditsResult, notificationsResult, reportsResult] = await Promise.all([
    supabase.from("credit_transactions").select("*").order("created_at", { ascending: false }),
    supabase.from("agencies").select("*").order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("*"),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }),
    supabase.from("reports").select("*").order("created_at", { ascending: false }),
  ])

  if (creditsResult.error) throw creditsResult.error
  if (agenciesResult.error) throw agenciesResult.error
  if (subscriptionsResult.error) throw subscriptionsResult.error
  if (auditsResult.error) throw auditsResult.error
  if (notificationsResult.error) throw notificationsResult.error
  if (reportsResult.error) throw reportsResult.error

  const credits = (creditsResult.data ?? []) as CreditTransactionRow[]
  const agencies = (agenciesResult.data ?? []) as AgencyRow[]
  const subscriptions = (subscriptionsResult.data ?? []) as SubscriptionRow[]
  const audits = (auditsResult.data ?? []) as AuditLogRow[]
  const notifications = (notificationsResult.data ?? []) as NotificationRow[]
  const reports = (reportsResult.data ?? []) as ReportRow[]
  const agenciesById = new Map(agencies.map((agency) => [agency.id, agency]))
  const latestSubscriptionByAgencyId = new Map<string, SubscriptionRow>()

  for (const item of subscriptions) {
    const current = latestSubscriptionByAgencyId.get(item.agency_id)
    if (!current || new Date(item.updated_at || item.created_at).getTime() > new Date(current.updated_at || current.created_at).getTime()) {
      latestSubscriptionByAgencyId.set(item.agency_id, item)
    }
  }

  const ranking = buildAgencyRanking(agencies, credits, subscriptions)
  const logs = buildAiLogs(agenciesById, audits, notifications, reports)
  const recentTransactions = credits.slice(0, 20).map((item) => ({
    ...item,
    agency_name: agenciesById.get(item.agency_id)?.name ?? null,
    plan_code: latestSubscriptionByAgencyId.get(item.agency_id)?.plan_code ?? null,
  }))

  return {
    summary: {
      agencies_with_usage: ranking.filter((item) => item.transactions_count > 0).length,
      total_balance: ranking.reduce((sum, item) => sum + item.credit_balance, 0),
      credits_sold: credits.reduce((sum, item) => {
        const signed = signedCreditAmount(item)
        return signed > 0 ? sum + signed : sum
      }, 0),
      credits_consumed: credits.reduce((sum, item) => {
        const signed = signedCreditAmount(item)
        return signed < 0 ? sum + Math.abs(signed) : sum
      }, 0),
      estimated_cost_total: null,
      ai_related_logs: logs.length,
    },
    ranking,
    recent_transactions: recentTransactions,
    logs,
  }
}
