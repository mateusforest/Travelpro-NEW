"use client"

export type AgencyRebuildMenuTarget =
  | "dashboard"
  | "clients"
  | "leads"
  | "trips"
  | "documents"
  | "finance"
  | "credits"
  | "catalog"
  | "plans"
  | "billing"
  | "settings"
  | "reports"
  | "team"
  | "expansions"
  | "operations"
  | "itineraries"
  | "quotes"
  | "atlas"
  | "signout"

const AGENCY_REBUILD_NAV_EVENT = "agency-rebuild:navigate"

export function dispatchAgencyRebuildNavigation(target: AgencyRebuildMenuTarget) {
  if (typeof window === "undefined") return

  window.dispatchEvent(
    new CustomEvent(AGENCY_REBUILD_NAV_EVENT, {
      detail: { target },
    }),
  )
}

export function subscribeAgencyRebuildNavigation(
  listener: (target: AgencyRebuildMenuTarget) => void,
) {
  if (typeof window === "undefined") {
    return () => {}
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ target?: AgencyRebuildMenuTarget }>
    if (!customEvent.detail?.target) return
    listener(customEvent.detail.target)
  }

  window.addEventListener(AGENCY_REBUILD_NAV_EVENT, handler)

  return () => {
    window.removeEventListener(AGENCY_REBUILD_NAV_EVENT, handler)
  }
}
