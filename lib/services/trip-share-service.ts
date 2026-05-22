import { randomBytes } from "node:crypto"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type {
  AgencyAccessContext,
  AgencyRow,
  AuditLogRow,
  ClientRow,
  DocumentRow,
  ItineraryRow,
  Json,
  TripRow,
  TripShareLinkRow,
} from "@/types/database"
import type { PublicTripExperienceData, TripShareLinkSummary } from "@/types/trip-share"

function withAgencyScope<T extends { eq: (...args: unknown[]) => T }>(query: T, context: AgencyAccessContext, column = "agency_id") {
  if (context.isMaster || !context.agencyId) return query
  return query.eq(column, context.agencyId)
}

function ensureAgencyContext(context: AgencyAccessContext) {
  if (!context.isMaster && !context.agencyId) {
    throw new Error("Sua sessão não possui uma agência vinculada para compartilhar viagens.")
  }
}

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

function buildShareUrl(token: string) {
  return `/v/${token}`
}

function isExpired(link: TripShareLinkRow) {
  if (!link.expires_at) return false
  return new Date(link.expires_at).getTime() < Date.now()
}

function buildShareSummary(link: TripShareLinkRow): TripShareLinkSummary {
  return {
    token: link.token,
    is_active: link.is_active,
    expires_at: link.expires_at,
    view_count: link.view_count,
    last_viewed_at: link.last_viewed_at,
    public_url: buildShareUrl(link.token),
  }
}

