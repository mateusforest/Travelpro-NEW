import { AUTH_ROLES, type AuthRole } from "@/lib/permissions/roles"
import { createAgencyForUser } from "@/lib/services/agency-service"
import { getProfileByUserId, upsertProfile } from "@/lib/services/profile-service"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

type BootstrapUserInput = {
  userId: string
  email: string
  fullName: string
  phone?: string | null
  agencyName?: string | null
  role: AuthRole
}

export async function bootstrapUserAccount(input: BootstrapUserInput) {
  const supabase = getSupabaseAdminClient()
  const existingProfile = await getProfileByUserId(input.userId)

  if (existingProfile) {
    return { profile: existingProfile, agency: null, bootstrapped: false }
  }

  let agency: { id: string; name: string; slug: string } | null = null
  let agencyId: string | null = null

  if (input.role === AUTH_ROLES.AGENCY_ADMIN || input.role === AUTH_ROLES.AGENCY_USER) {
    agency = await createAgencyForUser({
      agencyName: input.agencyName || `${input.fullName} Agência`,
      ownerName: input.fullName,
      ownerEmail: input.email,
      phone: input.phone ?? null,
    })
    agencyId = agency.id

    const { error: memberError } = await supabase.from("agency_members").insert({
      agency_id: agency.id,
      user_id: input.userId,
      role: input.role,
      status: "active",
    })

    if (memberError) throw memberError
  }

  const profile = await upsertProfile({
    userId: input.userId,
    email: input.email,
    fullName: input.fullName,
    phone: input.phone ?? null,
    role: input.role,
    agencyId,
  })

  if (input.role === AUTH_ROLES.CLIENT) {
    const { error: clientError } = await supabase.from("clients").insert({
      profile_id: profile.id,
      agency_id: null,
      name: input.fullName,
      email: input.email,
      phone: input.phone ?? null,
      status: "active",
    })

    if (clientError) throw clientError
  }

  const { error: authUpdateError } = await supabase.auth.admin.updateUserById(input.userId, {
    user_metadata: {
      role: input.role,
      full_name: input.fullName,
      agency_name: input.agencyName ?? null,
      agency_id: agencyId,
      phone: input.phone ?? null,
    },
  })

  if (authUpdateError) throw authUpdateError

  return { profile, agency, bootstrapped: true }
}
