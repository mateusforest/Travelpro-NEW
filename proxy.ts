import { NextResponse, type NextRequest } from "next/server"
import { getSafeRedirectForRole } from "@/lib/auth/redirects"
import { normalizeRole } from "@/lib/permissions/roles"
import { updateSession } from "@/lib/supabase/middleware"

const authPages = new Set(["/login", "/cadastro", "/recuperar-senha"])

function getProtectedPortal(pathname: string) {
  if (pathname.startsWith("/master")) return "master"
  if (pathname.startsWith("/app")) return "agency"
  if (pathname.startsWith("/cliente")) return "client"
  return null
}

function isRoleAllowedForPortal(portal: ReturnType<typeof getProtectedPortal>, role: string | null) {
  if (!portal || !role) return false
  if (portal === "master") return role === "master"
  if (portal === "agency") return role === "agency_admin" || role === "agency_user"
  if (portal === "client") return role === "client"
  return false
}

export async function proxy(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname
  const portal = getProtectedPortal(pathname)

  let role = normalizeRole(user?.user_metadata?.role ?? user?.app_metadata?.role)

  if (user && !role) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
    role = normalizeRole(profile?.role)
  }

  if (authPages.has(pathname) && user) {
    const destination = getSafeRedirectForRole(role, "/login")
    return NextResponse.redirect(new URL(destination, request.url))
  }

  if (portal && !user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (portal && !isRoleAllowedForPortal(portal, role)) {
    const safeUrl = new URL(getSafeRedirectForRole(role), request.url)
    return NextResponse.redirect(safeUrl)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
