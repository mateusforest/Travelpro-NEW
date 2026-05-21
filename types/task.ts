import type { TaskRow } from "@/types/database"

export type TaskInput = {
  title: string
  description?: string | null
  priority?: string
  status?: string
  due_at?: string | null
  client_id?: string | null
  trip_id?: string | null
}

export type TaskResponse = TaskRow
