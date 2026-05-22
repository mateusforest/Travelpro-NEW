import { NextResponse } from "next/server"
import { z } from "zod"
import { AuthSessionError, AuthorizationError, getAccessContext } from "@/lib/auth"
import { getMasterAgencyById, updateMasterAgency } from "@/lib/services"

const masterAgencyUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  owner_name: z.string().optional().nullable(),
  owner_email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  requested_plan: z.string().optional().nullable(),
  modules: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getAccessContext(["master"])
    const { id } = await params
    const data = await getMasterAgencyById(id)
    if (!data) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load master agency" }, { status })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getAccessContext(["master"])
    const { id } = await params
    const payload = masterAgencyUpdateSchema.parse(await request.json())
    const data = await updateMasterAgency(id, payload)
    if (!data) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update master agency" }, { status })
  }
}
