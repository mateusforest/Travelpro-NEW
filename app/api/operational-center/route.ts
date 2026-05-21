import { NextResponse } from "next/server"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { getOperationalCenterData } from "@/lib/services/operational-center-service"

export async function GET() {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const data = await getOperationalCenterData(context)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load operational center" }, { status })
  }
}
