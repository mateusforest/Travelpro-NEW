import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyRow, AuditLogRow, ProfileRow } from "@/types/database"
import type { MasterLogItem, MasterLogOverview } from "@/types/master"

function normalize(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function matchesScope(row: AuditLogRow, scope?: string) {
  const normalized = normalize(scope)
  if (!normalized || normalized === "all") return true
  const haystack = `${row.action} ${row.entity} ${row.status}`.toLowerCase()
  if (normalized === "atlas") {
    return ["atlas", "suporte", "support", "escal", "ticket", "chamado"].some((token) => haystack.includes(token))
  }
  return haystack.includes(normalized)
}

function matchesSearch(row: AuditLogRow, search?: string) {
  const normalized = normalize(search)
  if (!normalized) return true
  return normalize(`${row.action} ${row.entity} ${row.status}`).includes(normalized)
}

function mapLogItem(row: AuditLogRow, agenciesById: Map<string, AgencyRow>, profilesByUserId: Map<string, ProfileRow>): MasterLogItem {
  return {
    id: row.id,
    agency_id: row.agency_id,
    agency_name: row.agency_id ? agenciesById.get(row.agency_id)?.name ?? null : null,
    user_id: row.user_id,
    user_name: row.user_id ? profilesByUserId.get(row.user_id)?.full_name ?? profilesByUserId.get(row.user_id)?.email ?? null : null,
    action: row.action,
    entity: row.entity,
    status: row.status,
    created_at: row.created_at,
  }
}

export async function listMasterLogs(options?: {
  scope?: string
  search?: string
}): Promise<MasterLogOverview> {
  const supabase = getSupabaseAdminClient()
  const [logsResult, agenciesResult, profilesResult] = await Promise.all([
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }),
    supabase.from("agencies").select("*"),
    supabase.from("profiles").select("*"),
  ])

  if (logsResult.error) throw logsResult.error
  if (agenciesResult.error) throw agenciesResult.error
  if (profilesResult.error) throw profilesResult.error

  const logs = (logsResult.data ?? []) as AuditLogRow[]
  const agencies = (agenciesResult.data ?? []) as AgencyRow[]
  const profiles = (profilesResult.data ?? []) as ProfileRow[]
  const agenciesById = new Map(agencies.map((agency) => [agency.id, agency]))
  const profilesByUserId = new Map(profiles.map((profile) => [profile.user_id, profile]))

  const items = logs
    .filter((row) => matchesScope(row, options?.scope) && matchesSearch(row, options?.search))
    .map((row) => mapLogItem(row, agenciesById, profilesByUserId))

  return {
    summary: {
      total: items.length,
      audit: items.filter((item) => normalize(item.entity).includes("audit") || normalize(item.action).includes("audit")).length,
      warnings: items.filter((item) => normalize(item.status).includes("pend") || normalize(item.status).includes("warning")).length,
      errors: items.filter((item) => normalize(item.status).includes("error") || normalize(item.status).includes("fail")).length,
    },
    items,
  }
}