function formatDateLabel(value?: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

function formatDateTimeLabel(value?: string | null) {
  if (!value) return "Agora"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

function buildPeriodLabel(trip: TripRow) {
  const startsAt = formatDateLabel(trip.starts_at)
  const endsAt = formatDateLabel(trip.ends_at)
  if (startsAt && endsAt) return `${startsAt} - ${endsAt}`
  if (startsAt) return `A partir de ${startsAt}`
  if (endsAt) return `Até ${endsAt}`
  return "Período em definição"
}

function isSafePublicUrl(value: string | null | undefined) {
  return typeof value === "string" && /^https?:\/\//i.test(value)
}

function isPublicDocumentStatus(status: string) {
  const normalizedStatus = normalize(status)
  return !normalizedStatus.includes("draft") && !normalizedStatus.includes("rascun")
}

function isPublicDocumentType(type: string) {
  const normalizedType = normalize(type)
  return ["voucher", "passagem", "seguro", "roteiro", "contrato", "proposta", "cotacao"].some((item) => normalizedType.includes(item))
}

function buildDocumentNote(document: DocumentRow) {
  const metadata = parseMetadata(document.metadata)
  if (typeof metadata.public_note === "string" && metadata.public_note.trim()) return metadata.public_note.trim()
  if (typeof metadata.summary === "string" && metadata.summary.trim()) return metadata.summary.trim()
  if (typeof metadata.variables === "string" && metadata.variables.trim()) return metadata.variables.trim()

  const normalizedType = normalize(document.type)
  if (normalizedType.includes("voucher")) return "Voucher liberado para consulta e apresentação durante a viagem."
  if (normalizedType.includes("passagem")) return "Passagem vinculada à viagem e pronta para consulta."
  if (normalizedType.includes("seguro")) return "Cobertura e dados essenciais do seguro disponíveis para conferência."
  if (normalizedType.includes("contrato")) return "Documento contratual disponível para consulta."
  if (normalizedType.includes("roteiro")) return "Roteiro compartilhado pela agência para acompanhar a viagem."
  if (normalizedType.includes("proposta") || normalizedType.includes("cotacao")) return "Proposta compartilhada pela agência neste link seguro."
  return "Documento disponível nesta experiência compartilhável."
}

function buildAgencyBranding(agency: AgencyRow | null) {
  const metadata = parseMetadata(agency?.metadata)

  return {
    name:
      (typeof metadata.catalog_name === "string" && metadata.catalog_name.trim()) ||
      agency?.name ||
      "Agência TravelPro",
    owner_name: agency?.owner_name ?? null,
    phone:
      (typeof metadata.catalog_phone === "string" && metadata.catalog_phone.trim()) ||
      agency?.phone ||
      null,
    email: agency?.owner_email ?? null,
    logo_url: typeof metadata.catalog_logo_url === "string" && metadata.catalog_logo_url.trim() ? metadata.catalog_logo_url : null,
    banner_url: typeof metadata.catalog_banner_url === "string" && metadata.catalog_banner_url.trim() ? metadata.catalog_banner_url : null,
    primary_color:
      typeof metadata.catalog_primary_color === "string" && metadata.catalog_primary_color.trim() ? metadata.catalog_primary_color : null,
    visual_style:
      typeof metadata.catalog_visual_style === "string" && metadata.catalog_visual_style.trim() ? metadata.catalog_visual_style : null,
  }
}

function buildChecklist(trip: TripRow, itinerary: ItineraryRow[], documents: DocumentRow[], agency: AgencyRow | null) {
  return [
    { key: "trip-status", label: "Viagem com status atualizado", done: Boolean(trip.status?.trim()) },
    { key: "trip-summary", label: "Resumo da viagem disponível", done: Boolean(trip.summary?.trim()) },
    { key: "trip-itinerary", label: "Roteiro organizado", done: itinerary.length > 0 },
    { key: "trip-documents", label: "Documentos liberados", done: documents.length > 0 },
    { key: "trip-contact", label: "Contato da agência pronto", done: Boolean(agency?.phone || agency?.owner_email) },
  ]
}

function buildFallbackUpdates(trip: TripRow, itinerary: ItineraryRow[], documents: DocumentRow[]) {
  const updates: PublicTripExperienceData["updates"] = []

  updates.push({
    key: "trip-updated",
    title: "Resumo da viagem atualizado",
    detail: trip.summary?.trim() || "A agência preparou esta jornada compartilhável para acompanhar sua viagem com mais clareza.",
    time_label: formatDateTimeLabel(trip.updated_at),
  })

  if (documents[0]) {
    updates.push({
      key: `document-${documents[0].id}`,
      title: `${documents[0].type} disponível`,
      detail: buildDocumentNote(documents[0]),
      time_label: formatDateTimeLabel(documents[0].updated_at),
    })
  }

  if (itinerary[0]) {
    updates.push({
      key: `itinerary-${itinerary[0].id}`,
      title: "Roteiro organizado",
      detail: itinerary[0].description?.trim() || itinerary[0].title,
      time_label: formatDateTimeLabel(itinerary[0].updated_at),
    })
  }

  return updates
}

function buildAuditUpdates(tripId: string, logs: AuditLogRow[], documents: DocumentRow[], itinerary: ItineraryRow[]) {
  const documentIds = new Set(documents.map((item) => item.id))
  const itineraryIds = new Set(itinerary.map((item) => item.id))

  return logs
    .filter((log) => {
      if (log.entity === "trips" && log.entity_id) return log.entity_id === tripId
      if (log.entity === "documents" && log.entity_id) return documentIds.has(log.entity_id)
      if (log.entity === "itineraries" && log.entity_id) return itineraryIds.has(log.entity_id)
      return false
    })
    .slice(0, 5)
    .map((log, index) => ({
      key: `${log.entity}-${log.entity_id || index}-${log.created_at}`,
      title:
        log.entity === "documents"
          ? "Documento atualizado"
          : log.entity === "itineraries"
            ? "Roteiro atualizado"
            : "Viagem atualizada",
      detail: `A agência registrou uma atualização em ${log.entity} para esta viagem.`,
      time_label: formatDateTimeLabel(log.created_at),
    }))
}

function generateToken() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(9)
  let token = ""
  for (const byte of bytes) {
    token += alphabet[byte % alphabet.length]
  }
  return token
}

async function getTripOwnedByContext(context: AgencyAccessContext, tripId: string) {
  ensureAgencyContext(context)
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("trips").select("*").eq("id", tripId)
  query = withAgencyScope(query, context)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return (data as TripRow | null) ?? null
}

async function getLatestShareLink(context: AgencyAccessContext, tripId: string) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from("trip_share_links").select("*").eq("trip_id", tripId).order("created_at", { ascending: false }).limit(1)
  query = withAgencyScope(query, context)
  const { data, error } = await query
  if (error) throw error
  return ((data ?? [])[0] as TripShareLinkRow | undefined) ?? null
}

