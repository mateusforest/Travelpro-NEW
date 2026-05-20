import { getSupabaseServerClient } from "@/lib/supabase/server"
import { normalizeRole, type AuthRole } from "@/lib/permissions/roles"
import { getDefaultRouteForRole } from "@/lib/auth/redirects"
import { getProfileByUserId } from "@/lib/services/profile-service"

export type CurrentProfile = {
  id: string
  user_id: string
  agency_id: string | null
  role: AuthRole | null
  full_name: string | null
  phone: string | null
}

export async function getCurrentUser() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      profile: null,
      role: null,
      redirectTo: "/login",
    }
  }

  let profile: CurrentProfile | null = null

  try {
    const profileData = await getProfileByUserId(user.id)
    profile = profileData
      ? ({
          id: profileData.id,
          user_id: profileData.user_id,
          agency_id: profileData.agency_id,
          role: normalizeRole(profileData.role),
          full_name: profileData.full_name,
          phone: profileData.phone,
        } satisfies CurrentProfile)
      : null
  } catch (profileError) {
    const message = profileError instanceof Error ? profileError.message : "Unable to read profile"
    console.error("[auth/get-current-user] profile lookup failed", {
      userId: user.id,
      email: user.email ?? null,
      message,
    })
  }

  const profileRole = normalizeRole(profile?.role)
  const metadataRole = normalizeRole(user.user_metadata?.role ?? user.app_metadata?.role)
  const role = profileRole ?? metadataRole

  return {
    user,
    profile: (profile as CurrentProfile | null) ?? null,
    role,
    redirectTo: getDefaultRouteForRole(role),
  }
}
