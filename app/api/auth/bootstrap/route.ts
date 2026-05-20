import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AUTH_ROLES, normalizeRole } from "@/lib/permissions/roles"
import { bootstrapUserAccount } from "@/lib/services/user-service"

const bootstrapSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional().nullable(),
  agencyName: z.string().optional().nullable(),
  role: z.string().optional(),
})

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = bootstrapSchema.safeParse(await request.json())
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid payload", details: payload.error.flatten() }, { status: 400 })
  }

  const normalizedRole = normalizeRole(payload.data.role ?? String(user.user_metadata?.role ?? AUTH_ROLES.AGENCY_ADMIN))
  const role = normalizedRole ?? AUTH_ROLES.AGENCY_ADMIN

  try {
    const result = await bootstrapUserAccount({
      userId: user.id,
      email: user.email ?? "",
      fullName: payload.data.fullName,
      phone: payload.data.phone ?? null,
      agencyName: payload.data.agencyName ?? null,
      role,
    })

    return NextResponse.json(result)
  } catch (bootstrapError) {
    const message = bootstrapError instanceof Error ? bootstrapError.message : "Unable to bootstrap account"
    console.error("[auth/bootstrap] failed", {
      userId: user.id,
      role,
      hasAgencyName: Boolean(payload.data.agencyName),
      message,
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
