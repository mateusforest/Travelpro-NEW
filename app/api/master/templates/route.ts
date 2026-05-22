import { NextResponse } from "next/server"
import { z } from "zod"
import { AuthSessionError, AuthorizationError, getAccessContext } from "@/lib/auth"
import { createMasterTemplate, listMasterTemplates } from "@/lib/services"

const masterTemplateSchema = z.object({
  agency_id: z.string().uuid(),
  title: z.string().min(2),
  status: z.string().optional(),
  template_type: z.enum(["Documento", "Relatorio", "Roteiro", "Cotacao", "Catalogo"]),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  version: z.string().optional().nullable(),
  pricing_tier: z.string().optional().nullable(),
  file_name: z.string().optional().nullable(),
  is_official: z.boolean().optional(),
  compatibilities: z.array(z.string()).optional(),
  customizable_fields: z.array(z.string()).optional(),
  variables: z.array(z.string()).optional(),
  preview_image_url: z.string().optional().nullable(),
  cover_image_url: z.string().optional().nullable(),
  branding_assets: z.array(z.string()).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    content_type: z.string().optional().nullable(),
  })).optional(),
})

export async function GET(request: Request) {
  try {
    await getAccessContext(["master"])
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || undefined
    const filter = searchParams.get("filter") || undefined
    const data = await listMasterTemplates({ search, filter })
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list master templates" }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAccessContext(["master"])
    const payload = masterTemplateSchema.parse(await request.json())
    const data = await createMasterTemplate(context.userId, payload)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create master template" }, { status })
  }
}
