import { NextResponse } from "next/server"
import { AuthSessionError, AuthorizationError, getAccessContext } from "@/lib/auth"
import { getMasterReportById } from "@/lib/services"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getAccessContext(["master"])
    const { id } = await params
    const data = await getMasterReportById(id)
    if (!data) return NextResponse.json({ error: "Master report not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load master report" }, { status })
  }
}
