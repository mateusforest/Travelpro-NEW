import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/require-auth"
import { getSafeRedirectForRole } from "@/lib/auth/redirects"
import type { AuthRole } from "@/lib/permissions/roles"

export async function requireRole(allowedRoles: AuthRole[]) {
  const current = await requireAuth()

  if (!current.role || !allowedRoles.includes(current.role)) {
    redirect(getSafeRedirectForRole(current.role))
  }

  return current
}
