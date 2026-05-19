import type { LucideIcon } from "lucide-react"

export type PortalKey = "master" | "agency" | "client"

export type NavItem = {
  title: string
  href?: string
  icon: LucideIcon
  badge?: string
  description?: string
  children?: NavItem[]
  defaultExpanded?: boolean
}

export type UserProfile = {
  name: string
  email: string
  role: string
  initials: string
}

export type MetricItem = {
  label: string
  value: string
  change?: string
  tone?: "default" | "success" | "warning" | "danger" | "info"
  icon: LucideIcon
}

export type HighlightItem = {
  title: string
  description: string
  meta?: string
  tone?: "default" | "success" | "warning" | "danger" | "info"
  icon?: LucideIcon
  href?: string
}

export type TableRow = Record<string, string | number>

export type TableBlock = {
  type: "table"
  title: string
  description?: string
  span?: "half" | "full"
  columns: { key: string; label: string }[]
  rows: TableRow[]
}

export type KanbanCard = {
  title: string
  description: string
  meta?: string
  tags?: string[]
  status?: string
  href?: string
}

export type KanbanBlock = {
  type: "kanban"
  title: string
  description?: string
  span?: "half" | "full"
  columns: {
    title: string
    tone?: "default" | "success" | "warning" | "danger" | "info"
    cards: KanbanCard[]
  }[]
}

export type ChartBlock = {
  type: "chart"
  title: string
  description?: string
  span?: "half" | "full"
  filters?: string[]
  series: { label: string; value: number; expenses?: number; profit?: number }[]
}

export type FeedBlock = {
  type: "feed"
  title: string
  description?: string
  span?: "half" | "full"
  items: {
    title: string
    description: string
    time: string
    tone?: "default" | "success" | "warning" | "danger" | "info"
    href?: string
  }[]
}

export type HighlightsBlock = {
  type: "highlights"
  title: string
  description?: string
  span?: "half" | "full"
  columns?: 2 | 3 | 4
  items: HighlightItem[]
}

export type EmptyBlock = {
  type: "empty"
  title: string
  description: string
  span?: "half" | "full"
  actionLabel?: string
  actionHref?: string
}

export type ContentBlock = TableBlock | KanbanBlock | ChartBlock | FeedBlock | HighlightsBlock | EmptyBlock

export type PortalPageConfig = {
  title: string
  description: string
  searchPlaceholder?: string
  filterTabs?: string[]
  primaryAction?: string
  secondaryAction?: string
  primaryActionHref?: string
  secondaryActionHref?: string
  extraActions?: { label: string; href?: string }[]
  metrics?: MetricItem[]
  blocks: ContentBlock[]
}
