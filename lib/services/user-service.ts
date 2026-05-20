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
  const isAgencyRole = input.role === AUTH_ROLES.AGENCY_ADMIN || input.role === AUTH_ROLES.AGENCY_USER

  let agency: { id: string; name: string; slug: string } | null = null
  let agencyId: string | null = existingProfile?.agency_id ?? null

  if (!agencyId && isAgencyRole) {
    const { data: member, error: memberLookupError } = await supabase
      .from("agency_members")
      .select("agency_id")
      .eq("user_id", input.userId)
      .maybeSingle()

    if (memberLookupError) throw memberLookupError
    agencyId = member?.agency_id ?? null
  }

  if (!agencyId && isAgencyRole) {
    agency = await createAgencyForUser({
      agencyName: input.agencyName || `${input.fullName} Agência`,
      ownerName: input.fullName,
      ownerEmail: input.email,
      phone: input.phone ?? null,
    })
    agencyId = agency.id
  }

  const profile = await upsertProfile({
    userId: input.userId,
    email: input.email,
    fullName: input.fullName,
    phone: input.phone ?? null,
    role: input.role,
    agencyId,
  })

  if (isAgencyRole && agencyId) {
    const { error: memberError } = await supabase.from("agency_members").upsert(
      {
        agency_id: agencyId,
        user_id: input.userId,
        profile_id: profile.id,
        role: input.role,
        status: "active",
      },
      { onConflict: "agency_id,user_id" },
    )

    if (memberError) throw memberError
  }

  if (input.role === AUTH_ROLES.CLIENT && agencyId) {
    const { data: existingClient, error: clientLookupError } = await supabase
      .from("clients")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle()

    if (clientLookupError) throw clientLookupError

    if (!existingClient) {
      const { error: clientError } = await supabase.from("clients").insert({
        profile_id: profile.id,
        agency_id: agencyId,
        name: input.fullName,
        email: input.email,
        phone: input.phone ?? null,
        status: "active",
      })

      if (clientError) throw clientError
    }
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

  return { profile, agency, bootstrapped: !existingProfile }
}
