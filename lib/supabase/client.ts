"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

let browserClient: SupabaseClient<Database> | null = null

function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Supabase public environment variables are not configured.")
  }

  return { url, anonKey }
}

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient

  const { url, anonKey } = getPublicSupabaseEnv()
  browserClient = createBrowserClient<Database>(url, anonKey)
  return browserClient
}
