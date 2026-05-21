import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { createCreditTransaction, listCreditTransactions } from "@/lib/services"

const creditTransactionSchema = z.object({
  type: z.string().min(2),
  amount: z.number().int(),
  feature: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const data = await listCreditTransactions(context)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list credit transactions" }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const payload = creditTransactionSchema.parse(await request.json())
    const data = await createCreditTransaction(context, payload)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create credit transaction" }, { status })
  }
}
