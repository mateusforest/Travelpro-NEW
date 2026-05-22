import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type {
  AgencyRow,
  AuditLogRow,
  CreditTransactionRow,
  Json,
  PaymentRow,
  ProfileRow,
  SubscriptionRow,
} from "@/types/database"
import type {
  MasterAgencyDetail,
  MasterAgencyInput,
  MasterAgencyListItem,
  MasterAgencyOverview,
} from "@/types/master"

function parseMetadata(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, Json | undefined>
}

function slugifyAgencyValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function signedCreditAmount(row: CreditTransactionRow) {
  const normalizedType = row.type.toLowerCase()
  if (normalizedType.includes("grant") || normalizedType.includes("bonus") || normalizedType.includes("credit") || normalizedType.includes("entrada")) return Number(row.amount || 0)
  if (normalizedType.includes("consumo") || normalizedType.includes("debit") || normalizedType.includes("uso")) return Number(row.amount || 0) * -1
  return Number(row.amount || 0)
}

function isActiveStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized === "active" || normalized === "ativa" || normalized === "ativo"
}

function isInactiveStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized === "inactive" || normalized === "inativa" || normalized === "inativo"
}

function mapAgencyItem(
  agency: AgencyRow,
  subscriptions: SubscriptionRow[],
  payments: PaymentRow[],
  credits: CreditTransactionRow[],
  members: Array<{ profile_id: string | null; role: string; status: string }>,
  profilesById: Map<string, ProfileRow>,
  auditLogs: AuditLogRow[],
): MasterAgencyListItem {
  const metadata = parseMetadata(agency.metadata)
  const latestSubscription = subscriptions
    .slice()
    .sort((left, right) => new Date(right.updated_at || right.created_at).getTime() - new Date(left.updated_at || left.created_at).getTime())[0]
  const latestPayment = payments
    .slice()
    .sort((left, right) => new Date(right.paid_at || right.created_at).getTime() - new Date(left.paid_at || left.created_at).getTime())[0]

  const memberItems = members
    .map((member) => {
      const profile = member.profile_id ? profilesById.get(member.profile_id) : null
      return profile
        ? {
            id: profile.id,
            full_name: profile.full_name || profile.email,
            email: profile.email,
            role: member.role || profile.role,
            status: member.status || profile.status,
          }
        : null
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const creditBalance = credits.reduce((sum, item) => sum + signedCreditAmount(item), 0)
  const creditsConsumed = credits.reduce((sum, item) => {
    const signed = signedCreditAmount(item)
    return signed < 0 ? sum + Math.abs(signed) : sum
  }, 0)

  return {
    id: agency.id,
    name: agency.name,
    slug: agency.slug,
    owner_name: agency.owner_name,
    owner_email: agency.owner_email,
    phone: agency.phone,
    status: agency.status,
    city: typeof metadata.city === "string" ? metadata.city : null,
    requested_plan: typeof metadata.requested_plan === "string" ? metadata.requested_plan : null,
    current_plan: latestSubscription?.plan_code ?? null,
    subscription_status: latestSubscription?.status ?? null,
    subscription_price: latestSubscription?.price ?? null,
    renews_at: latestSubscription?.renews_at ?? null,
    members_count: memberItems.length,
    members: memberItems.slice(0, 5),
    credits_balance: creditBalance,
    credits_consumed: creditsConsumed,
    payments_total: payments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    last_payment_status: latestPayment?.status ?? null,
    created_at: agency.created_at,
    updated_at: agency.updated_at,
    recent_activity: auditLogs.slice(0, 5).map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      status: log.status,
      created_at: log.created_at,
    })),
  }
}

async function loadAgencyDependencies() {
  const supabase = getSupabaseAdminClient()
  const [
    agenciesResult,
    subscriptionsResult,
    paymentsResult,
    creditsResult,
    membersResult,
    profilesResult,
    auditsResult,
  ] = await Promise.all([
    supabase.from("agencies").select("*").order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("*"),
    supabase.from("payments").select("*"),
    supabase.from("credit_transactions").select("*"),
    supabase.from("agency_members").select("agency_id, profile_id, role, status"),
    supabase.from("profiles").select("*"),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }),
  ])

  if (agenciesResult.error) throw agenciesResult.error
  if (subscriptionsResult.error) throw subscriptionsResult.error
  if (paymentsResult.error) throw paymentsResult.error
  if (creditsResult.error) throw creditsResult.error
  if (membersResult.error) throw membersResult.error
  if (profilesResult.error) throw profilesResult.error
  if (auditsResult.error) throw auditsResult.error

  return {
    agencies: (agenciesResult.data ?? []) as AgencyRow[],
    subscriptions: (subscriptionsResult.data ?? []) as SubscriptionRow[],
    payments: (paymentsResult.data ?? []) as PaymentRow[],
    credits: (creditsResult.data ?? []) as CreditTransactionRow[],
    members: (membersResult.data ?? []) as Array<{ agency_id: string; profile_id: string | null; role: string; status: string }>,
    profiles: (profilesResult.data ?? []) as ProfileRow[],
    auditLogs: (auditsResult.data ?? []) as AuditLogRow[],
  }
}

