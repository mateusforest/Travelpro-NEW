import { NextResponse } from "next/server"
import { z } from "zod"
import { getAccessContext, AuthSessionError, AuthorizationError } from "@/lib/auth"
import { createTask, listTasks } from "@/lib/services"

const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  priority: z.string().optional(),
  status: z.string().optional(),
  due_at: z.string().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
  trip_id: z.string().uuid().optional().nullable(),
})

export async function GET() {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const data = await listTasks(context)
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list tasks" }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const payload = taskSchema.parse(await request.json())
    const data = await createTask(context, payload)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create task" }, { status })
  }
}
