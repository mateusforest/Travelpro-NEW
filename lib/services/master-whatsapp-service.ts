import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyRow, AuditLogRow, Json, NotificationRow } from "@/types/database"
import type { MasterWhatsAppAgencyItem, MasterWhatsAppOverview } from "@/types/master"

function parseMetadata(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, Json | undefined>
}

function pickString(metadata: Record<string, Json | undefined>, keys: string[]) {
  for (const key of keys) {
    const value = metadata[key]
    if (typeof value === "string" && value.trim()) return value
  }
  return null
}

function looksLikeWhatsappEvent(value?: string | null) {
  const normalized = (value || "").toLowerCase()
  return (
    normalized.includes("whatsapp") ||
    normalized.includes("travelpro go") ||
    normalized.includes("travelpro-go") ||
    normalized.includes("agent") ||
    normalized.includes("webhook") ||
    normalized.includes("instancia") ||
    normalized.includes("mensagem")
  )
}

function buildAgencyItem(agency: AgencyRow, notifications: NotificationRow[], logs: AuditLogRow[]): MasterWhatsAppAgencyItem {
  const metadata = parseMetadata(agency.metadata)
  const contactNumber = pickString(metadata, [
    "whatsapp_number",
    "catalog_whatsapp",
    "travelpro_go_number",
    "travelpro_agent_number",
    "phone",
  ])
  const whatsappStatus = pickString(metadata, ["whatsapp_status", "whatsapp_connection_status"]) || (contactNumber ? "Configurado" : "Nao configurado")
  const goStatus = pickString(metadata, ["travelpro_go_status", "go_status"]) || "Em breve"
  const agentStatus = pickString(metadata, ["travelpro_agent_status", "agent_status"]) || "Em breve"
  const lastEventAt = [notifications[0]?.created_at, logs[0]?.created_at]
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ?? null

  return {
    agency_id: agency.id,
    agency_name: agency.name,
    agency_status: agency.status,
    whatsapp_status: whatsappStatus,
    go_status: goStatus,
    agent_status: agentStatus,
    contact_number: contactNumber,
    last_event_at: lastEventAt,
  }
}

export async function getMasterWhatsAppOverview(): Promise<MasterWhatsAppOverview> {
  const supabase = getSupabaseAdminClient()
  const [agenciesResult, notificationsResult, logsResult] = await Promise.all([
    supabase.from("agencies").select("*").order("created_at", { ascending: false }),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }),
  ])

  if (agenciesResult.error) throw agenciesResult.error
  if (notificationsResult.error) throw notificationsResult.error
  if (logsResult.error) throw logsResult.error

  const agencies = (agenciesResult.data ?? []) as AgencyRow[]
  const notifications = (notificationsResult.data ?? []) as NotificationRow[]
  const logs = (logsResult.data ?? []) as AuditLogRow[]

  const scopedNotifications = notifications.filter((item) => looksLikeWhatsappEvent(item.title) || looksLikeWhatsappEvent(item.body || "") || looksLikeWhatsappEvent(item.type))
  const scopedLogs = logs.filter((item) => looksLikeWhatsappEvent(item.action) || looksLikeWhatsappEvent(item.entity))

  const agenciesWithEvents = new Set([
    ...scopedNotifications.map((item) => item.agency_id).filter((value): value is string => Boolean(value)),
    ...scopedLogs.map((item) => item.agency_id).filter((value): value is string => Boolean(value)),
  ])

  const agencyItems = agencies
    .map((agency) =>
      buildAgencyItem(
        agency,
        scopedNotifications.filter((item) => item.agency_id === agency.id),
        scopedLogs.filter((item) => item.agency_id === agency.id),
      ),
    )
    .sort((left, right) => new Date(right.last_event_at || 0).getTime() - new Date(left.last_event_at || 0).getTime())

  return {
    summary: {
      configured_agencies: agencyItems.filter((item) => item.contact_number || item.whatsapp_status !== "Nao configurado").length,
      agencies_with_events: agenciesWithEvents.size,
      notifications_count: scopedNotifications.length,
      audit_logs_count: scopedLogs.length,
    },
    agencies: agencyItems,
    notifications: scopedNotifications.slice(0, 20),
    logs: scopedLogs.slice(0, 20),
  }
}
