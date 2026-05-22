import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyRow, AuditLogRow, DocumentRow, Json } from "@/types/database"
import type {
  MasterTemplateDetail,
  MasterTemplateInput,
  MasterTemplateItem,
  MasterTemplateOverview,
  MasterTemplateType,
} from "@/types/master"

function parseMetadata(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, Json | undefined>
}

function normalize(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function isTemplateDocument(row: DocumentRow) {
  return normalize(row.type) === "template"
}

function resolveTemplateType(row: DocumentRow): MasterTemplateType {
  const metadata = parseMetadata(row.metadata)
  const explicit = typeof metadata.template_type === "string" ? metadata.template_type : null
  const fallback = typeof metadata.template === "string" ? metadata.template : null
  const value = normalize(explicit || fallback || row.title)

  if (value.includes("roteiro")) return "Roteiro"
  if (value.includes("cot")) return "Cotacao"
  if (value.includes("relatorio")) return "Relatorio"
  if (value.includes("catalog")) return "Catalogo"
  return "Documento"
}

function buildTemplateMetadata(input: MasterTemplateInput) {
  return {
    template_type: input.template_type,
    category: input.category ?? null,
    description: input.description ?? null,
    version: input.version ?? null,
    pricing_tier: input.pricing_tier ?? null,
    file_name: input.file_name ?? null,
    is_official: input.is_official ?? false,
    compatibilities: input.compatibilities ?? [],
    customizable_fields: input.customizable_fields ?? [],
    variables: input.variables ?? [],
  }
}

function mapTemplateItem(row: DocumentRow, agenciesById: Map<string, AgencyRow>): MasterTemplateItem {
  const metadata = parseMetadata(row.metadata)

  return {
    id: row.id,
    agency_id: row.agency_id,
    agency_name: agenciesById.get(row.agency_id)?.name ?? null,
    title: row.title,
    status: row.status,
    template_type: resolveTemplateType(row),
    category: typeof metadata.category === "string" ? metadata.category : null,
    description: typeof metadata.description === "string" ? metadata.description : null,
    version: typeof metadata.version === "string" ? metadata.version : null,
    pricing_tier: typeof metadata.pricing_tier === "string" ? metadata.pricing_tier : null,
    file_name: typeof metadata.file_name === "string" ? metadata.file_name : null,
    is_official: metadata.is_official === true,
    compatibilities: Array.isArray(metadata.compatibilities) ? metadata.compatibilities.filter((item): item is string => typeof item === "string") : [],
    customizable_fields: Array.isArray(metadata.customizable_fields) ? metadata.customizable_fields.filter((item): item is string => typeof item === "string") : [],
    updated_at: row.updated_at,
    created_at: row.created_at,
  }
}

function matchesTemplateSearch(item: MasterTemplateItem, search?: string) {
  const normalized = search?.trim().toLowerCase()
  if (!normalized) return true
  return (
    item.title.toLowerCase().includes(normalized) ||
    item.template_type.toLowerCase().includes(normalized) ||
    item.status.toLowerCase().includes(normalized) ||
    (item.category || "").toLowerCase().includes(normalized) ||
    (item.agency_name || "").toLowerCase().includes(normalized)
  )
}

function matchesTemplateFilter(item: MasterTemplateItem, filter?: string) {
  const normalized = filter?.trim().toLowerCase()
  if (!normalized || normalized === "todos") return true
  if (normalized === "ativos") return normalize(item.status).includes("ativo") || normalize(item.status).includes("public")
  if (normalized === "oficiais") return item.is_official
  return item.template_type.toLowerCase() === normalized
}

export async function listMasterTemplates(options?: {
  search?: string
  filter?: string
}): Promise<MasterTemplateOverview> {
  const supabase = getSupabaseAdminClient()
  const [documentsResult, agenciesResult, auditsResult] = await Promise.all([
    supabase.from("documents").select("*").order("created_at", { ascending: false }),
    supabase.from("agencies").select("*"),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }),
  ])

  if (documentsResult.error) throw documentsResult.error
  if (agenciesResult.error) throw agenciesResult.error
  if (auditsResult.error) throw auditsResult.error

  const documents = ((documentsResult.data ?? []) as DocumentRow[]).filter(isTemplateDocument)
  const agencies = (agenciesResult.data ?? []) as AgencyRow[]
  const audits = (auditsResult.data ?? []) as AuditLogRow[]
  const agenciesById = new Map(agencies.map((agency) => [agency.id, agency]))

  const items = documents
    .map((row) => mapTemplateItem(row, agenciesById))
    .filter((item) => matchesTemplateSearch(item, options?.search) && matchesTemplateFilter(item, options?.filter))

  const byTypeMap = new Map<string, number>()
  for (const item of items) {
    byTypeMap.set(item.template_type, (byTypeMap.get(item.template_type) || 0) + 1)
  }

  const recentActivity = audits
    .filter((item) => normalize(item.entity).includes("template") || normalize(item.action).includes("template"))
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      title: item.action,
      description: item.entity,
      created_at: item.created_at,
    }))

  return {
    summary: {
      total: items.length,
      active: items.filter((item) => normalize(item.status).includes("ativo") || normalize(item.status).includes("public")).length,
      official: items.filter((item) => item.is_official).length,
      agencies_using: new Set(items.map((item) => item.agency_id)).size,
    },
    by_type: [...byTypeMap.entries()].map(([label, count]) => ({ label, count })).sort((left, right) => right.count - left.count),
    recent_activity: recentActivity,
    items,
  }
}

