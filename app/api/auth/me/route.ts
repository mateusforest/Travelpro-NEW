import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"

export async function GET() {
  const current = await getCurrentUser()

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

  return NextResponse.json(current)
}
