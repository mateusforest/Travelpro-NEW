import { getCurrentUser } from "@/lib/auth/get-current-user"
import type { AgencyAccessContext } from "@/types/database"
import type { AuthRole } from "@/lib/permissions/roles"

export class AuthSessionError extends Error {
  status = 401
}

export class AuthorizationError extends Error {
  status = 403
}

export async function getAccessContext(allowedRoles: AuthRole[]): Promise<AgencyAccessContext> {
  const current = await getCurrentUser()

  if (!current.user || !current.role) {
    throw new AuthSessionError("Unauthorized")
  }

  if (!allowedRoles.includes(current.role)) {
    throw new AuthorizationError("Forbidden")
  }

  return {
    userId: current.user.id,
    profileId: current.profile?.id ?? null,
    agencyId: current.profile?.agency_id ?? null,
    role: current.role,
    isMaster: current.role === "master",
  }
}
