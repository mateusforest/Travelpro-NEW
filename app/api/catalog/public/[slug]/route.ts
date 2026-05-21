import { NextResponse } from "next/server"
import { getPublicCatalogBySlug } from "@/lib/services"

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const data = await getPublicCatalogBySlug(slug)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load public catalog" }, { status: 500 })
  }
}
