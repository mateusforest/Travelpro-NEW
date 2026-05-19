import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { deleteCatalogItem, getCatalogItemById, updateCatalogItem } from "@/lib/services"

const catalogPatchSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  price: z.number().optional().nullable(),
  match_enabled: z.boolean().optional(),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const data = await getCatalogItemById(context, id)
    if (!data) return NextResponse.json({ error: "Catalog item not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to get catalog item" }, { status })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const payload = catalogPatchSchema.parse(await request.json())
    const data = await updateCatalogItem(context, id, payload)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update catalog item" }, { status })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const data = await deleteCatalogItem(context, id)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete catalog item" }, { status })
  }
}
