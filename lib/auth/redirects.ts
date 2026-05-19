import type { AuthRole } from "@/lib/permissions/roles"

export function getDefaultRouteForRole(role: AuthRole | null | undefined) {
  switch (role) {
    case "master":
      return "/master"
    case "agency_admin":
    case "agency_user":
      return "/app"
    case "client":
      return "/cliente"
    default:
      return "/login"
  }
}

export function getSafeRedirectForRole(role: AuthRole | null | undefined, fallback = "/login") {
  return role ? getDefaultRouteForRole(role) : fallback
}

export function getAuthRedirectTarget(next: string | null | undefined, role: AuthRole | null | undefined) {
  if (!next || !next.startsWith("/")) return getDefaultRouteForRole(role)
  return next
}