async function insertShareLink(trip: TripRow) {
  const supabase = getSupabaseAdminClient()

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = generateToken()
    const { data, error } = await supabase
      .from("trip_share_links")
      .insert({
        agency_id: trip.agency_id,
        trip_id: trip.id,
        client_id: trip.client_id ?? null,
        token,
        is_active: true,
      })
      .select("*")
      .single()

    if (!error && data) {
      return data as TripShareLinkRow
    }

    if (!error || !("code" in error) || error.code !== "23505") {
      throw error
    }
  }

  throw new Error("Não foi possível gerar um token único para compartilhar a viagem.")
}

export async function getTripShareLink(context: AgencyAccessContext, tripId: string) {
  const trip = await getTripOwnedByContext(context, tripId)
  if (!trip) return null
  const link = await getLatestShareLink(context, tripId)
  return link ? buildShareSummary(link) : null
}

export async function createOrReuseTripShareLink(context: AgencyAccessContext, tripId: string) {
  const trip = await getTripOwnedByContext(context, tripId)
  if (!trip) {
    throw new Error("Viagem não encontrada para compartilhar.")
  }

  const currentLink = await getLatestShareLink(context, tripId)
  const supabase = getSupabaseAdminClient()

  if (currentLink && currentLink.is_active && !isExpired(currentLink)) {
    return buildShareSummary(currentLink)
  }

  if (currentLink) {
    const { data, error } = await supabase
      .from("trip_share_links")
      .update({
        is_active: true,
        expires_at: null,
        client_id: trip.client_id ?? null,
      })
      .eq("token", currentLink.token)
      .select("*")
      .single()

    if (error) throw error
    return buildShareSummary(data as TripShareLinkRow)
  }

  const createdLink = await insertShareLink(trip)
  return buildShareSummary(createdLink)
}

export async function updateTripShareLinkState(
  context: AgencyAccessContext,
  tripId: string,
  input: { is_active?: boolean; expires_at?: string | null },
) {
  const trip = await getTripOwnedByContext(context, tripId)
  if (!trip) {
    throw new Error("Viagem não encontrada para atualizar o link compartilhável.")
  }

  const currentLink = await getLatestShareLink(context, tripId)
  if (!currentLink) {
    if (input.is_active === true) {
      return createOrReuseTripShareLink(context, tripId)
    }
    throw new Error("Ainda não existe link compartilhável para esta viagem.")
  }

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("trip_share_links")
    .update({
      ...(input.is_active !== undefined ? { is_active: input.is_active } : {}),
      ...(input.expires_at !== undefined ? { expires_at: input.expires_at } : {}),
      client_id: trip.client_id ?? null,
    })
    .eq("token", currentLink.token)
    .select("*")
    .single()

  if (error) throw error
  return buildShareSummary(data as TripShareLinkRow)
}

