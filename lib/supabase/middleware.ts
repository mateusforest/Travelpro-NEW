import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

function isValidSupabaseProjectUrl(url: string) {
  return /^https:\/\/[^/]+\.supabase\.co\/?$/.test(url)
}

function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return null
  }

  if (!isValidSupabaseProjectUrl(url)) {
    return null
  }

  return { url, anonKey }
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const env = getPublicSupabaseEnv()

  if (!env) {
    return { response, supabase: null, user: null }
  }

  const { url, anonKey } = env

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, supabase, user }
}
