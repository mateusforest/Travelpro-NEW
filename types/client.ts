import type { ClientRow } from "@/types/database"

export type ClientInput = {
  name: string
  email?: string | null
  phone?: string | null
  status?: string
}

export type ClientResponse = ClientRow
