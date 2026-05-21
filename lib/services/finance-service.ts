import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, FinancialRecordRow } from "@/types/database"
import type { FinancialRecordInput } from "@/types/financial-record"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

function ensureAgencyContext(context: AgencyAccessContext) {
  if (!context.isMaster && !context.agencyId) {
    throw new Error("Sua sessão não possui uma agência vinculada para operar o financeiro.")
  }
}

export async function listFinancialRecords(context: AgencyAccessContext) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("financial_records").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as FinancialRecordRow[]
}

export async function getFinancialRecordById(context: AgencyAccessContext, id: string) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("financial_records").select("*").eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return (data as FinancialRecordRow | null) ?? null
}

export async function createFinancialRecord(context: AgencyAccessContext, input: FinancialRecordInput) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("financial_records")
    .insert({
      agency_id: context.agencyId,
      user_id: context.userId,
      client_id: input.client_id ?? null,
      trip_id: input.trip_id ?? null,
      type: input.type,
      amount: input.amount,
      status: input.status ?? "Ativo",
      description: input.description ?? null,
      category: input.category ?? null,
      occurred_at: input.occurred_at ?? undefined,
    })
    .select("*")
    .single()
  if (error) throw error
  return data as FinancialRecordRow
}

export async function updateFinancialRecord(context: AgencyAccessContext, id: string, input: Partial<FinancialRecordInput>) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from("financial_records")
    .update({
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.client_id !== undefined ? { client_id: input.client_id } : {}),
      ...(input.trip_id !== undefined ? { trip_id: input.trip_id } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.occurred_at !== undefined ? { occurred_at: input.occurred_at } : {}),
    })
    .eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.select("*").single()
  if (error) throw error
  return data as FinancialRecordRow
}

export async function deleteFinancialRecord(context: AgencyAccessContext, id: string) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("financial_records").delete().eq("id", id)
  query = withAgencyScope(query, context)
  const { error } = await query
  if (error) throw error
  return { success: true }
}
