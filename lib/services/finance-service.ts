import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, FinancialRecordRow } from "@/types/database"
import type { FinancialRecordInput } from "@/types/finance"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

export async function listFinancialRecords(context: AgencyAccessContext) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("financial_records").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as FinancialRecordRow[]
}

export async function getFinancialRecordById(context: AgencyAccessContext, id: string) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("financial_records").select("*").eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return (data as FinancialRecordRow | null) ?? null
}

export async function createFinancialRecord(context: AgencyAccessContext, input: FinancialRecordInput) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("financial_records")
    .insert({
      agency_id: context.agencyId,
      user_id: context.userId,
      type: input.type,
      amount: input.amount,
      status: input.status ?? "Ativo",
      description: input.description ?? null,
      category: input.category ?? null,
    })
    .select("*")
    .single()
  if (error) throw error
  return data as FinancialRecordRow
}

export async function updateFinancialRecord(context: AgencyAccessContext, id: string, input: Partial<FinancialRecordInput>) {
  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from("financial_records")
    .update({
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
    })
    .eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.select("*").single()
  if (error) throw error
  return data as FinancialRecordRow
}

export async function deleteFinancialRecord(context: AgencyAccessContext, id: string) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("financial_records").delete().eq("id", id)
  query = withAgencyScope(query, context)
  const { error } = await query
  if (error) throw error
  return { success: true }
}
