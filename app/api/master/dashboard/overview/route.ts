import { NextResponse } from "next/server"
import { AuthSessionError, AuthorizationError, getAccessContext } from "@/lib/auth"
import {
  getMasterAiCreditOverview,
  getMasterFinanceOverview,
  listMasterReports,
  listMasterTemplates,
  getMasterWhatsAppOverview,
  listMasterAgencies,
  listMasterUsers,
} from "@/lib/services"
import type { MasterDashboardOverview } from "@/types/master"

export async function GET() {
  try {
    await getAccessContext(["master"])
    const [agencies, users, finance, aiCredits, whatsapp, reports, templates] = await Promise.all([
      listMasterAgencies(),
      listMasterUsers(),
      getMasterFinanceOverview(),
      getMasterAiCreditOverview(),
      getMasterWhatsAppOverview(),
      listMasterReports(),
      listMasterTemplates(),
    ])

    const data: MasterDashboardOverview = {
      agencies_total: agencies.summary.total,
      agencies_active: agencies.summary.active,
      users_total: users.summary.total,
      payments_total: finance.totals.payments_total,
      paid_total: finance.totals.paid_total,
      credits_sold: finance.totals.credits_sold,
      credits_consumed: finance.totals.credits_consumed,
      top_credit_agency_name: aiCredits.ranking[0]?.agency_name ?? null,
      top_credit_agency_consumption: aiCredits.ranking[0]?.credits_consumed ?? 0,
      ai_status_label: aiCredits.logs.length > 0 ? "Leitura operacional" : "Em breve",
      ai_related_logs: aiCredits.summary.ai_related_logs,
      whatsapp_status_label: whatsapp.summary.configured_agencies > 0 ? "Preparado" : "Em breve",
      whatsapp_connected_agencies: whatsapp.summary.configured_agencies,
      reports_total: reports.summary.total,
      templates_active: templates.summary.active,
      templates_official: templates.summary.official,
      agencies_with_subscription: agencies.summary.with_subscription,
      total_credit_balance: agencies.summary.total_credit_balance,
      active_subscriptions: finance.totals.active_subscriptions,
      revenue_records_total: finance.totals.revenue_records_total,
      expense_records_total: finance.totals.expense_records_total,
      billing_status: finance.billing_status,
      top_agencies: agencies.items
        .slice()
        .sort((left, right) => {
          if (right.payments_total !== left.payments_total) return right.payments_total - left.payments_total
          return right.credits_consumed - left.credits_consumed
        })
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          name: item.name,
          status: item.status,
          current_plan: item.current_plan,
          members_count: item.members_count,
          credits_consumed: item.credits_consumed,
          credits_balance: item.credits_balance,
          payments_total: item.payments_total,
        })),
      recent_payments: finance.recent_payments.slice(0, 5).map((item) => ({
        id: item.id,
        agency_name: item.agency_name,
        amount: Number(item.amount || 0),
        status: item.status,
        paid_at: item.paid_at,
        payment_method: item.payment_method,
      })),
      recent_reports: reports.recent_reports.slice(0, 5).map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        status: item.status,
        agency_name: item.agency_name,
        created_at: item.created_at,
      })),
      credit_logs: aiCredits.logs.slice(0, 5).map((item) => ({
        id: item.id,
        title: item.title,
        detail: item.detail,
        agency_name: item.agency_name,
        source: item.source,
        status: item.status,
        created_at: item.created_at,
      })),
      whatsapp_agencies: whatsapp.agencies.slice(0, 5).map((item) => ({
        agency_id: item.agency_id,
        agency_name: item.agency_name,
        whatsapp_status: item.whatsapp_status,
        go_status: item.go_status,
        agent_status: item.agent_status,
        last_event_at: item.last_event_at,
      })),
      report_mix: reports.by_type.slice(0, 6).map((item) => ({
        label: item.label,
        value: item.count,
      })),
      template_mix: templates.by_type.slice(0, 6).map((item) => ({
        label: item.label,
        value: item.count,
      })),
    }

    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load master dashboard overview" }, { status })
  }
}
