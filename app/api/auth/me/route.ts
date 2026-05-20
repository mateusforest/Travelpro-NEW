import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
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

  if (!current.profile) {
    const role = normalizeRole(current.user.user_metadata?.role ?? current.user.app_metadata?.role)

    if (role) {
      try {
        await bootstrapUserAccount({
          userId: current.user.id,
          email: current.user.email ?? "",
          fullName:
            String(current.user.user_metadata?.full_name ?? current.user.user_metadata?.name ?? "").trim() ||
            current.user.email?.split("@")[0] ||
            "Usuário TravelPro",
          phone: (current.user.user_metadata?.phone as string | undefined) ?? null,
          agencyName: (current.user.user_metadata?.agency_name as string | undefined) ?? null,
          role,
        })
        current = await getCurrentUser()
      } catch (bootstrapError) {
        const message = bootstrapError instanceof Error ? bootstrapError.message : "Unable to bootstrap session"
        console.error("[auth/me] bootstrap retry failed", {
          userId: current.user.id,
          role,
          message,
        })
      }
    }
  }

  if (!current.profile) {
    return NextResponse.json(
      {
        error: "Perfil não encontrado após o login. Tente novamente ou conclua o cadastro.",
        user: current.user,
        profile: null,
        role: current.role,
        redirectTo: "/login",
      },
      { status: 409 },
    )
  }

  return NextResponse.json(current)
}
