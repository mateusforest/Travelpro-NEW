import { NextResponse } from "next/server"
import { AuthSessionError, AuthorizationError, getAccessContext } from "@/lib/auth"
import { buildReportDocumentData } from "@/lib/services"

export async function GET(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "Operacao geral"
    const period = searchParams.get("period") || "Ultimos 30 dias"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const financeFilter = searchParams.get("financeFilter")

    const payload = await buildReportDocumentData(context, type, period, {
      startDate,
      endDate,
      financeFilter,
    })

    return NextResponse.json({
      title: payload.title,
      lines: payload.summary.lines,
      payload,
    })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to compose report" }, { status })
  }
}
