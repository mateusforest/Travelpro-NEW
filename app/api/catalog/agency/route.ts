import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { getCatalogAgencyProfile, updateCatalogAgencyProfile } from "@/lib/services"

const agencyCatalogSchema = z.object({
  display_name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  visual_style: z.string().optional().nullable(),
  primary_color: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  banner_url: z.string().optional().nullable(),
  cta_label: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const data = await getCatalogAgencyProfile(context)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load catalog agency profile" }, { status })
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const payload = agencyCatalogSchema.parse(await request.json())
    const data = await updateCatalogAgencyProfile(context, payload)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update catalog agency profile" }, { status })
  }
}
