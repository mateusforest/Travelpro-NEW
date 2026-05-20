import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { getDefaultRouteForRole } from "@/lib/auth/redirects"
import { normalizeRole } from "@/lib/permissions/roles"
import { bootstrapUserAccount } from "@/lib/services/user-service"

export async function GET() {
  let current = await getCurrentUser()

  if (!current.user) {
    return NextResponse.json(
      {
        user: null,
        profile: null,
        role: null,
        redirectTo: "/login",
      },
      { status: 401 },
    )
  }

  console.info("[auth/me] session", {
    userId: current.user.id,
    email: current.user.email ?? null,
    profileFound: Boolean(current.profile),
    profileRole: current.profile?.role ?? null,
    agencyId: current.profile?.agency_id ?? null,
    resolvedRole: current.role,
    redirectTo: current.redirectTo,
  })

  if (!current.profile) {
    const metadataRole = normalizeRole(current.user.user_metadata?.role ?? current.user.app_metadata?.role)

    if (metadataRole) {
      try {
        console.info("[auth/me] bootstrap:start", {
          userId: current.user.id,
          email: current.user.email ?? null,
          metadataRole,
        })

        await bootstrapUserAccount({
          userId: current.user.id,
          email: current.user.email ?? "",
          fullName:
            String(current.user.user_metadata?.full_name ?? current.user.user_metadata?.name ?? "").trim() ||
            current.user.email?.split("@")[0] ||
            "TravelPro User",
          phone: (current.user.user_metadata?.phone as string | undefined) ?? null,
          agencyName: (current.user.user_metadata?.agency_name as string | undefined) ?? null,
          role: metadataRole,
        })

        await wait(250)
        current = await getCurrentUser()

        console.info("[auth/me] bootstrap:done", {
          userId: current.user?.id ?? null,
          profileFound: Boolean(current.profile),
          profileRole: current.profile?.role ?? null,
          agencyId: current.profile?.agency_id ?? null,
          redirectTo: current.redirectTo,
        })
      } catch (bootstrapError) {
        const message = bootstrapError instanceof Error ? bootstrapError.message : "Unable to bootstrap session"
        console.error("[auth/me] bootstrap failed", {
          userId: current.user.id,
          email: current.user.email ?? null,
          metadataRole,
          message,
        })
      }
    }
  }

  if (!current.profile) {
    return NextResponse.json(
      {
        error: "Profile not available yet. Please try again in a moment.",
        user: current.user,
        profile: null,
        role: current.role,
        redirectTo: "/login",
      },
      { status: 409 },
    )
  }

  const resolvedRole = normalizeRole(current.profile.role ?? current.role)
  const redirectTo = getDefaultRouteForRole(resolvedRole)

  console.info("[auth/me] resolved", {
    userId: current.user.id,
    email: current.user.email ?? null,
    profileRole: current.profile.role ?? null,
    agencyId: current.profile.agency_id ?? null,
    resolvedRole,
    redirectTo,
  })

  return NextResponse.json({
    ...current,
    role: resolvedRole,
    redirectTo,
  })
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
