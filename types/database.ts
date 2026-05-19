import type { AuthRole } from "@/lib/permissions/roles"

export type AgencyAccessContext = {
  userId: string
  profileId: string | null
  agencyId: string | null
  role: AuthRole
  isMaster: boolean
}

export type BaseRow = {
  id: string
  agency_id: string | null
  created_at: string
  updated_at?: string
}

export type ClientRow = BaseRow & {
  profile_id: string | null
  name: string
  email: string | null
  phone: string | null
  status: string
}

export type LeadRow = BaseRow & {
  user_id: string | null
  client_id: string | null
  name: string
  origin: string | null
  destination: string | null
  status: string
  temperature: string | null
}

export type TripRow = BaseRow & {
  client_id: string | null
  user_id: string | null
  destination: string
  status: string
  starts_at: string | null
  ends_at: string | null
}

export type DocumentRow = BaseRow & {
  client_id: string | null
  trip_id: string | null
  user_id: string | null
  title: string
  type: string
  status: string
  storage_path: string | null
}

export type CatalogItemRow = BaseRow & {
  title: string
  description: string | null
  status: string
  price: number | null
  match_enabled: boolean
}

export type TeamMemberRow = BaseRow & {
  user_id: string | null
  name: string
  role: string
  scope: string | null
  modules: string | null
  status: string
}

export type FinancialRecordRow = BaseRow & {
  user_id: string | null
  type: string
  amount: number
  status: string
  description: string | null
  category: string | null
}
