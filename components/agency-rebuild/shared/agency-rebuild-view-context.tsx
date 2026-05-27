"use client"

import { createContext, useContext } from "react"

export type AgencyRebuildViewMode = "workspace" | "traditional"

type AgencyRebuildViewContextValue = {
  viewMode: AgencyRebuildViewMode
  isSwitchingView: boolean
  setViewMode: (mode: AgencyRebuildViewMode) => void
}

const AgencyRebuildViewContext = createContext<AgencyRebuildViewContextValue | null>(null)

export function AgencyRebuildViewProvider({
  value,
  children,
}: {
  value: AgencyRebuildViewContextValue
  children: React.ReactNode
}) {
  return <AgencyRebuildViewContext.Provider value={value}>{children}</AgencyRebuildViewContext.Provider>
}

export function useAgencyRebuildView() {
  const context = useContext(AgencyRebuildViewContext)

  if (!context) {
    throw new Error("useAgencyRebuildView must be used within AgencyRebuildViewProvider")
  }

  return context
}
