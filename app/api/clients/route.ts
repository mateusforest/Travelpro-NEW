import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { createClient, listClients } from "@/lib/services"

const travelerProfileSchema = z
  .object({
    tag: z.string().optional(),
    destination: z.string().optional(),
    origin: z.string().optional(),
    preferences: z.string().optional(),
    travelerProfile: z.string().optional(),
    nextStep: z.string().optional(),
    companions: z.string().optional(),
    notes: z.string().optional(),
    recommendations: z.array(z.string()).optional(),
  })
  .optional()

const clientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  document_number: z.string().optional().nullable(),
  traveler_profile: travelerProfileSchema,
  status: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { searchParams } = new URL(request.url)
    const data = await listClients(context, {
      search: searchParams.get("search") ?? undefined,
    })
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list clients" }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const payload = clientSchema.parse(await request.json())
    const data = await createClient(context, payload)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create client" }, { status })
  }
}
