import { NextResponse } from "next/server"
import { AuthSessionError, AuthorizationError, getAccessContext } from "@/lib/auth"
import { getMasterFinanceOverview, listMasterAgencies, listMasterUsers } from "@/lib/services"
import type { MasterDashboardOverview } from "@/types/master"

export async function GET() {
  try {
    await getAccessContext(["master"])
    const [agencies, users, finance] = await Promise.all([
      listMasterAgencies(),
      listMasterUsers(),
      getMasterFinanceOverview(),
    ])

    const data: MasterDashboardOverview = {
      agencies_total: agencies.summary.total,
      agencies_active: agencies.summary.active,
      users_total: users.summary.total,
      payments_total: finance.totals.payments_total,
      paid_total: finance.totals.paid_total,
      credits_sold: finance.totals.credits_sold,
      credits_consumed: finance.totals.credits_consumed,
    }

    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load master dashboard overview" }, { status })
  }
}
