import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

function isValidSupabaseProjectUrl(url: string) {
  return /^https:\/\/[^/]+\.supabase\.co\/?$/.test(url)
}

function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Supabase public environment variables are not configured.")
  }

  if (!isValidSupabaseProjectUrl(url)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must use the Supabase project base URL without /rest/v1.")
  }

  return { url, anonKey }
}

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getPublicSupabaseEnv()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components can't always mutate cookies. Middleware handles refresh.
        }
      },
    },
  })
}
