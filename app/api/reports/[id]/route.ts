import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { deleteReport, getReportById, updateReport } from "@/lib/services"

const reportPatchSchema = z.object({
  name: z.string().min(2).optional(),
  type: z.string().min(2).optional(),
  status: z.string().optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  result_path: z.string().optional().nullable(),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const data = await getReportById(context, id)
    if (!data) return NextResponse.json({ error: "Report not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to get report" }, { status })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const payload = reportPatchSchema.parse(await request.json())
    const data = await updateReport(context, id, payload)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update report" }, { status })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const data = await deleteReport(context, id)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete report" }, { status })
  }
}
