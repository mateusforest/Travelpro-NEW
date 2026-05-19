export const ROLES = {
  MASTER: "MASTER",
  AGENCY_ADMIN: "AGENCY_ADMIN",
  AGENCY_MANAGER: "AGENCY_MANAGER",
  AGENCY_SALES: "AGENCY_SALES",
  AGENCY_FINANCE: "AGENCY_FINANCE",
  AGENCY_OPERATIONAL: "AGENCY_OPERATIONAL",
  CLIENT: "CLIENT",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const AUTH_ROLES = {
  MASTER: "master",
  AGENCY_ADMIN: "agency_admin",
  AGENCY_USER: "agency_user",
  CLIENT: "client",
} as const

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES]

export function normalizeRole(role: string | null | undefined): AuthRole | null {
  if (!role) return null

  const normalized = role.toLowerCase()

  if (normalized === AUTH_ROLES.MASTER) return AUTH_ROLES.MASTER
  if (normalized === AUTH_ROLES.AGENCY_ADMIN) return AUTH_ROLES.AGENCY_ADMIN
  if (
    normalized === AUTH_ROLES.AGENCY_USER ||
    normalized === "agency_manager" ||
    normalized === "agency_sales" ||
    normalized === "agency_finance" ||
    normalized === "agency_operational"
  ) {
    return AUTH_ROLES.AGENCY_USER
  }
  if (normalized === AUTH_ROLES.CLIENT) return AUTH_ROLES.CLIENT

  return null
}
