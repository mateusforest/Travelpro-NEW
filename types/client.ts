import type { ClientRow } from "@/types/database"

export type ClientTravelerProfile = {
  tag?: string
  destination?: string
  origin?: string
  preferences?: string
  travelerProfile?: string
  nextStep?: string
  companions?: string
  notes?: string
  recommendations?: string[]
}

export type ClientInput = {
  name: string
  email?: string | null
  phone?: string | null
  document_number?: string | null
  traveler_profile?: ClientTravelerProfile
  status?: string
}

export type ClientResponse = ClientRow
