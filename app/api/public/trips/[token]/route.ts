import { NextResponse } from "next/server"
import { getPublicTripExperienceByToken } from "@/lib/services"

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const data = await getPublicTripExperienceByToken(token)

    if (data.status === "missing") {
      return NextResponse.json(data, { status: 404 })
    }

    if (data.status === "inactive" || data.status === "expired") {
      return NextResponse.json(data, { status: 410 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load public trip" }, { status: 500 })
  }
}
