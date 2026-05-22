import { NextResponse } from "next/server"
import { AuthSessionError, AuthorizationError, getAccessContext } from "@/lib/auth"
import { getMasterPlanOverview } from "@/lib/services"

export async function GET() {
  try {
    await getAccessContext(["master"])
    const data = await getMasterPlanOverview()
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load master plans" }, { status })
  }
}
