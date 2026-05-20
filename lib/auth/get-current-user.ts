import { getSupabaseServerClient } from "@/lib/supabase/server"
import { normalizeRole, type AuthRole } from "@/lib/permissions/roles"
import { getDefaultRouteForRole } from "@/lib/auth/redirects"

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, user_id, agency_id, role, full_name, phone")
    .eq("user_id", user.id)
    .maybeSingle()

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
