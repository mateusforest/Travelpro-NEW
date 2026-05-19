import Link from "next/link"
import type { ContentBlock, HighlightItem, PortalPageConfig } from "@/lib/services/portal-types"
import { PageShell } from "@/components/system/page-shell"
import { SectionHeader } from "@/components/system/section-header"
import { PortalActions } from "@/components/system/portal-actions"
import { SearchInput } from "@/components/system/search-input"
import { FilterTabs } from "@/components/system/filter-tabs"
import { MetricCard } from "@/components/system/metric-card"
import { DataTable } from "@/components/system/data-table"
import { KanbanBoard } from "@/components/system/kanban-board"
import { MockChart } from "@/components/system/mock-chart"
import { ActivityFeed } from "@/components/system/activity-feed"
import { EmptyState } from "@/components/system/empty-state"
import { DashboardCard } from "@/components/system/dashboard-card"
import { StatusBadge } from "@/components/system/status-badge"

function HighlightGrid({ title, description, items, columns = 3 }: { title: string; description?: string; items: HighlightItem[]; columns?: 2 | 3 | 4 }) {
  const gridClass = columns === 2 ? "md:grid-cols-2" : columns === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3"

  return (
    <DashboardCard title={title} description={description}>
      <div className={`grid gap-4 ${gridClass}`}>
        {items.map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/8 bg-black/10 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-black/15">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-medium text-foreground">{item.title}</h3>
                {item.meta ? <StatusBadge status={item.meta} /> : null}
              </div>
              {item.icon ? (
                <div className="rounded-2xl border border-white/10 bg-primary/10 p-2.5">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            {item.href ? (
              <Link href={item.href} className="mt-3 inline-flex text-xs font-medium text-primary transition-colors hover:text-primary/80">
                Abrir
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}

function renderBlock(block: ContentBlock) {
  switch (block.type) {
    case "table":
      return <DataTable {...block} />
    case "kanban":
      return <KanbanBoard {...block} />
    case "chart":
      return <MockChart {...block} />
    case "feed":
      return <ActivityFeed {...block} />
    case "highlights":
      return <HighlightGrid title={block.title} description={block.description} items={block.items} columns={block.columns} />
    case "empty":
      return <EmptyState title={block.title} description={block.description} actionLabel={block.actionLabel} actionHref={block.actionHref} />
    default:
      return null
  }
}

export function PortalPage({ config }: { config: PortalPageConfig }) {
  return (
    <PageShell>
      <SectionHeader
        title={config.title}
        description={config.description}
        actions={<PortalActions primaryAction={config.primaryAction} secondaryAction={config.secondaryAction} primaryActionHref={config.primaryActionHref} secondaryActionHref={config.secondaryActionHref} extraActions={config.extraActions} />}
      />

      {config.searchPlaceholder || config.filterTabs ? (
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {config.searchPlaceholder ? <div className="xl:max-w-md xl:flex-1"><SearchInput placeholder={config.searchPlaceholder} /></div> : <div />}
          {config.filterTabs ? <FilterTabs items={config.filterTabs} /> : null}
        </div>
      ) : null}

      {config.metrics?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {config.metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {config.blocks.map((block, index) => (
          <div key={`${block.type}-${block.title}-${index}`} className={block.span === "full" ? "xl:col-span-2" : ""}>
            {renderBlock(block)}
          </div>
        ))}
      </div>
    </PageShell>
  )
}