export async function getMasterTemplateById(id: string): Promise<MasterTemplateDetail | null> {
  const supabase = getSupabaseAdminClient()
  const [documentResult, agenciesResult, auditsResult] = await Promise.all([
    supabase.from("documents").select("*").eq("id", id).maybeSingle(),
    supabase.from("agencies").select("*"),
    supabase.from("audit_logs").select("*").eq("entity_id", id).order("created_at", { ascending: false }),
  ])

  if (documentResult.error) throw documentResult.error
  if (agenciesResult.error) throw agenciesResult.error
  if (auditsResult.error) throw auditsResult.error

  const row = (documentResult.data as DocumentRow | null) ?? null
  if (!row || !isTemplateDocument(row)) return null

  const agencies = (agenciesResult.data ?? []) as AgencyRow[]
  const agenciesById = new Map(agencies.map((agency) => [agency.id, agency]))
  const metadata = parseMetadata(row.metadata)

  return {
    ...mapTemplateItem(row, agenciesById),
    variables: Array.isArray(metadata.variables) ? metadata.variables.filter((item): item is string => typeof item === "string") : [],
    audit_logs: (auditsResult.data ?? []) as AuditLogRow[],
  }
}

export async function createMasterTemplate(userId: string, input: MasterTemplateInput) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("documents")
    .insert({
      agency_id: input.agency_id,
      user_id: userId,
      client_id: null,
      trip_id: null,
      title: input.title,
      type: "Template",
      status: input.status ?? "Rascunho",
      storage_bucket: null,
      storage_path: null,
      metadata: buildTemplateMetadata(input),
    })
    .select("*")
    .single()

  if (error) throw error
  return data as DocumentRow
}

export async function updateMasterTemplate(id: string, input: Partial<MasterTemplateInput>) {
  const supabase = getSupabaseAdminClient()
  const { data: current, error: currentError } = await supabase.from("documents").select("*").eq("id", id).maybeSingle()
  if (currentError) throw currentError
  if (!current) return null

  const currentMetadata = parseMetadata(current.metadata)
  const nextMetadata = {
    ...currentMetadata,
    ...(input.template_type !== undefined ? { template_type: input.template_type } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.version !== undefined ? { version: input.version } : {}),
    ...(input.pricing_tier !== undefined ? { pricing_tier: input.pricing_tier } : {}),
    ...(input.file_name !== undefined ? { file_name: input.file_name } : {}),
    ...(input.is_official !== undefined ? { is_official: input.is_official } : {}),
    ...(input.compatibilities !== undefined ? { compatibilities: input.compatibilities } : {}),
    ...(input.customizable_fields !== undefined ? { customizable_fields: input.customizable_fields } : {}),
    ...(input.variables !== undefined ? { variables: input.variables } : {}),
  }

  const { data, error } = await supabase
    .from("documents")
    .update({
      ...(input.agency_id !== undefined ? { agency_id: input.agency_id } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      metadata: nextMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw error
  return data as DocumentRow
}
