import { NextResponse } from "next/server"
import { z } from "zod"
import { AuthSessionError, AuthorizationError, getAccessContext } from "@/lib/auth"
import { createMasterAgency, listMasterAgencies } from "@/lib/services"

const masterAgencySchema = z.object({
  name: z.string().min(2),
  owner_name: z.string().optional().nullable(),
  owner_email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  requested_plan: z.string().optional().nullable(),
  modules: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function GET(request: Request) {
  try {
    await getAccessContext(["master"])
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || undefined
    const status = searchParams.get("status") || undefined
    const data = await listMasterAgencies({ search, status })
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list master agencies" }, { status })
  }
}

export async function POST(request: Request) {
  try {
    await getAccessContext(["master"])
    const payload = masterAgencySchema.parse(await request.json())
    const data = await createMasterAgency(payload)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create master agency" }, { status })
  }
}
