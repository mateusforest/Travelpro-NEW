import { NextResponse } from "next/server"
import { AuthSessionError, AuthorizationError, getAccessContext } from "@/lib/auth"
import {
  getMasterAiCreditOverview,
  getMasterFinanceOverview,
  getMasterWhatsAppOverview,
  listMasterAgencies,
  listMasterUsers,
} from "@/lib/services"
import type { MasterDashboardOverview } from "@/types/master"

export async function GET() {
  try {
    await getAccessContext(["master"])
    const [agencies, users, finance, aiCredits, whatsapp] = await Promise.all([
      listMasterAgencies(),
      listMasterUsers(),
      getMasterFinanceOverview(),
      getMasterAiCreditOverview(),
      getMasterWhatsAppOverview(),
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
    }

    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load master dashboard overview" }, { status })
  }
}
