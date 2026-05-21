import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { createDocument, listDocuments } from "@/lib/services"

const documentSchema = z.object({
  title: z.string().min(2),
  type: z.string().min(2),
  status: z.string().optional(),
  client_id: z.string().uuid().optional().nullable(),
  trip_id: z.string().uuid().optional().nullable(),
  storage_bucket: z.string().optional().nullable(),
  storage_path: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function GET() {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const data = await listDocuments(context)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list documents" }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const payload = documentSchema.parse(await request.json())
    const data = await createDocument(context, payload)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create document" }, { status })
  }
}
