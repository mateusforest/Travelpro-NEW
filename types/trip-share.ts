export type TripShareLinkStatus = "available" | "inactive" | "expired" | "missing"

export type TripShareLinkSummary = {
  token: string
  is_active: boolean
  expires_at: string | null
  view_count: number
  last_viewed_at: string | null
  public_url: string
}

export type PublicTripDocument = {
  key: string
  title: string
  type: string
  status: string
  note: string
  href: string | null
}

export type PublicTripItineraryItem = {
  key: string
  day_label: string
  title: string
  time_label: string | null
  note: string
  status: string
}

export type PublicTripUpdateItem = {
  key: string
  title: string
  detail: string
  time_label: string
}

export type PublicTripChecklistItem = {
  key: string
  label: string
  done: boolean
}

export type PublicTripExperienceData = {
  status: TripShareLinkStatus
  token: string
  share_url: string
  trip: {
    destination: string
    status: string
    period_label: string
    summary: string | null
    origin: string | null
    starts_at: string | null
    ends_at: string | null
  } | null
  client: {
    name: string | null
  } | null
  agency: {
    name: string
    owner_name: string | null
    phone: string | null
    email: string | null
    logo_url: string | null
    banner_url: string | null
    primary_color: string | null
    visual_style: string | null
  } | null
  itinerary: PublicTripItineraryItem[]
  documents: PublicTripDocument[]
  updates: PublicTripUpdateItem[]
  checklist: PublicTripChecklistItem[]
  viewed_at: string | null
}
