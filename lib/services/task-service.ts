import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyAccessContext, TaskRow } from "@/types/database"
import type { TaskInput } from "@/types/task"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

function ensureAgencyContext(context: AgencyAccessContext) {
  if (!context.isMaster && !context.agencyId) {
    throw new Error("Sua sessão não possui uma agência vinculada para operar tarefas.")
  }
}

export async function listTasks(context: AgencyAccessContext) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("tasks").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as TaskRow[]
}

export async function getTaskById(context: AgencyAccessContext, id: string) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("tasks").select("*").eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return (data as TaskRow | null) ?? null
}

export async function createTask(context: AgencyAccessContext, input: TaskInput) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      agency_id: context.agencyId,
      user_id: context.userId,
      client_id: input.client_id ?? null,
      trip_id: input.trip_id ?? null,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? "Média",
      status: input.status ?? "Aberta",
      due_at: input.due_at ?? null,
    })
    .select("*")
    .single()
  if (error) throw error
  return data as TaskRow
}

export async function updateTask(context: AgencyAccessContext, id: string, input: Partial<TaskInput>) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from("tasks")
    .update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.due_at !== undefined ? { due_at: input.due_at } : {}),
      ...(input.client_id !== undefined ? { client_id: input.client_id } : {}),
      ...(input.trip_id !== undefined ? { trip_id: input.trip_id } : {}),
    })
    .eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.select("*").single()
  if (error) throw error
  return data as TaskRow
}

export async function deleteTask(context: AgencyAccessContext, id: string) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("tasks").delete().eq("id", id)
  query = withAgencyScope(query, context)
  const { error } = await query
  if (error) throw error
  return { success: true }
}
