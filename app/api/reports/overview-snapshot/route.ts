import { NextResponse } from "next/server"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { buildReportSnapshot } from "@/lib/services/reports-overview-service"

export async function GET(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "Resumo operacional"
    const period = searchParams.get("period") || "Últimos 30 dias"
    const data = await buildReportSnapshot(context, type, period)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load report snapshot" }, { status })
  }
}
