import type { PortalKey } from "@/lib/services/portal-types"

export type AtlasPortal = Extract<PortalKey, "agency" | "master">

export type AtlasModuleContext = {
  portal: AtlasPortal
  key: string
  label: string
  route: string
  summary: string
}

export type AtlasIntent = {
  id: string
  portal: AtlasPortal | "all"
  module: string
  title: string
  keywords: string[]
  quickQuestions: string[]
  route?: string
  routeLabel?: string
  status?: "ready" | "future" | "context"
  summary: string
  bullets: string[]
  nextSteps?: string[]
}

export type AtlasResolvedResponse = {
  intentId: string
  title: string
  summary: string
  bullets: string[]
  nextSteps: string[]
  route?: string
  routeLabel?: string
  status: "ready" | "future" | "context"
  moduleKey: string
}

export type AtlasAnalytics = {
  intents: Record<string, number>
  modules: Record<string, number>
  questions: Record<string, number>
  lastUsedAt: string | null
}
