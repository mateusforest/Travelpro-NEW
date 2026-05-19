import Link from "next/link"
import type { KanbanBlock } from "@/lib/services/portal-types"
import { DashboardCard } from "@/components/system/dashboard-card"
import { StatusBadge } from "@/components/system/status-badge"
import { cn } from "@/lib/utils"

const columnTone = {
  default: "border-white/10",
  success: "border-green-500/20",
  warning: "border-amber-500/20",
  danger: "border-red-500/20",
  info: "border-sky-500/20",
}

export function KanbanBoard({ title, description, columns }: KanbanBlock) {
  return (
    <DashboardCard title={title} description={description}>
      <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {columns.map((column) => (
          <div key={column.title} className={cn("rounded-3xl border bg-black/10 p-4", columnTone[column.tone ?? "default"])}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-foreground">{column.title}</h3>
              <span className="text-xs text-muted-foreground">{column.cards.length}</span>
            </div>
            <div className="space-y-3">
              {column.cards.map((card, index) => (
                <article key={`${column.title}-${index}`} className="rounded-2xl border border-white/8 bg-secondary/60 p-3 transition-all duration-200 hover:border-primary/15 hover:bg-secondary/80 hover:-translate-y-0.5">
                  <div className="space-y-1">
                    <h4 className="font-medium text-foreground">{card.title}</h4>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                    {card.meta ? <p className="text-xs text-primary">{card.meta}</p> : null}
                  </div>
                  {card.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {card.tags.map((tag) => (
                        <StatusBadge key={tag} status={tag} />
                      ))}
                    </div>
                  ) : null}
                  {card.href ? (
                    <Link href={card.href} className="mt-3 inline-flex text-xs font-medium text-primary transition-colors hover:text-primary/80">
                      Abrir
                    </Link>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
