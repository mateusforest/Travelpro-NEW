import { NextResponse } from "next/server"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { getAgencyDashboardData } from "@/lib/services"

export async function GET() {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const data = await getAgencyDashboardData(context)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load agency dashboard" }, { status })
  }
}
