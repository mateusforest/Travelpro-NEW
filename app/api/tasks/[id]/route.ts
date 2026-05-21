import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { deleteTask, getTaskById, updateTask } from "@/lib/services"

const taskPatchSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  priority: z.string().optional(),
  status: z.string().optional(),
  due_at: z.string().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
  trip_id: z.string().uuid().optional().nullable(),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const data = await getTaskById(context, id)
    if (!data) return NextResponse.json({ error: "Task not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to get task" }, { status })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const payload = taskPatchSchema.parse(await request.json())
    const data = await updateTask(context, id, payload)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update task" }, { status })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const data = await deleteTask(context, id)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete task" }, { status })
  }
}
