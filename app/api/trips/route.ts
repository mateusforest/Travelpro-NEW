import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { createTrip, listTrips } from "@/lib/services"

const tripSchema = z.object({
  destination: z.string().min(2),
  status: z.string().optional(),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
})

export async function GET() {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const data = await listTrips(context)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list trips" }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const payload = tripSchema.parse(await request.json())
    const data = await createTrip(context, payload)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create trip" }, { status })
  }
}
