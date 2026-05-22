import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyRow, AuditLogRow, Json, ReportRow } from "@/types/database"
import type { MasterReportDetail, MasterReportItem, MasterReportOverview } from "@/types/master"

function parseFilters(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, Json | undefined>
}

function resolveOrigin(report: ReportRow) {
  const filters = parseFilters(report.filters)
  if (typeof filters.origin === "string" && filters.origin.trim()) return filters.origin
  if (typeof filters.financeFilter === "string" && filters.financeFilter.trim()) return "Financeiro"
  if (!report.agency_id) return "Master"
  return "Operacional"
}

function mapReportItem(report: ReportRow, agenciesById: Map<string, AgencyRow>): MasterReportItem {
  return {
    id: report.id,
    name: report.name,
    type: report.type,
    status: report.status,
    agency_id: report.agency_id,
    agency_name: report.agency_id ? agenciesById.get(report.agency_id)?.name ?? null : null,
    origin: resolveOrigin(report),
    created_at: report.created_at,
    updated_at: report.updated_at,
    result_path: report.result_path,
  }
}

function matchesReportSearch(item: MasterReportItem, search?: string) {
  const normalized = search?.trim().toLowerCase()
  if (!normalized) return true
  return (
    item.name.toLowerCase().includes(normalized) ||
    item.type.toLowerCase().includes(normalized) ||
    item.status.toLowerCase().includes(normalized) ||
    item.origin.toLowerCase().includes(normalized) ||
    (item.agency_name || "").toLowerCase().includes(normalized)
  )
}

function matchesReportType(item: MasterReportItem, type?: string) {
  const normalized = type?.trim().toLowerCase()
  if (!normalized || normalized === "todos") return true
  return item.type.toLowerCase().includes(normalized)
}

function matchesReportStatus(item: MasterReportItem, status?: string) {
  const normalized = status?.trim().toLowerCase()
  if (!normalized || normalized === "todos") return true
  return item.status.toLowerCase().includes(normalized)
}

function buildPreviewLines(report: ReportRow) {
  const filters = parseFilters(report.filters)
  const preview = filters.preview
  if (preview && typeof preview === "object" && !Array.isArray(preview)) {
    const lines = (preview as Record<string, Json | undefined>).lines
    if (Array.isArray(lines)) {
      return lines.filter((item): item is string => typeof item === "string").slice(0, 4)
    }
  }
  return []
}

export async function listMasterReports(options?: {
  search?: string
  type?: string
  status?: string
}): Promise<MasterReportOverview> {
  const supabase = getSupabaseAdminClient()
  const [reportsResult, agenciesResult, auditsResult] = await Promise.all([
    supabase.from("reports").select("*").order("created_at", { ascending: false }),
    supabase.from("agencies").select("*"),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }),
  ])

  if (reportsResult.error) throw reportsResult.error
  if (agenciesResult.error) throw agenciesResult.error
  if (auditsResult.error) throw auditsResult.error

  const reports = (reportsResult.data ?? []) as ReportRow[]
  const agencies = (agenciesResult.data ?? []) as AgencyRow[]
  const audits = (auditsResult.data ?? []) as AuditLogRow[]
  const agenciesById = new Map(agencies.map((agency) => [agency.id, agency]))

  const items = reports
    .map((report) => mapReportItem(report, agenciesById))
    .filter((item) => matchesReportSearch(item, options?.search) && matchesReportType(item, options?.type) && matchesReportStatus(item, options?.status))

  const byTypeMap = new Map<string, number>()
  const byAgencyMap = new Map<string, { agency_id: string | null; agency_name: string; count: number }>()

  for (const item of items) {
    byTypeMap.set(item.type, (byTypeMap.get(item.type) || 0) + 1)
    const agencyKey = item.agency_id || "master"
    const agencyLabel = item.agency_name || "TravelPro Master"
    const current = byAgencyMap.get(agencyKey)
    byAgencyMap.set(agencyKey, {
      agency_id: item.agency_id,
      agency_name: agencyLabel,
      count: (current?.count || 0) + 1,
    })
  }

  const exportCount = audits.filter((item) => {
    const action = item.action.toLowerCase()
    const entity = item.entity.toLowerCase()
    return (action.includes("export") || action.includes("download")) && entity.includes("report")
  }).length

  const recentActivity = items.slice(0, 12)

  return {
    summary: {
      total: items.length,
      agencies_with_reports: new Set(items.map((item) => item.agency_id).filter(Boolean)).size,
      export_count: exportCount,
      recent_count: recentActivity.length,
    },
    by_type: [...byTypeMap.entries()].map(([label, count]) => ({ label, count })).sort((left, right) => right.count - left.count),
    by_agency: [...byAgencyMap.values()].sort((left, right) => right.count - left.count).slice(0, 8),
    recent_reports: recentActivity,
    items,
  }
}

export async function getMasterReportById(id: string): Promise<MasterReportDetail | null> {
  const supabase = getSupabaseAdminClient()
  const [reportResult, agenciesResult] = await Promise.all([
    supabase.from("reports").select("*").eq("id", id).maybeSingle(),
    supabase.from("agencies").select("*"),
  ])

  if (reportResult.error) throw reportResult.error
  if (agenciesResult.error) throw agenciesResult.error

  const report = (reportResult.data as ReportRow | null) ?? null
  if (!report) return null

  const agencies = (agenciesResult.data ?? []) as AgencyRow[]
  const agenciesById = new Map(agencies.map((agency) => [agency.id, agency]))

  return {
    ...mapReportItem(report, agenciesById),
    preview_lines: buildPreviewLines(report),
  }
}
