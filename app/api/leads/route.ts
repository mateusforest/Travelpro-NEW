import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { createLead, listLeads } from "@/lib/services"

const leadSchema = z.object({
  name: z.string().min(2),
  origin: z.string().optional().nullable(),
  destination: z.string().optional().nullable(),
  status: z.string().optional(),
  temperature: z.string().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
})

export async function GET() {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const data = await listLeads(context)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list leads" }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const payload = leadSchema.parse(await request.json())
    const data = await createLead(context, payload)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create lead" }, { status })
  }
}
