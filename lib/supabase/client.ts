"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

let browserClient: SupabaseClient<Database> | null = null

function isValidSupabaseProjectUrl(url: string) {
  return /^https:\/\/[^/]+\.supabase\.co\/?$/.test(url)
}

export function getSupabasePublicEnvStatus() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return {
      ok: false as const,
      message: "As variáveis públicas do Supabase não estão configuradas.",
    }
  }

  if (!isValidSupabaseProjectUrl(url)) {
    return {
      ok: false as const,
      message:
        "NEXT_PUBLIC_SUPABASE_URL precisa usar a URL base do projeto Supabase, sem /rest/v1 ou /auth/v1.",
    }
  }

  return {
    ok: true as const,
    url,
    anonKey,
  }
}

function getPublicSupabaseEnv() {
  const env = getSupabasePublicEnvStatus()

  if (!env.ok) {
    throw new Error(env.message)
  }

  return env
}

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient

  const { url, anonKey } = getPublicSupabaseEnv()
  browserClient = createBrowserClient<Database>(url, anonKey)
  return browserClient
}
