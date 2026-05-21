import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, CreditTransactionRow } from "@/types/database"
import type { CreditTransactionInput } from "@/types/credit-transaction"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

function ensureAgencyContext(context: AgencyAccessContext) {
  if (!context.isMaster && !context.agencyId) {
    throw new Error("Sua sessão não possui uma agência vinculada para operar créditos.")
  }
}

export async function listCreditTransactions(context: AgencyAccessContext) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("credit_transactions").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as CreditTransactionRow[]
}

export async function createCreditTransaction(context: AgencyAccessContext, input: CreditTransactionInput) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("credit_transactions")
    .insert({
      agency_id: context.agencyId,
      user_id: context.userId,
      type: input.type,
      amount: input.amount,
      feature: input.feature ?? null,
      source: input.source ?? null,
    })
    .select("*")
    .single()
  if (error) throw error
  return data as CreditTransactionRow
}
