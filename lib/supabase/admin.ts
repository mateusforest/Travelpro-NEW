import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

function isValidSupabaseProjectUrl(url: string) {
  return /^https:\/\/[^/]+\.supabase\.co\/?$/.test(url)
}

function getAdminSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin environment variables are not configured.")
  }

  if (!isValidSupabaseProjectUrl(url)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must use the Supabase project base URL without /rest/v1.")
  }

  return { url, serviceRoleKey }
}

export function getSupabaseAdminClient() {
  const { url, serviceRoleKey } = getAdminSupabaseEnv()

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