export async function listMasterAgencies(options?: { search?: string; status?: string }): Promise<MasterAgencyOverview> {
  const { agencies, subscriptions, payments, credits, members, profiles, auditLogs } = await loadAgencyDependencies()
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]))

  const items = agencies
    .map((agency) =>
      mapAgencyItem(
        agency,
        subscriptions.filter((item) => item.agency_id === agency.id),
        payments.filter((item) => item.agency_id === agency.id),
        credits.filter((item) => item.agency_id === agency.id),
        members.filter((item) => item.agency_id === agency.id),
        profilesById,
        auditLogs.filter((item) => item.agency_id === agency.id),
      ),
    )
    .filter((item) => {
      const search = options?.search?.trim().toLowerCase()
      const status = options?.status?.trim().toLowerCase()
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        (item.owner_name || "").toLowerCase().includes(search) ||
        (item.owner_email || "").toLowerCase().includes(search) ||
        (item.city || "").toLowerCase().includes(search)
      const matchesStatus = !status || status === "todos" || item.status.toLowerCase() === status
      return matchesSearch && matchesStatus
    })

  return {
    items,
    summary: {
      total: items.length,
      active: items.filter((item) => isActiveStatus(item.status)).length,
      inactive: items.filter((item) => isInactiveStatus(item.status)).length,
      with_subscription: items.filter((item) => Boolean(item.current_plan)).length,
      total_credit_balance: items.reduce((sum, item) => sum + item.credits_balance, 0),
    },
  }
}

export async function getMasterAgencyById(id: string): Promise<MasterAgencyDetail | null> {
  const { agencies, subscriptions, payments, credits, members, profiles, auditLogs } = await loadAgencyDependencies()
  const agency = agencies.find((item) => item.id === id)
  if (!agency) return null

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]))
  const scopedAuditLogs = auditLogs.filter((item) => item.agency_id === agency.id)

  return {
    ...mapAgencyItem(
      agency,
      subscriptions.filter((item) => item.agency_id === agency.id),
      payments.filter((item) => item.agency_id === agency.id),
      credits.filter((item) => item.agency_id === agency.id),
      members.filter((item) => item.agency_id === agency.id),
      profilesById,
      scopedAuditLogs,
    ),
    audit_logs: scopedAuditLogs.slice(0, 20),
  }
}

export async function createMasterAgency(input: MasterAgencyInput) {
  const supabase = getSupabaseAdminClient()
  const now = new Date().toISOString()
  const baseSlug = slugifyAgencyValue(input.name)

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${Date.now().toString().slice(-4)}-${attempt}`
    const { data, error } = await supabase
      .from("agencies")
      .insert({
        name: input.name,
        slug,
        owner_name: input.owner_name ?? null,
        owner_email: input.owner_email ?? null,
        phone: input.phone ?? null,
        status: input.status ?? "active",
        metadata: {
          city: input.city ?? null,
          requested_plan: input.requested_plan ?? null,
          modules: input.modules ?? null,
          notes: input.notes ?? null,
        },
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single()

    if (!error) {
      return (data ?? null) as AgencyRow | null
    }

    if (!String(error.message ?? "").toLowerCase().includes("duplicate")) {
      throw error
    }
  }

  throw new Error("Nao foi possivel gerar um slug unico para a agencia.")
}

export async function updateMasterAgency(id: string, input: Partial<MasterAgencyInput>) {
  const supabase = getSupabaseAdminClient()
  const { data: currentAgency, error: currentError } = await supabase.from("agencies").select("*").eq("id", id).maybeSingle()
  if (currentError) throw currentError
  if (!currentAgency) return null

  const metadata = parseMetadata(currentAgency.metadata)
  const nextMetadata = {
    ...metadata,
    ...(input.city !== undefined ? { city: input.city } : {}),
    ...(input.requested_plan !== undefined ? { requested_plan: input.requested_plan } : {}),
    ...(input.modules !== undefined ? { modules: input.modules } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  }

  const { data, error } = await supabase
    .from("agencies")
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.owner_name !== undefined ? { owner_name: input.owner_name } : {}),
      ...(input.owner_email !== undefined ? { owner_email: input.owner_email } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      metadata: nextMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw error
  return data as AgencyRow
}