export async function getPublicTripExperienceByToken(token: string, options?: { incrementView?: boolean }): Promise<PublicTripExperienceData> {
  const normalizedToken = token.trim().toUpperCase()
  const supabase = getSupabaseAdminClient()

  const { data: linkData, error: linkError } = await supabase.from("trip_share_links").select("*").eq("token", normalizedToken).maybeSingle()
  if (linkError) throw linkError

  const link = (linkData as TripShareLinkRow | null) ?? null

  if (!link) {
    return {
      status: "missing",
      token: normalizedToken,
      share_url: buildShareUrl(normalizedToken),
      view_count: 0,
      trip: null,
      client: null,
      agency: null,
      itinerary: [],
      documents: [],
      updates: [],
      checklist: [],
      viewed_at: null,
    }
  }

  if (!link.is_active) {
    return {
      status: "inactive",
      token: link.token,
      share_url: buildShareUrl(link.token),
      view_count: link.view_count,
      trip: null,
      client: null,
      agency: null,
      itinerary: [],
      documents: [],
      updates: [],
      checklist: [],
      viewed_at: link.last_viewed_at,
    }
  }

  if (isExpired(link)) {
    return {
      status: "expired",
      token: link.token,
      share_url: buildShareUrl(link.token),
      view_count: link.view_count,
      trip: null,
      client: null,
      agency: null,
      itinerary: [],
      documents: [],
      updates: [],
      checklist: [],
      viewed_at: link.last_viewed_at,
    }
  }

  const [tripResult, agencyResult, clientResult, itineraryResult, documentsResult, logsResult] = await Promise.all([
    supabase.from("trips").select("*").eq("id", link.trip_id).maybeSingle(),
    supabase.from("agencies").select("*").eq("id", link.agency_id).maybeSingle(),
    link.client_id ? supabase.from("clients").select("*").eq("id", link.client_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    supabase.from("itineraries").select("*").eq("trip_id", link.trip_id).order("day_index", { ascending: true }),
    supabase.from("documents").select("*").eq("trip_id", link.trip_id).order("created_at", { ascending: false }),
    supabase.from("audit_logs").select("*").eq("agency_id", link.agency_id).in("entity", ["trips", "documents", "itineraries"]).order("created_at", { ascending: false }).limit(12),
  ])

  if (tripResult.error) throw tripResult.error
  if (agencyResult.error) throw agencyResult.error
  if (clientResult.error) throw clientResult.error
  if (itineraryResult.error) throw itineraryResult.error
  if (documentsResult.error) throw documentsResult.error
  if (logsResult.error) throw logsResult.error

  const trip = (tripResult.data as TripRow | null) ?? null
  const agency = (agencyResult.data as AgencyRow | null) ?? null
  const client = (clientResult.data as ClientRow | null) ?? null
  const itinerary = (itineraryResult.data ?? []) as ItineraryRow[]
  const publicDocuments = ((documentsResult.data ?? []) as DocumentRow[]).filter(
    (document) => isPublicDocumentStatus(document.status) && isPublicDocumentType(document.type),
  )
  const logs = (logsResult.data ?? []) as AuditLogRow[]

  if (!trip || trip.agency_id !== link.agency_id) {
    return {
      status: "missing",
      token: link.token,
      share_url: buildShareUrl(link.token),
      view_count: link.view_count,
      trip: null,
      client: null,
      agency: buildAgencyBranding(agency),
      itinerary: [],
      documents: [],
      updates: [],
      checklist: [],
      viewed_at: link.last_viewed_at,
    }
  }

  if (options?.incrementView !== false) {
    void supabase
      .from("trip_share_links")
      .update({
        view_count: link.view_count + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq("token", link.token)
  }

  const updates = buildAuditUpdates(trip.id, logs, publicDocuments, itinerary)
  const branding = buildAgencyBranding(agency)

  return {
    status: "available",
    token: link.token,
    share_url: buildShareUrl(link.token),
    view_count: link.view_count + (options?.incrementView === false ? 0 : 1),
    trip: {
      destination: trip.destination,
      status: trip.status,
      period_label: buildPeriodLabel(trip),
      summary: trip.summary,
      origin: trip.origin,
      starts_at: trip.starts_at,
      ends_at: trip.ends_at,
    },
    client: {
      name: client?.name ?? null,
    },
    agency: branding,
    itinerary: itinerary.map((item) => ({
      key: `${item.day_index}-${item.title}-${item.created_at}`,
      day_label: `Dia ${item.day_index}`,
      title: item.title,
      time_label: item.activity_time || null,
      note: item.description?.trim() || "Etapa planejada para esta viagem.",
      status: item.status,
    })),
    documents: publicDocuments.map((document) => {
      const metadata = parseMetadata(document.metadata)
      const publicUrl =
        (typeof metadata.public_url === "string" && isSafePublicUrl(metadata.public_url) ? metadata.public_url : null) ||
        (isSafePublicUrl(document.storage_path) ? document.storage_path : null)

      return {
        key: `${document.type}-${document.title}-${document.created_at}`,
        title: document.title,
        type: document.type,
        status: document.status,
        note: buildDocumentNote(document),
        href: publicUrl,
      }
    }),
    updates: updates.length > 0 ? updates : buildFallbackUpdates(trip, itinerary, publicDocuments),
    checklist: buildChecklist(trip, itinerary, publicDocuments, agency),
    viewed_at: link.last_viewed_at,
  }
}
