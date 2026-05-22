import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { decorateDocumentMetadata, normalizeDocumentType } from "@/lib/documents/document-kind"
import type { AgencyAccessContext, DocumentRow } from "@/types/database"
import type { DocumentInput } from "@/types/document"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

function ensureAgencyContext(context: AgencyAccessContext) {
  if (!context.isMaster && !context.agencyId) {
    throw new Error("Sua sessão não possui uma agência vinculada para operar documentos.")
  }
}

export async function listDocuments(context: AgencyAccessContext) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("documents").select("*").order("created_at", { ascending: false })
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as DocumentRow[]
}

export async function getDocumentById(context: AgencyAccessContext, id: string) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("documents").select("*").eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return (data as DocumentRow | null) ?? null
}

export async function createDocument(context: AgencyAccessContext, input: DocumentInput) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  const canonicalType = normalizeDocumentType(input.type)
  const { data, error } = await supabase
    .from("documents")
    .insert({
      agency_id: context.agencyId,
      user_id: context.userId,
      client_id: input.client_id ?? null,
      trip_id: input.trip_id ?? null,
      title: input.title,
      type: canonicalType,
      status: input.status ?? "Rascunho",
      storage_bucket: input.storage_bucket ?? null,
      storage_path: input.storage_path ?? null,
      metadata: decorateDocumentMetadata(input.metadata, canonicalType),
    })
    .select("*")
    .single()
  if (error) throw error
  return data as DocumentRow
}

export async function updateDocument(context: AgencyAccessContext, id: string, input: Partial<DocumentInput>) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  const canonicalType = input.type !== undefined ? normalizeDocumentType(input.type) : undefined
  let query = supabase
    .from("documents")
    .update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(canonicalType !== undefined ? { type: canonicalType } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.client_id !== undefined ? { client_id: input.client_id } : {}),
      ...(input.trip_id !== undefined ? { trip_id: input.trip_id } : {}),
      ...(input.storage_bucket !== undefined ? { storage_bucket: input.storage_bucket } : {}),
      ...(input.storage_path !== undefined ? { storage_path: input.storage_path } : {}),
      ...(input.metadata !== undefined ? { metadata: decorateDocumentMetadata(input.metadata, canonicalType ?? "Documento geral") } : {}),
    })
    .eq("id", id)
  query = withAgencyScope(query, context)
  const { data, error } = await query.select("*").single()
  if (error) throw error
  return data as DocumentRow
}

export async function deleteDocument(context: AgencyAccessContext, id: string) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("documents").delete().eq("id", id)
  query = withAgencyScope(query, context)
  const { error } = await query
  if (error) throw error
  return { success: true }
}
