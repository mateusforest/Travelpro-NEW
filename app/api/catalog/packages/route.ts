import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { createCatalogItem, listCatalogItems } from "@/lib/services"

const catalogSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  price: z.number().optional().nullable(),
  currency: z.string().optional(),
  public_slug: z.string().optional().nullable(),
  match_enabled: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function GET(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { searchParams } = new URL(request.url)
    const data = await listCatalogItems(context, {
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    })
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list catalog packages" }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const payload = catalogSchema.parse(await request.json())
    const data = await createCatalogItem(context, payload)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create catalog package" }, { status })
  }
}
