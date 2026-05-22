import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { buildPlannedFinancialEntries } from "@/lib/finance/agency-finance"
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
  plan_mode: z.enum(["Único", "Parcelado", "Recorrente mensal"]).optional(),
  installments: z.number().int().min(1).max(24).optional(),
  recurrence_count: z.number().int().min(1).max(24).optional(),
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

    if (!payload.occurred_at) {
      return NextResponse.json({ error: "Informe a data do lançamento/competência." }, { status: 400 })
    }

    const plannedEntries = buildPlannedFinancialEntries(
      {
        type: payload.type,
        amount: payload.amount,
        status: payload.status ?? "Pendente",
        client_id: payload.client_id ?? null,
        trip_id: payload.trip_id ?? null,
        description: payload.description ?? null,
        category: payload.category ?? null,
        occurred_at: payload.occurred_at,
      },
      {
        mode: payload.plan_mode ?? "Único",
        installments: payload.installments ?? 1,
        recurrenceCount: payload.recurrence_count ?? 1,
      },
    )

    const createdRecords = await Promise.all(
      plannedEntries.map((entry) =>
        createFinancialRecord(context, {
          type: entry.type,
          amount: entry.amount,
          status: entry.status,
          client_id: entry.client_id ?? null,
          trip_id: entry.trip_id ?? null,
          description: entry.description ?? null,
          category: entry.category ?? null,
          occurred_at: entry.occurred_at,
        }),
      ),
    )

    return NextResponse.json(createdRecords.length === 1 ? createdRecords[0] : createdRecords, { status: 201 })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create financial record" }, { status })
  }
}
