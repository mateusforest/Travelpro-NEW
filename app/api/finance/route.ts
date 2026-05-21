import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { createFinancialRecord, listFinancialRecords } from "@/lib/services"

const financeSchema = z.object({
  type: z.string().min(2),
  amount: z.number(),
  status: z.string().optional(),
  client_id: z.string().uuid().optional().nullable(),
  trip_id: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  occurred_at: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const data = await listFinancialRecords(context)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list financial records" }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const payload = financeSchema.parse(await request.json())
    const data = await createFinancialRecord(context, payload)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create financial record" }, { status })
  }
}
