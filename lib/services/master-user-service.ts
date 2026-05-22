import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AgencyRow, AuditLogRow, ProfileRow } from "@/types/database"
import type { MasterUserDetail, MasterUserInput, MasterUserListItem, MasterUserOverview } from "@/types/master"

function isActiveStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized === "active" || normalized === "ativa" || normalized === "ativo"
}

function mapMasterUserItem(
  profile: ProfileRow,
  agenciesById: Map<string, AgencyRow>,
  memberByProfileId: Map<string, { role: string; status: string }>,
  auditLogs: AuditLogRow[],
): MasterUserListItem {
  const member = memberByProfileId.get(profile.id)
  const agency = profile.agency_id ? agenciesById.get(profile.agency_id) : null
  const userAuditLogs = auditLogs.filter((item) => item.user_id === profile.user_id)

  return {
    id: profile.id,
    user_id: profile.user_id,
    full_name: profile.full_name,
    email: profile.email,
    role: profile.role,
    status: profile.status,
    phone: profile.phone,
    agency_id: profile.agency_id,
    agency_name: agency?.name ?? null,
    member_role: member?.role ?? null,
    member_status: member?.status ?? null,
    last_activity_at: userAuditLogs[0]?.created_at ?? null,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  }
}

async function loadMasterUserDependencies() {
  const supabase = getSupabaseAdminClient()
  const [profilesResult, agenciesResult, membersResult, auditLogsResult] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("agencies").select("*"),
    supabase.from("agency_members").select("profile_id, role, status"),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }),
  ])

  if (profilesResult.error) throw profilesResult.error
  if (agenciesResult.error) throw agenciesResult.error
  if (membersResult.error) throw membersResult.error
  if (auditLogsResult.error) throw auditLogsResult.error

  return {
    profiles: (profilesResult.data ?? []) as ProfileRow[],
    agencies: (agenciesResult.data ?? []) as AgencyRow[],
    members: (membersResult.data ?? []) as Array<{ profile_id: string | null; role: string; status: string }>,
    auditLogs: (auditLogsResult.data ?? []) as AuditLogRow[],
  }
}

export async function listMasterUsers(options?: { search?: string; role?: string }): Promise<MasterUserOverview> {
  const { profiles, agencies, members, auditLogs } = await loadMasterUserDependencies()
  const agenciesById = new Map(agencies.map((agency) => [agency.id, agency]))
  const memberByProfileId = new Map(
    members.filter((item) => Boolean(item.profile_id)).map((item) => [item.profile_id as string, { role: item.role, status: item.status }]),
  )

  const items = profiles
    .map((profile) => mapMasterUserItem(profile, agenciesById, memberByProfileId, auditLogs))
    .filter((item) => {
      const search = options?.search?.trim().toLowerCase()
      const role = options?.role?.trim().toLowerCase()
      const matchesSearch =
        !search ||
        (item.full_name || "").toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search) ||
        (item.agency_name || "").toLowerCase().includes(search)
      const matchesRole = !role || role === "todos" || item.role.toLowerCase() === role
      return matchesSearch && matchesRole
    })

  return {
    items,
    summary: {
      total: items.length,
      active: items.filter((item) => isActiveStatus(item.status)).length,
      masters: items.filter((item) => item.role.toLowerCase() === "master").length,
      agency_linked: items.filter((item) => Boolean(item.agency_id)).length,
    },
  }
}

export async function getMasterUserById(id: string): Promise<MasterUserDetail | null> {
  const { profiles, agencies, members, auditLogs } = await loadMasterUserDependencies()
  const profile = profiles.find((item) => item.id === id)
  if (!profile) return null

  const agenciesById = new Map(agencies.map((agency) => [agency.id, agency]))
  const memberByProfileId = new Map(
    members.filter((item) => Boolean(item.profile_id)).map((item) => [item.profile_id as string, { role: item.role, status: item.status }]),
  )
  const userAuditLogs = auditLogs.filter((item) => item.user_id === profile.user_id)

  return {
    ...mapMasterUserItem(profile, agenciesById, memberByProfileId, auditLogs),
    audit_logs: userAuditLogs.slice(0, 20),
  }
}

export async function updateMasterUser(id: string, input: MasterUserInput) {
  const supabase = getSupabaseAdminClient()
  const { data: currentProfile, error: currentError } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle()
  if (currentError) throw currentError
  if (!currentProfile) return null

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw error

  const role = input.role ?? currentProfile.role
  const status = input.status ?? currentProfile.status

  if (currentProfile.user_id) {
    const memberUpdate = await supabase
      .from("agency_members")
      .update({
        role,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", currentProfile.user_id)

    if (memberUpdate.error) throw memberUpdate.error
  }

  return data as ProfileRow
}
