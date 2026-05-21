import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { createReport, listReports } from "@/lib/services"

const reportSchema = z.object({
  name: z.string().min(2),
  type: z.string().min(2),
  status: z.string().optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  result_path: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const data = await listReports(context)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list reports" }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const payload = reportSchema.parse(await request.json())
    const data = await createReport(context, payload)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create report" }, { status })
  }
}
