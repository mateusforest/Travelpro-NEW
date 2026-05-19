import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { AuthRole } from "@/lib/permissions/roles"

type UpsertProfileInput = {
  userId: string
  email: string
  fullName: string
  phone?: string | null
  role: AuthRole
  agencyId?: string | null
}

export async function getProfileByUserId(userId: string) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertProfile(input: UpsertProfileInput) {
  const supabase = getSupabaseAdminClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: input.userId,
        email: input.email,
        full_name: input.fullName,
        phone: input.phone ?? null,
        role: input.role,
        agency_id: input.agencyId ?? null,
        updated_at: now,
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single()

  if (error) throw error
  return data
}
