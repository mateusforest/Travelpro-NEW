import { NextResponse } from "next/server"
import { AuthSessionError, AuthorizationError, getAccessContext } from "@/lib/auth"
import { listMasterUsers } from "@/lib/services"

export async function GET(request: Request) {
  try {
    await getAccessContext(["master"])
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || undefined
    const role = searchParams.get("role") || undefined
    const data = await listMasterUsers({ search, role })
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list master users" }, { status })
  }
}
