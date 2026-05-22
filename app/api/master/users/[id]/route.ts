import { NextResponse } from "next/server"
import { z } from "zod"
import { AuthSessionError, AuthorizationError, getAccessContext } from "@/lib/auth"
import { getMasterUserById, updateMasterUser } from "@/lib/services"

const masterUserUpdateSchema = z.object({
  role: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getAccessContext(["master"])
    const { id } = await params
    const data = await getMasterUserById(id)
    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load master user" }, { status })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getAccessContext(["master"])
    const { id } = await params
    const payload = masterUserUpdateSchema.parse(await request.json())
    const data = await updateMasterUser(id, payload)
    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update master user" }, { status })
  }
}
