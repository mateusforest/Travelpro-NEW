import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { deleteClient, getClientById, updateClient } from "@/lib/services"

const travelerProfileSchema = z.object({
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

const clientPatchSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  document_number: z.string().optional().nullable(),
  traveler_profile: travelerProfileSchema.optional(),
  status: z.string().optional(),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const data = await getClientById(context, id)
    if (!data) return NextResponse.json({ error: "Client not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to get client" }, { status })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const payload = clientPatchSchema.parse(await request.json())
    const data = await updateClient(context, id, payload)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update client" }, { status })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const data = await deleteClient(context, id)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete client" }, { status })
  }
}
