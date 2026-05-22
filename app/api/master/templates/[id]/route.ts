import { NextResponse } from "next/server"
import { z } from "zod"
import { AuthSessionError, AuthorizationError, getAccessContext } from "@/lib/auth"
import { getMasterTemplateById, updateMasterTemplate } from "@/lib/services"

const masterTemplatePatchSchema = z.object({
  agency_id: z.string().uuid().optional(),
  title: z.string().min(2).optional(),
  status: z.string().optional(),
  template_type: z.enum(["Documento", "Relatorio", "Roteiro", "Cotacao", "Catalogo"]).optional(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  version: z.string().optional().nullable(),
  pricing_tier: z.string().optional().nullable(),
  file_name: z.string().optional().nullable(),
  is_official: z.boolean().optional(),
  compatibilities: z.array(z.string()).optional(),
  customizable_fields: z.array(z.string()).optional(),
  variables: z.array(z.string()).optional(),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getAccessContext(["master"])
    const { id } = await params
    const data = await getMasterTemplateById(id)
    if (!data) return NextResponse.json({ error: "Master template not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load master template" }, { status })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getAccessContext(["master"])
    const { id } = await params
    const payload = masterTemplatePatchSchema.parse(await request.json())
    const data = await updateMasterTemplate(id, payload)
    if (!data) return NextResponse.json({ error: "Master template not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update master template" }, { status })
  }
}
