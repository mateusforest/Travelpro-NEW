import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { deleteTeamMember, getTeamMemberById, updateTeamMember } from "@/lib/services"

const teamPatchSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.string().min(2).optional(),
  scope: z.string().optional().nullable(),
  modules: z.string().optional().nullable(),
  status: z.string().optional(),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const data = await getTeamMemberById(context, id)
    if (!data) return NextResponse.json({ error: "Team member not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to get team member" }, { status })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const payload = teamPatchSchema.parse(await request.json())
    const data = await updateTeamMember(context, id, payload)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update team member" }, { status })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const data = await deleteTeamMember(context, id)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete team member" }, { status })
  }
}
